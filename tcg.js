// --- TCG Mode Logic ---

let tcgState = {
    hand: [],
    active: null,
    bench: [],
    energy: 0,
    points: 0,
    enemyPoints: 0,
    turn: 1,
    isPlayerTurn: true,
    hasAttachedEnergy: false,
    hasAttacked: false,
    log: []
};

let tcgMp = {
    enabled: false,
    socket: null,
    room: null,
    name: null,
    opponentName: null,
    seed: null,
    applyingRemote: false,
    suppressRender: false
};

function tcgMpAvailable() {
    return typeof io !== 'undefined';
}

function tcgCloneDeck(deck) {
    return JSON.parse(JSON.stringify(deck || []));
}

function tcgSeededShuffle(list, seed) {
    const arr = [...list];
    let s = seed || 1;
    const rand = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function tcgSwapSides() {
    const temp = {
        active: tcgState.active,
        bench: tcgState.bench,
        hand: tcgState.hand,
        energy: tcgState.energy,
        points: tcgState.points,
        cemetery: tcgState.cemetery,
        hasAttachedEnergy: tcgState.hasAttachedEnergy,
        hasAttacked: tcgState.hasAttacked,
        currentDeck: tcgState.currentDeck
    };
    tcgState.active = tcgState.enemyActive;
    tcgState.bench = tcgState.enemyBench;
    tcgState.hand = tcgState.enemyHand;
    tcgState.energy = tcgState.enemyEnergy;
    tcgState.points = tcgState.enemyPoints;
    tcgState.cemetery = tcgState.enemyCemetery;
    tcgState.hasAttachedEnergy = tcgState.enemyHasAttachedEnergy || false;
    tcgState.hasAttacked = tcgState.enemyHasAttacked || false;
    tcgState.currentDeck = tcgState.enemyDeck;

    tcgState.enemyActive = temp.active;
    tcgState.enemyBench = temp.bench;
    tcgState.enemyHand = temp.hand;
    tcgState.enemyEnergy = temp.energy;
    tcgState.enemyPoints = temp.points;
    tcgState.enemyCemetery = temp.cemetery;
    tcgState.enemyHasAttachedEnergy = temp.hasAttachedEnergy;
    tcgState.enemyHasAttacked = temp.hasAttacked;
    tcgState.enemyDeck = temp.currentDeck;
}

// Redefine addLog para direcionar o log conforme o modo atual
function addLog(m) {
    const tcgBoard = document.getElementById('tcg-board');
    const tcgActive = tcgBoard && tcgBoard.style.display !== 'none';

    if (tcgActive) {
        const tcgLog = document.getElementById('tcg-battle-logs');
        if (tcgLog) {
            const d = document.createElement('div');
            d.innerHTML = m;
            tcgLog.appendChild(d);
            tcgLog.scrollTop = tcgLog.scrollHeight;
            return;
        }
    }

    const l = document.getElementById('battle-logs');
    if (l) {
        const d = document.createElement('div');
        d.innerHTML = m;
        l.appendChild(d);
        l.scrollTop = l.scrollHeight;
    }
}

// =============================
// KO / Promoção automática (Regra Mobile)
// - Se o Ativo do jogador morrer: promove automaticamente do banco.
// - Se não houver criatura no banco: derrota instantânea.
// =============================
function tcgAutoPromotePlayerFromBench() {
    if (tcgState.active) return true;
    if (tcgState.bench && tcgState.bench.length > 0) {
        tcgState.active = tcgState.bench.shift();
        const playerSlot = document.getElementById('tcg-active-slot');
        if (playerSlot) {
            playerSlot.classList.remove('anim-death');
            playerSlot.classList.remove('anim-shake');
            playerSlot.classList.remove('anim-flash');
            playerSlot.style.opacity = '';
            playerSlot.style.filter = '';
            playerSlot.style.transform = '';
        }
        addLog(`🛡️ TCG: ${tcgState.active.name} entrou automaticamente no Ativo!`);
        return true;
    }
    return false;
}

function tcgHandlePlayerActiveKO() {
    // Se houver banco, promove automaticamente.
    if (tcgAutoPromotePlayerFromBench()) {
        updateTCG();
        return;
    }

    // Sem banco = derrota instantânea (mesmo que tenha básico na mão).
    tcgState.enemyPoints = 3;
    addLog("💀 TCG: Seu Ativo foi nocauteado e não há criaturas no banco! Derrota instantânea.");
    updateTCG();
    checkTCGWin();
}

function applyTCGBonus(c) {
    if (!c || c.type === 'item') return c;
    
    const bonus = 1.8;
    const evoBonus = c.type === 'evo' ? 1.4 : 1.0;
    const multiplier = bonus * evoBonus;
    const newCard = { ...c };
    
    // Se a carta já tem HP (básicos), usa ele. 
    // Se não tem (evolucões mal formadas), tenta buscar da pool ou usa padrão.
    let baseHp = c.hp;
    if (!baseHp && c.type === 'evo' && c.baseId) {
        const basic = CREATURE_POOL.find(p => p.id === c.baseId);
        if (basic) baseHp = basic.hp + (c.hpBoost || 0);
    }
    if (!baseHp) baseHp = 100;

    newCard.hp = Math.floor(baseHp * multiplier);
    newCard.currentHp = newCard.hp;
    
    if (newCard.attacks) {
        newCard.attacks = newCard.attacks.map(atk => ({
            ...atk,
            min: Math.floor(atk.min * multiplier),
            max: Math.floor(atk.max * multiplier)
        }));
    }
    newCard.attachedEnergy = 0;
    newCard.items = [];
    newCard.cooldowns = {};
    newCard.turnsInField = 0;
    return newCard;
}


// --- Evolucao unificada (Player + IA) ---
function tcgCanEvolve(target, evoCard) {
    if (!target || !evoCard || evoCard.type !== 'evo') return false;
    if (target.id !== evoCard.baseId) return false;

    // Regra: 1 turno em campo OU turn > 2 (fallback)
    const tif = target.turnsInField || 0;
    return (tif >= 1) || (tcgState.turn > 2);
}

function tcgEvolveTarget(target, evoCard) {
    const evolved = applyTCGBonus(evoCard);

    // Preserva dano, energia e itens
    const damageTaken = (target.hp || 0) - (target.currentHp || 0);
    evolved.currentHp = Math.max(10, evolved.hp - Math.max(0, damageTaken));
    evolved.attachedEnergy = target.attachedEnergy || 0;

    // Padroniza itens: player usa items; IA pode ter equipped antigo
    evolved.items = target.items || target.equipped || [];

    // Garante ID unico do estagio (necessario para evolucao stackavel)
    if (!evolved.id) evolved.id = evoCard.id;

    evolved.type = 'evo';
    evolved.turnsInField = 0;
    return evolved;
}

// --- Energia: drag-friendly (mobile) ---
function tcgCanAttachEnergyNow() {
    return tcgState.isPlayerTurn && tcgState.turn > 1 && !tcgState.hasAttachedEnergy && tcgState.energy > 0;
}

function tcgAttachEnergyToCreature(creature) {
    if (!tcgCanAttachEnergyNow() || !creature) return false;
    creature.attachedEnergy = (creature.attachedEnergy || 0) + 1;
    tcgState.energy--;
    tcgState.hasAttachedEnergy = true;
    addLog(`⚡ TCG: Energia ligada em ${creature.name}.`);
    playSound('click');
    updateTCG();
    if (tcgMp.enabled && !tcgMp.applyingRemote) {
        const slot = tcgGetCreatureSlot(creature);
        if (slot) tcgMpEmit("attachEnergy", slot);
    }
    return true;
}

function tcgGetCreatureSlot(creature) {
    if (!creature) return null;
    if (tcgState.active === creature) return { slot: "active", index: 0 };
    const idx = tcgState.bench ? tcgState.bench.indexOf(creature) : -1;
    if (idx >= 0) return { slot: "bench", index: idx };
    return null;
}

function tcgGetPlayerCreatureBySlotEl(el) {
    if (!el || !el.id) return null;
    if (el.id === 'tcg-active-slot') return tcgState.active;
    const m = el.id.match(/^tcg-bench-slot-(\d)$/);
    if (m) {
        const idx = parseInt(m[1], 10);
        return tcgState.bench ? tcgState.bench[idx] : null;
    }
    return null;
}

function tcgBindEnergyTokenMobile() {
    const token = document.getElementById('tcg-energy-token');
    if (!token) return;

    // Evita duplicar handlers a cada updateTCG
    if (token._tcgBound) return;
    token._tcgBound = true;

    let dragEl = null;
    let hoveringSlot = null;

    const clearHover = () => {
        if (hoveringSlot) {
            hoveringSlot.style.outline = '';
            hoveringSlot.style.outlineOffset = '';
            hoveringSlot = null;
        }
    };

    const setHover = (slot) => {
        if (hoveringSlot === slot) return;
        clearHover();
        hoveringSlot = slot;
        if (hoveringSlot) {
            hoveringSlot.style.outline = '2px solid gold';
            hoveringSlot.style.outlineOffset = '2px';
        }
    };

    const isPlayerSlot = (slot) => {
        if (!slot || !slot.id) return false;
        if (slot.id === 'tcg-active-slot') return true;
        return /^tcg-bench-slot-\d$/.test(slot.id);
    };

    const findSlotUnderPoint = (x, y) => {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        let cur = el;
        while (cur && cur !== document.body) {
            if (cur.classList && cur.classList.contains('tcg-slot')) return cur;
            cur = cur.parentElement;
        }
        return null;
    };

    const makeDragEl = (x, y) => {
        const d = document.createElement('div');
        d.textContent = '⚡';
        d.style.position = 'fixed';
        d.style.left = (x - 20) + 'px';
        d.style.top = (y - 20) + 'px';
        d.style.width = '40px';
        d.style.height = '40px';
        d.style.display = 'flex';
        d.style.alignItems = 'center';
        d.style.justifyContent = 'center';
        d.style.borderRadius = '12px';
        d.style.background = 'rgba(255,255,255,0.15)';
        d.style.border = '1px solid rgba(255,255,255,0.25)';
        d.style.backdropFilter = 'blur(4px)';
        d.style.zIndex = '99999';
        d.style.pointerEvents = 'none';
        d.style.transform = 'scale(1.05)';
        document.body.appendChild(d);
        return d;
    };

    const cleanupDrag = () => {
        if (dragEl) {
            dragEl.remove();
            dragEl = null;
        }
        clearHover();
    };

    const canStart = () => {
        token.style.opacity = tcgCanAttachEnergyNow() ? '1' : '0.35';
        token.style.cursor = tcgCanAttachEnergyNow() ? 'grab' : 'not-allowed';
        return tcgCanAttachEnergyNow();
    };

    const onPointerDown = (e) => {
        if (!canStart()) return;
        e.preventDefault();
        if (token.setPointerCapture) token.setPointerCapture(e.pointerId);
        dragEl = makeDragEl(e.clientX, e.clientY);

        const slot = findSlotUnderPoint(e.clientX, e.clientY);
        if (isPlayerSlot(slot)) {
            const creature = tcgGetPlayerCreatureBySlotEl(slot);
            setHover(creature ? slot : null);
        } else {
            setHover(null);
        }
    };

    const onPointerMove = (e) => {
        if (!dragEl) return;
        dragEl.style.left = (e.clientX - 20) + 'px';
        dragEl.style.top = (e.clientY - 20) + 'px';

        const slot = findSlotUnderPoint(e.clientX, e.clientY);
        if (isPlayerSlot(slot)) {
            const creature = tcgGetPlayerCreatureBySlotEl(slot);
            setHover(creature ? slot : null);
        } else {
            setHover(null);
        }
    };

    const onPointerUp = (e) => {
        if (!dragEl) return;
        const slot = findSlotUnderPoint(e.clientX, e.clientY);
        const creature = isPlayerSlot(slot) ? tcgGetPlayerCreatureBySlotEl(slot) : null;

        cleanupDrag();

        if (creature) {
            tcgAttachEnergyToCreature(creature);
        }
    };

    const onPointerCancel = () => cleanupDrag();

    token.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });

    // Ajusta estado visual inicial
    canStart();
}

