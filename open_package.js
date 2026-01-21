function getAllTCGBaseCards() {
    const cards = [];
    function pushEvoChain(baseCreature) {
        let prevId = baseCreature.id;
        let evo = baseCreature.evo;
        let stage = 2;
        while (evo) {
            const evoId = evo.id || baseCreature.id + "_lv" + stage;
            cards.push({
                id: evoId,
                name: evo.name,
                type: "evo",
                baseId: prevId,
                clan: baseCreature.clan,
                attacks: baseCreature.attacks,
                hp: (baseCreature.hp || 100) + (evo.hpBoost || 0),
                image: evo.image || baseCreature.image,
                emoji: evo.emoji || baseCreature.emoji || "🃏",
                rarity: evo.rarity || "raro"
            });
            prevId = evoId;
            evo = evo.evo;
            stage++;
        }
    }
    CREATURE_POOL.forEach(function (c) {
        cards.push({
            id: c.id,
            name: c.name,
            type: "basic",
            baseId: c.id,
            clan: c.clan,
            attacks: c.attacks,
            hp: c.hp || 100,
            image: c.image,
            emoji: c.emoji || "🃏",
            rarity: c.rarity || "comum"
        });
        if (c.evo) pushEvoChain(c);
    });
    Object.values(ITEMS).forEach(function (i) {
        cards.push({
            id: "item_" + i.id,
            name: i.name,
            type: "item",
            baseId: null,
            image: i.image,
            emoji: i.icon || "📦",
            rarity: i.rarity || "raro"
        });
    });
    return cards;
}

function ensureTCGCollection() {
    normalizeState();
    if (!Array.isArray(state.tcgUnlockedIds)) state.tcgUnlockedIds = [];
    if (typeof state.tcgFreePacks !== "number") state.tcgFreePacks = 5;
}

function isCardUnlocked(cardId) {
    ensureTCGCollection();
    return state.tcgUnlockedIds.indexOf(cardId) !== -1;
}

function unlockCard(cardId) {
    ensureTCGCollection();
    if (state.tcgUnlockedIds.indexOf(cardId) === -1) {
        state.tcgUnlockedIds.push(cardId);
        saveAccountFromState(state);
    }
}

function getUnlockedTCGCards() {
    ensureTCGCollection();
    var all = getAllTCGBaseCards();
    return all.filter(function (c) { return isCardUnlocked(c.id); });
}

function tcgShowPackShop() {
    ensureTCGCollection();
    var all = getAllTCGBaseCards();
    var unlockedCount = getUnlockedTCGCards().length;
    var total = all.length;
    var lvl = typeof state.accountLevel === "number" ? state.accountLevel : 1;
    var lux = typeof state.lux === "number" ? state.lux : 80;
    var body = ""
        + "<div style=\"text-align:center; color:white; margin-bottom:20px;\">"
        + "<div style=\"font-size:1.1rem; margin-bottom:8px;\">Pacotes TCG</div>"
        + "<div style=\"font-size:0.85rem; color:#ccc;\">Abra pacotes para desbloquear cartas para o editor de deck.</div>"
        + "<div style=\"margin-top:8px; font-size:0.85rem;\">Conta Nível " + lvl + " | Lux: " + lux + " ⚜️</div>"
        + "<div style=\"margin-top:10px; font-size:0.9rem;\">Coleção: "
        + unlockedCount + " / " + total + " cartas desbloqueadas</div>"
        + "<div style=\"margin-top:10px; font-size:0.9rem;\">Pacotes grátis: "
        + state.tcgFreePacks + "</div>"
        + "</div>"
        + "<div id=\"tcg-pack-display\" style=\"display:flex; justify-content:center; gap:20px; margin-bottom:15px;\">"
        + "<div id=\"tcg-pack-card\" style=\"width:140px; height:190px; border-radius:18px; background:linear-gradient(135deg,#ffcc00,#ff0066); box-shadow:0 0 20px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; cursor:pointer;\">"
        + "<div style=\"position:absolute; inset:0; background:radial-gradient(circle at 20% 0,rgba(255,255,255,0.4),transparent), radial-gradient(circle at 80% 100%,rgba(0,0,0,0.5),transparent);\"></div>"
        + "<div style=\"position:relative; text-align:center;\">"
        + "<div style=\"font-size:2.2rem;\">🃏</div>"
        + "<div style=\"font-size:0.9rem; font-weight:bold;\">PACOTE MÍSTICO</div>"
        + "<div style=\"font-size:0.7rem; opacity:0.9;\">5 cartas aleatórias</div>"
        + "</div>"
        + "</div>"
        + "</div>"
        + "<div style=\"text-align:center; font-size:0.85rem; color:#ccc;\">"
        + "Clique no pacote para abrir. Cada pacote contém 5 cartas, podendo repetir."
        + "</div>";
    showModal("Pacotes TCG", body, [
        { text: "Abrir Pacote", action: function () { tcgOpenPack(false); } },
        { text: "Abrir Pacote Grátis", action: function () { tcgOpenPack(true); } },
        { text: "Voltar", action: showTCGMenu }
    ]);
}

