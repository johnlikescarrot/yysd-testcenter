# Shared A-Level board + subject registry (imported by build/seed scripts)
# ponytail: 7 subjects only — Toán học/Toán nâng cao/Kinh tế học/Vật lý/Hóa học/Kế toán/Sinh học

BOARDS = {
    "caie": {"label": "CAIE", "labelVi": "Cambridge International A-Level"},
    "edexcel": {"label": "Edexcel", "labelVi": "Edexcel A Level"},
    "oxford-aqa": {"label": "Oxford AQA", "labelVi": "Oxford AQA A Level"},
}

# slug → metadata (board-specific codes)
SUBJECTS = {
    # --- CAIE ---
    "9709-mathematics": {
        "code": "9709", "name": "Mathematics", "nameVi": "Toán học", "icon": "📐", "board": "caie",
    },
    "9231-further-mathematics": {
        "code": "9231", "name": "Further Mathematics", "nameVi": "Toán nâng cao", "icon": "∑", "board": "caie",
    },
    "9708-economics": {
        "code": "9708", "name": "Economics", "nameVi": "Kinh tế học", "icon": "📊", "board": "caie",
    },
    "9702-physics": {
        "code": "9702", "name": "Physics", "nameVi": "Vật lý", "icon": "⚛️", "board": "caie",
    },
    "9701-chemistry": {
        "code": "9701", "name": "Chemistry", "nameVi": "Hóa học", "icon": "🧪", "board": "caie",
    },
    "9706-accounting": {
        "code": "9706", "name": "Accounting", "nameVi": "Kế toán", "icon": "📒", "board": "caie",
    },
    "9700-biology": {
        "code": "9700", "name": "Biology", "nameVi": "Sinh học", "icon": "🧬", "board": "caie",
    },
    # --- Edexcel A Level ---
    "9ma0-mathematics": {
        "code": "9MA0", "name": "Mathematics", "nameVi": "Toán học", "icon": "📐", "board": "edexcel",
    },
    "9fm0-further-mathematics": {
        "code": "9FM0", "name": "Further Mathematics", "nameVi": "Toán nâng cao", "icon": "∑", "board": "edexcel",
    },
    "9ec0-economics": {
        "code": "9EC0", "name": "Economics", "nameVi": "Kinh tế học", "icon": "📊", "board": "edexcel",
    },
    "9ph0-physics": {
        "code": "9PH0", "name": "Physics", "nameVi": "Vật lý", "icon": "⚛️", "board": "edexcel",
    },
    "9ch0-chemistry": {
        "code": "9CH0", "name": "Chemistry", "nameVi": "Hóa học", "icon": "🧪", "board": "edexcel",
    },
    "wac11-accounting": {
        "code": "WAC11", "name": "Accounting", "nameVi": "Kế toán", "icon": "📒", "board": "edexcel",
    },
    "9bi0-biology": {
        "code": "9BI0", "name": "Biology", "nameVi": "Sinh học", "icon": "🧬", "board": "edexcel",
    },
    # --- Oxford AQA A Level (no accounting spec) ---
    "7367-mathematics": {
        "code": "7367", "name": "Mathematics", "nameVi": "Toán học", "icon": "📐", "board": "oxford-aqa",
    },
    "9665-further-mathematics": {
        "code": "9665", "name": "Further Mathematics", "nameVi": "Toán nâng cao", "icon": "∑", "board": "oxford-aqa",
    },
    "7136-economics": {
        "code": "7136", "name": "Economics", "nameVi": "Kinh tế học", "icon": "📊", "board": "oxford-aqa",
    },
    "7517-physics": {
        "code": "7517", "name": "Physics", "nameVi": "Vật lý", "icon": "⚛️", "board": "oxford-aqa",
    },
    "7522-chemistry": {
        "code": "7522", "name": "Chemistry", "nameVi": "Hóa học", "icon": "🧪", "board": "oxford-aqa",
    },
    "7447-biology": {
        "code": "7447", "name": "Biology", "nameVi": "Sinh học", "icon": "🧬", "board": "oxford-aqa",
    },
}

BOARD_ORDER = ["caie", "edexcel", "oxford-aqa"]