function showTCGMenu() {
    playSound('click');
    try {
        const saved = localStorage.getItem('aventura_save');
        if (saved) {
            state = JSON.parse(saved);
        }
    } catch (e) {}
    if (typeof normalizeState === 'function') normalizeState();
    if (typeof applyAccountSaveToState === 'function') applyAccountSaveToState(state);
    const body = `
        <div style="text-align:center; color:white; margin-bottom:20px;">
            Bem-vindo ao Modo TCG!<br><br>
            Monte seu deck de 20 cartas e vença acumulando 3 pontos de vitória.
        </div>
    `;
    showModal("Modo TCG", body, [
        { text: "Abrir Pacotes", action: () => tcgShowPackShop() },
        { text: "Montar Deck", action: () => showTCGDeckBuilder() },
        { text: "Meus Decks", action: () => showTCGSavedDecks() },
        { text: "Jogar (Requer Deck)", action: () => startTCGGame() },
        { text: "Multiplayer", action: () => showTCGMultiplayerMenu() },
        { text: "Voltar", action: hideModal }
    ]);
}

function showTCGMultiplayerMenu() {
    if (!tcgMpAvailable()) {
        const isFile = location.protocol === 'file:';
        const msg = isFile
            ? "Servidor multiplayer indisponível. Abra pelo servidor com npm run dev."
            : "Servidor multiplayer indisponível. Verifique se o servidor está rodando.";
        showModal("Multiplayer", msg, [
            { text: "Ok", action: showTCGMenu }
        ]);
        return;
    }
    if (!Array.isArray(state.tcgDeck) || state.tcgDeck.length < 20) {
        showModal("Multiplayer", "Você precisa de um deck completo (20 cartas).", [
            { text: "Ok", action: showTCGMenu }
        ]);
        return;
    }
    const body = `
        <div style="display:flex; flex-direction:column; gap:10px;">
            <label>Nome</label>
            <input id="tcg-mp-name" type="text" placeholder="Seu nome">
            <label>Sala</label>
            <input id="tcg-mp-room" type="text" placeholder="lobby">
        </div>
    `;
    showModal("TCG Multiplayer", body, [
        { text: "Entrar", action: () => tcgMpJoinFromModal() },
        { text: "Voltar", action: showTCGMenu }
    ]);
    const nameInput = document.getElementById('tcg-mp-name');
    const roomInput = document.getElementById('tcg-mp-room');
    if (nameInput && !nameInput.value) nameInput.value = `Jogador${Math.floor(Math.random() * 1000)}`;
    if (roomInput && !roomInput.value) roomInput.value = "lobby";
}

function tcgMpJoinFromModal() {
    const nameEl = document.getElementById('tcg-mp-name');
    const roomEl = document.getElementById('tcg-mp-room');
    const name = nameEl ? nameEl.value.trim() : "Jogador";
    const room = roomEl ? roomEl.value.trim() : "lobby";
    tcgMpConnect();
    tcgMp.room = room || "lobby";
    tcgMp.name = name || "Jogador";
    tcgMp.socket.emit("tcgJoin", { room: tcgMp.room, name: tcgMp.name, deck: tcgCloneDeck(state.tcgDeck) });
    showModal("Multiplayer", "Aguardando outro jogador...", [
        { text: "Cancelar", action: () => { tcgMpDisconnect(); showTCGMenu(); } }
    ]);
}

function tcgMpConnect() {
    if (tcgMp.socket) return;
    tcgMp.socket = io();
    tcgMp.socket.on("tcgWaiting", (data) => {
        showModal("Multiplayer", `Aguardando outro jogador na sala ${data.room}...`, [
            { text: "Cancelar", action: () => { tcgMpDisconnect(); showTCGMenu(); } }
        ]);
    });
    tcgMp.socket.on("tcgJoinError", (data) => {
        showModal("Multiplayer", data && data.message ? data.message : "Erro ao entrar.", [
            { text: "Ok", action: showTCGMenu }
        ]);
    });
    tcgMp.socket.on("tcgStart", (data) => {
        tcgMp.enabled = true;
        tcgMp.room = data.room;
        tcgMp.opponentName = data.opponentName || "Oponente";
        tcgMp.seed = data.seed;
        const youStart = data.starterId === data.yourId;
        startTCGMultiplayer(tcgCloneDeck(data.opponentDeck || []), data.seed, youStart);
    });
    tcgMp.socket.on("tcgCommand", (data) => {
        if (!tcgMp.enabled) return;
        if (data && data.action === "endTurn") {
            tcgMpApplyOpponentTurn();
        } else {
            tcgMpApplyCommand(data);
        }
    });
    tcgMp.socket.on("tcgOpponentLeft", () => {
        tcgMp.enabled = false;
        showModal("Multiplayer", "O oponente saiu da partida.", [
            { text: "Ok", action: showTCGMenu }
        ]);
    });
}

function tcgMpDisconnect() {
    if (tcgMp.socket) {
        tcgMp.socket.disconnect();
    }
    tcgMp.socket = null;
    tcgMp.enabled = false;
}



// --- Decks Salvos (Colecao) ---
function tcgEnsureDeckStorage() {
    if (!state) return;
    if (!Array.isArray(state.tcgDecks)) state.tcgDecks = [];

    // Migra deck unico antigo para colecao (uma vez)
    if (Array.isArray(state.tcgDeck) && state.tcgDeck.length > 0 && !state.tcgDecks.some(d => d && Array.isArray(d.cards) && d.cards.length)) {
        state.tcgDecks.push({
            id: `deck_${Date.now()}`,
            name: 'Meu Deck',
            cards: JSON.parse(JSON.stringify(state.tcgDeck))
        });
        saveGame();
    }

    // Garante deck ativo
    if (!Array.isArray(state.tcgDeck)) state.tcgDeck = [];
    saveAccountFromState(state);
}

