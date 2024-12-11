import { ElMessage } from 'element-plus';
export default {
    "customRight": {
        regText: "格式要求：r9 + 四位数字。示例：r90001",
        check: (value) => {
            let reg = /^r9\d+$/;
            if(!reg.test(value) || value.length != 6) {
                ElMessage.error('常量值格式不正确，格式要求：r9 + 四位数字。');
                return false;
            }
            return true;
        }
    },
}