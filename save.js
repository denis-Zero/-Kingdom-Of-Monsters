

const SAVE_KEY = 'kom_account_save';

function loadAccountSave() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (typeof data !== 'object' || data === null) return null;
        return {
            accountLevel: data.accountLevel || 1,
            lux: typeof data.lux === 'number' ? data.lux : 80,
            tcgUnlockedIds: Array.isArray(data.tcgUnlockedIds) ? data.tcgUnlockedIds : [],
            tcgDecks: Array.isArray(data.tcgDecks) ? data.tcgDecks : []
        };
    } catch (e) {
        return null;
    }
}

function saveAccountFromState(state) {
    if (!state) return;
    const data = {
        accountLevel: state.accountLevel || 1,
        lux: typeof state.lux === 'number' ? state.lux : 80,
        tcgUnlockedIds: Array.isArray(state.tcgUnlockedIds) ? state.tcgUnlockedIds : [],
        tcgDecks: Array.isArray(state.tcgDecks) ? state.tcgDecks : []
    };
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {}
}

function applyAccountSaveToState(state) {
    if (!state) return state;
    const data = loadAccountSave();
    if (!data) {
        if (typeof state.accountLevel !== 'number') state.accountLevel = 1;
        if (typeof state.lux !== 'number') state.lux = 80;
        if (!Array.isArray(state.tcgUnlockedIds)) state.tcgUnlockedIds = [];
        if (!Array.isArray(state.tcgDecks)) state.tcgDecks = [];
        return state;
    }
    state.accountLevel = typeof data.accountLevel === 'number' ? data.accountLevel : 1;
    state.lux = typeof data.lux === 'number' ? data.lux : 80;
    state.tcgUnlockedIds = Array.isArray(data.tcgUnlockedIds) ? data.tcgUnlockedIds : [];
    state.tcgDecks = Array.isArray(data.tcgDecks) ? data.tcgDecks : [];
    return state;
}