function tcgOpenPack(isFree) {
    ensureTCGCollection();
    var cost = 80;
    if (isFree) {
        if (state.tcgFreePacks <= 5) {
            alert("Você não possui pacotes grátis.");
            return;
        }
    } else {
        if (state.lux == null || typeof state.lux !== "number") state.lux = 80;
        if (state.lux < cost) {
            alert("Lux insuficiente. É necessário 80 Lux.");
            return;
        }
    }
    var all = getAllTCGBaseCards();
    if (all.length === 0) {
        alert("Nenhuma carta disponível para este modo.");
        return;
    }
    var opened = [];
    for (var i = 0; i < 5; i++) {
        var card = all[Math.floor(Math.random() * all.length)];
        opened.push(card);
        unlockCard(card.id);
    }
    if (isFree) {
        state.tcgFreePacks = Math.max(0, state.tcgFreePacks - 1);
    } else {
        state.lux -= cost;
    }
    saveGame();
    tcgShowPackResult(opened);
}

function tcgShowPackResult(cards) {
    var body = ""
        + "<div id=\"tcg-pack-open-area\" style=\"position:relative; min-height:260px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:15px;\">"
        + "<div style=\"font-size:1rem; color:#ffd700; text-align:center;\">Cartas Obtidas</div>"
        + "<div id=\"tcg-pack-cards-row\" style=\"display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:10px;\"></div>"
        + "</div>";
    showModal("Pacote Aberto", body, [
        { text: "Abrir Outro", action: function () { tcgShowPackShop(); } },
        { text: "Montar Deck", action: function () { showTCGDeckBuilder(); } },
        { text: "Fechar", action: hideModal }
    ]);
    var row = document.getElementById("tcg-pack-cards-row");
    if (!row) return;
    var delayBase = 0;
    cards.forEach(function (card, index) {
        var cardEl = document.createElement("div");
        cardEl.style.width = "90px";
        cardEl.style.height = "130px";
        cardEl.style.position = "relative";
        cardEl.style.transform = "scale(0.2) translateY(40px)";
        cardEl.style.opacity = "0";
        cardEl.style.transition = "all 0.4s cubic-bezier(.34,1.56,.64,1);";
        var rarityColor = "#ffffff";
        if (card.rarity === "raro") rarityColor = "#4dabff";
        if (card.rarity === "epico") rarityColor = "#a64dff";
        if (card.rarity === "lendario") rarityColor = "#ffcc00";
        var isItem = card.type === "item";
        var imgHtml = "";
        if (isItem) {
            imgHtml = ""
                + "<div class=\"creature-img-container\" style=\"background:rgba(255,215,0,0.12);\">"
                + "<img src=\"imagens/" + card.image + "\" style=\"width:60%; height:60%; object-fit:contain;\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='flex';\">"
                + "<div style=\"display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:2rem; opacity:0.3;\">" + (card.emoji || "📦") + "</div>"
                + "</div>";
        } else {
            var hp = card.hp || 100;
            imgHtml = getCreatureDisplay({
                id: card.id,
                name: card.name,
                emoji: card.emoji || "🃏",
                image: card.image,
                hp: hp,
                level: 1,
                clan: card.clan,
                attacks: card.attacks || []
            });
        }
        cardEl.innerHTML = ""
            + "<div class=\"creature-card mini\" style=\"width:100%; height:100%; margin:0; padding:0; border-radius:12px; border:2px solid "
            + rarityColor
            + "; box-shadow:0 0 18px rgba(0,0,0,0.6); background:rgba(0,0,0,0.6);\">"
            + imgHtml
            + "<div class=\"creature-card-info\" style=\"padding:6px 4px 4px 4px;\">"
            + "<div class=\"creature-card-name\" style=\"font-size:0.6rem;\">" + card.name + "</div>"
            + "<div class=\"creature-card-stats\" style=\"font-size:0.55rem; color:" + rarityColor + ";\">" + card.rarity + "</div>"
            + "</div>"
            + "</div>";
        row.appendChild(cardEl);
        var d = delayBase + index * 120;
        setTimeout(function () {
            cardEl.style.opacity = "1";
            cardEl.style.transform = "scale(1) translateY(0)";
            cardEl.style.boxShadow = "0 0 22px rgba(255,255,255,0.35)";
            playSound("card_flip");
        }, d);
    });
}
