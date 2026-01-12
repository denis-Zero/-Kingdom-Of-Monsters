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

// Redefine addLog para o modo TCG
function addLog(m) {
    const tcgLog = document.getElementById('tcg-battle-logs');
    if (tcgLog) {
        const d = document.createElement('div');
        d.innerHTML = m;
        tcgLog.appendChild(d);
        tcgLog.scrollTop = tcgLog.scrollHeight;
    } else {
        // Fallback para o log de batalha padrão se o TCG log não existir
        const l = document.getElementById('battle-logs');
        if (l) {
            const d = document.createElement('div');
            d.innerHTML = m;
            l.appendChild(d);
            l.scrollTop = l.scrollHeight;
        }
    }
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


function showTCGMenu() {
    playSound('click');
    const body = `
        <div style="text-align:center; color:white; margin-bottom:20px;">
            Bem-vindo ao Modo TCG!<br><br>
            Monte seu deck de 20 cartas e vença acumulando 3 pontos de vitória.
        </div>
    `;
    showModal("Modo TCG", body, [
        { text: "Montar Deck", action: () => showTCGDeckBuilder() },
        { text: "Jogar (Requer Deck)", action: () => startTCGGame() },
        { text: "Voltar", action: hideModal }
    ]);
}

function showTCGDeckBuilder() {
    playSound('click');
    const availableCards = [];
    CREATURE_POOL.forEach(c => {
        availableCards.push({ ...c, type: 'basic' });
        if (c.evo) {
            availableCards.push({ 
                ...c.evo, 
                type: 'evo', 
                baseId: c.id,
                clan: c.clan,
                attacks: c.attacks,
                hp: c.hp + (c.evo.hpBoost || 0)
            });
        }
    });
    Object.values(ITEMS).forEach(i => availableCards.push({ ...i, type: 'item' }));

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
                state.tcgDeck = tempDeck;
                saveGame();
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
        
        const evolution = availableCards.find(c => c.type === 'evo' && c.baseId === basic.id);
        if (evolution) {
            // Adiciona 2 cópias da básica e 2 da evolução (4 cartas)
            deck.push({...basic}, {...basic});
            deck.push({...evolution}, {...evolution});
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
    CREATURE_POOL.forEach(c => {
        availableCards.push({ ...c, type: 'basic' });
        if (c.evo) {
            availableCards.push({ 
                ...c.evo, 
                type: 'evo', 
                baseId: c.id,
                clan: c.clan,
                attacks: c.attacks,
                hp: c.hp + (c.evo.hpBoost || 0)
            });
        }
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

function enemyTCGTurn() {
    if (tcgState.isPlayerTurn) return;
    
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

                        if (target) {
                            const evolved = applyTCGBonus(card);
                            const damageTaken = target.hp - target.currentHp;
                            
                            target.name = evolved.name;
                            target.emoji = evolved.emoji;
                            if (evolved.image) target.image = evolved.image;
                            target.hp = evolved.hp;
                            target.currentHp = Math.max(10, evolved.hp - damageTaken);
                            target.attacks = evolved.attacks;
                            target.type = 'evo';
                            target.supportSkill = evolved.supportSkill;
                            
                            tcgState.enemyHand.splice(i, 1);
                            addLog(`👾 TCG: Inimigo evoluiu para ${target.name}!`);
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

            // 7. Equipamentos
            if (tcgState.enemyHand) {
                for (let i = tcgState.enemyHand.length - 1; i >= 0; i--) {
                    const card = tcgState.enemyHand[i];
                    if (card.type === 'item') {
                        let target = tcgState.enemyActive || (tcgState.enemyBench ? tcgState.enemyBench[0] : null);
                        if (target) {
                            if (!target.equipped) target.equipped = [];
                            target.equipped.push(card);
                            tcgState.enemyHand.splice(i, 1);
                            addLog(`🛡️ TCG: Inimigo equipou ${card.name} em ${target.name}!`);
                        }
                    }
                }
            }
            updateTCG();

            // 8. Ataca
            setTimeout(() => {
                if (tcgState.enemyActive && tcgState.turn > 1 && tcgState.enemyActive.attachedEnergy > 0) {
                    const atk = tcgState.enemyActive.attacks[tcgState.enemyActive.attacks.length - 1];
                    let dmg = Math.floor(atk.min + Math.random() * (atk.max - atk.min + 1));
                    
                    if (tcgState.enemyActive.equipped) {
                        tcgState.enemyActive.equipped.forEach(item => {
                            if (item.id === 'garra_obsidiana') dmg += Math.floor(15 * 1.8);
                            if (item.id === 'anel_fogo') dmg += Math.floor(25 * 1.8);
                        });
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
                        if (tcgState.active.equipped && tcgState.active.equipped.some(e => e.id === 'manto_esquiva')) hitChance = 0.65;
                        
                        if (tcgState.active.dodgeBuff) {
                            hitChance -= tcgState.active.dodgeBuff;
                            tcgState.active.dodgeBuff = 0;
                        }

                        if (Math.random() < hitChance) {
                            if (tcgState.active.damageReductionBuff) {
                                const reduction = Math.floor(dmg * tcgState.active.damageReductionBuff);
                                dmg -= reduction;
                                addLog(`🛡️ TCG: Proteção reduziu ${reduction} de dano!`);
                                tcgState.active.damageReductionBuff = 0;
                            }

                            tcgState.active.currentHp -= dmg;
                            addLog(`💥 TCG: Inimigo atacou ${tcgState.active.name} causando ${dmg} de dano!`);
                            
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

                            if (tcgState.active.equipped && tcgState.active.equipped.some(e => e.id === 'escudo_espinhos')) {
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
                                    tcgState.cemetery.push({...tcgState.active});
                                    tcgState.active = null;
                                    updateTCG();
                                    checkTCGWin();
                                }, 1000);
                            }
                        } else {
                            addLog(`💨 TCG: ${tcgState.active.name} desviou!`);
                        }
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
    
    document.getElementById('tcg-energy-pool').innerText = `Energia: ⚡${tcgState.energy}`;
    document.getElementById('tcg-turn-info').innerText = `Turno ${tcgState.turn} - ${tcgState.isPlayerTurn ? 'Seu Turno' : 'Turno Inimigo'}`;

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
    
    checkTCGWin();

    // Se o jogador não tem ativo mas tem banco, e é seu turno, força promoção
    if (!tcgState.active && tcgState.bench && tcgState.bench.length > 0 && tcgState.isPlayerTurn) {
        setTimeout(() => {
            if (!document.querySelector('.modal')) {
                tcgPromoteFromBench();
            }
        }, 500);
    }
}

function renderTCGCard(slot, card) {
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
        if (!tcgState.active) {
            tcgState.active = applyTCGBonus(card);
            tcgState.hand.splice(handIndex, 1);
        } else if (tcgState.bench.length < 3) {
            tcgState.bench.push(applyTCGBonus(card));
            tcgState.hand.splice(handIndex, 1);
        } else {
            alert("Banco cheio!");
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
                const evolved = applyTCGBonus(card);
                // Mantém energia e danos (proporcionalmente ou fixo? Vamos manter fixo o dano e somar energia)
                const damageTaken = target.data.hp - target.data.currentHp;
                evolved.currentHp = Math.max(10, evolved.hp - damageTaken);
                evolved.attachedEnergy = target.data.attachedEnergy;
                evolved.items = target.data.items || []; // Preserva equipamentos (player)

                if (target.type === 'active') tcgState.active = evolved;
                else tcgState.bench[target.index] = evolved;

                tcgState.hand.splice(handIndex, 1);
                hideModal();
                updateTCG();
                addLog(`✨ TCG: ${target.data.name} evoluiu para ${evolved.name}!`);
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
            target.attachedEnergy = (target.attachedEnergy || 0) + 1;
            tcgState.energy--;
            tcgState.hasAttachedEnergy = true;
            hideModal();
            updateTCG();
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

    // No TCG, suporte afeta o Ativo ou todos do banco dependendo do efeito
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
        }
    });

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

    let dmg = baseDmg + bonusDmg;

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
            alert("Parabéns! Você venceu o Duelo TCG e ganhou 50 Diamantes!");
            state.diamantes += 50;
            saveGame();
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
            tcgState.active.attachedEnergy -= cost;
            const oldActive = tcgState.active;
            tcgState.active = tcgState.bench[idx];
            tcgState.bench[idx] = oldActive;
            hideModal();
            updateTCG();
            addLog(`🔄 TCG: ${oldActive.name} recuou para o banco.`);
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

function tcgEndTurn() {
    if (!tcgState.isPlayerTurn) return;

    tcgState.isPlayerTurn = false;
    tcgState.hasAttachedEnergy = false;
    tcgState.hasAttacked = false;
    
    const passBtn = document.getElementById('tcg-pass-btn');
    if (passBtn) passBtn.disabled = true;

    updateTCG();
    checkTCGWin();
    
    // Chama a lógica unificada do turno do inimigo
    enemyTCGTurn();
}
