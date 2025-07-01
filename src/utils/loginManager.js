 // 登录管理器
class LoginManager {
    constructor() {
        this.isProcessing = false;
        this.resolvePromise = null;
        this.loginPromise = null;
    }

    // 开始登录处理
    startLogin() {
        this.isProcessing = true;
        this.loginPromise = new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
        return this.loginPromise;
    }

    // 完成登录处理
    completeLogin() {
        this.isProcessing = false;
        if (this.resolvePromise) {
            this.resolvePromise();
            this.resolvePromise = null;
        }
    }

    // 等待登录完成
    async waitForLogin() {
        if (this.isProcessing && this.loginPromise) {
            await this.loginPromise;
        }
    }
}

// 创建全局实例
const loginManager = new LoginManager();

export default loginManager;