function showTCGSavedDecks() {
    playSound('click');
    tcgEnsureDeckStorage();

    const activeSig = JSON.stringify((state.tcgDeck || []).map(c => ({ n: c.name, t: c.type, id: c.id, b: c.baseId })).slice(0, 20));

    const body = `
        <div style="color:white; margin-bottom:10px; text-align:center;">
            <b>Decks Salvos</b><br>
            Toque em um deck para carregar como deck ativo.
        </div>
        <div id="tcg-saved-decks" style="display:flex; flex-direction:column; gap:10px; max-height:380px; overflow:auto; padding:10px;">
            ${(state.tcgDecks || []).map((d, i) => {
                const sig = JSON.stringify((d.cards || []).map(c => ({ n: c.name, t: c.type, id: c.id, b: c.baseId })).slice(0, 20));
                const isActive = sig === activeSig;
                const count = (d.cards || []).length;
                const basics = (d.cards || []).filter(c => c.type === 'basic').length;
                const evos = (d.cards || []).filter(c => c.type === 'evo').length;
                const items = (d.cards || []).filter(c => c.type === 'item').length;

                return `
                    <div class="creature-card" style="padding:12px; border-radius:14px; cursor:pointer;" data-deck-idx="${i}">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <div style="font-size:1rem; color:gold;">${(d.name || 'Deck Sem Nome')}${isActive ? ' ✅' : ''}</div>
                                <div style="font-size:0.8rem; opacity:0.9; color:white;">${count}/20 | Básicos: ${basics} | Evoluções: ${evos} | Itens: ${items}</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button class="btn" style="padding:8px 10px;" data-action="rename" data-deck-idx="${i}">Renomear</button>
                                <button class="btn" style="padding:8px 10px;" data-action="delete" data-deck-idx="${i}">Excluir</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="margin-top:10px; font-size:0.85rem; color:#ccc; text-align:center;">
            Dica: ao salvar no editor, você pode criar vários decks.
        </div>
    `;

    showModal('Decks', body, [
        { text: 'Criar Novo (Editor)', action: () => showTCGDeckBuilder() },
        { text: 'Voltar', action: () => showTCGMenu() }
    ]);

    const container = document.getElementById('tcg-saved-decks');
    if (!container) return;

    // Clique no card carrega o deck
    container.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest ? e.target.closest('button[data-action]') : null;
        if (btn) {
            const idx = parseInt(btn.getAttribute('data-deck-idx'), 10);
            const action = btn.getAttribute('data-action');
            const deck = state.tcgDecks[idx];
            if (!deck) return;

            if (action === 'rename') {
                const name = prompt('Nome do deck:', deck.name || 'Meu Deck');
                if (name && name.trim()) {
                    deck.name = name.trim();
                    saveGame();
                    showTCGSavedDecks();
                }
                return;
            }

            if (action === 'delete') {
                if (confirm(`Excluir o deck "${deck.name || 'Deck'}"?`)) {
                    state.tcgDecks.splice(idx, 1);
                    saveGame();
                    showTCGSavedDecks();
                }
                return;
            }
            return;
        }

        const card = e.target && e.target.closest ? e.target.closest('[data-deck-idx]') : null;
        if (!card) return;
        const idx = parseInt(card.getAttribute('data-deck-idx'), 10);
        const deck = state.tcgDecks[idx];
        if (!deck || !Array.isArray(deck.cards)) return;

        state.tcgDeck = JSON.parse(JSON.stringify(deck.cards));
        saveGame();
        saveAccountFromState(state);
        addLog(`📦 TCG: Deck ativo carregado: ${deck.name || 'Deck'}`);
        showTCGMenu();
    });
}
function showTCGDeckBuilder() {
    playSound('click');
    const availableCards = getUnlockedTCGCards();

    let tempDeck = [...state.tcgDeck];

    // Cria a estrutura básica do modal apenas uma vez
    const body = `
        <div id="tcg-builder-container" style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 400px; overflow-y: auto;">
            <div id="builder-available" style="border-right: 1px solid #444; padding-right: 10px;">
                <h4 style="color:var(--accent-color)">Cartas Disponíveis</h4>
                <div id="available-list" class="selection-grid"></div>
            </div>
            <div id="builder-deck">
                <h4 id="deck-counter" style="color:var(--accent-color)">Seu Deck (0/20)</h4>
                <div id="deck-list" class="selection-grid"></div>
            </div>
        </div>
    `;

    showModal("Editor de Deck TCG", body, [
        { text: "Salvar Deck", action: () => {
            const hasBasic = tempDeck.some(c => c.type === 'basic');
            if (tempDeck.length === 20 && hasBasic) {
                tcgEnsureDeckStorage();

                const name = prompt('Nome do deck:', 'Meu Deck');
                const deckObj = {
                    id: `deck_${Date.now()}`,
                    name: (name && name.trim()) ? name.trim() : 'Meu Deck',
                    cards: JSON.parse(JSON.stringify(tempDeck))
                };

                // salva na colecao e define como ativo
                state.tcgDecks.push(deckObj);
                state.tcgDeck = JSON.parse(JSON.stringify(deckObj.cards));
                saveGame();
                saveAccountFromState(state);
                showTCGMenu();
            } else if (!hasBasic) {
                alert("O deck precisa ter pelo menos uma criatura básica!");
            } else {
                alert("O deck precisa ter exatamente 20 cartas!");
            }
        }},
        { text: "Deck Aleatório", action: () => {
            tempDeck = generateRandomTCGDeck(availableCards);
            updateBuilderLists();
        }},
        { text: "Exportar", action: () => {
            if (tempDeck.length === 0) {
                alert("O deck está vazio!");
                return;
            }
            const data = tempDeck.map(c => ({ n: c.name, t: c.type }));
            const code = btoa(JSON.stringify(data));
            navigator.clipboard.writeText(code).then(() => {
                alert("Código do deck copiado para a área de transferência!");
            }).catch(() => {
                prompt("Copie o código do seu deck:", code);
            });
        }},
        { text: "Importar", action: () => {
            const code = prompt("Cole o código do deck aqui:");
            if (!code) return;
            try {
                const data = JSON.parse(atob(code));
                if (!Array.isArray(data)) throw new Error();
                
                const newDeck = [];
                data.forEach(item => {
                    const card = availableCards.find(c => c.name === item.n && c.type === item.t);
                    if (card) newDeck.push({ ...card });
                });

                if (newDeck.length > 0) {
                    tempDeck = newDeck;
                    updateBuilderLists();
                    alert(`Deck importado com sucesso! (${newDeck.length} cartas)`);
                } else {
                    alert("Código inválido ou nenhuma carta compatível encontrada.");
                }
            } catch (e) {
                alert("Código de deck inválido!");
            }
        }},
        { text: "Limpar", action: () => { tempDeck = []; updateBuilderLists(); }},
        { text: "Voltar", action: showTCGMenu }
    ]);

    function updateBuilderLists() {
        const availList = document.getElementById('available-list');
        const deckList = document.getElementById('deck-list');
        const counter = document.getElementById('deck-counter');
        
        if (!availList || !deckList || !counter) return;

        // Salva o scroll do container ANTES de limpar
        const container = document.getElementById('tcg-builder-container');
        const scrollTop = container ? container.scrollTop : 0;

        availList.innerHTML = '';
        deckList.innerHTML = '';
        counter.innerText = `Seu Deck (${tempDeck.length}/20)`;

        availableCards.forEach(card => {
            const count = tempDeck.filter(c => c.name === card.name).length;
            const cardEl = document.createElement('div');
            cardEl.className = 'creature-card tooltip' + (count >= 2 ? ' disabled' : '');
            cardEl.style.width = '100px';
            cardEl.style.height = '140px';
            cardEl.style.fontSize = '0.7rem';
            cardEl.style.margin = '25px 20px 10px 10px';
            cardEl.style.position = 'relative'; // Garante posicionamento correto para badges
            
            const isItem = card.type === 'item';
            const hp = card.hp || 100;
            cardEl.innerHTML = `
                <div class="creature-card mini" style="width:100%; height:100%; margin:0; padding:0; border:none; box-shadow:none; pointer-events:none;">
                    ${isItem ? `
                        <div class="creature-img-container" style="background: rgba(255, 215, 0, 0.1);">
                            <img src="imagens/${card.image}" style="width:60%; height:60%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 2.5rem; opacity: 0.3;">${card.emoji || '📦'}</div>
                        </div>
                    ` : getCreatureDisplay(card)}
                    <div class="creature-card-info">
                        <div class="creature-card-name" style="font-size:0.7rem">${card.name}</div>
                        <div style="color:gold; font-size:0.6rem">${isItem ? 'Item' : (card.type === 'evo' ? 'Evolução' : 'Básico')} | ${count}/2</div>
                    </div>
                </div>
                <span class="tooltiptext">${getCreatureTooltip({...card, currentHp: hp, hp: hp})}</span>
            `;
            
            cardEl.onclick = () => {
                if (count < 2 && tempDeck.length < 20) {
                    tempDeck.push(card);
                    updateBuilderLists();
                }
            };
            availList.appendChild(cardEl);
        });

        tempDeck.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'creature-card tooltip';
            cardEl.style.width = '80px';
            cardEl.style.height = '110px';
            cardEl.style.fontSize = '0.6rem';
            cardEl.style.margin = '20px 15px 5px 5px';
            cardEl.style.position = 'relative';
            
            const isItem = card.type === 'item';
            const hp = card.hp || 100;
            cardEl.innerHTML = `
                <div class="creature-card mini" style="width:100%; height:100%; margin:0; padding:0; border:none; box-shadow:none; pointer-events:none;">
                    ${isItem ? `
                        <div class="creature-img-container" style="background: rgba(255, 215, 0, 0.1);">
                            <img src="imagens/${card.image}" style="width:60%; height:60%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 2rem; opacity: 0.3;">${card.emoji || '📦'}</div>
                        </div>
                    ` : getCreatureDisplay(card)}
                    <div class="creature-card-info">
                        <div class="creature-card-name" style="font-size:0.6rem">${card.name}</div>
                    </div>
                </div>
                <span class="tooltiptext">${getCreatureTooltip({...card, currentHp: hp, hp: hp})}</span>
            `;

            cardEl.onclick = () => {
                tempDeck.splice(index, 1);
                updateBuilderLists();
            };
            deckList.appendChild(cardEl);
        });

        // Restaura o scroll IMEDIATAMENTE após popular
        if (container) container.scrollTop = scrollTop;
    }

    updateBuilderLists();
}

function generateRandomTCGDeck(availableCards) {
    let deck = [];
    const basicCreatures = availableCards.filter(c => c.type === 'basic');
    const items = availableCards.filter(c => c.type === 'item');
    
    // Tenta pegar 7-8 pares de criaturas (básica + evolução)
    const shuffledBasics = [...basicCreatures].sort(() => Math.random() - 0.5);
    
    for (const basic of shuffledBasics) {
        if (deck.length >= 16) break;
        
        const evo1 = availableCards.find(c => c.type === 'evo' && c.baseId === basic.id);
        if (evo1) {
            // Adiciona 2 copias da basica + 2 da primeira evolucao
            deck.push({ ...basic }, { ...basic });
            deck.push({ ...evo1 }, { ...evo1 });

            // Se existir evolucao de evolucao (stack), tenta incluir tambem
            const evo2 = availableCards.find(c => c.type === 'evo' && c.baseId === evo1.id);
            if (evo2 && deck.length + 2 <= 20) {
                deck.push({ ...evo2 }, { ...evo2 });
            }
        }
    }
    
    // Preenche o resto com itens aleatórios (até 20 cartas)
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    for (const item of shuffledItems) {
        if (deck.length >= 20) break;
        // Adiciona até 2 cópias de cada item se houver espaço
        deck.push({...item});
        if (deck.length < 20) deck.push({...item});
    }
    
    // Se ainda não tiver 20 (raro), preenche com básicas aleatórias
    while (deck.length < 20) {
        const randomBasic = basicCreatures[Math.floor(Math.random() * basicCreatures.length)];
        const count = deck.filter(c => c.name === randomBasic.name).length;
        if (count < 2) deck.push({...randomBasic});
        else if (deck.length >= 20) break; 
    }
    
    return deck.slice(0, 20);
}

function startTCGGame() {
    if (state.tcgDeck.length < 20) {
        alert("Você precisa montar um deck de 20 cartas primeiro!");
        return;
    }
    if (!getUnlockedTCGCards || getUnlockedTCGCards().length === 0) {
        alert("Você precisa desbloquear cartas abrindo pacotes no Modo TCG.");
        return;
    }
    playSound('click');
    hideModal();
    
    // Inicializa estado do jogo TCG
    tcgState.hand = [];
    tcgState.active = null;
    tcgState.bench = [];
    tcgState.energy = 0;
    tcgState.points = 0;
    tcgState.enemyPoints = 0;
    tcgState.enemyActive = null;
    tcgState.enemyBench = [];
    tcgState.enemyHand = [];
    tcgState.enemyEnergy = 0;
    tcgState.cemetery = [];
    tcgState.enemyCemetery = [];
    tcgState.turn = 1;
    tcgState.isPlayerTurn = true;
    tcgState.log = ["Início do Duelo TCG!"];
    
    // Sorteio de quem começa
    const playerStarts = Math.random() > 0.5;
    tcgState.isPlayerTurn = playerStarts;
    
    // Embaralha deck jogador
    const gameDeck = [...state.tcgDeck].sort(() => Math.random() - 0.5);
    tcgState.currentDeck = gameDeck;
    
    // Gera deck inimigo (mesmo tamanho, cartas aleatórias válidas)
    const availableCards = [];

    function pushEvoChain(baseCreature) {
        let prevId = baseCreature.id;
        let evo = baseCreature.evo;
        let stage = 2;

        while (evo) {
            const evoId = evo.id || `${baseCreature.id}_lv${stage}`;
            availableCards.push({
                ...evo,
                id: evoId,
                type: 'evo',
                baseId: prevId,
                clan: baseCreature.clan,
                attacks: baseCreature.attacks,
                hp: (baseCreature.hp || 100) + (evo.hpBoost || 0),
                evoStage: stage
            });
            prevId = evoId;
            evo = evo.evo;
            stage++;
        }
    }

    CREATURE_POOL.forEach(c => {
        availableCards.push({ ...c, type: 'basic' });
        if (c.evo) pushEvoChain(c);
    });
    Object.values(ITEMS).forEach(i => availableCards.push({ ...i, type: 'item' }));
    tcgState.enemyDeck = generateRandomTCGDeck(availableCards);
    
    // Compra 5 cartas iniciais para ambos
    for (let i = 0; i < 5; i++) {
        if (tcgState.currentDeck.length > 0) tcgState.hand.push(tcgState.currentDeck.pop());
        if (tcgState.enemyDeck.length > 0) tcgState.enemyHand.push(tcgState.enemyDeck.pop());
    }

    // Garante criatura básica na mão inicial (Mulligan forçado)
    const ensureBasic = (hand, deck) => {
        if (!hand.some(c => c.type === 'basic')) {
            const basicIdx = deck.findIndex(c => c.type === 'basic');
            if (basicIdx !== -1) {
                // Troca a primeira carta da mão por uma básica do deck
                const swappedCard = hand.shift();
                const basicCard = deck.splice(basicIdx, 1)[0];
                hand.push(basicCard);
                deck.push(swappedCard);
                // Re-embaralha o deck após a troca
                deck.sort(() => Math.random() - 0.5);
            }
        }
    };

    ensureBasic(tcgState.hand, tcgState.currentDeck);
    ensureBasic(tcgState.enemyHand, tcgState.enemyDeck);
    
    setupTCGInterface();
    updateTCG();

    // Indicativo de quem joga primeiro
    const startMsg = tcgState.isPlayerTurn ? "Você joga primeiro!" : "O Inimigo joga primeiro!";
    const overlay = document.createElement('div');
    overlay.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.9); color:gold; padding:40px; border:2px solid gold; border-radius:15px; font-size:2rem; z-index:10000; text-align:center; box-shadow:0 0 50px gold; pointer-events:none; transition: opacity 0.5s;";
    overlay.innerHTML = `🎲 SORTEIO INICIAL<br><small style="color:white; font-size:1rem;">${startMsg}</small>`;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
        if (!tcgState.isPlayerTurn) {
            setTimeout(enemyTCGTurn, 1000);
        }
    }, 2000);
}

function startTCGMultiplayer(opponentDeck, seed, youStart) {
    if (state.tcgDeck.length < 20) {
        alert("Você precisa montar um deck de 20 cartas primeiro!");
        return;
    }
    playSound('click');
    hideModal();

    tcgState.hand = [];
    tcgState.active = null;
    tcgState.bench = [];
    tcgState.energy = 0;
    tcgState.points = 0;
    tcgState.enemyPoints = 0;
    tcgState.enemyActive = null;
    tcgState.enemyBench = [];
    tcgState.enemyHand = [];
    tcgState.enemyEnergy = 0;
    tcgState.cemetery = [];
    tcgState.enemyCemetery = [];
    tcgState.turn = 1;
    tcgState.isPlayerTurn = youStart;
    tcgState.log = ["Início do Duelo TCG Multiplayer!"];
    tcgState.hasAttachedEnergy = false;
    tcgState.hasAttacked = false;
    tcgState.enemyHasAttachedEnergy = false;
    tcgState.enemyHasAttacked = false;

    const playerDeck = tcgSeededShuffle(tcgCloneDeck(state.tcgDeck), seed + 1);
    const enemyDeck = tcgSeededShuffle(tcgCloneDeck(opponentDeck), seed + 2);
    tcgState.currentDeck = playerDeck;
    tcgState.enemyDeck = enemyDeck;

    for (let i = 0; i < 5; i++) {
        if (tcgState.currentDeck.length > 0) tcgState.hand.push(tcgState.currentDeck.pop());
        if (tcgState.enemyDeck.length > 0) tcgState.enemyHand.push(tcgState.enemyDeck.pop());
    }

    const ensureBasic = (hand, deck) => {
        if (!hand.some(c => c.type === 'basic')) {
            const basicIdx = deck.findIndex(c => c.type === 'basic');
            if (basicIdx !== -1) {
                const swappedCard = hand.shift();
                const basicCard = deck.splice(basicIdx, 1)[0];
                hand.push(basicCard);
                deck.push(swappedCard);
            }
        }
    };

    ensureBasic(tcgState.hand, tcgState.currentDeck);
    ensureBasic(tcgState.enemyHand, tcgState.enemyDeck);

    setupTCGInterface();
    updateTCG();

    const startMsg = tcgState.isPlayerTurn ? "Você joga primeiro!" : `${tcgMp.opponentName} joga primeiro!`;
    const overlay = document.createElement('div');
    overlay.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.9); color:gold; padding:40px; border:2px solid gold; border-radius:15px; font-size:2rem; z-index:10000; text-align:center; box-shadow:0 0 50px gold; pointer-events:none; transition: opacity 0.5s;";
    overlay.innerHTML = `🎲 SORTEIO INICIAL<br><small style="color:white; font-size:1rem;">${startMsg}</small>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }, 2000);
}

function tcgMpEmit(action, payload) {
    if (!tcgMp.enabled || !tcgMp.socket) return;
    tcgMp.socket.emit("tcgCommand", { room: tcgMp.room, action, payload });
}

