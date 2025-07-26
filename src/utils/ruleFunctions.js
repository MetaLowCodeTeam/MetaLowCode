export const RuleFunctions = {
    LK: (formModel, field, value) => {
        return formModel[field] && formModel[field].contains(value);
    },
    NLK: (formModel, field, value) => {
        return !formModel[field] || !formModel[field].contains(value);
    },
    EQ: (formModel, field, value) => {
        return formModel[field] == value;
    },
    REQ: (formModel, field, idStr) => {  //引用类型等于需要特殊处理
        return formModel[field] && idStr && formModel[field].id == idStr;
    },
    DEQ: (formModel, field, value) => {
        return formModel[field] == value;
    },
    NEQ: (formModel, field, value) => {
        return formModel[field] != value;
    },
    GT: (formModel, field, value) => {
        return formModel[field] > value;
    },
    LT: (formModel, field, value) => {
        return formModel[field] < value;
    },
    GE: (formModel, field, value) => {
        return formModel[field] >= value;
    },
    LE: (formModel, field, value) => {
        return formModel[field] <= value;
    },
    BW: (formModel, field, value, value2) => {
        return formModel[field] >= value && formModel[field] <= value2;
    },
    NL: (formModel, field, value) => {
        return !formModel[field];
    },
    NT: (formModel, field, value) => {
        return !!formModel[field];
    },
};