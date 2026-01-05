 // --- Data Definitions ---
    const CLANS = {
        primordiais: { 
            name: "Primordiais", emoji: "🔥", color: "#ff4d4d", bonus: "+20% Dano",
            strongAgainst: ['selvagens'], weakAgainst: ['abissais'],
            desc: "Poder bruto e magia antiga."
        },
        selvagens: { 
            name: "Selvagens", emoji: "🌿", color: "#4CAF50", bonus: "+15% HP",
            strongAgainst: ['sombras'], weakAgainst: ['primordiais'],
            desc: "Instinto, resistência e adaptação."
        },
        sagrados: { 
            name: "Sagrados", emoji: "✨", color: "#ffd700", bonus: "+10% HP/Turno",
            strongAgainst: ['sombras'], weakAgainst: ['primordiais'],
            desc: "Luz, cura e pureza."
        },
        sombras: { 
            name: "Sombras", emoji: "🌙", color: "#9932cc", bonus: "+20% Esquiva",
            strongAgainst: ['abissais'], weakAgainst: ['sagrados'],
            desc: "Noite, caos e corrupção."
        },
        abissais: { 
            name: "Abissais", emoji: "🌊", color: "#00bfff", bonus: "+25% Refletir",
            strongAgainst: ['primordiais'], weakAgainst: ['selvagens'],
            desc: "Domínio, controle e profundezas."
        }
    };

    const CREATURE_POOL = [
        
    // 🔥 PRIMORDIAIS
{ id: 'dragao', clan: 'primordiais', name: "Dragão", emoji: "🦖", image: "dragao.png", hp: 125,
  attacks: [
    { name: "Sopro de Fogo", min: 22, max: 32 },
    { name: "Mordida Flamejante", min: 34, max: 44, cooldown: 2 }
  ],
  evo: { level: 7, name: "Rei Dragão", emoji: "🐉", image: "rei_dragao.png", hpBoost: 95, dmgBoost: 80 }
},

{ id: 'fenix', clan: 'primordiais', name: "Fênix", emoji: "🐦‍🔥", image: "fenix.png", hp: 95,
  attacks: [
    { name: "Brasas", min: 14, max: 22 },
    { name: "Supernova", min: 38, max: 52, recoil: 0.25, cooldown: 3 }
  ],
  supportSkill: { name: "Cinzas Renascidas", desc: "Cura 25% do HP da criatura ativa instantaneamente.", effect: "heal_percent", value: 0.25, cooldown: 5 },
  evo: { level: 8, name: "Fênix Ancestral", emoji: "🦅", image: "fenix_ancestral.png", hpBoost: 85, dmgBoost: 75 }
},

{ id: 'golem', clan: 'primordiais', name: "Golem", emoji: "🗿", image: "golem.png", hp: 155,
  attacks: [
    { name: "Soco de Pedra", min: 12, max: 20 },
    { name: "Terremoto", min: 26, max: 36, enemyBoost: { dmg: 1.15 }, cooldown: 3 }
  ],
  evo: { level: 10, name: "Golem de Ferro", emoji: "🤖", image: "golem_ferro.png", hpBoost: 90, dmgBoost: 70 }
},

{ id: 'mago', clan: 'primordiais', name: "Mago", emoji: "🧙‍♀️", image: "mago.png", hp: 90,
  attacks: [
    { name: "Faisca", min: 16, max: 24 },
    { name: "Faisca Poderosa", min: 36, max: 50, cooldown: 2 }
  ],
  supportSkill: { name: "Encantamento Ígneo", desc: "Adiciona +15 de dano fixo ao próximo ataque do aliado.", effect: "fixed_dmg_buff", value: 15, cooldown: 2 },
  evo: { level: 5, name: "Rei Mago", emoji: "🧙‍♂️", image: "rei_mago.png", hpBoost: 70, dmgBoost: 75 }
},

{ id: 'tita', clan: 'primordiais', name: "Titã", emoji: "🗻", image: "tita.png", hp: 175,
  attacks: [
    { name: "Punho Colossal", min: 18, max: 26 },
    { name: "Impacto Titânico", min: 32, max: 44, cooldown: 3 }
  ],
  evo: { level: 9, name: "Titã Primordial", emoji: "🗿", image: "tita_primordial.png", hpBoost: 85, dmgBoost: 60 }
},
{
  id: 'colosso_lava',
  clan: 'primordiais',
  name: "Colosso de Lava",
  emoji: "🌋",
  image: "colosso_lava.png",
  hp: 135,
  attacks: [
    { name: "Punho Magmático", min: 18, max: 26 },
    { name: "Erupção Devastadora", min: 36, max: 50, cooldown: 3 }
  ],
  evo: {
    level: 15,
    name: "Titã Vulcânico",
    emoji: "🌋",
    image: "tita_vulcanico.png",
    hpBoost: 200,
    dmgBoost: 160
  }
},

// 🌿 SELVAGENS
{ id: 'lobo', clan: 'selvagens', name: "Lobo", emoji: "🐺", image: "lobo.png", hp: 85,
  attacks: [
    { name: "Arranhão", min: 12, max: 18 },
    { name: "Uivo Mortal", min: 24, max: 38, recoil: 0.15 }
  ],
  evo: { level: 5, name: "Lobisomem", emoji: "🐺", image: "lobisomem.png", hpBoost: 75, dmgBoost: 70 }
},

{ id: 'tartaruga', clan: 'selvagens', name: "Tartaruga", emoji: "🐢", image: "tartaruga.png", hp: 190,
  attacks: [
    { name: "Casco Pesado", min: 6, max: 14 },
    { name: "Jato d'água", min: 26, max: 36, cooldown: 3 }
  ],
  supportSkill: { name: "Proteção de Casco", desc: "Reduz o dano recebido pelo aliado ativo em 40% no próximo turno.", effect: "dmg_reduction_buff", value: 0.40, turns: 1, cooldown: 4 },
  evo: { level: 5, name: "Tartaruga Gigante", emoji: "🐢", image: "tartaruga_gigante.png", hpBoost: 95, dmgBoost: 50 }
},

{ id: 'esquilo', clan: 'selvagens', name: "Esquilo", emoji: "🐿️", image: "esquilo.png", hp: 70,
  attacks: [
    { name: "Mordida Rápida", min: 8, max: 12 },
    { name: "Noz Explosiva", min: 22, max: 32, cooldown: 2 }
  ],
  evo: { level: 5, name: "Esquilo Guerreiro", emoji: "🛡️", image: "esquilo_guerreiro.png", hpBoost: 90, dmgBoost: 65 }
},

{ id: 'urso', clan: 'selvagens', name: "Urso", emoji: "🐻", image: "urso.png", hp: 145,
  attacks: [
    { name: "Garra Pesada", min: 16, max: 24 },
    { name: "Fúria Selvagem", min: 30, max: 38, recoil: 0.2 }
  ],
  evo: { level: 6, name: "Urso Ancestral", emoji: "🐻‍❄️", image: "urso_ancestral.png", hpBoost: 70, dmgBoost: 55 }
},

{ id: 'serpente', clan: 'selvagens', name: "Serpente", emoji: "🐍", image: "serpente.png", hp: 90,
  attacks: [
    { name: "Bote Rápido", min: 18, max: 28 },
    { name: "Veneno Paralizante", min: 24, max: 34, cooldown: 3 }
  ],
  supportSkill: { name: "Toxina Debilitante", desc: "Reduz o dano máximo do inimigo em 10 durante 2 turnos.", effect: "enemy_max_dmg_debuff", value: 10, turns: 2, cooldown: 5 },
  evo: { level: 6, name: "Serpente Alfa", emoji: "🐲", image: "serpente_alfa.png", hpBoost: 50, dmgBoost: 65 }
},

{
  id: 'cervo_ancestral',
  clan: 'selvagens',
  name: "Cervo Ancestral",
  emoji: "🦌",
  image: "cervo_ancestral.png",
  hp: 125,
  attacks: [
    { name: "Chifrada Selvagem", min: 17, max: 25 },
    { name: "Espírito da Floresta", min: 26, max: 38, cooldown: 2 }
  ],
  evo: {
    level: 6,
    name: "Guardião do Bosque",
    emoji: "🌳",
    image: "guardiao_bosque.png",
    hpBoost: 105,
    dmgBoost: 70
  }
},

// ✨ SAGRADOS
{ id: 'unicornio', clan: 'sagrados', name: "Unicórnio", emoji: "🦄", image: "unicornio.png", hp: 95,
  attacks: [
    { name: "Raio Místico", min: 18, max: 24 },
    { name: "Benção Lunar", min: 28, max: 38, cooldown: 3 }
  ],
  evo: { level: 5, name: "pegasus", emoji: "🫎", image: "pegasus.png", hpBoost: 60, dmgBoost: 60 }
},

{ id: 'fada', clan: 'sagrados', name: "Fada", emoji: "🧚‍♀️", image: "fada.png", hp: 80,
  attacks: [
    { name: "Pó de Estrela", min: 14, max: 22 },
    { name: "Explosão Mágica", min: 28, max: 40, recoil: 0.1 }
  ],
  supportSkill: { name: "Pó de Estrela", desc: "Limpa qualquer efeito de recoil (recuo) e cura 15 HP.", effect: "clean_recoil_heal", value: 15, cooldown: 3 },
  evo: { level: 6, name: "Rainha Fada", emoji: "👸", image: "rainha_fada.png", hpBoost: 55, dmgBoost: 45 }
},

{ id: 'anjo', clan: 'sagrados', name: "Anjo", emoji: "😇", image: "anjo.png", hp: 105,
  attacks: [
    { name: "Lâmina Celestial", min: 18, max: 26 },
    { name: "Julgamento Divino", min: 34, max: 46, cooldown: 3, recoil: 0.2 }
  ],
  evo: { level: 8, name: "Arcanjo", emoji: "🪽", image: "arcanjo.png", hpBoost: 65, dmgBoost: 75 }
},

{ id: 'guardiao', clan: 'sagrados', name: "Guardião", emoji: "🛡️", image: "guardiao.png", hp: 165,
  attacks: [
    { name: "Golpe Protetor", min: 12, max: 22 },
    { name: "Muralha Sagrada", min: 24, max: 34, cooldown: 3 }
  ],
  evo: { level: 7, name: "Guardião Eterno", emoji: "🗡️", image: "guardiao_eterno.png", hpBoost: 85, dmgBoost: 40 }
},

{ id: 'oraculo', clan: 'sagrados', name: "Oráculo", emoji: "🔮", image: "oraculo.png", hp: 85,
  attacks: [
    { name: "Visão Arcana", min: 14, max: 22 },
    { name: "Profecia Ruinosa", min: 28, max: 40, cooldown: 4 }
  ],
  supportSkill: { name: "Previsão Arcana", desc: "Garante que o próximo ataque do aliado cause o dano máximo possível.", effect: "guaranteed_max_dmg", cooldown: 6 },
  evo: { level: 7, name: "Oráculo Supremo", emoji: "✨", image: "oraculo_supremo.png", hpBoost: 50, dmgBoost: 65 }
},

{
  id: 'templario_luz',
  clan: 'sagrados',
  name: "Templário da Luz",
  emoji: "🛡️",
  image: "templario_luz.png",
  hp: 140,
  attacks: [
    { name: "Lâmina Consagrada", min: 16, max: 24 },
    { name: "Veredito Celestial", min: 28, max: 42, cooldown: 2 }
  ],
  evo: {
    level: 12,
    name: "Paladino Solar",
    emoji: "☀️",
    image: "paladino_solar.png",
    hpBoost: 130,
    dmgBoost: 65
  }
},

{ id: 'azul_eterno', clan: 'sagrados', name: "Azul Eterno", emoji: "💙", image: "Azul Eterno.png", hp: 160,
  attacks: [
    { name: "Corte Iluminado", min: 28, max: 48 },
    { name: "Retaliação Eterna", min: 38, max: 68, recoil: 0.25 }
  ],
  supportSkill: { name: "Relâmpago Azul", desc: "Concede +60% de Esquiva para o aliado no próximo turno.", effect: "dodge_buff", value: 0.30, turns: 1, cooldown: 5},
  evo: { level: 12, name: "Paladino do Trono Azul", emoji: "🌀", image: "Paladino do Trono Azul.png", hpBoost: 100, dmgBoost: 80 }
},     

// 🌙 SOMBRAS
{ id: 'goblin', clan: 'sombras', name: "Goblin", emoji: "🧌", image: "goblin.png", hp: 100,
  attacks: [
    { name: "Dilacerar", min: 16, max: 22 },
    { name: "Carnificina", min: 30, max: 42, cooldown: 2 }
  ],
  evo: { level: 10, name: "Goblin Supremo", emoji: "🧌", image: "goblin_supremo.png", hpBoost: 95, dmgBoost: 75 }
},

{ id: 'morcego', clan: 'sombras', name: "Morcego", emoji: "🦇", image: "morcego.png", hp: 75,
  attacks: [
    { name: "Sugada", min: 8, max: 12 },
    { name: "Eco-ataque", min: 22, max: 32, recoil: 0.2 }
  ],
  evo: { level: 9, name: "Vampiro", emoji: "🧛", image: "vampiro.png", hpBoost: 55, dmgBoost: 75 }
},

{ id: 'zumbi', clan: 'sombras', name: "Zumbi", emoji: "🧟", image: "zumbi.png", hp: 90,
  attacks: [
    { name: "Mordida", min: 10, max: 18 },
    { name: "Desmembramento", min: 26, max: 36, cooldown: 3 }
  ],
  evo: { level: 7, name: "Zumbi Forte", emoji: "🧟‍♂️", image: "zumbi_forte.png", hpBoost: 50, dmgBoost: 45 }
},

{ id: 'espectro', clan: 'sombras', name: "Espectro", emoji: "👻", image: "espectro.png", hp: 80,
  attacks: [
    { name: "Toque Etéreo", min: 18, max: 28 },
    { name: "Assombração", min: 28, max: 38, recoil: 0.25 }
  ],
  supportSkill: { name: "Velo das Sombras", desc: "Concede +30% de Esquiva para o aliado no próximo turno.", effect: "dodge_buff", value: 0.30, turns: 1, cooldown: 4 },
  evo: { level: 7, name: "Espectro Ancião", emoji: "☠️", image: "espectro_anciao.png", hpBoost: 45, dmgBoost: 60 }
},

{ id: 'demonio', clan: 'sombras', name: "Demônio", emoji: "😈", image: "demonio.png", hp: 125,
  attacks: [
    { name: "Chamas Infernais", min: 18, max: 28 },
    { name: "Pacto Profano", min: 36, max: 50, recoil: 0.3, cooldown: 3 }
  ],
  evo: { level: 9, name: "Demônio Abissal", emoji: "👹", image: "demonio_abissal.png", hpBoost: 75, dmgBoost: 80 }
},

{
  id: 'assassino_vazio',
  clan: 'sombras',
  name: "Assassino do Vazio",
  emoji: "🗡️",
  image: "assassino_vazio.png",
  hp: 90,
  attacks: [
    { name: "Lâmina Oculta", min: 22, max: 30 },
    { name: "Execução Sombria", min: 38, max: 52, cooldown: 3 }
  ],
  supportSkill: { name: "Poder do Abismo", desc: "Adiciona +50 de dano fixo ao próximo ataque do aliado.", effect: "fixed_dmg_buff", value: 50, cooldown: 3 },
  evo: {
    level: 10,
    name: "Carrasco do Abismo",
    emoji: "🩸",
    image: "carrasco_abismo.png",
    hpBoost: 50,
    dmgBoost: 90
  }
},

// 🌊 ABISSAIS
{ id: 'polvo', clan: 'abissais', name: "Polvo", emoji: "🐙", image: "polvo.png", hp: 115,
  attacks: [
    { name: "Onda de Choque", min: 14, max: 22 },
    { name: "Tsunami", min: 32, max: 44, cooldown: 3 }
  ],
  supportSkill: { name: "Tinta Obscurecedora", desc: "Faz o inimigo perder o próximo turno (50% de chance).", effect: "stun_chance", value: 0.50, cooldown: 6 },
  evo: { level: 8, name: "Polvo_Sombrio", emoji: "🦑", image: "polvo_sombrio.png", hpBoost: 70, dmgBoost: 65 }
},

{ id: 'kraken', clan: 'abissais', name: "Kraken", emoji: "🐙", image: "kraken.png", hp: 165,
  attacks: [
    { name: "Tentáculos", min: 18, max: 26 },
    { name: "Esmagamento Abissal", min: 34, max: 46, cooldown: 3 }
  ],
  evo: { level: 9, name: "Kraken Ancestral", emoji: "🦑", image: "kraken_ancestral.png", hpBoost: 85, dmgBoost: 65 }
},

{ id: 'serpente_marinha', clan: 'abissais', name: "Serpente Marinha", emoji: "🐉", image: "serpente_marinha.png", hp: 135,
  attacks: [
    { name: "Mordida Salgada", min: 18, max: 28 },
    { name: "Redemoinho", min: 30, max: 42, cooldown: 3 }
  ],
  evo: { level: 8, name: "Serpente Oceânica", emoji: "🌊", image: "serpente_oceanica.png", hpBoost: 65, dmgBoost: 70 }
},

{ id: 'abissal', clan: 'abissais', name: "Abissal", emoji: "🕳️", image: "abissal.png", hp: 115,
  attacks: [
    { name: "Vácuo Profundo", min: 18, max: 26 },
    { name: "Colapso", min: 32, max: 44, recoil: 0.25 }
  ],
  evo: { level: 8, name: "Entidade Abissal", emoji: "🌑", image: "entidade_abissal.png", hpBoost: 60, dmgBoost: 65 }
},

{ id: 'nautilus_ancestral', clan: 'abissais', name: "Nautilus Ancestral", emoji: "🐚", image: "nautilus_ancestral.png", hp: 195,
  attacks: [
    { name: "Casco Milenar", min: 10, max: 18 },
    { name: "Pressão Oceânica", min: 28, max: 38, cooldown: 3 }
  ],
  evo: { level: 10, name: "Nautilus Colossal", emoji: "🌀", image: "nautilus_colossal.png", hpBoost: 95, dmgBoost: 45 }
},

{
  id: 'sacerdote_profundo',
  clan: 'abissais',
  name: "Sacerdote das Profundezas",
  emoji: "🌀",
  image: "sacerdote_profundezas.png",
  hp: 120,
  attacks: [
    { name: "Sussurros do Abismo", min: 15, max: 23 },
    { name: "Ritual Profano", min: 34, max: 48, cooldown: 3 }
  ],
  evo: {
    level: 10,
    name: "Arauto do Caos",
    emoji: "🌑",
    image: "arauto_caos.png",
    hpBoost: 100,
    dmgBoost: 90
  }
}



];

    const BOSS = { name: "REI DEMÔNIO", clan: 'sombras', emoji: "👺", image: "boss.png", hp: 1200, level: 50, attacks: [{name: "Apocalipse", min: 0, max: 500, cooldown: 0, ignoreClans: true}, {name: "Garras do Caos", min: 120, max: 180}, {name: "Chama Negra", min: 200, max: 360}] }; 

    const ITEMS = {
        // Ofensiva
        'garra_obsidiana': { id: 'garra_obsidiana', name: "Garra de Obsidiana", desc: "+8 de dano fixo em todos os ataques.", cost: 150, type: 'offense', icon: "💎", image: "garra_obsidiana.png" },
        'anel_fogo': { id: 'anel_fogo', name: "Anel de Fogo", desc: "Aumenta o dano máximo em 15.", cost: 120, type: 'offense', icon: "🔥", image: "anel_fogo.png" },
        'amolador_presas': { id: 'amolador_presas', name: "Amolador de Presas", desc: "Dano mínimo nunca é inferior a 20.", cost: 100, type: 'offense', icon: "🦴", image: "amolador_presas.png" },
        'cajado_runico': { id: 'cajado_runico', name: "Cajado Rúnico", desc: "+5% de dano para evoluções finais.", cost: 200, type: 'offense', icon: "🪄", image: "cajado_runico.png" },
        // Defensiva
        'casco_adamante': { id: 'casco_adamante', name: "Casco de Adamante", desc: "+100 de HP máximo.", cost: 130, type: 'defense', icon: "🛡️", image: "casco_adamante.png" },
        'manto_esquiva': { id: 'manto_esquiva', name: "Manto da Esquiva", desc: "25% de chance de desviar de ataques.", cost: 180, type: 'defense', icon: "🧣", image: "manto_esquiva.png" },
        'colar_regeneracao': { id: 'colar_regeneracao', name: "Colar de Regeneração", desc: "Cura uma parte do HP total ao atacar.", cost: 150, type: 'defense', icon: "📿", image: "colar_regeneracao.png" },
        'escudo_espinhos': { id: 'escudo_espinhos', name: "Escudo de Espinhos", desc: "Reflete 45% do dano recebido.", cost: 140, type: 'defense', icon: "🌵", image: "escudo_espinhos.png" },
        // Utilitários
        'grimorio_aprendiz': { id: 'grimorio_aprendiz', name: "Grimório de Aprendiz", desc: "+60% de ganho de XP.", cost: 100, type: 'utility', icon: "📖", image: "grimorio_aprendiz.png" },
        'bolsa_moedas': { id: 'bolsa_moedas', name: "Bolsa de Moedas", desc: "+100 diamantes em baús de tesouro.", cost: 80, type: 'utility', icon: "💰", image: "bolsa_moedas.png" },
        'incenso_atrativo': { id: 'incenso_atrativo', name: "Incenso Atrativo", desc: "Aumenta chance de captura em encontros.", cost: 90, type: 'utility', icon: "💨", image: "incenso_atrativo.png" },
        'pedra_evolucao': { id: 'pedra_evolucao', name: "Pedra da Evolução Precoce", desc: "Evolui 1 nível antes do requisito.", cost: 150, type: 'utility', icon: "💠", image: "pedra_evolucao.png" },
        // Raros (Nível 30+)
        'coroa_demonio': { id: 'coroa_demonio', name: "Coroa do Rei Demônio", desc: "+20 de dano, mas corta HP pela metade.", cost: 400, type: 'rare', icon: "👑", image: "coroa_demonio.png", minLevel: 30 },
        'fenix_bolso': { id: 'fenix_bolso', name: "Fênix de Bolso", desc: "Revive uma vez com 30% HP (Quebra após o uso).", cost: 500, type: 'rare', icon: "🐣", image: "fenix_bolso.png", minLevel: 30 },
        'espelho_mistico': { id: 'espelho_mistico', name: "Espelho Místico", desc: "Reflete o ataque mais forte do inimigo.", cost: 450, type: 'rare', icon: "🪞", image: "espelho_mistico.png", minLevel: 30 },
        
        // --- Novos Equipamentos (Buffs & Debuffs por Turno) ---
        'amuleto_ritmo': { id: 'amuleto_ritmo', name: "Amuleto do Ritmo", desc: "+10% dano por turno consecutivo sem trocar. Reseta ao trocar ou HP < 30%.", cost: 220, type: 'offense', icon: "🧩", image: "amuleto_ritmo.png" },
        'coracao_ancestral': { id: 'coracao_ancestral', name: "Coração Ancestral", desc: "Regenera 4% HP por turno, mas reduz dano em 6%.", cost: 200, type: 'defense', icon: "🟢", image: "coracao_ancestral.png" },
        'manto_persistencia': { id: 'manto_persistencia', name: "Manto da Persistência", desc: "+5% defesa por turno vivo (máx 25%+). Some ao trocar.", cost: 250, type: 'defense', icon: "🧥", image: "manto_persistencia.png" },
        'olho_predador': { id: 'olho_predador', name: "Olho do Predador", desc: "Após 2 turnos no mesmo alvo, ignora esquiva, defesa e fraqueza.", cost: 280, type: 'offense', icon: "👁️", image: "olho_predador.png" },
        'tonico_guerra': { id: 'tonico_guerra', name: "Tônico de Guerra", desc: "Consumível: +15% dano por 3 turnos. Depois causa exaustão e quebra.", cost: 150, type: 'utility', icon: "🧪", image: "tonico_guerra.png" },
        'correntes_esquecimento': { id: 'correntes_esquecimento', name: "Correntes do Esquecimento", desc: "Inimigo perde 5% dano/turno (acumula 4x). Reseta se ele esquivar.", cost: 210, type: 'utility', icon: "⛓️", image: "correntes_esquecimento.png" },
        'marca_abismo': { id: 'marca_abismo', name: "Marca do Abismo", desc: "Inimigo recebe +6% dano/turno. Explode e elimina se HP < 30%.", cost: 300, type: 'rare', icon: "🔴", image: "marca_abismo.png" },
        'nevoa_entorpecente': { id: 'nevoa_entorpecente', name: "Névoa Entorpecente", desc: "+10% chance de erro do oponente por turno (máx 60%).", cost: 240, type: 'utility', icon: "🌫️", image: "nevoa_entorpecente.png" },
        'sangramento': { id: 'sangramento', name: "Sangramento", desc: "Causa 3% HP/turno (3 turnos) e cura metade do valor ao portador.", cost: 190, type: 'offense', icon: "🩸", image: "sangramento.png" },
        'selo_ruptura': { id: 'selo_ruptura', name: "Selo da Ruptura", desc: "Reduz 1 nível de item inimigo por turno. Nível 0 quebra o item.", cost: 350, type: 'rare', icon: "🔱", image: "selo_ruptura.png" },
        'lamina_instavel': { id: 'lamina_instavel', name: "Lâmina Instável", desc: "+20% dano, mas tem 10% de chance de se ferir por turno.", cost: 180, type: 'offense', icon: "🔪", image: "lamina_instavel.png" },
        'relogio_entropia': { id: 'relogio_entropia', name: "Relógio da Entropia", desc: "Turno ímpar: +15% esquiva. Turno par: -15% defesa.", cost: 230, type: 'utility', icon: "⏳", image: "relogio_entropia.png" },
        'mascara_sacrificio': { id: 'mascara_sacrificio', name: "Máscara do Sacrifício", desc: "+5% dano por debuff no inimigo. -3% HP/turno por buff em você.", cost: 320, type: 'rare', icon: "🎭", image: "mascara_sacrificio.png" }
    };

    // --- Sound System ---
    const SOUNDS = {
        'click': 'sons/click.mp3',
        'battle_start': 'sons/battle_start.mp3',
        'attack': 'sons/attack.mp3',
        'hit': 'sons/hit.mp3',
        'victory': 'sons/victory.mp3',
        'defeat': 'sons/defeat.mp3',
        'card_flip': 'sons/card_flip.mp3',
        'treasure': 'sons/treasure.mp3',
        'shop': 'sons/shop.mp3',
        'evolution': 'sons/evolution.mp3',
        'boss_battle': 'sons/boss_battle.mp3'
    };

    let currentAudio = null;

    function playSound(name) {
        if (state.options.muted) return;
        const audio = new Audio(SOUNDS[name]);
        let vol = state.options.volume || 0.5;
        if (name === 'hit') vol = Math.min(1.0, vol * 3); // Aumenta o volume do hit
        audio.volume = vol;
        
        if (name === 'defeat') currentAudio = audio; // Armazena áudio de derrota para parar depois
        
        audio.play().catch(e => console.log("Erro ao tocar som: " + e));
    }

    function stopSound() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.src = ""; // Limpa a fonte para garantir que parou
            currentAudio = null;
        }
    }

    // --- Game State ---
    let state = {
        level: 1,
        team: [],
        maxTeamSize: 6,
        cardsRevealed: 0,
        enemies: [], // Agora suporta múltiplos inimigos
        activePlayerCreature: null,
        activePlayerCreatures: [], // Suporte a múltiplas criaturas ativas
        isBossBattle: false,
        swapsUsed: 0,
        selectedIniciais: [],
        diamantes: 10,
        lockedShopItem: null,
        currentShopItems: null,
        options: {
            fontSize: 16,
            isFullScreen: false,
            muted: false,
            volume: 0.5
        }
    };

    // --- Core Functions ---

    function startNewGame() {
        playSound('click');
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        initGame();
    }

    function continueGame() {
        const saved = localStorage.getItem('aventura_save');
        if (saved) {
            state = JSON.parse(saved);
            document.getElementById('main-menu').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            updateUI();
            generateLevel();
        }
    }

    function saveGame() {
        localStorage.setItem('aventura_save', JSON.stringify(state));
        document.getElementById('continue-btn').disabled = false;
    }

    function showOptionsMenu() {
        showModal("Opções", "", [
            { text: "Aumentar Texto", action: () => changeFontSize(2) },
            { text: "Diminuir Texto", action: () => changeFontSize(-2) },
            { text: "Alternar FullScreen", action: toggleFullScreen },
            { text: state.options.muted ? "Ativar Som" : "Mudar Som", action: toggleMute },
            { text: "Exportar Save", action: exportSave },
            { text: "Importar Save", action: importSave },
            { text: "Voltar ao Menu", action: () => location.reload() },
            { text: "Fechar", action: hideModal }
        ]);
    }

    function toggleMute() {
        state.options.muted = !state.options.muted;
        saveGame();
        showOptionsMenu();
    }

    function exportSave() {
        const dataStr = JSON.stringify(state);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'save_aventura.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        addLog("Save exportado com sucesso!");
    }

    function importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = readerEvent => {
                try {
                    const content = readerEvent.target.result;
                    state = JSON.parse(content);
                    saveGame();
                    alert("Save importado com sucesso! O jogo irá recarregar.");
                    location.reload();
                } catch (err) {
                    alert("Erro ao importar o arquivo!");
                }
            }
            reader.readAsText(file);
        }
        input.click();
    }

    function changeFontSize(delta) {
        state.options.fontSize = Math.min(24, Math.max(12, state.options.fontSize + delta));
        document.documentElement.style.setProperty('--base-font-size', state.options.fontSize + 'px');
        saveGame();
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                alert(`Erro ao tentar entrar em modo tela cheia: ${e.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    function startInitialSelection() {
        state.team = [];
        state.selectedIniciais = [];
        showModal("Escolha seus Iniciais", "Selecione de 1 a 3 criaturas para começar sua jornada:", []);
        
        const footer = document.getElementById('modal-footer');
        footer.innerHTML = '';
        
        CREATURE_POOL.forEach(c => {
            const card = document.createElement('div');
            card.className = 'creature-card tooltip';
            card.innerHTML = `
                ${getCreatureDisplay(c)}
                <div class="creature-card-info">
                    <div class="creature-card-name">${c.name}</div>
                    <div class="creature-card-stats">HP: ${c.hp}</div>
                </div>
                <span class="tooltiptext">${getCreatureTooltip({...c, level: 1, currentHp: c.hp})}</span>
            `;
            card.onclick = () => {
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    state.selectedIniciais = state.selectedIniciais.filter(i => i.id !== c.id);
                } else if (state.selectedIniciais.length < 3) {
                    card.classList.add('selected');
                    state.selectedIniciais.push({...c});
                }
                updateSelectionButton();
            };
            footer.appendChild(card);
        });

        const actions = document.getElementById('modal-actions');
        actions.innerHTML = '<button id="confirm-iniciais" disabled>Confirmar (0/3)</button>';
        document.getElementById('confirm-iniciais').onclick = () => {
            state.team = state.selectedIniciais.map(c => initCreature(c));
            hideModal();
            initGame(true);
        };
    }

    function updateSelectionButton() {
        const btn = document.getElementById('confirm-iniciais');
        btn.innerText = `Confirmar (${state.selectedIniciais.length}/3)`;
        btn.disabled = state.selectedIniciais.length < 1;
    }

    function initCreature(base) {
        const cloned = JSON.parse(JSON.stringify(base));
        const c = {
            ...cloned,
            level: cloned.level || 1,
            xp: 0,
            maxXp: 100,
            currentHp: cloned.hp,
            isEvolved: false,
            items: cloned.items ? JSON.parse(JSON.stringify(cloned.items)) : [],
            cooldowns: {}
        };

        // Bônus Selvagens: +15% HP
        if (c.clan === 'selvagens') {
            c.hp = Math.floor(c.hp * 1.15);
            c.currentHp = c.hp;
        }

        return c;
    }

    function initGame(alreadySelected = false) {
        if (!alreadySelected) {
            startInitialSelection();
            return;
        }
        state.level = 1;
        state.cardsRevealed = 0;
        state.isBossBattle = false;
        state.diamantes = 50; // Começa com um pouco de diamantes
        state.currentShopItems = null;
        updateUI();
        generateLevel();
        saveGame();
    }

    function updateUI() {
        document.getElementById('current-level').innerText = state.level;
        document.getElementById('creature-count').innerText = state.team.length;
        document.getElementById('player-diamantes').innerText = state.diamantes;
        
        // Atualiza diamante no modal se estiver visível
        const diamondVal = document.getElementById('modal-diamonds-val');
        if (diamondVal) diamondVal.innerText = state.diamantes;

        const footer = document.getElementById('team-footer');
        footer.innerHTML = '';
        state.team.forEach(c => {
            const div = document.createElement('div');
            div.className = 'team-member tooltip';
            const hpPercent = (c.currentHp / c.hp) * 100;
            const xpPercent = (c.xp / c.maxXp) * 100;
            
            div.innerHTML = `
                <div class="creature-card mini">
                    ${getCreatureDisplay(c)}
                    <div class="creature-card-info">
                        <div class="creature-card-name">${c.name}</div>
                    </div>
                </div>
                <div class="mini-bars">
                    <div class="mini-bar"><div class="mini-bar-fill-hp" style="width: ${hpPercent}%"></div></div>
                    <div class="mini-bar"><div class="mini-bar-fill-xp" style="width: ${xpPercent}%"></div></div>
                </div>
                <span class="tooltiptext">${getCreatureTooltip(c)}</span>
            `;
            div.ondblclick = () => {
                showModal("Status da Criatura", getCreatureTooltip(c), [{ text: "Fechar", action: hideModal }]);
            };
            footer.appendChild(div);
        });

        if (state.team.length === 0 || state.team.every(c => c.currentHp <= 0)) {
            gameOver();
        }
        saveGame();
    }

    function generateLevel() {
        state.cardsRevealed = 0;
        saveGame();
        const grid = document.getElementById('exploration-grid');
        grid.innerHTML = '';
        grid.classList.remove('hidden');
        document.getElementById('battle-screen').style.display = 'none';

        if (state.level % 10 === 0) {
            startBossBattle();
            return;
        }

        for (let i = 0; i < 6; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-face card-back">
                    <img src="imagens/card_back.png" class="card-back-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 3rem; opacity: 0.3;">❓</div>
                </div>
                <div class="card-face card-front"></div>
            `;
            
            const rand = Math.random();
            let type = rand < 0.4 ? 'COMBAT' : (rand < 0.7 ? 'ENCOUNTER' : 'TREASURE');
            
            card.dataset.type = type;
            card.onclick = () => openCard(card);
            grid.appendChild(card);
        }
    }

    function openCard(cardElement) {
        if (cardElement.classList.contains('revealed')) return;
        playSound('card_flip');
        cardElement.classList.add('revealed');
        state.cardsRevealed++;
        
        updateUI();

        const type = cardElement.dataset.type;
        const front = cardElement.querySelector('.card-front');
        
        let eventName = "";
        let eventEmoji = "";
        let eventImg = "";
        let eventColor = "";

        if (type === 'COMBAT') {
            eventName = "COMBATE!";
            eventEmoji = "⚔️";
            eventImg = "card_battle.png";
            eventColor = "#ff4d4d";
        } else if (type === 'ENCOUNTER') {
            eventName = "ENCONTRO";
            eventEmoji = "👣";
            eventImg = "card_encounter.png";
            eventColor = "#4dabff";
        } else {
            eventName = "TESOURO";
            eventEmoji = "🍀";
            eventImg = "card_treasure.png";
            eventColor = "#4dff4d";
        }

        front.innerHTML = `
            <img src="imagens/${eventImg}" class="card-event-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 4rem; opacity: 0.3;">${eventEmoji}</div>
            <div class="card-event-info" style="color: ${eventColor};">
                ${eventEmoji}<br>${eventName}
            </div>
        `;
        
        setTimeout(() => {
            if (type === 'COMBAT') {
                const enemyCount = state.level > 10 ? Math.min(3, 1 + Math.floor(Math.random() * 3)) : 1;
                const enemies = [];
                for (let i = 0; i < enemyCount; i++) enemies.push(getRandomEnemy());
                setTimeout(() => startBattle(enemies), 600);
            } else if (type === 'ENCOUNTER') {
                setTimeout(() => startEncounter(getRandomEnemy()), 600);
            } else {
                setTimeout(() => handleTreasure(), 600);
            }
        }, 300);
    }

    function getRandomEnemy() {
        const base = CREATURE_POOL[Math.floor(Math.random() * CREATURE_POOL.length)];
        let enemy = initCreature(base);
        
        // Escala nível do inimigo com base no nível do jogador
        const levelBoost = Math.floor(state.level / 2);
        enemy.level += levelBoost;
        enemy.hp += levelBoost * 20;
        enemy.attacks.forEach(a => { a.min += levelBoost * 2; a.max += levelBoost * 3; });

        // A partir do nível 10, inimigos podem vir evoluídos ou com itens
        if (state.level > 10) {
            // Chance de vir evoluído (se tiver evolução)
            if (enemy.evo && Math.random() < 0.4) {
                const oldName = enemy.name;
                enemy.name = enemy.evo.name;
                enemy.emoji = enemy.evo.emoji;
                if (enemy.evo.image) enemy.image = enemy.evo.image;
                enemy.hp += enemy.evo.hpBoost;
                enemy.attacks.forEach(a => { a.min += enemy.evo.dmgBoost; a.max += enemy.evo.dmgBoost; });
                enemy.isEvolved = true;
            }

            // Chance de vir com equipamento (1 a 2 itens)
            if (Math.random() < 0.5) {
                const availableItems = Object.values(ITEMS).filter(i => !i.minLevel || state.level >= i.minLevel);
                const itemCount = Math.random() < 0.8 ? 1 : 2;
                for (let i = 0; i < itemCount; i++) {
                    const randomItem = JSON.parse(JSON.stringify(availableItems[Math.floor(Math.random() * availableItems.length)]));
                    randomItem.level = Math.max(1, Math.floor(state.level / 15)); // Itens podem vir com nível maior
                    enemy.items.push(randomItem);
                    
                    // Aplica efeitos imediatos se necessário (ex: Casco de Adamante)
                    if (randomItem.id === 'casco_adamante') enemy.hp += 100;
                }
            }
        }

        // Buff global: inimigos têm 30% a mais de HP e ataque que as criaturas base
        const enemyStatMultiplier = 1.3;
        enemy.hp = Math.floor(enemy.hp * enemyStatMultiplier);
        enemy.attacks.forEach(a => {
            a.min = Math.max(1, Math.floor(a.min * enemyStatMultiplier));
            a.max = Math.max(a.min, Math.floor(a.max * enemyStatMultiplier));
        });

        enemy.currentHp = enemy.hp;
        return enemy;
    }

    // --- Battle & XP Logic ---

    function startBattle(enemyOrEnemies, isBoss = false) {
        state.enemies = Array.isArray(enemyOrEnemies) ? enemyOrEnemies : [enemyOrEnemies];
        state.isBossBattle = isBoss;
        state.swapsUsed = 0; // Reseta trocas no início da batalha
        playSound(isBoss ? 'boss_battle' : 'battle_start');
        
        state.activePlayerCreatures = []; // Reseta lista de criaturas ativas

        if (isBoss) {
            const alive = state.team.filter(c => c.currentHp > 0);
            const countToPick = Math.min(3, alive.length);
            let selected = [];

            function pickNext() {
                if (selected.length < countToPick) {
                    const selectedIds = selected.map(s => s.id);
                    showCreatureSelection((c) => {
                        selected.push(c);
                        pickNext();
                    }, `Escolha a criatura ${selected.length + 1} de ${countToPick} para o Boss:`, true, selectedIds);
                } else {
                    finishStartBattle(selected);
                }
            }
            pickNext();
        } else {
            showCreatureSelection((selected) => {
                finishStartBattle([selected]);
            }, "Escolha quem vai lutar:", true);
        }

        function finishStartBattle(creatures) {
            state.activePlayerCreatures = creatures;
            state.activePlayerCreature = creatures[0]; // Mantém para compatibilidade legado

            creatures.forEach(selected => {
                selected.cooldowns = selected.cooldowns || {};
                selected.battleState = {
                    consecutiveTurns: 0,
                    defenseBuff: 0,
                    tonicoTurns: selected.items && selected.items.some(i => i.id === 'tonico_guerra') ? 3 : 0,
                    targetLock: { index: -1, turns: 0 },
                    turnCount: 0,
                    hasActed: false
                };
            });

            state.enemies.forEach(e => {
                e.battleState = {
                    damageReduction: 0,
                    takenDamageIncrease: 0,
                    missChance: 0,
                    bleedTurns: 0,
                    turnCount: 0
                };
            });
            
            document.getElementById('exploration-grid').classList.add('hidden');
            document.getElementById('battle-screen').style.display = 'flex';
            setupBattleUI();
            
            const playerNames = creatures.map(p => p.name).join(', ');
            addLog(`Batalha: ${playerNames} vs ${state.enemies.map(e => e.name).join(', ')}!`);
            
            // Aleatório quem começa atacando
            if (Math.random() < 0.5) {
                addLog("O inimigo foi mais rápido e ataca primeiro!");
                updateTurnIndicator(false);
                toggleButtons(true);
                setTimeout(enemyTurn, 1000);
            } else {
                addLog("Você foi mais rápido e começa atacando!");
                updateTurnIndicator(true);
                toggleButtons(false);
            }
        }
    }

    function updateTurnIndicator(isPlayerTurn) {
        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            indicator.innerText = isPlayerTurn ? "▶ Seu Turno" : "▶ Turno do Inimigo";
            indicator.style.color = isPlayerTurn ? "#ffd700" : "#ff4d4d";
        }
    }

    function processTurnEnd(side) {
        if (side === 'player') {
            state.activePlayerCreatures.forEach((p, pIdx) => {
            if (!p || p.currentHp <= 0) return;

            // Garante que o battleState existe
            if (!p.battleState) {
                p.battleState = {
                    consecutiveTurns: 0,
                    defenseBuff: 0,
                    tonicoTurns: (p.items && p.items.some(i => i.id === 'tonico_guerra')) ? 3 : 0,
                    targetLock: { index: -1, turns: 0 },
                    turnCount: 0
                };
            }

            p.battleState.turnCount++;
            p.battleState.consecutiveTurns++;
            
            if (p.items && p.items.length > 0) {
                p.items.forEach(item => {
                    const lvl = item.level || 1;
                    
                    // 2. Coração Ancestral
                    if (item.id === 'coracao_ancestral') {
                        const heal = Math.floor(p.hp * 0.04);
                        p.currentHp = Math.min(p.hp, p.currentHp + heal);
                        showFloatingValue(`player-fighter-${pIdx}`, heal, 'heal');
                        updateHpUI(`player-${pIdx}`, p);
                    }

                    // 3. Manto da Persistência
                    if (item.id === 'manto_persistencia') {
                        const maxDef = 0.25 + (lvl - 1) * 0.05;
                        p.battleState.defenseBuff = Math.min(maxDef, (p.battleState.defenseBuff || 0) + 0.05);
                    }

                    // 5. Tônico de Guerra
                    if (item.id === 'tonico_guerra') {
                        if (p.battleState.tonicoTurns > 0) {
                            p.battleState.tonicoTurns--;
                            if (p.battleState.tonicoTurns === 0) {
                                p.battleState.tonicoTurns = -1; // Exaustão
                                addLog(`🧪 TÔNICO: O efeito acabou! ${p.name} está exausto.`);
                            }
                        } else if (p.battleState.tonicoTurns === -1) {
                            p.battleState.tonicoTurns = 0; // Fim da exaustão e quebra
                            p.items = p.items.filter(i => i.id !== 'tonico_guerra');
                            addLog(`🧪 TÔNICO: O frasco se quebrou.`);
                        }
                    }

                    // 11. Lâmina Instável
                    if (item.id === 'lamina_instavel' && Math.random() < 0.1) {
                        const selfDmg = Math.floor(p.hp * 0.05);
                        p.currentHp -= selfDmg;
                        showFloatingValue(`player-fighter-${pIdx}`, selfDmg, 'damage');
                        addLog(`🔪 LÂMINA: ${p.name} se feriu com a lâmina instável!`);
                        updateHpUI(`player-${pIdx}`, p);
                    }

                    // 12. Relógio da Entropia
                    if (item.id === 'relogio_entropia') {
                        if (p.battleState.turnCount % 2 === 1) {
                            addLog(`⏳ RELÓGIO: Turno ímpar! +15% velocidade.`);
                        } else {
                            addLog(`⏳ RELÓGIO: Turno par! -15% defesa.`);
                        }
                    }

                    // 13. Máscara do Sacrifício
                    if (item.id === 'mascara_sacrificio') {
                        let buffs = 0;
                        if (p.battleState.consecutiveTurns > 1) buffs++;
                        if (p.battleState.defenseBuff > 0) buffs++;
                        if (p.battleState.tonicoTurns > 0) buffs++;
                        if (buffs > 0) {
                            const penalty = Math.floor(p.hp * (buffs * 0.03));
                            p.currentHp -= penalty;
                            showFloatingValue(`player-fighter-${pIdx}`, penalty, 'damage');
                            updateHpUI(`player-${pIdx}`, p);
                        }
                    }
                });
            }
        });
    }

    if (side === 'enemy') {
        // Aplica debuffs nos inimigos
        state.enemies.forEach((e, idx) => {
            if (e.currentHp <= 0) return;

            // Garante que o battleState existe no inimigo
            if (!e.battleState) {
                e.battleState = {
                    damageReduction: 0,
                    takenDamageIncrease: 0,
                    missChance: 0,
                    bleedTurns: 0,
                    turnCount: 0
                };
            }
            
            e.battleState.turnCount++;
            
            // Verifica itens de TODOS os jogadores ativos para aplicar efeitos no inimigo
            state.activePlayerCreatures.forEach((p, pIdx) => {
                if (p.currentHp <= 0) return;
                
                if (p.items && p.items.length > 0) {
                    p.items.forEach(item => {
                        // 6. Correntes do Esquecimento
                        if (item.id === 'correntes_esquecimento') {
                            e.battleState.damageReduction = Math.min(0.20, (e.battleState.damageReduction || 0) + 0.05);
                        }
                        // 7. Marca do Abismo
                        if (item.id === 'marca_abismo') {
                            e.battleState.takenDamageIncrease = (e.battleState.takenDamageIncrease || 0) + 0.06;
                            if (e.currentHp < e.hp * 0.3) {
                                e.currentHp = 0;
                                showFloatingValue(`enemy-fighter-${idx}`, "ELIMINADO", 'damage');
                                addLog(`🔴 MARCA: A marca do abismo explodiu e eliminou ${e.name}!`);
                                
                                const enemyEl = document.getElementById(`enemy-fighter-${idx}`);
                                const enemyCard = enemyEl ? enemyEl.querySelector('.creature-card') : null;
                                if (enemyCard) enemyCard.classList.add('anim-death');
                                else if (enemyEl) enemyEl.style.opacity = '0.3';

                                updateHpUI(`enemy-${idx}`, e);
                            }
                        }
                        // 8. Névoa Entorpecente
                        if (item.id === 'nevoa_entorpecente') {
                            e.battleState.missChance = (e.battleState.missChance || 0) + 0.10;
                            if (e.battleState.missChance >= 0.60) {
                                addLog(`🌫️ NÉVOA: ${e.name} está totalmente desorientado pela névoa!`);
                            }
                        }
                        // 9. Sangramento
                        if (item.id === 'sangramento' && e.battleState.bleedTurns > 0) {
                            const bleedDmg = Math.floor(e.hp * 0.03);
                            e.currentHp -= bleedDmg;
                            const heal = Math.floor(bleedDmg / 2);
                            p.currentHp = Math.min(p.hp, p.currentHp + heal);
                            
                            showFloatingValue(`enemy-fighter-${idx}`, bleedDmg, 'damage');
                            showFloatingValue(`player-fighter-${pIdx}`, heal, 'heal');
                            addLog(`🩸 SANGRAMENTO: ${e.name} perdeu ${bleedDmg} HP e curou ${p.name} em ${heal}!`);
                            
                            e.battleState.bleedTurns--;
                            if (e.battleState.bleedTurns === 0) {
                                addLog(`🩸 SANGRAMENTO: O sangramento de ${e.name} parou.`);
                            }
                            
                            updateHpUI(`enemy-${idx}`, e);
                            updateHpUI(`player-${pIdx}`, p);
                        }
                        // 10. Selo da Ruptura
                        if (item.id === 'selo_ruptura' && e.items && e.items.length > 0) {
                            const randomItem = e.items[Math.floor(Math.random() * e.items.length)];
                            randomItem.level = (randomItem.level || 1) - 1;
                            if (randomItem.level <= 0) {
                                e.items = e.items.filter(i => i !== randomItem);
                                addLog(`🔱 SELO: O item ${randomItem.name} de ${e.name} se quebrou!`);
                            } else {
                                addLog(`🔱 SELO: Reduziu nível de ${randomItem.name} de ${e.name}.`);
                            }
                        }
                    });
                }
            });

            // --- DECREMENTA DEBUFFS DE SUPORTE (INIMIGO) ---
            if (e.battleState.maxDmgDebuff && e.battleState.maxDmgDebuff.turns > 0) {
                e.battleState.maxDmgDebuff.turns--;
                if (e.battleState.maxDmgDebuff.turns === 0) {
                    addLog(`✨ TOXINA: O efeito em ${e.name} acabou.`);
                }
            }
            // -----------------------------------------------

            // --- REDUZ COOLDOWNS DO INIMIGO ---
            if (e.cooldowns) {
                for (let atkName in e.cooldowns) {
                    if (e.cooldowns[atkName] > 0) e.cooldowns[atkName]--;
                }
            }
            // ----------------------------------
        });

        // --- REDUZ COOLDOWNS DA RESERVA ---
        state.team.forEach(c => {
            if (!state.activePlayerCreatures.includes(c) && c.cooldowns) {
                for (let skillName in c.cooldowns) {
                    if (c.cooldowns[skillName] > 0) c.cooldowns[skillName]--;
                }
            }
        });

        // --- PROCESSAMENTO DE FIM DE TURNO PARA JOGADORES (Reset e Cooldowns) ---
        state.activePlayerCreatures.forEach((p, idx) => {
            if (p.currentHp <= 0) return;

            // Reseta hasActed para o próximo turno do jogador
            if (p.battleState) p.battleState.hasActed = false;

            // Reduz cooldowns do jogador
            if (p.cooldowns) {
                for (let atkName in p.cooldowns) {
                    if (p.cooldowns[atkName] > 0) p.cooldowns[atkName]--;
                }
            }

            // Bônus Sagrados: Cura 10% ao final do turno global
            if (p.clan === 'sagrados') {
                const heal = Math.floor(p.hp * 0.1);
                p.currentHp = Math.min(p.hp, p.currentHp + heal);
                showFloatingValue(`player-fighter-${idx}`, heal, 'heal');
                addLog(`✨ SAGRADOS: ${p.name} regenerou ${heal} HP!`);
                updateHpUI(`player-${idx}`, p);
            }

            // Reseta buffs temporários de suporte
            if (p.battleState) {
                p.battleState.damageReductionBuff = 0;
                p.battleState.dodgeBuff = 0;
            }
        });
    }
}
    

    function setupBattleUI() {
        const playerContainer = document.getElementById('player-container');
        playerContainer.innerHTML = '';
        
        // Garante que activePlayerCreatures exista
        if (!state.activePlayerCreatures) {
            state.activePlayerCreatures = [state.activePlayerCreature];
        }

        state.activePlayerCreatures.forEach((p, index) => {
            const playerFighter = document.createElement('div');
            playerFighter.className = 'fighter';
            playerFighter.id = `player-fighter-${index}`;
            
            const hasActed = state.isBossBattle && p.battleState && p.battleState.hasActed;
            if (p.currentHp <= 0) playerFighter.style.opacity = '0.3';
            else if (hasActed) playerFighter.style.filter = 'grayscale(0.7) opacity(0.8)';

            playerFighter.innerHTML = `
                <div class="creature-card tooltip" style="width: 150px; height: 225px; margin: 0 auto; cursor: default; ${hasActed ? 'border-color: #555;' : ''}">
                    ${getCreatureDisplay(p)}
                    <div class="creature-card-info" style="padding: 15px 5px 8px 5px;">
                        <div class="creature-card-name" style="font-size: 0.9rem;">${p.name}</div>
                    </div>
                    ${hasActed ? '<div style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.6); border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:10px;">⏳</div>' : ''}
                    <span class="tooltiptext">${getCreatureTooltip(p)}</span>
                </div>
                <div class="hp-bar-container">
                    <div id="player-${index}-hp-bar" class="hp-bar-fill"></div>
                    <div id="player-${index}-hp-text" class="hp-text">${Math.floor(p.currentHp)}/${p.hp}</div>
                </div>
                <div class="xp-bar-container">
                    <div id="player-${index}-xp-bar" class="xp-bar-fill"></div>
                    <div id="player-${index}-xp-text" class="hp-text" style="font-size: 0.6rem;">Lvl ${p.level} - ${p.xp}/${p.maxXp} XP</div>
                </div>
            `;

            playerFighter.ondblclick = () => {
                showModal("Status: " + p.name, getCreatureTooltip(p), [{ text: "Fechar", action: hideModal }]);
            };
            
            playerContainer.appendChild(playerFighter);
            updateHpUI(`player-${index}`, p);
            updateXpUI(p, index);
        });

        const enemiesContainer = document.getElementById('enemies-container');
        enemiesContainer.innerHTML = '';

        state.enemies.forEach((e, index) => {
            const enemyDiv = document.createElement('div');
            enemyDiv.className = 'fighter enemy-fighter';
            enemyDiv.id = `enemy-fighter-${index}`;
            if (e.currentHp <= 0) enemyDiv.style.opacity = '0.3';
            
            enemyDiv.innerHTML = `
                <div class="creature-card tooltip" style="width: 100px; height: 150px; margin: 0 auto; cursor: crosshair;">
                    ${getCreatureDisplay(e)}
                    <div class="creature-card-info" style="padding: 10px 5px 5px 5px;">
                        <div class="creature-card-name" style="font-size: 0.75rem;">${e.name}</div>
                    </div>
                    <span class="tooltiptext">${getCreatureTooltip(e)}</span>
                </div>
                <div class="hp-bar-container enemy-hp-container">
                    <div id="enemy-${index}-hp-bar" class="hp-bar-fill"></div>
                    <div id="enemy-${index}-hp-text" class="hp-text" style="font-size: 0.6rem;">${Math.floor(e.currentHp)}/${e.hp}</div>
                </div>
            `;
            
            enemyDiv.ondblclick = () => {
                showModal("Status: " + e.name, getCreatureTooltip(e), [{ text: "Fechar", action: hideModal }]);
            };
            
            if (e.currentHp > 0) {
                enemyDiv.style.cursor = 'crosshair';
                enemyDiv.title = "Clique para atacar este inimigo";
            }
            
            enemiesContainer.appendChild(enemyDiv);
            updateHpUI(`enemy-${index}`, e);
        });

        const actions = document.getElementById('battle-actions');
        actions.innerHTML = '';
        
        state.activePlayerCreatures.forEach((p, pIndex) => {
            if (p.currentHp <= 0) return;
            
            const pActions = document.createElement('div');
            pActions.className = 'player-creature-actions';
            pActions.style.border = "1px solid rgba(255,215,0,0.3)";
            pActions.style.borderRadius = "5px";
            pActions.style.padding = "5px";
            pActions.style.marginBottom = "5px";
            pActions.style.display = "flex";
            pActions.style.flexDirection = "column";
            pActions.style.gap = "5px";
            
            pActions.innerHTML = `<div style="font-size: 0.7rem; color: #ffd700; text-align: center; border-bottom: 1px solid #444; padding-bottom: 2px;">${p.name}</div>`;
            const btnGroup = document.createElement('div');
            btnGroup.style.display = "flex";
            btnGroup.style.gap = "5px";
            btnGroup.style.justifyContent = "center";
            btnGroup.style.flexWrap = "wrap";

            p.attacks.forEach(atk => {
                const btn = document.createElement('button');
                const cd = p.cooldowns[atk.name] || 0;
                btn.style.padding = "5px 10px";
                btn.style.fontSize = "0.7rem";
                btn.style.minWidth = "auto";
                
                const hasActed = state.isBossBattle && p.battleState && p.battleState.hasActed;

                if (cd > 0 || hasActed) {
                    btn.innerText = cd > 0 ? `${atk.name} (${cd})` : atk.name;
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                } else {
                    btn.innerText = `${atk.name}`;
                }

                // Adiciona info de custo se houver
                let costInfo = "";
                if (atk.cooldown) costInfo = `\nRecarga: ${atk.cooldown} turnos`;
                if (atk.recoil) costInfo = `\nRecuo: ${atk.recoil * 100}% HP`;
                if (atk.enemyBoost) costInfo = `\nEfeito: Fortalece inimigos em ${Math.round((atk.enemyBoost.dmg - 1) * 100)}%`;
                if (costInfo) btn.title = atk.name + costInfo;

                btn.onclick = () => {
                    if (state.enemies.length === 1) {
                        playerAttack(atk, 0, pIndex);
                    } else {
                        addLog(`Escolha o alvo para ${p.name}!`);
                        const aliveEnemies = state.enemies.map((e, i) => e.currentHp > 0 ? i : -1).filter(i => i !== -1);
                        aliveEnemies.forEach(i => {
                            const enemyEl = document.getElementById(`enemy-fighter-${i}`);
                            enemyEl.style.boxShadow = "0 0 15px red";
                            enemyEl.onclick = () => {
                                aliveEnemies.forEach(idx => {
                                    const el = document.getElementById(`enemy-fighter-${idx}`);
                                    el.style.boxShadow = "";
                                    el.onclick = null;
                                });
                                playerAttack(atk, i, pIndex);
                            };
                        });
                    }
                };
                btnGroup.appendChild(btn);
            });
            pActions.appendChild(btnGroup);
            actions.appendChild(pActions);
        });
        
        // Botão de Troca (apenas se não for batalha de chefe)
        if (state.swapsUsed < 2 && !state.isBossBattle) {
            const p = state.activePlayerCreatures[0];
            const swapBtn = document.createElement('button');
            swapBtn.innerText = `Trocar (${2 - state.swapsUsed})`;
            swapBtn.style.backgroundColor = "#555";
            swapBtn.onclick = () => {
                const activeIds = state.activePlayerCreatures.map(ac => ac.id);
                showCreatureSelection((newCreature) => {
                    p.restCount = 2;
                    state.swapsUsed++;
                    state.activePlayerCreatures[0] = newCreature;
                    state.activePlayerCreature = newCreature;
                    
                    if (!newCreature.battleState) {
                        newCreature.battleState = {
                            consecutiveTurns: 0,
                            defenseBuff: 0,
                            tonicoTurns: newCreature.items && newCreature.items.some(i => i.id === 'tonico_guerra') ? 3 : 0,
                            targetLock: { index: -1, turns: 0 },
                            turnCount: 0
                        };
                    }
                    newCreature.cooldowns = newCreature.cooldowns || {};

                    addLog(`${p.name} saiu. ${newCreature.name} entrou!`);
                    setupBattleUI();
                    addLog("O inimigo aproveita a troca para atacar!");
                    toggleButtons(true);
                    setTimeout(enemyTurn, 1000);
                }, "Escolha quem vai entrar:", true, activeIds);
            };
            actions.appendChild(swapBtn);
        }

        // --- SUPORTE DA RESERVA ---
        const supportActions = document.getElementById('support-actions');
        supportActions.innerHTML = '';
        
        const activeIds = state.activePlayerCreatures.map(c => c.id);
        const reserves = state.team.filter(c => !activeIds.includes(c.id) && c.currentHp > 0);
        reserves.forEach(reserve => {
            if (reserve.supportSkill) {
                const btn = document.createElement('button');
                btn.className = 'support-btn';
                const cd = reserve.cooldowns[reserve.supportSkill.name] || 0;
                btn.style.padding = "5px 10px";
                btn.style.fontSize = "0.7rem";
                btn.style.minWidth = "auto";
                btn.style.backgroundColor = cd > 0 ? "#333" : "#2e7d32";
                
                if (cd > 0) {
                    btn.innerText = `${reserve.emoji} ${reserve.supportSkill.name} (${cd})`;
                    btn.disabled = true;
                } else {
                    btn.innerText = `${reserve.emoji} ${reserve.supportSkill.name}`;
                    btn.onclick = () => activateSupportSkill(reserve);
                }
                supportActions.appendChild(btn);
            }
        });
    }

    function activateSupportSkill(creature) {
        const skill = creature.supportSkill;
        if (!skill) return;

        // No modo boss, habilidades de suporte afetam todos os jogadores ativos (se aplicável)
        const targets = state.isBossBattle ? state.activePlayerCreatures.filter(p => p.currentHp > 0) : [state.activePlayerCreature];
        if (targets.length === 0) return;

        addLog(`✨ SUPORTE: ${creature.name} usa ${skill.name}!`);
        playSound('heal'); // Som genérico de suporte

        // Registra o cooldown
        creature.cooldowns[skill.name] = skill.cooldown;

        targets.forEach((active, tIdx) => {
            const playerIndex = state.isBossBattle ? state.activePlayerCreatures.indexOf(active) : 0;

            switch (skill.effect) {
                case 'heal_percent':
                    const heal = Math.floor(active.hp * skill.value);
                    active.currentHp = Math.min(active.hp, active.currentHp + heal);
                    showFloatingValue(`player-fighter-${playerIndex}`, heal, 'heal');
                    updateHpUI(`player-${playerIndex}`, active);
                    addLog(`✨ ${active.name} recuperou ${heal} HP!`);
                    break;
                
                case 'fixed_dmg_buff':
                    active.battleState.nextAttackBonus = (active.battleState.nextAttackBonus || 0) + skill.value;
                    addLog(`✨ O próximo ataque de ${active.name} terá +${skill.value} de dano!`);
                    break;
                
                case 'dmg_reduction_buff':
                    active.battleState.damageReductionBuff = skill.value;
                    addLog(`✨ ${active.name} recebeu proteção! -${Math.round(skill.value * 100)}% de dano no próximo turno.`);
                    break;
                
                case 'clean_recoil_heal':
                    const cleanHeal = skill.value || 15;
                    active.currentHp = Math.min(active.hp, active.currentHp + cleanHeal);
                    showFloatingValue(`player-fighter-${playerIndex}`, cleanHeal, 'heal');
                    updateHpUI(`player-${playerIndex}`, active);
                    addLog(`✨ ${active.name} recuperou ${cleanHeal} HP!`);
                    break;
                
                case 'guaranteed_max_dmg':
                    active.battleState.guaranteedMax = true;
                    addLog(`✨ O próximo ataque de ${active.name} causará dano máximo!`);
                    break;
                
                case 'dodge_buff':
                    active.battleState.dodgeBuff = skill.value;
                    addLog(`✨ ${active.name} ganhou +${Math.round(skill.value * 100)}% de esquiva para o próximo turno!`);
                    break;
            }
        });

        // Efeitos globais (afetam inimigos ou estado global)
        switch (skill.effect) {
            case 'enemy_max_dmg_debuff':
                state.enemies.forEach(e => {
                    if (e.currentHp > 0) {
                        e.battleState.maxDmgDebuff = { value: skill.value, turns: skill.turns || 2 };
                        addLog(`✨ ${e.name} teve o dano máximo reduzido em ${skill.value} por ${skill.turns || 2} turnos!`);
                    }
                });
                break;
            
            case 'clean_recoil_heal':
                // "Limpa recoil" - Vamos interpretar como limpar os boosts que o jogador deu aos inimigos
                state.enemies.forEach(e => {
                    if (e.tempDmgBoost > 1) {
                        e.tempDmgBoost = 1;
                        addLog(`✨ Os inimigos perderam os bônus de dano recebidos!`);
                    }
                });
                break;
            
            case 'stun_chance':
                if (Math.random() < skill.value) {
                    state.enemies.forEach(e => {
                        if (e.currentHp > 0) {
                            e.battleState.stunned = true;
                            addLog(`✨ ${e.name} ficou atordoado e perderá o próximo turno!`);
                        }
                    });
                } else {
                    addLog(`✨ A fumaça falhou em atordoar os inimigos.`);
                }
                break;
        }

        setupBattleUI();
    }

    function updateHpUI(who, creature) {
        if (!creature) return;
        const percent = Math.max(0, Math.min(100, (creature.currentHp / creature.hp) * 100));
        
        // Suporte a legado 'player' redirecionando para 'player-0'
        const effectiveWho = who === 'player' ? 'player-0' : who;
        
        const bar = document.getElementById(`${effectiveWho}-hp-bar`);
        const text = document.getElementById(`${effectiveWho}-hp-text`);
        if (bar) bar.style.width = percent + '%';
        if (text) text.innerText = `${Math.max(0, Math.floor(creature.currentHp))}/${creature.hp}`;
        
        // Atualiza Tooltip
        let containerId;
        if (effectiveWho.startsWith('player-')) {
            containerId = `player-fighter-${effectiveWho.split('-')[1]}`;
        } else if (effectiveWho.startsWith('enemy-')) {
            containerId = `enemy-fighter-${effectiveWho.split('-')[1]}`;
        } else {
            containerId = effectiveWho === 'player' ? 'player-fighter-0' : `enemy-fighter-0`;
        }

        const container = document.getElementById(containerId);
        if (container) {
            const tooltip = container.querySelector('.tooltiptext');
            if (tooltip) tooltip.innerHTML = getCreatureTooltip(creature);
        }
    }

    function updateXpUI(creature, index = 0) {
        const percent = (creature.xp / creature.maxXp) * 100;
        const bar = document.getElementById(`player-${index}-xp-bar`);
        const text = document.getElementById(`player-${index}-xp-text`);
        if (bar) bar.style.width = percent + '%';
        if (text) text.innerText = `Lvl ${creature.level} - ${creature.xp}/${creature.maxXp} XP`;
    }

    function playerAttack(atk, enemyIndex, playerIndex = 0) {
        const p = state.activePlayerCreatures[playerIndex];
        
        // Verifica Cooldown
        if (p.cooldowns[atk.name] > 0) {
            addLog(`${atk.name} está em recarga! (${p.cooldowns[atk.name]} turnos)`);
            return;
        }

        // Se já agiu neste turno, impede novo ataque (apenas para modo Boss)
        if (state.isBossBattle && p.battleState.hasActed) {
            addLog(`${p.name} já agiu neste turno!`);
            return;
        }

        playSound('attack');
        const target = state.enemies[enemyIndex];
        const enemyEl = document.getElementById(`enemy-fighter-${enemyIndex}`);
        const enemyCard = enemyEl ? enemyEl.querySelector('.creature-card') : null;
        
        // Animação de Ataque do Jogador
        const playerFighterEl = document.getElementById(`player-fighter-${playerIndex}`);
        const playerCard = playerFighterEl ? playerFighterEl.querySelector('.creature-card') : null;
        if (playerCard) {
            playerCard.classList.remove('anim-attack-p');
            void playerCard.offsetWidth; // Force reflow
            playerCard.classList.add('anim-attack-p');
        }

        let dmg = Math.floor(Math.random() * (atk.max - atk.min + 1)) + atk.min;


        // --- SUPORTE ORÁCULO: Garantia de Dano Máximo ---
        if (p.battleState && p.battleState.guaranteedMax) {
            dmg = atk.max;
            p.battleState.guaranteedMax = false;
            addLog(`✨ PREVISÃO: ${p.name} desferiu um golpe perfeito!`);
        }

        // --- SUPORTE MAGO: Bônus de Próximo Ataque ---
        if (p.battleState && p.battleState.nextAttackBonus) {
            dmg += p.battleState.nextAttackBonus;
            p.battleState.nextAttackBonus = 0;
            addLog(`✨ ENCANTAMENTO: Dano extra aplicado!`);
        }

        // --- APLICA BOOST TEMPORÁRIO (de custos do inimigo) ---
        if (p.tempDmgBoost) {
            dmg = Math.floor(dmg * p.tempDmgBoost);
            p.tempDmgBoost = 1; // Reseta após usar
        }
        // -----------------------------------------------------

        // --- NOVOS BUFFS/DEBUFFS OFFENSIVOS ---
        let ignoreDodge = false;
        let ignoreWeakness = false;
        let ignoreDefense = false;

        if (p.items && p.items.length > 0) {
            p.items.forEach(item => {
                const lvl = item.level || 1;
                const itemDourado = (msg) => `<span style="color:gold; font-weight:bold;">${item.icon || '📦'} ${msg}</span>`;

                // 1. Amuleto do Ritmo: +10% dano por turno consecutivo
                if (item.id === 'amuleto_ritmo') {
                    if (p.currentHp < p.hp * 0.3) p.battleState.consecutiveTurns = 0;
                    const bonus = 1 + (p.battleState.consecutiveTurns * 0.1);
                    dmg = Math.floor(dmg * bonus);
                }

                // 2. Coração Ancestral: -6% dano
                if (item.id === 'coracao_ancestral') dmg = Math.floor(dmg * 0.94);

                // 4. Olho do Predador
                if (item.id === 'olho_predador') {
                    if (p.battleState.targetLock.index === enemyIndex) {
                        if (p.battleState.targetLock.turns >= 2) {
                            ignoreDodge = true;
                            ignoreWeakness = true;
                            ignoreDefense = true;
                            addLog(itemDourado(`OLHO DO PREDADOR: Focado! Ignorando defesas.`));
                            p.battleState.targetLock.turns = 0; // Reseta após usar o buff
                        } else {
                            p.battleState.targetLock.turns++;
                        }
                    } else {
                        p.battleState.targetLock = { index: enemyIndex, turns: 1 };
                    }
                }

                // 5. Tônico de Guerra
                if (item.id === 'tonico_guerra') {
                    if (p.battleState.tonicoTurns > 0) {
                        dmg = Math.floor(dmg * 1.15);
                    } else if (p.battleState.tonicoTurns === -1) {
                        dmg = Math.floor(dmg * 0.90); // Exaustão
                    }
                }

                // 11. Lâmina Instável
                if (item.id === 'lamina_instavel') dmg = Math.floor(dmg * 1.2);

                // 13. Máscara do Sacrifício: +5% dmg por debuff no inimigo
                if (item.id === 'mascara_sacrificio' && target.battleState) {
                    let debuffs = 0;
                    if (target.battleState.damageReduction > 0) debuffs++;
                    if (target.battleState.takenDamageIncrease > 0) debuffs++;
                    if (target.battleState.missChance > 0) debuffs++;
                    if (target.battleState.bleedTurns > 0) debuffs++;
                    dmg = Math.floor(dmg * (1 + (debuffs * 0.05)));
                }
            });
        }

        // Marca do Abismo (no alvo)
        if (target.battleState && target.battleState.takenDamageIncrease > 0) {
            dmg = Math.floor(dmg * (1 + target.battleState.takenDamageIncrease));
        }
        // --------------------------------------

        // Bônus Primordiais: +20% Dano
        if (p.clan === 'primordiais') {
            dmg = Math.floor(dmg * 1.2);
        }

        // Vantagem/Desvantagem de Clã
        let multiplier = 1.0;
        if (!atk.ignoreClans && p.clan && target.clan && !ignoreWeakness) {
            const attackerClan = CLANS[p.clan];
            const targetClan = CLANS[target.clan];
            if (attackerClan.strongAgainst.includes(target.clan)) {
                multiplier = 1.2;
                addLog(`✨ VANTAGEM: ${attackerClan.emoji} ${p.name} é forte contra ${targetClan.emoji} ${target.name}! (+20%)`);
            } else if (attackerClan.weakAgainst.includes(target.clan)) {
                multiplier = 0.8;
                addLog(`✖ DESVANTAGEM: ${attackerClan.emoji} ${p.name} é fraco contra ${targetClan.emoji} ${target.name}! (-20%)`);
            }
        }
        dmg = Math.floor(dmg * multiplier);

        // --- CHANCE DE ESQUIVA DO INIMIGO ---
        let enemyDodged = false;
        if (!ignoreDodge) {
            // Bônus Sombras para Inimigos: +20% Esquiva
            if (target.clan === 'sombras' && Math.random() < 0.20) enemyDodged = true;
            
            // Inimigos também podem ter Manto de Esquiva se vierem com itens
            if (target.items && target.items.some(i => i.id === 'manto_esquiva') && Math.random() < 0.25) enemyDodged = true;
        }

        if (enemyDodged) {
            addLog(`<span style="color:#4dabff;">💨 ESQUIVA: ${target.name} desviou do ataque de ${p.name}!</span>`);
            
            // 6. Correntes do Esquecimento: Remove se o inimigo esquivar
            if (p.items && p.items.some(i => i.id === 'correntes_esquecimento')) {
                if (target.battleState) target.battleState.damageReduction = 0;
                addLog(`⛓️ CORRENTES: As correntes se soltaram após a esquiva!`);
            }

            // Animação de Esquiva no Inimigo
            if (enemyCard) {
                enemyCard.classList.remove('anim-flash');
                void enemyCard.offsetWidth;
                enemyCard.classList.add('anim-flash');
            }
        } else {
            // Efeitos de Itens Ofensivos (Calculados com Nível do Item)
            if (p.items && p.items.length > 0) {
                p.items.forEach(item => {
                    const lvl = item.level || 1;
                    const itemDourado = (msg) => `<span style="color:gold; font-weight:bold;">${item.icon || '📦'} ${msg}</span>`;
                    
                    if (item.id === 'garra_obsidiana') dmg += (10 * lvl);
                    if (item.id === 'anel_fogo') {
                        if (Math.random() > 0.5) dmg += (15 * lvl); 
                    }
                    if (item.id === 'amolador_presas') dmg = Math.max(dmg, 20 + (5 * (lvl-1)));
                    if (item.id === 'cajado_runico' && p.isEvolved) dmg = Math.floor(dmg * (2.5 + (0.05 * (lvl-1))));
                    if (item.id === 'coroa_demonio') dmg += (30 * lvl);
                    if (item.id === 'espelho_mistico') {
                        if (Math.random() < (0.6 + (0.2 * (lvl-1)))) {
                            const enemyMaxAtk = Math.max(...target.attacks.map(a => a.max));
                            dmg += enemyMaxAtk;
                            addLog(itemDourado(`ESPELHO MÍSTICO: Refletiu +${enemyMaxAtk} de dano! (Nível ${lvl})`));
                        }
                    }
                    // Colar de Regeneração (Cura ao atacar)
                    if (item.id === 'colar_regeneracao') {
                        const heal = Math.floor(p.hp * (0.10 * lvl));
                        p.currentHp = Math.min(p.hp, p.currentHp + heal);
                        showFloatingValue(`player-fighter-${playerIndex}`, heal, 'heal');
                        addLog(itemDourado(`REGENERAÇÃO: ${p.name} recuperou ${heal} HP!`));
                        updateHpUI(`player-${playerIndex}`, p);
                    }

                    // 9. Sangramento (Aplica/Reseta duração ao atacar)
                    if (item.id === 'sangramento') {
                        if (!target.battleState) {
                            target.battleState = {
                                damageReduction: 0,
                                takenDamageIncrease: 0,
                                missChance: 0,
                                bleedTurns: 0,
                                turnCount: 0
                            };
                        }
                        target.battleState.bleedTurns = 3;
                        addLog(itemDourado(`SANGRAMENTO: ${target.name} está sangrando!`));
                    }
                });
            }

            target.currentHp -= dmg;
            showFloatingValue(`enemy-fighter-${enemyIndex}`, dmg, 'damage');
            const dmgStyle = dmg > 100 ? `color:#ff4d4d; font-size:1.1rem; font-weight:bold;` : `color:#ff4d4d;`;
            addLog(`${p.name} usou ${atk.name} em ${target.name}: <span style="${dmgStyle}">${dmg} dano!</span>`);

            // --- EFEITOS DE ITENS DO INIMIGO (REVIDE/DEFESA) ---
            if (target.items && target.items.length > 0 && !ignoreDefense) {
                target.items.forEach(item => {
                    const lvl = item.level || 1;
                    // Escudo de Espinhos no Inimigo
                    if (item.id === 'escudo_espinhos') {
                        const reflect = Math.floor(dmg * (0.08 + (0.02 * (lvl - 1))));
                        p.currentHp -= reflect;
                        addLog(`<span style="color:#ff4d4d;">🌵 ESPINHOS: ${target.name} refletiu ${reflect} de dano!</span>`);
                        showFloatingValue(`player-fighter-${playerIndex}`, reflect, 'damage');
                        updateHpUI(`player-${playerIndex}`, p);
                    }
                });
            }
            // --------------------------------------------------


            // --- CUSTOS DE ATAQUE ---
            // 1. Recoil (Dano ao usuário)
            if (atk.recoil) {
                const recoilDmg = Math.floor(p.hp * atk.recoil);
                p.currentHp -= recoilDmg;
                showFloatingValue(`player-fighter-${playerIndex}`, recoilDmg, 'damage');
                addLog(`⚠️ RECUO: ${p.name} recebeu ${recoilDmg} de dano pelo impacto!`);
                updateHpUI(`player-${playerIndex}`, p);
            }

            // 2. Enemy Boost (Fortalece inimigos)
            if (atk.enemyBoost) {
                state.enemies.forEach(e => {
                    if (e.currentHp > 0) {
                        e.tempDmgBoost = (e.tempDmgBoost || 1) * atk.enemyBoost.dmg;
                    }
                });
                addLog(`🔥 PODER INIMIGO: O ataque de ${p.name} fortaleceu os inimigos!`);
            }

            // 3. Cooldown (Recarga)
            if (atk.cooldown) {
                p.cooldowns[atk.name] = atk.cooldown;
            }
            // ------------------------

            updateHpUI(`enemy-${enemyIndex}`, target);
            
            // Animação de Dano no Inimigo
            if (enemyCard) {
                enemyCard.classList.remove('anim-shake', 'anim-flash');
                void enemyCard.offsetWidth; // Force reflow
                enemyCard.classList.add('anim-shake', 'anim-flash');
            }
        } // Fim do else (se não esquivou)

        // Atualiza tooltip do inimigo (HP mudou)
        if (enemyEl) {
            const enemyTooltip = enemyEl.querySelector('.tooltiptext');
            if (enemyTooltip) enemyTooltip.innerHTML = getCreatureTooltip(target);
        }

        if (target.currentHp <= 0) {
            addLog(`${target.name} foi derrotado!`);
            if (enemyCard) enemyCard.classList.add('anim-death');
            else if (enemyEl) enemyEl.style.opacity = '0.3';
        }

        // Se o jogador morreu pelo recoil ou espinhos, marca como fora
        if (p.currentHp <= 0) {
            addLog(`${p.name} desmaiou pelo esforço!`);
            if (playerCard) playerCard.classList.add('anim-death');
        }

        // --- PROCESSA FIM DE TURNO DO JOGADOR ---
        p.battleState.hasActed = true;
        
        // Se estiver no modo boss, desativa apenas os botões desta criatura
        if (state.isBossBattle) {
            setupBattleUI(); // Redesenha para refletir cooldowns e hasActed
        }

        // Verifica se todos os jogadores vivos já agiram
        const alivePlayers = state.activePlayerCreatures.filter(c => c.currentHp > 0);
        const allActed = alivePlayers.every(c => c.battleState.hasActed);

        if (allActed || !state.isBossBattle) {
            // Só processa efeitos globais e passa turno se todos agiram ou se não for Boss
            processTurnEnd('player');
            
            // Verifica mortes pós-efeitos
            alivePlayers.forEach((player, idx) => {
                if (player.currentHp <= 0) {
                    addLog(`${player.name} sucumbiu aos efeitos colaterais.`);
                    const pCard = document.querySelector(`#player-fighter-${idx} .creature-card`);
                    if (pCard) pCard.classList.add('anim-death');
                }
            });

            const teamDefeated = state.activePlayerCreatures.every(c => c.currentHp <= 0);
            if (teamDefeated) {
                toggleButtons(true);
                setTimeout(loseBattle, 1000);
                return;
            }

            toggleButtons(true);
            const allEnemiesDead = state.enemies.every(e => e.currentHp <= 0);
            if (allEnemiesDead) {
                setTimeout(winBattle, 1000);
            } else {
                updateTurnIndicator(false);
                setTimeout(enemyTurn, 1000);
            }
        }
    }

    function enemyTurn() {
        const aliveEnemies = state.enemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length === 0) { winBattle(); return; }
        
        updateTurnIndicator(false);
        let currentAttackerIndex = 0;
        
        function nextEnemyAttack() {
            if (currentAttackerIndex >= aliveEnemies.length) {
                // Ao final do turno dos inimigos
                processTurnEnd('enemy'); // Aplica sangramento, regeneração, etc.

                // Verifica se todos os jogadores morreram
                const allPlayersDead = state.activePlayerCreatures.every(p => p.currentHp <= 0);
                if (allPlayersDead) {
                    addLog(`Toda a sua equipe foi derrotada.`);
                    state.activePlayerCreatures.forEach((p, idx) => {
                        const playerCard = document.querySelector(`#player-fighter-${idx} .creature-card`);
                        if (playerCard) playerCard.classList.add('anim-death');
                    });
                    setTimeout(loseBattle, 1000);
                    return;
                }

                // Verifica se todos os inimigos morreram por efeitos de fim de turno
                const allDead = state.enemies.every(e => e.currentHp <= 0);
                if (allDead) {
                    setTimeout(winBattle, 1000);
                    return;
                }
                
                updateTurnIndicator(true);
                setupBattleUI(); // Redesenha para resetar estados visuais dos botões
                toggleButtons(false);
                return;
            }
            
            const enemy = aliveEnemies[currentAttackerIndex];
            
            // Escolhe um alvo vivo aleatório do jogador
            const alivePlayers = state.activePlayerCreatures
                .map((p, idx) => ({p, idx}))
                .filter(item => item.p.currentHp > 0);
            
            if (alivePlayers.length === 0) {
                currentAttackerIndex++;
                nextEnemyAttack();
                return;
            }

            const targetItem = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            const p = targetItem.p;
            const pIdx = targetItem.idx;

            // Garante que o battleState existe
            if (!enemy.battleState) {
                enemy.battleState = {
                    damageReduction: 0,
                    takenDamageIncrease: 0,
                    missChance: 0,
                    bleedTurns: 0,
                    turnCount: 0
                };
            }
            
            // --- VERIFICA STUN (Suporte Polvo) ---
            if (enemy.battleState.stunned) {
                addLog(`✨ STUN: ${enemy.name} está atordoado e não pode atacar!`);
                enemy.battleState.stunned = false;
                currentAttackerIndex++;
                setTimeout(nextEnemyAttack, 1000);
                return;
            }

            if (p && !p.battleState) {
                p.battleState = {
                    consecutiveTurns: 0,
                    defenseBuff: 0,
                    tonicoTurns: (p.items && p.items.some(i => i.id === 'tonico_guerra')) ? 3 : 0,
                    targetLock: { index: -1, turns: 0 },
                    turnCount: 0,
                    hasActed: false
                };
            }

            // Bônus Sagrados para Inimigos: Cura 10% no início do seu ataque
            if (enemy.clan === 'sagrados') {
                const heal = Math.floor(enemy.hp * 0.1);
                enemy.currentHp = Math.min(enemy.hp, enemy.currentHp + heal);
                showFloatingValue(`enemy-fighter-${state.enemies.indexOf(enemy)}`, heal, 'heal');
                addLog(`SAGRADOS: ${enemy.name} regenerou ${heal} HP!`);
                updateHpUI(`enemy-${state.enemies.indexOf(enemy)}`, enemy);
            }

            playSound('hit');
            
            // Animação de Ataque do Inimigo
            const enemyIndex = state.enemies.indexOf(enemy);
            const enemyEl = document.getElementById(`enemy-fighter-${enemyIndex}`);
            const enemyCard = enemyEl ? enemyEl.querySelector('.creature-card') : null;
            if (enemyCard) {
                enemyCard.classList.remove('anim-attack-e');
                void enemyCard.offsetWidth; // Force reflow
                enemyCard.classList.add('anim-attack-e');
            }

            // IA: Escolhe o melhor ataque baseado no clã e cooldowns
            let atk;
            enemy.cooldowns = enemy.cooldowns || {};
            
            const attackerClan = CLANS[enemy.clan];
            const isWeak = attackerClan && p.clan && attackerClan.weakAgainst.includes(p.clan);
            
            // Filtra ataques disponíveis (sem cooldown)
            const availableAttacks = enemy.attacks.filter(a => (enemy.cooldowns[a.name] || 0) <= 0);
            const pool = availableAttacks.length > 0 ? availableAttacks : enemy.attacks;
            
            if (isWeak) {
                const ignoreAtks = pool.filter(a => a.ignoreClans);
                if (ignoreAtks.length > 0 && Math.random() < 0.7) {
                    atk = ignoreAtks[Math.floor(Math.random() * ignoreAtks.length)];
                    addLog(`🧠 ESTRATÉGIA: ${enemy.name} usa um ataque que ignora fraquezas!`);
                } else {
                    atk = pool[Math.floor(Math.random() * pool.length)];
                }
            } else {
                atk = pool[Math.floor(Math.random() * pool.length)];
            }
            
            // --- APLICA CUSTOS DE ATAQUE DO INIMIGO ---
            if (atk.cooldown) {
                enemy.cooldowns[atk.name] = atk.cooldown;
            }
            if (atk.recoil) {
                const recoilDmg = Math.floor(enemy.hp * atk.recoil);
                enemy.currentHp -= recoilDmg;
                showFloatingValue(`enemy-fighter-${enemyIndex}`, recoilDmg, 'damage');
                addLog(`⚠️ RECUO: ${enemy.name} recebeu ${recoilDmg} de dano pelo impacto!`);
                updateHpUI(`enemy-${enemyIndex}`, enemy);
            }

            // Dano Base
            let dmg = Math.floor(Math.random() * (atk.max - atk.min + 1)) + atk.min;

            // --- SUPORTE SERPENTE: Toxina Debilitante ---
            if (enemy.battleState.maxDmgDebuff && enemy.battleState.maxDmgDebuff.turns > 0) {
                dmg = Math.max(atk.min, dmg - enemy.battleState.maxDmgDebuff.value);
            }

            // Correntes do Esquecimento: -5% dano por acúmulo
            if (enemy.battleState.damageReduction > 0) {
                dmg = Math.floor(dmg * (1 - enemy.battleState.damageReduction));
            }

            // Bônus Primordiais para Inimigos: +20% Dano
            if (enemy.clan === 'primordiais') {
                dmg = Math.floor(dmg * 1.2);
            }

            // Fraqueza Elemental
            if (isWeak) {
                if (!atk.ignoreClans) {
                    dmg = Math.floor(dmg * 0.7);
                    addLog(`🛡️ RESISTÊNCIA: ${p.name} resistiu ao ataque de ${enemy.name}!`);
                }
            } else if (p.clan && attackerClan && attackerClan.strongAgainst.includes(p.clan)) {
                if (!atk.ignoreClans) {
                    dmg = Math.floor(dmg * 1.5);
                    addLog(`💥 FRAQUEZA: ${p.name} é vulnerável a ${enemy.name}!`);
                }
            }

            // --- NÉVOA ENTORPECENTE ---
            if (enemy.battleState.missChance > 0) {
                if (Math.random() < enemy.battleState.missChance) {
                    showFloatingValue(`player-fighter-${pIdx}`, 'MISS', 'damage');
                    addLog(`<span style="color:#4dabff;">🌫️ NÉVOA: ${enemy.name} errou o ataque!</span>`);
                    currentAttackerIndex++;
                    setTimeout(nextEnemyAttack, 1000);
                    return;
                }
            }

            // Esquiva do Jogador (Base + Buffs + Itens)
            let dodgeChance = 0.05 + (p.battleState ? p.battleState.dodgeBuff || 0 : 0);
            if (p.clan === 'sombras') dodgeChance += 0.20;
            if (p.items && p.items.some(i => i.id === 'capa_invisibilidade')) dodgeChance += 0.15;
            if (p.items && p.items.some(i => i.id === 'manto_esquiva')) dodgeChance += 0.25;
            
            if (Math.random() < dodgeChance) {
                showFloatingValue(`player-fighter-${pIdx}`, 'MISS', 'damage');
                addLog(`💨 ESQUIVA: ${p.name} desviou do ataque!`);
            } else {
                // Redução de Dano (Defesa do Jogador)
                let reduction = p.battleState ? (p.battleState.defenseBuff || 0) + (p.battleState.damageReductionBuff || 0) : 0;
                if (p.items && p.items.some(i => i.id === 'escudo_espartano')) reduction += 0.15;
                
                dmg = Math.floor(dmg * (1 - Math.min(0.8, reduction)));
                
                // Relógio da Entropia: Turno par: +15% dano recebido
                if (p.items && p.items.some(i => i.id === 'relogio_entropia') && p.battleState.turnCount % 2 === 0) {
                    dmg = Math.floor(dmg * 1.15);
                }

                p.currentHp -= dmg;
                showFloatingValue(`player-fighter-${pIdx}`, dmg, 'damage');
                addLog(`⚔️ ATAQUE: ${enemy.name} usou ${atk.name} e causou ${dmg} de dano em ${p.name}!`);
                
                // Espinhos
                if (p.items && p.items.some(i => i.id === 'escudo_espinhos')) {
                    const reflect = Math.floor(dmg * 0.1);
                    enemy.currentHp -= reflect;
                    addLog(`🛡️ ESPINHOS: ${enemy.name} recebeu ${reflect} de dano de volta!`);
                    updateHpUI(`enemy-${enemyIndex}`, enemy);
                }

                // Abissais (Refletir)
                if (p.clan === 'abissais') {
                    const reflect = Math.floor(dmg * 0.25);
                    enemy.currentHp -= reflect;
                    addLog(`🌌 ABISSAIS: ${enemy.name} recebeu ${reflect} de dano refletido!`);
                    updateHpUI(`enemy-${enemyIndex}`, enemy);
                }

                const playerEl = document.getElementById(`player-fighter-${pIdx}`);
                const playerCard = playerEl ? playerEl.querySelector('.creature-card') : null;
                if (playerCard) {
                    playerCard.classList.remove('anim-shake', 'anim-flash');
                    void playerCard.offsetWidth;
                    playerCard.classList.add('anim-shake', 'anim-flash');
                }
                
                // Fênix de Bolso
                if (p.currentHp <= 0 && p.items && p.items.some(i => i.id === 'fenix_bolso')) {
                    const fIdx = p.items.findIndex(i => i.id === 'fenix_bolso');
                    p.items.splice(fIdx, 1);
                    p.currentHp = Math.floor(p.hp * 0.3);
                    addLog(`🔥 FÊNIX: ${p.name} renasceu das cinzas!`);
                }

                updateHpUI(`player-${pIdx}`, p);
            }

            currentAttackerIndex++;
            setTimeout(nextEnemyAttack, 1000);
        }
        
        nextEnemyAttack();
    }

    function winBattle() {
        if (state.isBossBattle) playSound('victory');
        
        let totalXp = 0;
        let totalDiamantes = 0;
        
        state.enemies.forEach(e => {
            totalXp += state.isBossBattle ? 500 : 40 + (e.level * 10);
            totalDiamantes += state.isBossBattle ? 200 : 20 + (e.level * 5);
        });

        state.diamantes += totalDiamantes;
        addLog(`Vitória! +${totalXp} XP | +${totalDiamantes} 💎`);

        // Dá XP para todos os jogadores ativos (ou o único ativo no modo normal)
        state.activePlayerCreatures.forEach(p => {
            let xpForThisOne = totalXp;
            // Bônus Grimório de Aprendiz (+30% XP)
            if (p.items && p.items.length > 0) {
                let xpBonus = 0;
                p.items.forEach(item => {
                    if (item.id === 'grimorio_aprendiz') xpBonus += 1;
                });
                if (xpBonus > 0) {
                    xpForThisOne = Math.floor(xpForThisOne * (1 + xpBonus));
                    addLog(`GRIMÓRIO (${p.name}): +${Math.round(xpBonus * 100)}% de XP bônus!`);
                }
            }
            gainXp(p, xpForThisOne);
        });

        // Chance de Drop de Item (10% normal, 100% boss)
        const dropChance = state.isBossBattle ? 1.0 : 0.1;
        if (Math.random() < dropChance) {
            const possibleItems = Object.values(ITEMS).filter(i => !i.minLevel || state.level >= i.minLevel);
            const droppedItem = JSON.parse(JSON.stringify(possibleItems[Math.floor(Math.random() * possibleItems.length)]));
            droppedItem.level = 1; // Inicializa nível do item

            setTimeout(() => {
                showModal("DROP!", `
                    <div style="text-align:center;">
                        <img src="imagens/${droppedItem.image}" style="width:64px; height:64px; object-fit:contain; margin-bottom:10px;"><br>
                        <strong>${droppedItem.name}</strong><br>
                        <small>${droppedItem.desc}</small>
                    </div>`, [
                    { text: "Equipar", action: () => {
                        showCreatureSelection((target) => {
                            if (!target.items) target.items = [];
                            const maxSlots = getMaxItemSlotsForLevel(target.level);
                            
                            if (target.items.length >= maxSlots) {
                                // Sistema de Substituição/Fusão
                                showModal("Espaços Cheios", `Escolha um item para substituir ou fundir (se for igual):`, [
                                    ...target.items.map((it, idx) => ({
                                        text: it.id === droppedItem.id ? `Fundir (+Power)` : `Subst. ${it.name}`,
                                        action: () => {
                                            if (it.id === droppedItem.id) {
                                                fuseItems(it, droppedItem);
                                                addLog(`${it.name} subiu de nível!`);
                                            } else {
                                                target.items[idx] = droppedItem;
                                                addLog(`${target.name} equipou ${droppedItem.name}!`);
                                            }
                                            finishBattleFlow();
                                        }
                                    })),
                                    { text: "Voltar", action: () => winBattle() }
                                ]);
                                return;
                            }
                            
                            target.items.push(droppedItem);
                            addLog(`${target.name} equipou ${droppedItem.name}!`);
                            finishBattleFlow();
                        }, "Quem deve equipar?");
                    }},
                    { text: "Ignorar", action: finishBattleFlow }
                ]);
            }, 1000);
            return;
        }

        finishBattleFlow();
    }

    function finishBattleFlow() {
        if (state.isBossBattle) { 
            setTimeout(showBossVictory, 1000); 
        } else {
            const lastEnemy = state.enemies[state.enemies.length - 1];
            showModal("Vitória!", `
                <div style="text-align:center;">
                    ${getCreatureImageOnly(lastEnemy, "80px")}<br>
                    Você venceu o combate contra <strong>${lastEnemy.name}</strong>!
                </div>`, [
                { text: "Capturar", action: () => captureCreature(lastEnemy) },
                { text: "Trocar", action: () => swapCreature(lastEnemy) },
                { text: "Deixar ir", action: endEvent }
            ]);
        }
    }

    function fuseItems(targetItem, sourceItem) {
        targetItem.level = (targetItem.level || 1) + 1;
        // O poder dos itens é calculado dinamicamente no combate agora
    }

    function gainXp(creature, amount) {
        creature.xp += amount;
        while (creature.xp >= creature.maxXp) {
            creature.xp -= creature.maxXp;
            levelUp(creature);
        }
        updateUI();
    }

    function levelUp(c) {
        c.level++;
        c.maxXp = Math.floor(c.maxXp * 1.2);
        
        // Casco de Adamante (+100 HP Max) - já deve estar somado se o item for equipado
        // Mas garantimos que o HP aumente ao subir de nível
        c.hp += 20;
        c.currentHp = c.hp;
        c.attacks.forEach(a => { a.min += 2; a.max += 4; });
        addLog(`LEVEL UP! ${c.name} atingiu nível ${c.level}!`);
        
        // Pedra da Evolução Precoce (Evolui 1 nível antes por item)
        let reduction = 0;
        if (c.items) {
            c.items.forEach(item => {
                if (item.id === 'pedra_evolucao') reduction += 2;
            });
        }
        const evoLevel = c.evo ? Math.max(1, c.evo.level - reduction) : 999;
        
        if (!c.isEvolved && c.evo && c.level >= evoLevel) {
            evolve(c);
        }
    }

    function evolve(c) {
        playSound('evolution');
        const oldName = c.name;
        c.name = c.evo.name;
        c.emoji = c.evo.emoji;
        if (c.evo.image) c.image = c.evo.image;
        c.hp += c.evo.hpBoost;
        c.currentHp = c.hp;
        c.attacks.forEach(a => { a.min += c.evo.dmgBoost; a.max += c.evo.dmgBoost; });
        c.isEvolved = true;
        
        showModal("EVOLUÇÃO!", `
            <div style="text-align:center;">
                ${getCreatureImageOnly(c, "100px")}
                <strong>${oldName}</strong> evoluiu para <strong>${c.name}</strong>!
            </div>`, [{ text: "Incrível!", action: hideModal }]);
        addLog(`EVOLUÇÃO! ${oldName} evoluiu para ${c.name}!`);
    }

    function loseBattle() {
        playSound('defeat');
        
        if (state.isBossBattle) {
            // No modo boss, verifica se ainda há alguém vivo no time reserva
            const aliveReserves = state.team.filter(c => !state.activePlayerCreatures.includes(c) && c.currentHp > 0);
            
            if (aliveReserves.length > 0) {
                addLog("Toda a equipe ativa caiu! Escolha reforços!");
                showCreatureSelection((s) => { 
                    // Substitui a primeira criatura morta pela nova (ou apenas reseta se houver lógica complexa)
                    // Para simplificar: se o time de 3 caiu, o jogador pode escolher um para continuar (modo legado adaptado)
                    // Ou idealmente, substituir as 3. Mas vamos manter o fluxo de "escolha um" por enquanto.
                    state.activePlayerCreature = s; 
                    state.activePlayerCreatures = [s]; // Volta para modo single se escolher reforço? 
                    // Na verdade, vamos manter o modo Boss mas com apenas 1 se for reforço.
                    setupBattleUI(); 
                    toggleButtons(false); 
                }, "Quem deve entrar?");
            } else {
                gameOverBoss();
            }
            return;
        }

        const p = state.activePlayerCreature;
        addLog(`${p.name} caiu!`);
        state.team.splice(state.team.indexOf(p), 1);
        updateUI();
        showModal("Derrota", `
            <div style="text-align:center;">
                ${getCreatureImageOnly(p, "80px")}
                Você perdeu <strong>${p.name}</strong>...
            </div>`, [{ text: "Continuar", action: () => { stopSound(); endEvent(); } }]);
    }

    // --- Events ---

    function startEncounter(enemy) {
        showModal("Encontro", `
            <div style="text-align:center;">
                ${getCreatureImageOnly(enemy, "80px")}
                Um <strong>${enemy.name}</strong> nível ${enemy.level} apareceu!
            </div>`, [
            { text: "Capturar", action: () => tryCapture(enemy) },
            { text: "Lutar", action: () => startBattle(enemy) },
            { text: "Fugir", action: endEvent }
        ]);
    }

    function tryCapture(enemy) {
        let chance = 0.5;
        // Incenso Atrativo (+30% chance de captura por item)
        let bonus = 0;
        state.team.forEach(c => {
            if (c.items) {
                c.items.forEach(item => {
                    if (item.id === 'incenso_atrativo') bonus += 0.3;
                });
            }
        });
        
        if (bonus > 0) {
            chance = Math.min(0.95, chance + bonus);
            addLog(`INCENSO ATRATIVO: +${Math.round(bonus * 100)}% de chance de captura!`);
        }

        const roll = Math.random();
        const fleeChanceOnFail = 0.4; // 40% de chance de fuga quando a captura falha

        if (roll < chance) {
            showModal("Sucesso!", `
                <div style="text-align:center;">
                    ${getCreatureImageOnly(enemy, "80px")}
                    Capturou <strong>${enemy.name}</strong>!
                </div>`, [{ text: "Ok", action: () => captureCreature(enemy) }]);
        } else {
            const fleeRoll = Math.random();
            if (fleeRoll < fleeChanceOnFail) {
                showModal("Fugiu!", `
                    <div style="text-align:center;">
                        ${getCreatureImageOnly(enemy, "80px")}
                        <strong>${enemy.name}</strong> escapou antes de ser capturado!
                    </div>`, [{ text: "Ok", action: endEvent }]);
            } else {
                showModal("Falhou!", `
                    <div style="text-align:center;">
                        ${getCreatureImageOnly(enemy, "80px")}
                        A captura falhou e ele decidiu atacar!
                    </div>`, [{ text: "Lutar", action: () => startBattle(enemy) }]);
            }
        }
    }

    function showBossVictory() {
        const capturedBoss = JSON.parse(JSON.stringify(BOSS));
        capturedBoss.hp = Math.floor(capturedBoss.hp * 0.3);
        capturedBoss.attacks.forEach(a => {
            a.min = Math.floor(a.min * 0.3);
            a.max = Math.floor(a.max * 0.3);
        });
        capturedBoss.name = "Mini " + capturedBoss.name;

        showModal("VITÓRIA!", `
            <div style="text-align:center;">
                ${getCreatureImageOnly(BOSS, "100px")}
                Você derrotou o Chefe! Deseja capturá-lo com 30% do poder?
            </div>`, [
            { text: "Sim, Capturar!", action: () => { 
                captureCreature(capturedBoss, true); // true indica que é captura de boss
            } },
            { text: "Não, Apenas Continuar", action: continueAfterBoss }
        ]);
    }

    function captureCreature(c, isBoss = false) {
        c.currentHp = c.hp; // Vida cheia ao capturar
        
        const nextAction = isBoss ? continueAfterBoss : endEvent;

        // Verifica se já tem uma criatura igual para fusão
        const duplicate = state.team.find(t => t.id === c.id);
        if (duplicate) {
            showModal("Criatura Repetida!", `
                <div style="text-align:center;">
                    ${getCreatureImageOnly(c, "80px")}
                    Você já tem um <strong>${c.name}</strong>. O que deseja fazer?
                </div>`, [
                { text: "Fundir (Power Up!)", action: () => { fuseCreatures(duplicate, c); nextAction(); } },
                { text: "Manter Ambos", action: () => addToTeam(c, isBoss) }
            ]);
        } else {
            addToTeam(c, isBoss);
        }
    }

    function addToTeam(c, isBoss = false) {
        const nextAction = isBoss ? continueAfterBoss : endEvent;
        if (state.team.length < state.maxTeamSize) { 
            state.team.push(c); 
            healTeamOnCapture();
            nextAction(); 
        }
        else {
            showModal("Time Cheio", "Trocar uma?", [
                { text: "Trocar", action: () => swapCreature(c, isBoss) }, 
                { text: "Deixar ir", action: nextAction }
            ]);
        }
    }

    function swapCreature(newC, isBoss = false) {
        const nextAction = isBoss ? continueAfterBoss : endEvent;
        showCreatureSelection((s) => { 
            state.team[state.team.indexOf(s)] = newC; 
            nextAction(); 
        }, `
            <div style="text-align:center;">
                ${getCreatureImageOnly(newC, "64px")}
                Remover qual para dar lugar a <strong>${newC.name}</strong>?
            </div>`);
    }

    function fuseCreatures(existing, newC) {
        existing.level += 1;
        existing.hp += 30;
        existing.currentHp = existing.hp;
        existing.attacks.forEach(a => { a.min += 5; a.max += 8; });
        
        if (newC.level > 1) {
            existing.xp += 50;
            if (existing.xp >= existing.maxXp) gainXp(existing, 0);
        }
        
        addLog(`FUSÃO! ${existing.name} ficou mais forte!`);
        healTeamOnCapture();
    }

    function healTeamOnCapture() {
        state.team.forEach(creature => {
            const healAmount = creature.hp * 0.25;
            creature.currentHp = Math.min(creature.hp, creature.currentHp + healAmount);
        });
        addLog("Sua equipe recuperou um pouco de vida!");
    }

    function handleTreasure() {
        showModal("Baú de Tesouro", "Você encontrou um baú misterioso🍀💀! Deseja abri-lo? (Pode conter recompensas ou armadilhas!)", [
            { text: "Abrir Baú", action: openTreasure },
            { text: "Deixar para lá", action: endEvent }
        ]);
    }

    function openTreasure() {
        playSound('treasure');
        const r = Math.random();
        
        // Bolsa de Moedas (+50 diamantes)
        let bonusDiamantes = 0;
        state.team.forEach(c => {
            if (c.items && c.items.length > 0) {
                c.items.forEach(item => {
                    if (item.id === 'bolsa_moedas') bonusDiamantes += 100;
                });
            }
        });
        if (bonusDiamantes > 0) {
            addLog(`BOLSA DE MOEDAS: +${bonusDiamantes} diamantes bônus!`);
        }

        if (r < 0.3) {
            const c = getRandomEnemy();
            showModal("Ovo!", `
                <div style="text-align:center;">
                    ${getCreatureImageOnly(c, "80px")}<br>
                    Ganhou um <strong>${c.name}</strong>!
                </div>`, [{ text: "Chocar", action: () => captureCreature(c) }]);
        } else if (r < 0.6) {
            const g = 50 + (state.level * 10) + bonusDiamantes;
            state.diamantes += g;
            showModal("Diamante!", `Encontrou um baú com ${g} 💎!`, [{ text: "Pegar", action: endEvent }]);
        } else if (r < 0.8) {
            state.team.forEach(c => { 
                c.hp += 10; c.currentHp = c.hp; 
                c.attacks.forEach(a => { a.min += 2; a.max += 2; });
            });
            showModal("Bênção", "Time fortalecido!", [{ text: "Legal!", action: endEvent }]);
        } else {
            if (Math.random() < 0.3) {
                const possibleItems = Object.values(ITEMS).filter(i => !i.minLevel || state.level >= i.minLevel);
                const foundItem = JSON.parse(JSON.stringify(possibleItems[Math.floor(Math.random() * possibleItems.length)]));
                foundItem.level = 1;
                
                showModal("Item Encontrado!", `
                    <div style="text-align:center;">
                        <img src="imagens/${foundItem.image}" style="width:64px; height:64px; object-fit:contain; margin-bottom:10px;"><br>
                        <strong>${foundItem.name}</strong><br>
                        <small>${foundItem.desc}</small>
                    </div>`, [
                    { text: "Equipar", action: () => {
                        showCreatureSelection((target) => {
                            if (!target.items) target.items = [];
                            const maxSlots = getMaxItemSlotsForLevel(target.level);
                            
                            if (target.items.length >= maxSlots) {
                                showModal("Espaços Cheios", `Escolha um item para substituir ou fundir (se for igual):`, [
                                    ...target.items.map((it, idx) => ({
                                        text: it.id === foundItem.id ? `Fundir (+Power)` : `Subst. ${it.name}`,
                                        action: () => {
                                            if (it.id === foundItem.id) {
                                                fuseItems(it, foundItem);
                                                addLog(`${it.name} subiu de nível!`);
                                            } else {
                                                target.items[idx] = foundItem;
                                                addLog(`${target.name} equipou ${foundItem.name}!`);
                                            }
                                            endEvent();
                                        }
                                    })),
                                    { text: "Voltar", action: () => openTreasure() }
                                ]);
                                return;
                            }
                            
                            target.items.push(foundItem);
                            addLog(`${target.name} equipou ${foundItem.name}!`);
                            endEvent();
                        }, "Quem deve equipar?");
                    }},
                    { text: "Ignorar", action: endEvent }
                ]);
                return;
            }

            if (state.team.length > 1) {
                showModal("Armadilha!", "O baú era uma armadilha! Uma de suas criaturas fugiu assustada. Escolha qual perder:", []);
                const f = document.getElementById('modal-footer');
                f.innerHTML = '';
                state.team.forEach(c => {
                    const d = document.createElement('div');
                    d.className = 'creature-card tooltip';
                    d.innerHTML = `
                        ${getCreatureDisplay(c)}
                        <div class="creature-card-info">
                            <div class="creature-card-name">${c.name}</div>
                        </div>
                        <span class="tooltiptext">${getCreatureTooltip(c)}</span>
                    `;
                    d.onclick = () => {
                        state.team.splice(state.team.indexOf(c), 1);
                        addLog(`${c.name} fugiu da armadilha!`);
                        endEvent();
                    };
                    f.appendChild(d);
                });
            } else showModal("Vazio", "O baú estava vazio...", [{ text: "Ok", action: endEvent }]);
        }
    }

    function openMysteryBox() {
        playSound('treasure');
        let bonusDiamantes = 0;
        if (Math.random() < 0.7) {
            bonusDiamantes = 1 + Math.floor(Math.random() * 75);
            state.diamantes += bonusDiamantes;
        }
        const itemDrops = [];
        const possibleItems = Object.values(ITEMS).filter(i => !i.minLevel || state.level >= i.minLevel);
        for (let i = 0; i < 3; i++) {
            if (Math.random() < 0.5) {
                const foundItem = JSON.parse(JSON.stringify(possibleItems[Math.floor(Math.random() * possibleItems.length)]));
                foundItem.level = 1;
                itemDrops.push(foundItem);
            }
        }
        if (bonusDiamantes === 0 && itemDrops.length === 0) {
            showModal("Caixa Vazia", "A caixa não continha nada...", [
                { text: "Ok", action: showShop }
            ]);
            return;
        }
        if (itemDrops.length === 0) {
            showModal("Recompensa", `Você ganhou ${bonusDiamantes} 💎 da caixa!`, [
                { text: "Ok", action: showShop }
            ]);
            return;
        }
        let header = "";
        if (bonusDiamantes > 0) header = `Você ganhou ${bonusDiamantes} 💎 e encontrou itens!`;
        else header = "Você encontrou itens na caixa!";
        equipBoxItemsSequentially(itemDrops, 0, header);
    }

    function equipBoxItemsSequentially(items, index, headerText) {
        if (index >= items.length) {
            showModal("Caixa Aberta", headerText, [
                { text: "Voltar à Loja", action: showShop }
            ]);
            return;
        }
        const foundItem = items[index];
        showModal("Item da Caixa", `
            <div style="text-align:center;">
                <img src="imagens/${foundItem.image}" style="width:64px; height:64px; object-fit:contain; margin-bottom:10px;"><br>
                <strong>${foundItem.name}</strong><br>
                <small>${foundItem.desc}</small>
            </div>`, [
            { text: "Equipar", action: () => {
                showCreatureSelection((target) => {
                    if (!target.items) target.items = [];
                    const maxSlots = getMaxItemSlotsForLevel(target.level);
                    
                    if (target.items.length >= maxSlots) {
                        showModal("Espaços Cheios", `Escolha um item para substituir ou fundir (se for igual):`, [
                            ...target.items.map((it, idx) => ({
                                text: it.id === foundItem.id ? `Fundir (+Power)` : `Subst. ${it.name}`,
                                action: () => {
                                    if (it.id === foundItem.id) {
                                        fuseItems(it, foundItem);
                                        addLog(`${it.name} subiu de nível!`);
                                    } else {
                                        target.items[idx] = foundItem;
                                        addLog(`${target.name} equipou ${foundItem.name}!`);
                                    }
                                    equipBoxItemsSequentially(items, index + 1, headerText);
                                }
                            })),
                            { text: "Voltar", action: () => equipBoxItemsSequentially(items, index, headerText) }
                        ]);
                        return;
                    }
                    
                    target.items.push(foundItem);
                    addLog(`${target.name} equipou ${foundItem.name}!`);
                    equipBoxItemsSequentially(items, index + 1, headerText);
                }, "Quem deve equipar?");
            }},
            { text: "Ignorar", action: () => equipBoxItemsSequentially(items, index + 1, headerText) }
        ]);
    }

    function endEvent() {
        hideModal();
        
        // Gerencia o descanso das criaturas
        state.team.forEach(c => {
            if (c.restCount > 0) c.restCount--;
        });

        saveGame();
        document.getElementById('battle-screen').style.display = 'none';
        document.getElementById('exploration-grid').classList.remove('hidden');
        updateUI();
        if (state.cardsRevealed >= 6) { 
            if (state.level < 50) {
                setTimeout(showShop, 500);
            } else {
                // Se já estiver no 50 (fim do jogo), não faz nada especial aqui
            }
        }
    }

    function showShop() {
        const shopTitle = `Loja do Nível ${state.level}`;
        const shopBody = state.selectingLock ? 
            "<strong style='color: gold;'>MODO DE TRAVA: Clique no item que deseja fixar!</strong>" : 
            "Bem-vindo! Use seus diamantes para fortalecer sua equipe.";
        const rerollCost = 20;
        
        showModal(shopTitle, shopBody, [
            { text: `Novas Escolhas (${rerollCost} 💎)`, action: () => {
                if (state.diamantes >= rerollCost) {
                    state.diamantes -= rerollCost;
                    state.currentShopItems = null; // Limpa para gerar novos
                    updateUI();
                    showShop();
                    addLog("Loja renovada!");
                } else {
                    alert("Diamantes insuficientes!");
                }
            }},
            { text: state.lockedShopItem ? "Destravar Item" : "Travar Item", action: () => {
                if (state.lockedShopItem) {
                    state.lockedShopItem = null;
                    addLog("Item destravado!");
                    showShop();
                } else {
                    state.selectingLock = !state.selectingLock;
                    showShop();
                }
            }},
            { text: "Próximo Nível", action: () => { 
                hideModal(); 
                state.level++; 
                state.currentShopItems = null; // Limpa para o próximo nível
                generateLevel(); 
            } }
        ], true);

        const f = document.getElementById('modal-footer');
        f.innerHTML = '';

        const healCost = 40 + (state.level * 10);
        createShopItem("Poção Grupal", "Cura 50% de HP de todos.", healCost, "skill_heal.png", "🧪", () => {
            if (state.selectingLock) return false;
            state.team.forEach(c => c.currentHp = Math.min(c.hp, c.currentHp + (c.hp * 0.5)));
            addLog("Equipe curada pela poção!");
            updateUI();
        });

        const boxCost = 150;
        createShopItem("Caixa Misteriosa", "Abra e receba até 3 equipamentos e até 75 💎.", boxCost, "caixa_misteriosa.png", "🎁", () => {
            if (state.selectingLock) return false;
            if (state.diamantes < boxCost) return false;
            state.diamantes -= boxCost;
            updateUI();
            openMysteryBox();
            return false;
        });

        if (!state.currentShopItems) {
            const allItems = Object.values(ITEMS).filter(i => !i.minLevel || state.level >= i.minLevel);
            let selected = [];
            
            // Se houver um item travado, ele ocupa a primeira vaga
            if (state.lockedShopItem) {
                // Tenta encontrar o item atualizado no pool (caso tenha subido de nível o pool)
                const lockedInPool = allItems.find(i => i.id === state.lockedShopItem.id);
                selected.push(lockedInPool || state.lockedShopItem);
            }

            const poolForShuffle = allItems.filter(i => !state.lockedShopItem || i.id !== state.lockedShopItem.id)
                                .sort(() => 0.5 - Math.random());
            
            while (selected.length < 3 && poolForShuffle.length > 0) {
                selected.push(poolForShuffle.pop());
            }
            state.currentShopItems = selected;
        }

        state.currentShopItems.forEach((item, idx) => {
            const isLocked = state.lockedShopItem && state.lockedShopItem.id === item.id;
            const nameDisplay = isLocked ? `🔒 ${item.name}` : item.name;

            createShopItem(nameDisplay, item.desc, item.cost, item.image, null, () => {
                // Se estiver no modo de seleção de trava
                if (state.selectingLock) {
                    state.lockedShopItem = item;
                    state.selectingLock = false;
                    addLog(`Item ${item.name} travado para a próxima visita!`);
                    showShop();
                    return false;
                }

                showCreatureSelection((target) => {
                    if (!target.items) target.items = [];
                    const maxSlots = getMaxItemSlotsForLevel(target.level);
                    
                    const boughtItem = JSON.parse(JSON.stringify(item));
                    boughtItem.level = 1;

                    if (target.items.length >= maxSlots) {
                        // Sistema de Substituição/Fusão
                        showModal("Espaços Cheios", `Escolha um item para substituir ou fundir (se for igual):`, [
                            ...target.items.map((it, itIdx) => ({
                                text: it.id === boughtItem.id ? `Fundir (+Power)` : `Subst. ${it.name}`,
                                action: () => {
                                    if (it.id === boughtItem.id) {
                                        fuseItems(it, boughtItem);
                                        addLog(`${it.name} subiu de nível!`);
                                    } else {
                                        target.items[itIdx] = boughtItem;
                                        addLog(`${target.name} equipou ${boughtItem.name}!`);
                                    }
                                    state.diamantes -= item.cost;
                                    if (isLocked) state.lockedShopItem = null; // Destrava se comprar
                                    
                                    // Remove o item da loja após comprar
                                    state.currentShopItems.splice(idx, 1);
                                    
                                    updateUI();
                                    showShop();
                                }
                            })),
                            { text: "Voltar", action: () => showShop() }
                        ]);
                        return;
                    }
                    
                    // Efeito imediato: Casco de Adamante
                    if (boughtItem.id === 'casco_adamante') {
                        target.hp += 100;
                        target.currentHp += 100;
                    }
                    // Efeito imediato: Coroa do Demônio
                    if (boughtItem.id === 'coroa_demonio') {
                        target.hp = Math.floor(target.hp / 2);
                        target.currentHp = Math.min(target.currentHp, target.hp);
                    }

                    target.items.push(boughtItem);
                    state.diamantes -= item.cost;
                    if (isLocked) state.lockedShopItem = null; // Destrava se comprar
                    
                    // Remove o item da loja após comprar
                    state.currentShopItems.splice(idx, 1);

                    addLog(`${target.name} equipou ${item.name}!`);
                    updateUI();
                    showShop(); // Reabre a loja após equipar
                }, "Quem deve equipar este item?");
                return false; // Não subtrai diamantes aqui, já subtraímos no callback acima
            });
        });

        // --- Treinos ---
        const atkCost = 60 + (state.level * 15);
        createShopItem("Treino Força", "+5 Dano (Min/Max) p/ um", atkCost, "skill_atk.png", "⚔️", () => {
            if (state.selectingLock) return false;
            showCreatureSelection((c) => {
                c.attacks.forEach(a => { a.min += 8; a.max += 8; });
                state.diamantes -= atkCost;
                addLog(`${c.name} aumentou seu dano!`);
                updateUI();
                showShop();
            }, "Escolha quem treinar:");
            return false;
        });

        const hpCost = 50 + (state.level * 10);
        createShopItem("Vida Máxima", "+40 HP Máximo p/ um", hpCost, "skill_hp.png", "💊", () => {
            if (state.selectingLock) return false;
            showCreatureSelection((c) => {
                c.hp += 40;
                c.currentHp += 40;
                state.diamantes -= hpCost;
                addLog(`${c.name} aumentou sua vida!`);
                updateUI();
                showShop();
            }, "Escolha quem fortalecer:");
            return false;
        });
    }

    function createShopItem(name, desc, cost, image, emoji, action) {
        const f = document.getElementById('modal-footer');
        const d = document.createElement('div');
        d.className = 'creature-card';
        if (state.diamantes < cost && !state.selectingLock) d.style.opacity = '0.5';
        
        let displayHtml = "";
        if (image) {
            displayHtml = `<div class="creature-img-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <img src="imagens/${image}" class="creature-img" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 2rem; opacity: 0.3;">${emoji || '❓'}</div>
            </div>`;
        } else {
            displayHtml = `<div class="creature-img-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 2rem;">${emoji}</span>
            </div>`;
        }

        d.innerHTML = `
            ${displayHtml}
            <div class="creature-card-info" style="padding: 15px 5px 8px 5px; background: linear-gradient(transparent, rgba(0,0,0,0.9));">
                <div class="creature-card-name" style="font-size: 0.9rem;">${name}</div>
                <div class="creature-card-stats" style="font-size: 0.65rem; margin-bottom: 5px; max-height: 40px; overflow: hidden; line-height: 1.1;">${desc}</div>
                <div style="color: #ffd700; font-weight: bold; font-size: 1rem; text-shadow: 1px 1px 2px black;">${cost} 💎</div>
            </div>
        `;
        
        d.onclick = () => {
            if (state.diamantes >= cost || state.selectingLock) {
                const result = action();
                if (result !== false) {
                    state.diamantes -= cost;
                    updateUI();
                    showShop();
                }
            } else {
                alert("Diamantes insuficiente!");
            }
        };
        f.appendChild(d);
    }

    function startBossBattle() {
        document.getElementById('exploration-grid').classList.add('hidden');
        const bossAppearanceCount = Math.floor(state.level / 10);
        const multiplier = 1 + (bossAppearanceCount - 1) * 0.5;
        const currentBoss = JSON.parse(JSON.stringify(BOSS));
        currentBoss.hp = Math.floor(currentBoss.hp * multiplier);
        currentBoss.attacks.forEach(a => {
            a.min = Math.floor(a.min * multiplier);
            a.max = Math.floor(a.max * multiplier);
        });

        // Configura equipamentos fixos para o Chefe
        const itemLevel = 6 + (bossAppearanceCount - 1); // Nível 6 inicial, aumenta a cada aparição
        currentBoss.items = [
            { ...JSON.parse(JSON.stringify(ITEMS['garra_obsidiana'])), level: itemLevel },
            { ...JSON.parse(JSON.stringify(ITEMS['cajado_runico'])), level: itemLevel },
            { ...JSON.parse(JSON.stringify(ITEMS['coroa_demonio'])), level: itemLevel }
        ];
        
        // Aplica efeitos imediatos dos itens se necessário
        currentBoss.hp = Math.floor(currentBoss.hp / 2); // Efeito da Coroa do Rei Demônio (HP pela metade)
        
        showModal(`CHEFE DO NÍVEL ${state.level}`, `
            <div style="text-align:center;">
                ${getCreatureImageOnly(currentBoss, "120px")}
                <small>Equipamentos Nível ${itemLevel}</small>
            </div>`, [{ text: "LUTAR", action: () => startBattle(initCreature(currentBoss), true) }]);
    }

    function gameOver() { showModal("FIM", "Perdeu tudo.", [{ text: "Reiniciar", action: () => { location.reload(); } }]); }

    function gameOverBoss() {
        showModal("DERROTA", `
            <div style="text-align:center;">
                ${getCreatureImageOnly(BOSS, "100px")}
                O Rei venceu. Escolha um para renascer:
            </div>`, []);
        const f = document.getElementById('modal-footer');
        f.innerHTML = '';
        state.team.forEach(c => {
            const d = document.createElement('div'); 
            d.className = 'creature-card';
            d.innerHTML = `
                ${getCreatureDisplay(c)}
                <div class="creature-card-info">
                    <div class="creature-card-name">${c.name}</div>
                    <div class="creature-card-stats">Lvl ${c.level}</div>
                </div>
            `;
            d.onclick = () => {
                stopSound();
                const t = [initCreature(CREATURE_POOL[0]), initCreature(CREATURE_POOL[1]), c];
                c.currentHp = c.hp;
                state.team = t;
                state.level = Math.max(1, state.level - 9);
                hideModal(); initGame(true);
            };
            f.appendChild(d);
        });
    }

    function continueAfterBoss() {
        if (state.level >= 50) {
            showModal("GRANDE VITÓRIA!", "Você completou todos os 50 níveis e dominou o mundo das criaturas!", [
                { text: "Jogar Novamente", action: () => location.reload() }
            ]);
            return;
        }

        showModal("Progresso", `Nível ${state.level} concluído! Prepare-se para o próximo desafio.`, [
            { text: "Continuar", action: () => {
                state.level++;
                generateLevel();
                hideModal();
            }}
        ]);
    }

    // --- UI Utils ---
    function showFloatingValue(elementId, value, type = 'damage') {
        const target = document.getElementById(elementId);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const container = document.body;
        
        const floating = document.createElement('div');
        floating.className = `floating-value floating-${type}`;
        floating.textContent = type === 'heal' ? `+${value} HP` : value;
        
        // Posicionamento centralizado no elemento alvo
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        floating.style.left = `${x}px`;
        floating.style.top = `${y}px`;
        
        container.appendChild(floating);
        
        // Remove após a animação
        setTimeout(() => floating.remove(), 1000);
    }

    function getMaxItemSlotsForLevel(level) {
        const lvl = level || 1;
        if (lvl >= 6) return 3;
        if (lvl >= 3) return 2;
        return 1;
    }

    function getCreatureDisplay(c) {
        // Badge do Clã em estilo pílula acima da carta
        let clanHtml = "";
        if (c.clan && CLANS[c.clan]) {
            const clan = CLANS[c.clan];
            clanHtml = `<div class="clan-badge-pill" style="background: ${clan.color};" title="${clan.name}: ${clan.bonus}">
                ${clan.emoji} ${clan.name}
            </div>`;
        }

        // Ícone de Habilidade de Suporte com Tooltip
        let supportHtml = "";
        if (c.supportSkill) {
            const skill = c.supportSkill;
            supportHtml = `<div class="support-skill-icon" title="Habilidade de Suporte: ${skill.name}\n${skill.desc || skill.description}">
                ${skill.icon || '✨'}
            </div>`;
        }

        const maxSlots = getMaxItemSlotsForLevel(c.level);
        // Slots de Itens Laterais - Movidos para FORA do creature-img-container para garantir visibilidade
        let itemsHtml = `<div class="item-slots-sidebar">`;
        for (let i = 0; i < 3; i++) {
            const item = (c.items && c.items[i]) ? c.items[i] : null;
            if (i >= maxSlots) {
                itemsHtml += `<div class="item-slot locked" title="Slot bloqueado: aumente o nível para liberar"></div>`;
            } else if (item) {
                itemsHtml += `
                    <div class="item-slot" title="${item.name}\nAtk: +${item.atk || 0} | Def: +${item.def || 0} | HP: +${item.hp || 0}">
                        <img src="imagens/${item.image}" onerror="this.parentElement.innerHTML='<span style=\'font-size:12px;\'>${item.icon}</span>'">
                    </div>`;
            } else {
                itemsHtml += `<div class="item-slot empty" title="Slot Vazio"></div>`;
            }
        }
        itemsHtml += `</div>`;

        const imagePath = c.image ? `imagens/${c.image}` : "";
        
        return `
            ${clanHtml}
            ${itemsHtml}
            <div class="creature-img-container">
                ${supportHtml}
                ${c.image ? `
                    <img src="${imagePath}" alt="${c.name}" class="creature-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 3.5rem; opacity: 0.3;">${c.emoji}</div>
                ` : `
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size: 3.5rem;">${c.emoji}</div>
                `}
            </div>
        `;
    }

    function getCreatureImageOnly(c, size = "100px") {
        const height = parseInt(size) * 1.5 + "px";
        const imagePath = c.image ? `imagens/${c.image}` : "";
        const content = c.image ? 
            `<img src="${imagePath}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size: 2rem; opacity: 0.3;">${c.emoji}</div>` :
            `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size: 2rem; opacity: 0.5;">${c.emoji}</div>`;
            
        const maxSlots = getMaxItemSlotsForLevel(c.level);
        let itemsHtml = `<div class="item-slots-sidebar" style="right: -25px; gap: 4px;">`;
        for (let i = 0; i < 3; i++) {
            const item = (c.items && c.items[i]) ? c.items[i] : null;
            if (i >= maxSlots) {
                itemsHtml += `<div class="item-slot locked" style="width: 18px; height: 18px; border-width: 1px;" title="Slot bloqueado"></div>`;
            } else if (item) {
                itemsHtml += `<div class="item-slot" style="width: 18px; height: 18px; border-width: 1px;"><img src="imagens/${item.image}" style="width:100%; height:100%; object-fit:contain;" onerror="this.parentElement.innerHTML='<span style=\'font-size:8px;\'>${item.icon}</span>'"></div>`;
            } else {
                itemsHtml += `<div class="item-slot empty" style="width: 18px; height: 18px; border-width: 1px;"></div>`;
            }
        }
        itemsHtml += `</div>`;

        return `
            <div class="creature-card mini" style="width: ${size}; height: ${height}; margin: 0 auto; cursor: default; pointer-events: none; overflow: visible;">
                ${itemsHtml}
                <div class="creature-img-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                    ${content}
                </div>
                <div class="creature-card-info">
                    <div class="creature-card-name" style="font-size: 0.7rem; padding: 2px;">${c.name}</div>
                </div>
            </div>
        `;
    }

    function getCreatureTooltip(c) {
        let attacksInfo = c.attacks.map(a => `• ${a.name}: ${a.min}-${a.max}${a.ignoreClans ? ' <small>(Ignora Clãs)</small>' : ''}`).join('<br>');
        let itemsInfo = (c.items && c.items.length > 0) ? `<br>--- Equipamentos ---<br>${c.items.map(i => {
            const lvl = i.level || 1;
            return `<img src="imagens/${i.image}" style="width:20px; vertical-align:middle;"> <strong>${i.name} (Lvl ${lvl})</strong><br><small style="color:#ccc;">${i.desc}</small>`;
        }).join('<br>')}` : '';

        let supportInfo = c.supportSkill ? `<br>--- Habilidade de Suporte ---<br><span style="color:#ffd700;">✨ ${c.supportSkill.name}</span><br><small style="color:#ccc;">${c.supportSkill.desc}</small><br><small style="color:#4dabff;">Cooldown: ${c.supportSkill.cooldown} Turnos</small>` : '';
        
        let clanInfo = "";
        if (c.clan && CLANS[c.clan]) {
            const clan = CLANS[c.clan];
            const strong = clan.strongAgainst.map(s => CLANS[s].emoji).join(' ');
            const weak = clan.weakAgainst.map(w => CLANS[w].emoji).join(' ');
            clanInfo = `
                <div style="border-left: 3px solid ${clan.color}; padding-left: 5px; margin-bottom: 5px;">
                    <span style="color:${clan.color}; font-weight:bold;">${clan.emoji} Clã ${clan.name}</span><br>
                    <small style="color:#ccc;">${clan.desc}</small><br>
                    <small style="color:${clan.color};">Bônus: ${clan.bonus}</small><br>
                    <small>💪 Forte contra: ${strong} | 🧊 Fraco contra: ${weak}</small>
                </div>
            `;
        }

        return `
            <strong>${c.name} (Lvl ${c.level})</strong><br>
            ${clanInfo}
            HP: ${Math.floor(c.currentHp)}/${c.hp}<br>
            ${c.xp !== undefined ? `XP: ${c.xp}/${c.maxXp}<br>` : ''}--- Ataques ---<br>
            ${attacksInfo}${itemsInfo}${supportInfo}
        `;
    }

    function showModal(t, b, btns, showDiamonds = false) {
        playSound('click');
        document.getElementById('overlay').style.display = 'flex';
        document.getElementById('modal-title').innerHTML = t;
        document.getElementById('modal-body').innerHTML = b;
        document.getElementById('modal-actions').innerHTML = '';
        const f = document.getElementById('modal-footer'); f.innerHTML = '';
        
        const diamondHud = document.getElementById('modal-diamonds-hud');
        if (showDiamonds) {
            diamondHud.classList.remove('hidden');
            document.getElementById('modal-diamonds-val').innerText = state.diamantes;
        } else {
            diamondHud.classList.add('hidden');
        }

        btns.forEach(btn => {
            const el = document.createElement('button'); el.innerText = btn.text; el.onclick = btn.action;
            document.getElementById('modal-actions').appendChild(el);
        });
    }

    function hideModal() { 
        playSound('click');
        document.getElementById('overlay').style.display = 'none'; 
    }

    function showCreatureSelection(cb, t = "Escolha:", filterResting = false, excludeIds = []) {
        document.getElementById('overlay').style.display = 'flex';
        document.getElementById('modal-title').innerHTML = t;
        document.getElementById('modal-body').innerText = "";
        document.getElementById('modal-actions').innerHTML = '';
        const f = document.getElementById('modal-footer'); f.innerHTML = '';
        
        // Esconde HUD de diamantes se estiver vindo da loja para seleção
        document.getElementById('modal-diamonds-hud').classList.add('hidden');

        state.team.forEach(c => {
            if (excludeIds.includes(c.id)) return;

            const isResting = filterResting && c.restCount > 0;
            const d = document.createElement('div'); 
            d.className = 'creature-card' + (c.currentHp <= 0 ? ' dead' : '') + (isResting ? ' resting' : '');
            
            let statusText = "";
            if (c.currentHp <= 0) statusText = "<br><span style='color:red;'>DERROTADO</span>";
            else if (isResting) statusText = "<br><span style='color:orange;'>CANSADO</span>";

            d.innerHTML = `
                ${getCreatureDisplay(c)}
                <div class="creature-card-info">
                    <div class="creature-card-name">${c.name}</div>
                    <div class="creature-card-stats">Lvl ${c.level}${statusText}</div>
                </div>
            `;
            
            d.ondblclick = (e) => {
                e.stopPropagation();
                showModal("Status: " + c.name, getCreatureTooltip(c), [
                    { text: "Voltar", action: () => showCreatureSelection(cb, t) }
                ]);
            };

            if (c.currentHp > 0 && !isResting) d.onclick = () => { hideModal(); cb(c); };
            f.appendChild(d);
        });
    }

    function addLog(m) {
        const l = document.getElementById('battle-logs');
        const d = document.createElement('div'); 
        d.innerHTML = m; // Agora aceita HTML para cores e estilos
        l.appendChild(d); l.scrollTop = l.scrollHeight;
    }

    function toggleButtons(d) { 
        if (d) {
            document.querySelectorAll('#battle-actions button').forEach(b => b.disabled = true);
        } else {
            // Se for para habilitar, redesenha a UI para respeitar cooldowns e hasActed
            setupBattleUI();
        }
        
        // Atualiza indicador de turno visualmente
        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            if (d) {
                indicator.innerText = "▶ Turno do Inimigo";
                indicator.style.color = "#ff4d4d"; // Vermelho
                indicator.style.borderColor = "#ff4d4d";
            } else {
                indicator.innerText = "▶ Seu Turno";
                indicator.style.color = "gold"; // Dourado
                indicator.style.borderColor = "var(--accent-color)";
            }
        }
    }

    // Ao carregar a página
    window.onload = () => {
        const saved = localStorage.getItem('aventura_save');
        if (saved) {
            document.getElementById('continue-btn').disabled = false;
        }
    };