function tcgMpApplyCommand(data) {
    if (!data || !data.action) return;
    tcgMp.applyingRemote = true;
    tcgMp.suppressRender = true;
    const prevTurn = tcgState.isPlayerTurn;
    tcgSwapSides();
    tcgState.isPlayerTurn = true;
    if (data.action === "playCard") {
        tcgApplyPlayCard(data.payload || {});
    } else if (data.action === "attack") {
        const idx = data.payload ? data.payload.attackIndex : 0;
        const atk = tcgState.active && tcgState.active.attacks ? tcgState.active.attacks[idx] : null;
        tcgAttack(atk);
        setTimeout(() => {
            if (!tcgState.isPlayerTurn) tcgMpApplyOpponentTurn();
        }, 1100);
    } else if (data.action === "attachEnergy") {
        const slot = data.payload ? data.payload.slot : "active";
        const index = data.payload ? data.payload.index : 0;
        const target = slot === "active" ? tcgState.active : tcgState.bench[index];
        if (target) tcgAttachEnergyToCreature(target);
    } else if (data.action === "retreat") {
        const idx = data.payload ? data.payload.index : 0;
        tcgPerformRetreat(idx);
    } else if (data.action === "support") {
        const slot = data.payload ? data.payload.slot : "active";
        const index = data.payload ? data.payload.index : 0;
        const target = slot === "active" ? tcgState.active : tcgState.bench[index];
        if (target) tcgUseSupportSkill(target);
    }
    tcgSwapSides();
    tcgState.isPlayerTurn = prevTurn;
    tcgMp.suppressRender = false;
    tcgMp.applyingRemote = false;
    updateTCG();
}

function tcgMpApplyOpponentTurn() {
    if (tcgState.isPlayerTurn) return;
    tcgState.turn++;
    tcgState.isPlayerTurn = true;
    if (tcgState.turn > 0) tcgState.energy++;
    if (tcgState.currentDeck && tcgState.currentDeck.length > 0) {
        tcgState.hand.push(tcgState.currentDeck.pop());
    }
    tcgUpdateCooldowns(tcgState.active);
    tcgUpdateCooldowns(tcgState.bench);
    if (!tcgState.active && tcgState.bench && tcgState.bench.length > 0) {
        tcgState.active = tcgState.bench.shift();
        addLog(`🛡️ TCG: ${tcgState.active.name} entrou no Ativo!`);
    }
    tcgState.hasAttachedEnergy = false;
    tcgState.hasAttacked = false;
    const passBtn = document.getElementById('tcg-pass-btn');
    if (passBtn) passBtn.disabled = false;
    updateTCG();
}

function tcgMpPrepareOpponentTurn() {
    if (tcgState.enemyDeck && tcgState.enemyDeck.length > 0) {
        tcgState.enemyHand.push(tcgState.enemyDeck.pop());
    }
    if (tcgState.turn > 0) tcgState.enemyEnergy++;
    tcgUpdateCooldowns(tcgState.enemyActive);
    tcgUpdateCooldowns(tcgState.enemyBench);
    if (!tcgState.enemyActive && tcgState.enemyBench && tcgState.enemyBench.length > 0) {
        tcgState.enemyActive = tcgState.enemyBench.shift();
        addLog(`👾 TCG: ${tcgState.enemyActive.name} entrou no Ativo!`);
    }
    tcgState.enemyHasAttachedEnergy = false;
    tcgState.enemyHasAttacked = false;
}

function tcgPerformRetreat(index) {
    if (!tcgState.active || !tcgState.bench || tcgState.bench.length === 0) return;
    const cost = 1;
    if ((tcgState.active.attachedEnergy || 0) < cost) return;
    if (!tcgState.bench[index]) return;
    tcgState.active.attachedEnergy -= cost;
    const oldActive = tcgState.active;
    tcgState.active = tcgState.bench[index];
    tcgState.bench[index] = oldActive;
    updateTCG();
    addLog(`🔄 TCG: ${oldActive.name} recuou para o banco.`);
}

function tcgApplyPlayCard(payload) {
    const handIndex = payload.handIndex;
    const card = tcgState.hand[handIndex];
    if (!card) return;
    if (card.type === 'basic') {
        if (!tcgState.active) {
            tcgState.active = applyTCGBonus(card);
            tcgState.hand.splice(handIndex, 1);
        } else if (tcgState.bench.length < 3) {
            tcgState.bench.push(applyTCGBonus(card));
            tcgState.hand.splice(handIndex, 1);
        }
    } else if (card.type === 'evo') {
        const targetType = payload.targetType;
        const targetIndex = payload.targetIndex;
        const target = targetType === 'active' ? tcgState.active : tcgState.bench[targetIndex];
        if (!target || !tcgCanEvolve(target, card)) return;
        const evolved = tcgEvolveTarget(target, card);
        if (targetType === 'active') tcgState.active = evolved;
        else tcgState.bench[targetIndex] = evolved;
        tcgState.hand.splice(handIndex, 1);
        addLog(`✨ TCG: ${target.name} evoluiu para ${evolved.name}!`);
    } else if (card.type === 'item') {
        const targetType = payload.targetType;
        const targetIndex = payload.targetIndex;
        const target = targetType === 'active' ? tcgState.active : tcgState.bench[targetIndex];
        if (!target) return;
        if (!target.items) target.items = [];
        if (target.items.length >= 3) return;
        target.items.push({ ...card });
        tcgState.hand.splice(handIndex, 1);
        addLog(`🛡️ TCG: ${card.name} equipado em ${target.name}!`);
    }
    updateTCG();
}

