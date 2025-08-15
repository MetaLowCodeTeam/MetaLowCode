// 密码强度 hooks（Vue 3 通用，非依赖 Composition API）

// 规则等级常量（参考提供的定义）
export const ruleLevel0 = 0; // 6-20 位
export const ruleLevel1 = 1; // 6-20 位，字母+数字
export const ruleLevel2 = 2; // 6-20 位，大小写字母+数字
// export const ruleLevel3 = 3; // 6-20 位，大小写字母+数字+特殊字符 和4差不多，去掉，前端只用3
export const ruleLevel4 = 4; // 6-20 位，大小写字母+数字+特殊字符（同 3，保留用于向后兼容/扩展）

// 可用选项（label + value）
export const passwordRuleOptions = [
    { label: '6-20 位', value: ruleLevel0 },
    { label: '6-20 位且包含字母和数字', value: ruleLevel1 },
    { label: '6-20 位且包含大小写字母和数字', value: ruleLevel2 },
    //   { label: '6-20 位且包含大小写字母、数字和特殊字符', value: ruleLevel3 }, 和4差不多，去掉，前端只用3
    { label: '6-20 位且包含大小写字母、数字和特殊字符', value: ruleLevel4 },
];

// 正则说明：
// - 基础长度：^.{6,20}$
// - 至少包含一种：(?=.*[a-z])、(?=.*[A-Z])、(?=.*\d) 、(?=.*[^\w\s])（特殊字符：非字母数字下划线与空白）

const lengthRegex = /^.{6,20}$/;
const hasLower = /[a-z]/;
const hasUpper = /[A-Z]/;
const hasDigit = /\d/;
// 特殊字符：除字母数字下划线与空白以外的任意字符
const hasSpecial = /[^\w\s]/;

export function validatePasswordByLevel(password, level) {
    if (typeof password !== 'string') return false;
    if (!lengthRegex.test(password)) return false;

    switch (level) {
        case ruleLevel0:
            // 仅限制长度
            return true;
        case ruleLevel1:
            // 字母 + 数字（不区分大小写）
            return (hasLower.test(password) || hasUpper.test(password)) && hasDigit.test(password);
        case ruleLevel2:
            // 大小写字母 + 数字
            return hasLower.test(password) && hasUpper.test(password) && hasDigit.test(password);
        case ruleLevel4:
            // 大小写字母 + 数字 + 特殊字符
            return (
                hasLower.test(password) &&
                hasUpper.test(password) &&
                hasDigit.test(password) &&
                hasSpecial.test(password)
            );
        default:
            return false;
    }
}

// 便捷校验函数：返回 { passed, message }
export function checkPassword(password, level) {
    const passed = validatePasswordByLevel(password, level);
    if (passed) return { passed: true, message: '' };

    const rule = passwordRuleOptions.find((r) => r.value === level);
    return { passed: false, message: rule?.label || '密码不符合规则' };
}

export function getPasswordRuleLabel(level) {
    const rule = passwordRuleOptions.find((r) => r.value === level);
    return rule?.label || '密码不符合规则';
}

export default function usePasswordStrength() {
    return {
        ruleLevel0,
        ruleLevel1,
        ruleLevel2,
        ruleLevel4,
        passwordRuleOptions,
        validatePasswordByLevel,
        checkPassword,
        getPasswordRuleLabel,
    };
}