function enemyTCGTurn() {
    if (tcgState.isPlayerTurn) return;
    if (tcgMp.enabled) return;
    
    addLog("🤖 TCG: Turno do Inimigo...");
    
    // Reduz cooldowns do inimigo ao iniciar o turno dele
    tcgUpdateCooldowns(tcgState.enemyActive);
    tcgUpdateCooldowns(tcgState.enemyBench);

    setTimeout(() => {
        try {
            // Verifica Atordoamento
            if (tcgState.enemyActive && tcgState.enemyActive.stunned) {
                tcgState.enemyActive.stunned = false;
                addLog(`💫 TCG: ${tcgState.enemyActive.name} está atordoado e perdeu o turno!`);
                throw new Error("SKIP_TURN");
            }

            // 1. Compra carta
            if (tcgState.enemyDeck && tcgState.enemyDeck.length > 0) {
                tcgState.enemyHand.push(tcgState.enemyDeck.pop());
            }

            // 2. Gera Energia
            if (tcgState.turn > 0) tcgState.enemyEnergy++;

            // 3. Promoção do Banco (Se não houver Ativo e houver algo no banco)
            if (!tcgState.enemyActive && tcgState.enemyBench && tcgState.enemyBench.length > 0) {
                tcgState.enemyActive = tcgState.enemyBench.shift();
                addLog(`👾 TCG: Oponente promoveu ${tcgState.enemyActive.name} para o Ativo!`);
            }

            // 4. Joga Básicos
            if (tcgState.enemyHand) {
                for (let i = tcgState.enemyHand.length - 1; i >= 0; i--) {
                    const card = tcgState.enemyHand[i];
                    if (card.type === 'basic') {
                        if (!tcgState.enemyActive) {
                            tcgState.enemyActive = applyTCGBonus(card);
                            tcgState.enemyHand.splice(i, 1);
                            addLog(`👾 TCG: Inimigo enviou ${card.name} para o Ativo!`);
                        } else if (tcgState.enemyBench && tcgState.enemyBench.length < 3) {
                            tcgState.enemyBench.push(applyTCGBonus(card));
                            tcgState.enemyHand.splice(i, 1);
                            addLog(`👾 TCG: Inimigo colocou ${card.name} no banco.`);
                        }
                    }
                }
            }
            updateTCG();

            // 5. Evolui
            if (tcgState.enemyHand) {
                for (let i = tcgState.enemyHand.length - 1; i >= 0; i--) {
                    const card = tcgState.enemyHand[i];
                    if (card.type === 'evo') {
                        let target = null;
                        if (tcgState.enemyActive && tcgState.enemyActive.id === card.baseId && (tcgState.enemyActive.turnsInField >= 1 || tcgState.turn > 2)) {
                            target = tcgState.enemyActive;
                        } else if (tcgState.enemyBench) {
                            target = tcgState.enemyBench.find(b => b.id === card.baseId && (b.turnsInField >= 1 || tcgState.turn > 2));
                        }

                        if (target && tcgCanEvolve(target, card)) {
                            const evolved = tcgEvolveTarget(target, card);

                            if (tcgState.enemyActive === target) {
                                tcgState.enemyActive = evolved;
                            } else if (tcgState.enemyBench) {
                                const idx = tcgState.enemyBench.indexOf(target);
                                if (idx !== -1) tcgState.enemyBench[idx] = evolved;
                            }

                            tcgState.enemyHand.splice(i, 1);
                            addLog(`👾 TCG: Inimigo evoluiu para ${evolved.name}!`);
                            playSound('evolution');
                        }
                    }
                }
            }
            updateTCG();

            // 6. Liga Energia
            if (tcgState.enemyEnergy > 0) {
                let energyTarget = tcgState.enemyActive || (tcgState.enemyBench ? tcgState.enemyBench[0] : null);
                if (energyTarget) {
                    energyTarget.attachedEnergy = (energyTarget.attachedEnergy || 0) + 1;
                    tcgState.enemyEnergy--;
                    addLog(`⚡ TCG: Inimigo ligou energia em ${energyTarget.name}.`);
                }
            }
            updateTCG();

            // 7. Itens (equipar)
            if (tcgState.enemyHand) {
                for (let i = tcgState.enemyHand.length - 1; i >= 0; i--) {
                    const card = tcgState.enemyHand[i];
                    if (card.type === 'item') {
                        let target = tcgState.enemyActive || (tcgState.enemyBench ? tcgState.enemyBench[0] : null);
                        if (target) {
                            if (!target.items) target.items = [];
                            // Limite igual ao jogador: 3 slots
                            if (target.items.length < 3) {
                                target.items.push({ ...card });
                                tcgState.enemyHand.splice(i, 1);
                                addLog(`🛡️ TCG: Inimigo equipou ${card.name} em ${target.name}!`);
                            }
                        }
                    }
                }
            }
            updateTCG();

            // 8. Ataca
            setTimeout(() => {
                if (tcgState.enemyActive && tcgState.turn > 1 && tcgState.enemyActive.attachedEnergy > 0) {
                    
                    const performEnemyAttack = () => {
                        const atk = tcgState.enemyActive.attacks[tcgState.enemyActive.attacks.length - 1];
                        let baseDmg = Math.floor(atk.min + Math.random() * (atk.max - atk.min + 1));
                        
                        // Itens de Dano
                        if (tcgState.enemyActive.items) {
                            tcgState.enemyActive.items.forEach(item => {
                                if (item.id === 'garra_obsidiana') baseDmg += Math.floor(15 * 1.8);
                                if (item.id === 'anel_fogo') baseDmg += Math.floor(25 * 1.8);
                            });
                        }

                        // Debuff de Dano (no inimigo)
                        if (tcgState.enemyActive.maxDmgDebuff) {
                            baseDmg = Math.max(atk.min, baseDmg - tcgState.enemyActive.maxDmgDebuff.value);
                        }

                        let dmg = baseDmg;

                        // Crit
                        if (tcgState.enemyActive.critBuff) {
                             if (Math.random() < tcgState.enemyActive.critBuff.value) {
                                  dmg = Math.floor(dmg * 1.5);
                                  addLog(`🎯 TCG: Inimigo acertou Crítico!`);
                             }
                        }

                        // Invulnerability (Player)
                        if (tcgState.active && tcgState.active.invulnerability) {
                            dmg = 0;
                            addLog(`🛡️ TCG: Você está invulnerável!`);
                        }

                        if (tcgState.active) {
                            const enemyActiveSlot = document.getElementById('tcg-enemy-active-slot');
                            if (enemyActiveSlot) {
                                enemyActiveSlot.classList.remove('anim-attack-e');
                                void enemyActiveSlot.offsetWidth;
                                enemyActiveSlot.classList.add('anim-attack-e');
                                playSound('attack');
                            }

                            let hitChance = 0.9;
                            if (tcgState.active.items && tcgState.active.items.some(e => e.id === 'manto_esquiva')) hitChance = 0.65;
                            
                            if (tcgState.active.dodgeBuff) {
                                hitChance -= tcgState.active.dodgeBuff;
                                tcgState.active.dodgeBuff = 0;
                            }
                            
                            // Accuracy Debuff on Enemy
                            if (tcgState.enemyActive.missChance) {
                                hitChance -= tcgState.enemyActive.missChance;
                            }

                            if (Math.random() < hitChance) {
                                if (tcgState.active.damageReductionBuff) {
                                    // Se for objeto {value, turns}
                                    let reductionVal = 0;
                                    if (typeof tcgState.active.damageReductionBuff === 'object') {
                                        reductionVal = tcgState.active.damageReductionBuff.value;
                                    } else {
                                        reductionVal = tcgState.active.damageReductionBuff;
                                    }
                                    
                                    const reduction = Math.floor(dmg * reductionVal);
                                    dmg -= reduction;
                                    addLog(`🛡️ TCG: Proteção reduziu ${reduction} de dano!`);
                                    
                                    // Se for simples valor, consome. Se for objeto, tcgHandleBuffs decrementa.
                                    if (typeof tcgState.active.damageReductionBuff !== 'object') {
                                        tcgState.active.damageReductionBuff = 0;
                                    }
                                }

                                // Shield (Player)
                                if (dmg > 0 && tcgState.active.shield) {
                                    const shieldVal = tcgState.active.shield.value;
                                    if (shieldVal >= dmg) {
                                        tcgState.active.shield.value -= dmg;
                                        addLog(`🛡️ TCG: Escudo absorveu ${dmg} de dano!`);
                                        dmg = 0;
                                    } else {
                                        dmg -= shieldVal;
                                        tcgState.active.shield = null;
                                        addLog(`🛡️ TCG: Escudo quebrado!`);
                                    }
                                }

                                if (dmg > 0) {
                                    tcgState.active.currentHp -= dmg;
                                    addLog(`💥 TCG: Inimigo atacou ${tcgState.active.name} causando ${dmg} de dano!`);
                                } else {
                                    addLog(`🛡️ TCG: Dano absorvido completamente!`);
                                }

                                // Lifesteal (Enemy)
                                if (tcgState.enemyActive.lifesteal) {
                                    const heal = Math.floor(dmg * tcgState.enemyActive.lifesteal.value);
                                    if (heal > 0) {
                                        tcgState.enemyActive.currentHp = Math.min(tcgState.enemyActive.hp, tcgState.enemyActive.currentHp + heal);
                                        addLog(`🧛 TCG: ${tcgState.enemyActive.name} curou ${heal} HP com Roubo de Vida!`);
                                    }
                                }

                                // Reflect (Player Buff)
                                if (tcgState.active.reflect) {
                                    const reflectDmg = Math.floor(dmg * tcgState.active.reflect.value);
                                    if (reflectDmg > 0) {
                                        tcgState.enemyActive.currentHp -= reflectDmg;
                                        addLog(`🌵 TCG: ${tcgState.active.name} refletiu ${reflectDmg} de dano!`);
                                        showFloatingValue('tcg-enemy-active-slot', reflectDmg, 'damage');
                                    }
                                }
                                
                                setTimeout(() => {
                                    showFloatingValue('tcg-active-slot', dmg, 'damage');
                                    const playerSlot = document.getElementById('tcg-active-slot');
                                    if (playerSlot) {
                                        playerSlot.classList.remove('anim-shake');
                                        playerSlot.classList.remove('anim-flash');
                                        void playerSlot.offsetWidth;
                                        playerSlot.classList.add('anim-shake');
                                        playerSlot.classList.add('anim-flash');
                                        playSound('hit');
                                    }
                                }, 200);

                                if (tcgState.active.items && tcgState.active.items.some(e => e.id === 'escudo_espinhos')) {
                                    const reflect = Math.floor(dmg * 0.4);
                                    tcgState.enemyActive.currentHp -= reflect;
                                    addLog(`🌵 TCG: ${tcgState.active.name} refletiu ${reflect} de dano!`);
                                    showFloatingValue('tcg-enemy-active-slot', reflect, 'damage');
                                }

                                if (tcgState.active.currentHp <= 0) {
                                    const pts = tcgState.active.type === 'evo' ? 2 : 1;
                                    tcgState.enemyPoints += pts;
                                    addLog(`💀 TCG: ${tcgState.active.name} nocauteado! Inimigo +${pts} pontos.`);
                                    
                                    const playerSlot = document.getElementById('tcg-active-slot');
                                    if (playerSlot) {
                                        playerSlot.classList.add('anim-death');
                                        playSound('death');
                                    }

                                    setTimeout(() => {
                                        if (!tcgState.cemetery) tcgState.cemetery = [];
                                        tcgState.cemetery.push({ ...tcgState.active });
                                        tcgState.active = null;
                                        // Regra nova: promove automaticamente do banco; se não houver banco, derrota instantânea.
                                        tcgHandlePlayerActiveKO();
                                    }, 1000);
                                }
                            } else {
                                addLog(`💨 TCG: ${tcgState.active.name} desviou!`);
                            }
                        }
                    };

                    // Executa ataque (considerando MultiHit)
                    let attacksCount = 1;
                    if (tcgState.enemyActive.multiHit) attacksCount = 2;

                    performEnemyAttack();
                    if (attacksCount > 1 && tcgState.active && tcgState.active.currentHp > 0) {
                        setTimeout(() => {
                             if (tcgState.enemyActive && tcgState.active && tcgState.active.currentHp > 0) {
                                 addLog(`⚔️ TCG: Inimigo ataca novamente (Golpe Duplo)!`);
                                 performEnemyAttack();
                             }
                        }, 1000);
                    }
                }


                // Finaliza o turno do inimigo e volta para o jogador
                setTimeout(() => {
                    tcgState.turn++;
                    tcgState.isPlayerTurn = true;
                    tcgState.energy++; 
                    tcgState.hasAttachedEnergy = false;
                    tcgState.hasAttacked = false;

                    // Compra carta para o jogador
                    if (tcgState.currentDeck && tcgState.currentDeck.length > 0) {
                        tcgState.hand.push(tcgState.currentDeck.pop());
                    }

                    // Reduz cooldowns do jogador
                    tcgUpdateCooldowns(tcgState.active);
                    tcgUpdateCooldowns(tcgState.bench);
                    
                    // Incrementa turnsInField
                    if (tcgState.active) tcgState.active.turnsInField = (tcgState.active.turnsInField || 0) + 1;
                    if (tcgState.bench) tcgState.bench.forEach(b => b.turnsInField = (b.turnsInField || 0) + 1);
                    if (tcgState.enemyActive) tcgState.enemyActive.turnsInField = (tcgState.enemyActive.turnsInField || 0) + 1;
                    if (tcgState.enemyBench) tcgState.enemyBench.forEach(b => b.turnsInField = (b.turnsInField || 0) + 1);

                    // Processa buffs do inimigo no final do turno dele
                    if (tcgState.enemyActive) tcgHandleBuffs(tcgState.enemyActive);
                    if (tcgState.enemyBench && tcgState.enemyBench.length > 0) {
                        tcgState.enemyBench.forEach(b => tcgHandleBuffs(b));
                    }

                    const passBtn = document.getElementById('tcg-pass-btn');
                    if (passBtn) passBtn.disabled = false;

                    updateTCG();
                    addLog("--- Seu Turno ---");
                }, 1000);

            }, 1000);

        } catch (e) {
            if (e.message !== "SKIP_TURN") {
                console.error("Erro no turno da IA TCG:", e);
                addLog("⚠️ Erro no turno do inimigo.");
            }
            // Se falhar ou pular, garante que o turno volta para o jogador
            tcgState.isPlayerTurn = true;
            tcgState.energy++;
            if (tcgState.currentDeck && tcgState.currentDeck.length > 0) {
                tcgState.hand.push(tcgState.currentDeck.pop());
            }
            updateTCG();
        }
    }, 1500);
}

function setupTCGInterface() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('exploration-grid').classList.add('hidden');
    
    // Esconde header e barra de status no TCG
    const header = document.querySelector('header');
    if (header) header.style.display = 'none';
    const statsBar = document.getElementById('game-stats-bar');
    if (statsBar) statsBar.style.display = 'none';

    // Esconde UI de batalha padrão
    const standardArena = document.getElementById('standard-battle-arena');
    if (standardArena) standardArena.style.display = 'none';
    const battleLogs = document.getElementById('battle-logs');
    if (battleLogs) battleLogs.style.display = 'none';
    const battleActions = document.getElementById('battle-actions');
    if (battleActions) battleActions.style.display = 'none';
    const supportContainer = document.getElementById('support-container');
    if (supportContainer) supportContainer.style.display = 'none';
    const turnIndicator = document.getElementById('turn-indicator');
    if (turnIndicator) turnIndicator.style.display = 'none';

    // Mostra tabuleiro TCG
    const battleScreen = document.getElementById('battle-screen');
    battleScreen.style.display = 'flex';
    const tcgBoard = document.getElementById('tcg-board');
    if (tcgBoard) tcgBoard.style.display = 'flex';
}

function updateTCG() {
    if (tcgMp.suppressRender) return;
    const pPoints = document.getElementById('tcg-player-points');
    if (!pPoints) return; 

    pPoints.innerText = tcgState.points;
    document.getElementById('tcg-enemy-points').innerText = tcgState.enemyPoints;
    document.getElementById('tcg-player-deck').innerText = tcgState.currentDeck.length;
    
    const enemyDeckEl = document.getElementById('tcg-enemy-deck');
    if (enemyDeckEl) enemyDeckEl.innerText = tcgState.enemyDeck ? tcgState.enemyDeck.length : 0;
    
    const pCemetery = document.getElementById('tcg-player-cemetery');
    if (pCemetery) pCemetery.innerText = tcgState.cemetery ? tcgState.cemetery.length : 0;
    const eCemetery = document.getElementById('tcg-enemy-cemetery');
    if (eCemetery) eCemetery.innerText = tcgState.enemyCemetery ? tcgState.enemyCemetery.length : 0;
    
    const energyEl = document.getElementById('tcg-energy-pool');
    if (energyEl) {
        const canDragEnergy = tcgCanAttachEnergyNow();
        energyEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; justify-content:center;">
                <div>Energia: ⚡${tcgState.energy}</div>
                <div
                    id="tcg-energy-token"
                    style="
                        width:44px; height:44px; border-radius:12px;
                        display:flex; align-items:center; justify-content:center;
                        border:1px solid rgba(255,255,255,0.25);
                        background: rgba(255,255,255,0.06);
                        opacity:${canDragEnergy ? '1' : '0.35'};
                        touch-action:none; user-select:none;
                    "
                    title="${canDragEnergy ? 'Arraste para uma criatura' : 'Nao pode ligar energia agora'}"
                >⚡</div>
            </div>
        `;
    }
    const turnLabel = tcgState.isPlayerTurn ? 'Seu Turno' : `Turno ${tcgMp.enabled ? (tcgMp.opponentName || 'Oponente') : 'Inimigo'}`;
    document.getElementById('tcg-turn-info').innerText = `Turno ${tcgState.turn} - ${turnLabel}`;
    const accountHud = document.getElementById('tcg-account-hud');
    if (accountHud) {
        const lvl = typeof state.accountLevel === 'number' ? state.accountLevel : 1;
        const luxVal = typeof state.lux === 'number' ? state.lux : 80;
        accountHud.innerText = `Conta Nível ${lvl} | Lux: ${luxVal} ⚜️`;
    }

    const handEl = document.getElementById('tcg-hand');
    handEl.innerHTML = '';
    tcgState.hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'creature-card tooltip';
        cardEl.style.width = '80px';
        cardEl.style.height = '120px';
        cardEl.style.margin = '0';
        cardEl.style.fontSize = '0.6rem';
        cardEl.style.position = 'relative'; // Adicionado para badges
        
        const isItem = card.type === 'item';
        const hp = card.hp || 100;
        cardEl.innerHTML = `
            <div class="creature-card mini" style="width:100%; height:100%; margin:0; padding:0; border:none; box-shadow:none; pointer-events:none;">
                ${isItem ? `
                    <div class="creature-img-container" style="background: rgba(255, 215, 0, 0.1);">
                        <img src="imagens/${card.image}" style="width:60%; height:60%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 2rem; opacity: 0.3;">${card.emoji || '📦'}</div>
                    </div>
                ` : getCreatureDisplay(card)}
                <div class="creature-card-info">
                    <div class="creature-card-name" style="font-size:0.6rem">${card.name}</div>
                    <div style="color:gold; font-size:0.5rem">${isItem ? 'Item' : (card.type === 'evo' ? 'Evolução' : 'Básico')}</div>
                </div>
            </div>
            <span class="tooltiptext">${getCreatureTooltip({...card, currentHp: hp, hp: hp})}</span>
        `;

        cardEl.onclick = () => tcgPlayCard(index);
        handEl.appendChild(cardEl);
    });

    const activeSlot = document.getElementById('tcg-active-slot');
    if (activeSlot) renderTCGCard(activeSlot, tcgState.active);

    const benchSlotsContainer = document.getElementById('tcg-bench-slots');
    if (benchSlotsContainer) {
        const benchSlots = benchSlotsContainer.children;
        for (let i = 0; i < 3; i++) {
            const slot = benchSlots[i];
            if (slot) {
                slot.id = `tcg-bench-slot-${i}`; // Adiciona ID dinâmico para animações
                renderTCGCard(slot, tcgState.bench[i]);
                if (tcgState.bench[i]) {
                    slot.onclick = () => tcgAction('bench', i);
                } else {
                    slot.onclick = null;
                }
            }
        }
    }

    // Atualiza Campo Inimigo
    const enemyActiveSlot = document.getElementById('tcg-enemy-active-slot');
    if (enemyActiveSlot) renderTCGCard(enemyActiveSlot, tcgState.enemyActive);

    const enemyBenchContainer = document.getElementById('tcg-enemy-bench-slots');
    if (enemyBenchContainer) {
        enemyBenchContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            slot.className = 'tcg-slot bench';
            slot.id = `tcg-enemy-bench-slot-${i}`; // Adiciona ID dinâmico
            renderTCGCard(slot, tcgState.enemyBench[i]);
            enemyBenchContainer.appendChild(slot);
        }
    }

    // Liga drag de energia no mobile (token ⚡)
    tcgBindEnergyTokenMobile();
    
    checkTCGWin();

    // Se por qualquer motivo ficou sem Ativo mas ainda tem Banco, promove automaticamente.
    // (No mobile não abre modal.)
    if (!tcgState.active && tcgState.bench && tcgState.bench.length > 0) {
        tcgAutoPromotePlayerFromBench();
    }
}

function renderTCGCard(slot, card) {
    slot.classList.remove('anim-death');
    slot.classList.remove('anim-shake');
    slot.classList.remove('anim-flash');
    slot.style.opacity = '';
    slot.style.filter = '';
    slot.style.transform = '';

    if (!card) {
        slot.innerHTML = slot.classList.contains('active') ? 'Ativo' : 'Banco';
        slot.classList.remove('filled');
        slot.onmouseenter = null;
        slot.onmouseleave = null;
        return;
    }
    slot.classList.add('filled');
    
    const isItem = card.type === 'item';
    slot.innerHTML = `
        <div class="creature-card mini" style="width:100%; height:100%; margin:0; padding:0; border:none; box-shadow:none; pointer-events:none;">
            ${isItem ? `
                <div class="creature-img-container" style="background: rgba(255, 215, 0, 0.1);">
                    <img src="imagens/${card.image}" style="width:60%; height:60%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 2rem; opacity: 0.3;">${card.emoji || '📦'}</div>
                </div>
            ` : getCreatureDisplay(card)}
            <div class="creature-card-info">
                <div class="creature-card-name" style="font-size: 0.7rem; padding: 2px;">${card.name}</div>
                <div class="creature-card-stats" style="font-size: 0.6rem;">${isItem ? 'Item' : `HP: ${Math.floor(card.currentHp || 0)}/${card.hp || 0}`}</div>
            </div>
        </div>
        <div class="tcg-energy-badge">⚡${card.attachedEnergy || 0}</div>
    `;

    slot.onmouseenter = () => {
        // Limpa timer anterior se existir
        if (slot.tcgTooltipTimer) clearTimeout(slot.tcgTooltipTimer);
        
        slot.tcgTooltipTimer = setTimeout(() => {
            const tooltip = document.createElement('div');
            tooltip.id = 'tcg-field-tooltip';
            tooltip.className = 'tooltiptext';
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            tooltip.style.bottom = '120%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.width = '200px';
            tooltip.style.zIndex = '100';
            tooltip.innerHTML = getCreatureTooltip(card);
            slot.appendChild(tooltip);
        }, 2000); // 2 segundos de atraso
    };
    slot.onmouseleave = () => {
        if (slot.tcgTooltipTimer) {
            clearTimeout(slot.tcgTooltipTimer);
            slot.tcgTooltipTimer = null;
        }
        const t = slot.querySelector('#tcg-field-tooltip');
        if (t) t.remove();
    };
}

function tcgPlayCard(handIndex) {
    if (!tcgState.isPlayerTurn) return;
    const card = tcgState.hand[handIndex];
    
    if (card.type === 'basic') {
        let played = false;
        if (!tcgState.active) {
            tcgState.active = applyTCGBonus(card);
            tcgState.hand.splice(handIndex, 1);
            played = true;
        } else if (tcgState.bench.length < 3) {
            tcgState.bench.push(applyTCGBonus(card));
            tcgState.hand.splice(handIndex, 1);
            played = true;
        } else {
            alert("Banco cheio!");
        }
        if (played && tcgMp.enabled && !tcgMp.applyingRemote) {
            tcgMpEmit("playCard", { handIndex, mode: "basic" });
        }
    } else if (card.type === 'evo') {
        // Tenta evoluir
        const body = `Em qual criatura deseja evoluir ${card.name}?`;
        const targets = [];
        if (tcgState.active && tcgState.active.id === card.baseId) {
            targets.push({ type: 'active', data: tcgState.active });
        }
        tcgState.bench.forEach((b, idx) => {
            if (b.id === card.baseId) targets.push({ type: 'bench', index: idx, data: b });
        });

        if (targets.length === 0) {
            alert(`Você precisa da criatura base (ID: ${card.baseId}) em campo para evoluir!`);
            return;
        }

        showModal("Evoluir", body, []);
        const footer = document.getElementById('modal-footer');
        footer.innerHTML = '';
        targets.forEach(target => {
            const d = document.createElement('div');
            d.className = 'creature-card';
            d.style.width = '120px';
            d.style.height = '180px';
            d.innerHTML = `
                ${getCreatureDisplay(target.data)}
                <div class="creature-card-info">
                    <div class="creature-card-name">${target.data.name}</div>
                    <div class="creature-card-stats">${target.type === 'active' ? 'Ativo' : 'Banco'}</div>
                </div>
            `;
            d.onclick = () => {
                if (!tcgCanEvolve(target.data, card)) {
                    alert('Ainda não pode evoluir: espere 1 turno em campo.');
                    return;
                }

                const evolved = tcgEvolveTarget(target.data, card);

                if (target.type === 'active') tcgState.active = evolved;
                else tcgState.bench[target.index] = evolved;

                tcgState.hand.splice(handIndex, 1);
                hideModal();
                updateTCG();
                addLog(`✨ TCG: ${target.data.name} evoluiu para ${evolved.name}!`);
                playSound('evolution');
                if (tcgMp.enabled && !tcgMp.applyingRemote) {
                    tcgMpEmit("playCard", { handIndex, mode: "evo", targetType: target.type, targetIndex: target.index || 0 });
                }
            };
            footer.appendChild(d);
        });
    } else if (card.type === 'item') {
        // Equipamento
        const body = `Em qual criatura deseja equipar ${card.name}?`;
        showModal("Equipar Item", body, [{ text: "Cancelar", action: hideModal }]);
        
        const footer = document.getElementById('modal-footer');
        footer.innerHTML = '';

        const targets = [];
        if (tcgState.active) targets.push({ type: 'active', data: tcgState.active });
        tcgState.bench.forEach((b, idx) => targets.push({ type: 'bench', index: idx, data: b }));

        if (targets.length === 0) {
            alert("Não há criaturas em campo para equipar!");
            hideModal();
            return;
        }

        targets.forEach(target => {
            const d = document.createElement('div');
            d.className = 'creature-card';
            d.style.width = '120px';
            d.style.height = '180px';
            
            // TCG libera 3 slots fixos
            if (!target.data.items) target.data.items = [];
            const hasSlot = target.data.items.length < 3;

            d.innerHTML = `
                ${getCreatureDisplay(target.data)}
                <div class="creature-card-info">
                    <div class="creature-card-name">${target.data.name}</div>
                    <div class="creature-card-stats">${target.data.items.length}/3 Itens</div>
                </div>
            `;

            if (hasSlot) {
                d.onclick = () => {
                    target.data.items.push({...card});
                    tcgState.hand.splice(handIndex, 1);
                    hideModal();
                    updateTCG();
                    addLog(`🛡️ TCG: ${card.name} equipado em ${target.data.name}!`);
                    if (tcgMp.enabled && !tcgMp.applyingRemote) {
                        tcgMpEmit("playCard", { handIndex, mode: "item", targetType: target.type, targetIndex: target.index || 0 });
                    }
                };
            } else {
                d.style.opacity = '0.5';
                d.style.cursor = 'not-allowed';
            }
            footer.appendChild(d);
        });
    }
    updateTCG();
}

function tcgAction(type, index) {
    if (!tcgState.isPlayerTurn) return;
    
    const target = type === 'active' ? tcgState.active : tcgState.bench[index];
    if (!target) return;

    if (target.stunned) {
        addLog(`💫 TCG: ${target.name} está atordoado e não pode agir!`);
        target.stunned = false; // Consome o atordoamento
        return;
    }

    const body = `O que deseja fazer com ${target.name}?`;
    const actions = [];

    if (!tcgState.hasAttachedEnergy && tcgState.energy > 0 && tcgState.turn > 1) {
        actions.push({ text: "Dar Energia (⚡1)", action: () => {
            tcgAttachEnergyToCreature(target);
            hideModal();
        }});
    }

    if (type === 'active' && !tcgState.hasAttacked && tcgState.turn > 1 && target.attachedEnergy > 0) {
        actions.push({ text: "Atacar", action: () => {
            const attackBody = `Escolha o ataque para ${target.name}:`;
            const attackActions = target.attacks.map(atk => ({
                text: `${atk.name} (${atk.min}-${atk.max})`,
                action: () => {
                    tcgAttack(atk);
                    hideModal();
                }
            }));
            attackActions.push({ text: "Voltar", action: () => tcgAction(type, index) });
            showModal("Escolher Ataque", attackBody, attackActions);
        }});
    }

    if (type === 'active' && tcgState.bench.length > 0) {
        actions.push({ text: "Recuar", action: () => tcgRetreat() });
    }

    // Habilidade de Suporte (Ativo ou Banco)
    if (target.supportSkill) {
        if (!target.cooldowns) target.cooldowns = {};
        const cd = target.cooldowns[target.supportSkill.name] || 0;
        
        if (cd <= 0) {
            actions.push({ 
                text: `✨ ${target.supportSkill.name}`, 
                action: () => {
                    tcgUseSupportSkill(target);
                    hideModal();
                }
            });
        } else {
            actions.push({ 
                text: `✨ ${target.supportSkill.name} (CD: ${cd})`, 
                style: "opacity: 0.5; cursor: not-allowed;",
                action: () => alert(`Habilidade em recarga! Aguarde ${cd} turnos.`)
            });
        }
    }

    actions.push({ text: "Cancelar", action: hideModal });
    showModal(target.name, body, actions);
}

function tcgUseSupportSkill(creature) {
    const skill = creature.supportSkill;
    if (!skill) return;

    addLog(`✨ TCG: ${creature.name} usa ${skill.name}!`);
    playSound('heal');
    
    if (!creature.cooldowns) creature.cooldowns = {};
    creature.cooldowns[skill.name] = skill.cooldown;

    const targets = [];
    if (tcgState.active) targets.push({ data: tcgState.active, id: 'tcg-active-slot' });
    // Algumas skills podem afetar o banco também, mas por padrão focamos no ativo no TCG
    
    targets.forEach(target => {
        const active = target.data;
        switch (skill.effect) {
            case 'heal_percent':
                const heal = Math.floor(active.hp * skill.value);
                const oldHp = active.currentHp;
                active.currentHp = Math.min(active.hp, active.currentHp + heal);
                const actualHeal = active.currentHp - oldHp;
                if (actualHeal > 0) {
                    showFloatingValue(target.id, actualHeal, 'heal');
                    addLog(`💚 TCG: ${active.name} recuperou ${actualHeal} HP!`);
                }
                break;
            case 'fixed_dmg_buff':
                active.nextAttackBonus = (active.nextAttackBonus || 0) + Math.floor(skill.value * 1.8);
                addLog(`🔥 TCG: Próximo ataque de ${active.name} terá +${Math.floor(skill.value * 1.8)} de dano!`);
                break;
            case 'energy_gain':
                tcgState.energy += skill.value;
                addLog(`⚡ TCG: Ganhou ${skill.value} de Energia extra!`);
                break;
            case 'dmg_reduction_buff':
                active.damageReductionBuff = skill.value;
                addLog(`🛡️ TCG: ${active.name} recebeu proteção! -${Math.round(skill.value * 100)}% de dano no próximo turno.`);
                break;
            case 'guaranteed_max_dmg':
                active.guaranteedMax = true;
                addLog(`✨ TCG: Próximo ataque de ${active.name} causará dano máximo!`);
                break;
            case 'dodge_buff':
                active.dodgeBuff = skill.value;
                addLog(`💨 TCG: ${active.name} ganhou +${Math.round(skill.value * 100)}% de esquiva!`);
                break;
            case 'stun_chance':
                if (Math.random() < skill.value) {
                    if (tcgState.enemyActive) {
                        tcgState.enemyActive.stunned = true;
                        addLog(`💫 TCG: ${tcgState.enemyActive.name} ficou atordoado!`);
                    }
                } else {
                    addLog(`💨 TCG: A fumaça falhou em atordoar o inimigo.`);
                }
                break;
            case 'enemy_max_dmg_debuff':
                if (tcgState.enemyActive) {
                    const debuff = { value: skill.value, turns: skill.turns || 2 };
                    tcgState.enemyActive.maxDmgDebuff = debuff;
                    addLog(`✨ TCG: Dano máximo de ${tcgState.enemyActive.name} reduzido em ${skill.value} por ${debuff.turns} turnos!`);
                }
                break;

            // --- NOVAS SKILLS ---
            case 'shield_flat':
                active.shield = { value: skill.value, turns: skill.turns };
                addLog(`🛡️ TCG: ${active.name} recebeu um escudo de ${skill.value} HP!`);
                showFloatingValue(target.id, skill.value, 'heal');
                break;
            
            case 'regen_turns':
                active.regen = { value: skill.value, turns: skill.turns };
                addLog(`🌿 TCG: ${active.name} ganhou regeneração!`);
                break;
            
            case 'cleanse_debuffs':
                // Limpa debuffs comuns no TCG
                active.maxDmgDebuff = null;
                active.poison = null;
                active.stunned = false;
                if (active.missChance) active.missChance = 0;
                addLog(`✨ TCG: ${active.name} foi purificado!`);
                break;
            
            case 'crit_buff':
                active.critBuff = { value: skill.value, turns: skill.turns };
                addLog(`🎯 TCG: ${active.name} foca no ponto fraco! (Crítico garantido/aumentado)`);
                break;
            
            case 'multi_hit_buff':
                active.multiHit = { value: skill.value, turns: skill.turns };
                addLog(`⚔️ TCG: ${active.name} preparou um golpe duplo!`);
                break;

            case 'invulnerability':
                active.invulnerability = { turns: skill.turns };
                addLog(`🛡️ TCG: ${active.name} está invulnerável!`);
                break;

            case 'lifesteal_buff':
                active.lifesteal = { value: skill.value, turns: skill.turns };
                addLog(`🧛 TCG: ${active.name} ganhou roubo de vida!`);
                break;

            case 'reflect_damage':
                active.reflect = { value: skill.value, turns: skill.turns };
                addLog(`🌵 TCG: ${active.name} refletirá dano!`);
                break;
            
            case 'taunt_support':
                addLog(`📢 TCG: Provocar ativado! (Inimigo já foca no ativo no TCG)`);
                break;

            case 'cooldown_reduce_one':
                if (active.cooldowns) {
                    for (let k in active.cooldowns) {
                        if (active.cooldowns[k] > 0) active.cooldowns[k] = Math.max(0, active.cooldowns[k] - skill.value);
                    }
                }
                addLog(`⚡ TCG: Cooldowns de ${active.name} reduzidos!`);
                break;
        }
    });

    // Efeitos que miram o INIMIGO diretamente (sem precisar de target player) ou globais
    switch (skill.effect) {
        case 'enemy_accuracy_down':
            if (tcgState.enemyActive) {
                tcgState.enemyActive.missChance = (tcgState.enemyActive.missChance || 0) + skill.value;
                addLog(`🌫️ TCG: Precisão de ${tcgState.enemyActive.name} reduzida!`);
            }
            break;
        case 'enemy_damage_down':
            if (tcgState.enemyActive) {
                tcgState.enemyActive.damageReduction = (tcgState.enemyActive.damageReduction || 0) + skill.value;
                addLog(`📉 TCG: Dano de ${tcgState.enemyActive.name} enfraquecido!`);
            }
            break;
        case 'revive_weak':
                if (tcgState.cemetery && tcgState.cemetery.length > 0) {
                    const revived = tcgState.cemetery.pop();
                    revived.currentHp = Math.floor(revived.hp * skill.value);
                    // Adiciona ao banco
                    if (!tcgState.bench) tcgState.bench = [];
                    tcgState.bench.push(revived);
                    addLog(`✨ TCG: ${revived.name} renasceu do cemitério para o banco!`);
                } else {
                    addLog(`✨ TCG: Cemitério vazio, nada para reanimar.`);
                }
                break;
            
            case 'clean_recoil_heal':
                 const cleanHeal = skill.value || 15;
                 // Em TCG, 'recoil' não é persistente como estado, mas podemos curar
                 active.currentHp = Math.min(active.hp, active.currentHp + cleanHeal);
                 addLog(`✨ TCG: ${active.name} purificou energias e curou ${cleanHeal} HP!`);
                 break;

            case 'poison_enemy':
                if (tcgState.enemyActive) {
                    tcgState.enemyActive.poison = { value: skill.value, turns: skill.turns };
                    addLog(`☠️ TCG: ${tcgState.enemyActive.name} foi envenenado!`);
                }
                break;
    }

    if (tcgMp.enabled && !tcgMp.applyingRemote) {
        const slot = tcgGetCreatureSlot(creature);
        if (slot) tcgMpEmit("support", slot);
    }

    updateTCG();
}

function tcgAttack(chosenAttack) {
    if (!tcgState.active) return;
    
    // Verifica se o inimigo tem um ativo
    if (!tcgState.enemyActive) {
        if (tcgState.enemyBench && tcgState.enemyBench.length > 0) {
            addLog("⚠️ TCG: O inimigo deve promover uma criatura antes que você possa atacar!");
            return;
        } else {
            addLog("🏆 TCG: Inimigo sem criaturas! Vitória automática!");
            tcgState.points = 3;
            checkTCGWin();
            return;
        }
    }

    const passBtn = document.getElementById('tcg-pass-btn');
    if (passBtn) passBtn.disabled = true;

    // Se não passar ataque, usa o primeiro (fallback)
    const atk = chosenAttack || tcgState.active.attacks[0];
    const atkIndex = tcgState.active.attacks ? tcgState.active.attacks.indexOf(atk) : 0;
    let baseDmg = tcgState.active.guaranteedMax ? atk.max : Math.floor(atk.min + Math.random() * (atk.max - atk.min + 1));
    if (tcgState.active.guaranteedMax) {
        tcgState.active.guaranteedMax = false; // Consome o bônus
    }
    let bonusDmg = 0;
    
    // Aplica bônus de itens equipados
    if (tcgState.active.items) {
        tcgState.active.items.forEach(item => {
            if (item.id === 'garra_obsidiana') bonusDmg += Math.floor(15 * 1.8);
            if (item.id === 'anel_fogo') bonusDmg += Math.floor(25 * 1.8);
            if (item.id === 'colar_regeneracao') {
                const heal = Math.floor(tcgState.active.hp * 0.1);
                tcgState.active.currentHp = Math.min(tcgState.active.hp, tcgState.active.currentHp + heal);
                addLog(`✨ TCG: ${tcgState.active.name} regenerou ${heal} HP!`);
            }
        });
    }

    // Aplica bônus de Habilidade de Suporte
    if (tcgState.active.nextAttackBonus) {
        bonusDmg += tcgState.active.nextAttackBonus;
        tcgState.active.nextAttackBonus = 0; // Consome o bônus
    }

    // Aplica Max Dmg Debuff (no próprio atacante)
    if (tcgState.active.maxDmgDebuff) {
        baseDmg = Math.max(atk.min, baseDmg - tcgState.active.maxDmgDebuff.value);
        // Não decrementa turnos aqui, deixa para o tcgHandleBuffs no final do turno
    }

    let dmg = baseDmg + bonusDmg;

    // --- NOVOS BUFFS (TCG) ---
    // MultiHit (Simulado como dobro de dano para simplificar o fluxo assíncrono do TCG)
    if (tcgState.active.multiHit) {
        dmg = Math.floor(dmg * 2);
        addLog(`⚔️ TCG: Golpe Duplo! Dano dobrado!`);
    }

    // CritBuff
    if (tcgState.active.critBuff) {
        if (Math.random() < tcgState.active.critBuff.value) {
             dmg = Math.floor(dmg * 1.5);
             addLog(`🎯 TCG: Acerto Crítico!`);
        }
    }

    // Invulnerability (Enemy)
    if (tcgState.enemyActive.invulnerability) {
        dmg = 0;
        addLog(`🛡️ TCG: Oponente está invulnerável!`);
    }

    // Shield (Enemy)
    if (dmg > 0 && tcgState.enemyActive.shield) {
        const shieldVal = tcgState.enemyActive.shield.value;
        if (shieldVal >= dmg) {
            tcgState.enemyActive.shield.value -= dmg;
            addLog(`🛡️ TCG: Escudo inimigo absorveu ${dmg} de dano!`);
            dmg = 0;
        } else {
            dmg -= shieldVal;
            tcgState.enemyActive.shield = null;
            addLog(`🛡️ TCG: Escudo inimigo quebrado!`);
        }
    }

    // Lifesteal (Player)
    if (tcgState.active.lifesteal) {
        const heal = Math.floor(dmg * tcgState.active.lifesteal.value);
        if (heal > 0) {
            tcgState.active.currentHp = Math.min(tcgState.active.hp, tcgState.active.currentHp + heal);
            addLog(`🧛 TCG: ${tcgState.active.name} curou ${heal} HP com Roubo de Vida!`);
        }
    }

    // Reflect (Enemy)
    if (tcgState.enemyActive.reflect) {
        const reflectDmg = Math.floor(dmg * tcgState.enemyActive.reflect.value);
        if (reflectDmg > 0) {
            tcgState.active.currentHp -= reflectDmg;
            addLog(`🌵 TCG: ${tcgState.enemyActive.name} refletiu ${reflectDmg} de dano!`);
            
            // Verifica se o jogador morreu pelo reflect
            if (tcgState.active.currentHp <= 0) {
                 // Animação e lógica de morte do jogador serão tratadas no fluxo principal ou precisamos chamar aqui?
                 // Como tcgAttack é síncrono/linear, se o jogador morrer aqui, pode dar conflito com o resto da função?
                 // Melhor apenas atualizar visualmente por enquanto e deixar o checkTCGDefeat/Win lidar se for chamado,
                 // mas tcgAttack foca em matar o inimigo.
                 // Vamos adicionar uma verificação rápida visual.
                 showFloatingValue('tcg-active-slot', reflectDmg, 'damage');
            }
        }
    }
    // -------------------------

    // Vantagem de Clã (se houver)
    if (tcgState.active.clan && tcgState.enemyActive.clan && typeof CLANS !== 'undefined') {
        const myClan = CLANS[tcgState.active.clan];
        if (myClan && myClan.strongAgainst.includes(tcgState.enemyActive.clan)) {
            dmg = Math.floor(dmg * 1.5);
            addLog(`💥 TCG: Vantagem de Clã! Dano aumentado!`);
        } else if (myClan && myClan.weakAgainst.includes(tcgState.enemyActive.clan)) {
            dmg = Math.floor(dmg * 0.5);
            addLog(`🛡️ TCG: Desvantagem de Clã! Dano reduzido!`);
        }
    }

    addLog(`⚔️ TCG: ${tcgState.active.name} usou ${atk.name} e causou ${dmg} de dano!`);
    
    // Animação de ataque jogador
    const activeSlot = document.getElementById('tcg-active-slot');
    if (activeSlot) {
        activeSlot.classList.remove('anim-attack-p');
        void activeSlot.offsetWidth;
        activeSlot.classList.add('anim-attack-p');
        playSound('attack');
    }

    tcgState.enemyActive.currentHp -= dmg;
    
    // Animação de dano no inimigo
    setTimeout(() => {
        showFloatingValue('tcg-enemy-active-slot', dmg, 'damage');
        const enemySlot = document.getElementById('tcg-enemy-active-slot');
        if (enemySlot) {
            enemySlot.classList.remove('anim-shake');
            enemySlot.classList.remove('anim-flash');
            void enemySlot.offsetWidth;
            enemySlot.classList.add('anim-shake');
            enemySlot.classList.add('anim-flash');
            playSound('hit');
        }
    }, 200);
    
    if (tcgState.enemyActive.currentHp <= 0) {
        const pts = tcgState.enemyActive.type === 'evo' ? 2 : 1;
        tcgState.points += pts;
        addLog(`🏆 TCG: ${tcgState.enemyActive.name} nocauteado! +${pts} Pontos!`);
        
        const enemySlot = document.getElementById('tcg-enemy-active-slot');
        if (enemySlot) {
            enemySlot.classList.add('anim-death');
            playSound('death');
        }

        setTimeout(() => {
            if (!tcgState.enemyCemetery) tcgState.enemyCemetery = [];
            tcgState.enemyCemetery.push({...tcgState.enemyActive});
            tcgState.enemyActive = null;
            
            if (tcgState.enemyBench && tcgState.enemyBench.length > 0) {
                tcgState.enemyActive = tcgState.enemyBench.shift();
                addLog(`👾 TCG: Oponente promoveu ${tcgState.enemyActive.name} para o Ativo!`);
            }
            
            checkTCGWin();
            updateTCG();
        }, 1000);
        return;
    }

    tcgState.hasAttacked = true;
    updateTCG();
    if (tcgMp.enabled && !tcgMp.applyingRemote) {
        tcgMpEmit("attack", { attackIndex: atkIndex });
    }
    setTimeout(() => tcgEndTurn(), 1000);
}

function checkTCGDefeat() {
    // Verifica derrota do jogador
    const playerHasField = tcgState.active || (tcgState.bench && tcgState.bench.length > 0);
    const playerHasBasicInHand = tcgState.hand && tcgState.hand.some(c => c.type === 'basic');
    
    if (!playerHasField && !playerHasBasicInHand) {
        addLog("💀 TCG: Você não tem mais criaturas no campo nem básicos na mão! Derrota automática.");
        tcgState.enemyPoints = 3;
        return true;
    }

    // Verifica derrota do inimigo
    const enemyHasField = tcgState.enemyActive || (tcgState.enemyBench && tcgState.enemyBench.length > 0);
    const enemyHasBasicInHand = tcgState.enemyHand && tcgState.enemyHand.some(c => c.type === 'basic');

    if (!enemyHasField && !enemyHasBasicInHand) {
        addLog("🏆 TCG: O oponente não tem mais criaturas no campo nem básicos na mão! Vitória automática.");
        tcgState.points = 3;
        return true;
    }
    return false;
}

function checkTCGWin() {
    // Primeiro verifica se alguém perdeu por falta de criaturas
    if (checkTCGDefeat()) return true;

    if (tcgState.points >= 3) {
        addLog("🎉 VOCÊ VENCEU O DUELO TCG!");
        setTimeout(() => {
            const rewardLux = 50;
            alert("Parabéns! Você venceu o Duelo TCG e ganhou " + rewardLux + " Lux!");
            if (typeof state.lux !== 'number') state.lux = 80;
            state.lux += rewardLux;
            saveGame();
            saveAccountFromState(state);
            location.reload();
        }, 1000);
        return true;
    } else if (tcgState.enemyPoints >= 3) {
        addLog("💀 VOCÊ PERDEU O DUELO TCG...");
        setTimeout(() => {
            alert("O oponente venceu o Duelo TCG. Mais sorte na próxima!");
            location.reload();
        }, 1000);
        return true;
    }
    return false;
}

function tcgPromoteFromBench() {
    if (tcgState.active || !tcgState.bench || tcgState.bench.length === 0) return;

    const body = "Seu Ativo foi nocauteado! Escolha um substituto do banco:";
    showModal("Promover Criatura", body, []);
    
    const footer = document.getElementById('modal-footer');
    footer.innerHTML = '';
    tcgState.bench.forEach((b, idx) => {
        const d = document.createElement('div');
        d.className = 'creature-card tooltip';
        d.style.width = '120px';
        d.style.height = '180px';
        d.innerHTML = `
            ${getCreatureDisplay(b)}
            <div class="creature-card-info">
                <div class="creature-card-name">${b.name}</div>
                <div class="creature-card-stats">HP: ${b.currentHp}/${b.hp}</div>
            </div>
            <span class="tooltiptext">${getCreatureTooltip(b)}</span>
        `;
        d.onclick = () => {
            tcgState.active = tcgState.bench.splice(idx, 1)[0];
            hideModal();
            updateTCG();
            addLog(`🛡️ TCG: ${tcgState.active.name} assumiu o posto ativo!`);
        };
        footer.appendChild(d);
    });
}

function showCemetery(who) {
    const list = who === 'player' ? tcgState.cemetery : tcgState.enemyCemetery;
    if (!list || list.length === 0) {
        alert("O cemitério está vazio!");
        return;
    }

    const body = `
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; max-height:300px; overflow-y:auto; padding:10px;">
            ${list.map(card => {
                const isItem = card.type === 'item';
                return `
                    <div class="creature-card mini tooltip" style="width:100px; height:150px; font-size:0.7rem; opacity:0.7; position:relative; margin-bottom:30px;">
                        ${isItem ? `
                            <div class="creature-img-container" style="background: rgba(255, 215, 0, 0.1);">
                                <img src="imagens/${card.image}" style="width:60%; height:60%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 2.5rem; opacity: 0.3;">${card.emoji || '📦'}</div>
                            </div>
                        ` : getCreatureDisplay(card)}
                        <div class="creature-card-info">
                            <div class="creature-card-name" style="font-size:0.7rem">${card.name}</div>
                            <div class="creature-card-stats" style="font-size:0.6rem">${isItem ? 'Item' : `HP: ${card.hp}`}</div>
                        </div>
                        <span class="tooltiptext">${getCreatureTooltip({...card, currentHp: 0, hp: card.hp || 100})}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    showModal(`Cemitério (${who === 'player' ? 'Seu' : 'Inimigo'})`, body, [{ text: "Fechar", action: hideModal }]);
}

function tcgRetreat() {
    if (!tcgState.active || tcgState.bench.length === 0) return;
    
    const cost = 1; 
    if (tcgState.active.attachedEnergy < cost) {
        alert(`Energia insuficiente para recuar! Necessário: ⚡${cost}`);
        return;
    }

    const body = "Escolha qual criatura do banco assumirá o lugar:";
    showModal("Recuar", body, [{ text: "Cancelar", action: hideModal }]);

    const footer = document.getElementById('modal-footer');
    footer.innerHTML = '';
    tcgState.bench.forEach((b, idx) => {
        const d = document.createElement('div');
        d.className = 'creature-card tooltip';
        d.style.width = '120px';
        d.style.height = '180px';
        d.innerHTML = `
            ${getCreatureDisplay(b)}
            <div class="creature-card-info">
                <div class="creature-card-name">${b.name}</div>
                <div class="creature-card-stats">HP: ${b.currentHp}/${b.hp}</div>
            </div>
            <span class="tooltiptext">${getCreatureTooltip(b)}</span>
        `;
        d.onclick = () => {
            tcgPerformRetreat(idx);
            hideModal();
            if (tcgMp.enabled && !tcgMp.applyingRemote) {
                tcgMpEmit("retreat", { index: idx });
            }
        };
        footer.appendChild(d);
    });
}

function tcgUpdateCooldowns(creatures) {
    if (!creatures) return;
    const list = Array.isArray(creatures) ? creatures : [creatures];
    list.forEach(c => {
        if (c && c.cooldowns) {
            for (let skill in c.cooldowns) {
                if (c.cooldowns[skill] > 0) {
                    c.cooldowns[skill]--;
                }
            }
        }
    });
}

function tcgHandleBuffs(creature) {
    if (!creature) return;

    // Regen
    if (creature.regen && creature.regen.turns > 0) {
        const heal = Math.floor(creature.hp * creature.regen.value);
        creature.currentHp = Math.min(creature.hp, creature.currentHp + heal);
        addLog(`🌿 TCG: ${creature.name} regenerou ${heal} HP.`);
        creature.regen.turns--;
        if (creature.regen.turns <= 0) creature.regen = null;
    }

    // Shield (flat value, duration based)
    if (creature.shield && creature.shield.turns !== undefined) {
        creature.shield.turns--;
        if (creature.shield.turns <= 0) {
            creature.shield = null;
            addLog(`🛡️ TCG: Escudo de ${creature.name} expirou.`);
        }
    }

    // Crit
    if (creature.critBuff && creature.critBuff.turns > 0) {
        creature.critBuff.turns--;
        if (creature.critBuff.turns <= 0) {
            creature.critBuff = null;
            addLog(`🎯 TCG: Foco de ${creature.name} terminou.`);
        }
    }

    // MultiHit
    if (creature.multiHit && creature.multiHit.turns > 0) {
        creature.multiHit.turns--;
        if (creature.multiHit.turns <= 0) {
            creature.multiHit = null;
            addLog(`⚔️ TCG: Efeito de golpe duplo de ${creature.name} acabou.`);
        }
    }

    // Invulnerability
    if (creature.invulnerability && creature.invulnerability.turns > 0) {
        creature.invulnerability.turns--;
        if (creature.invulnerability.turns <= 0) {
            creature.invulnerability = null;
            addLog(`🛡️ TCG: Invulnerabilidade de ${creature.name} terminou.`);
        }
    }

    // Lifesteal
    if (creature.lifesteal && creature.lifesteal.turns > 0) {
        creature.lifesteal.turns--;
        if (creature.lifesteal.turns <= 0) {
            creature.lifesteal = null;
            addLog(`🧛 TCG: Roubo de vida de ${creature.name} acabou.`);
        }
    }

    // Reflect
    if (creature.reflect && creature.reflect.turns > 0) {
        creature.reflect.turns--;
        if (creature.reflect.turns <= 0) {
            creature.reflect = null;
            addLog(`🌵 TCG: Reflexão de ${creature.name} acabou.`);
        }
    }

    // Poison
    if (creature.poison && creature.poison.turns > 0) {
        const dmg = Math.floor(creature.hp * creature.poison.value);
        creature.currentHp -= dmg;
        addLog(`☠️ TCG: ${creature.name} sofreu ${dmg} de dano por veneno!`);
        creature.poison.turns--;
        
        if (creature.currentHp <= 0) {
            // Se morrer pelo veneno, handled no próximo check de vitória/derrota ou update
            // Mas visualmente seria bom atualizar
        }

        if (creature.poison.turns <= 0) {
            creature.poison = null;
            addLog(`✨ TCG: ${creature.name} se recuperou do veneno.`);
        }
    }

    // Max Dmg Debuff (Decrementa duração se for baseado em turnos)
    if (creature.maxDmgDebuff && creature.maxDmgDebuff.turns > 0) {
        creature.maxDmgDebuff.turns--;
        if (creature.maxDmgDebuff.turns <= 0) {
            creature.maxDmgDebuff = null;
            addLog(`✨ TCG: Debuff de dano de ${creature.name} expirou.`);
        }
    }

    // Cleanse Taunt if turns expire (assuming taunt has turns)
    if (creature.taunt && creature.taunt.turns > 0) {
        creature.taunt.turns--;
        if (creature.taunt.turns <= 0) {
            creature.taunt = null;
            addLog(`📢 TCG: ${creature.name} parou de provocar.`);
        }
    }
}

function tcgEndTurn() {
    if (!tcgState.isPlayerTurn) return;

    // Processa buffs do jogador no final do turno dele
    if (tcgState.active) tcgHandleBuffs(tcgState.active);
    if (tcgState.bench && tcgState.bench.length > 0) {
        tcgState.bench.forEach(b => tcgHandleBuffs(b));
    }

    if (tcgMp.enabled) {
        tcgState.isPlayerTurn = false;
        tcgState.turn++;
        tcgState.hasAttachedEnergy = false;
        tcgState.hasAttacked = false;
        tcgMpPrepareOpponentTurn();
        const passBtn = document.getElementById('tcg-pass-btn');
        if (passBtn) passBtn.disabled = true;
        updateTCG();
        checkTCGWin();
        tcgMpEmit("endTurn", {});
        return;
    }

    tcgState.isPlayerTurn = false;
    tcgState.hasAttachedEnergy = false;
    tcgState.hasAttacked = false;
    
    const passBtn = document.getElementById('tcg-pass-btn');
    if (passBtn) passBtn.disabled = true;

    updateTCG();
    checkTCGWin();
    
    enemyTCGTurn();
}
