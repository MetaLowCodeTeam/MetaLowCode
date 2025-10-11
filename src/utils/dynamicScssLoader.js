/**
 * 动态SCSS加载器
 * 根据后台配置动态加载SCSS文件
 */

class DynamicScssLoader {
  constructor() {
    this.currentLoadedFile = null;
  }

  /**
   * 根据配置加载SCSS文件
   * @param {string} scssFileName - SCSS文件名 (custom1 或 custom2)
   */
  async loadScssFile(scssFileName) {
    // 移除当前加载的文件
    this.removeCurrentFile();
    
    if (!scssFileName || scssFileName == "default") {
      console.log('未指定SCSS文件，跳过加载');
      return;
    }

    try {
      // 判断是否为开发环境
      const isDev = import.meta.env.DEV;
      
      if (isDev) {
        // 开发环境：动态导入SCSS文件
        const scssPath = `../style/customScss/${scssFileName}.scss`;
        const scssModule = await import(/* @vite-ignore */ scssPath);
        
        // 创建style标签注入CSS内容
        const styleElement = document.createElement('style');
        styleElement.id = `dynamic-scss-${scssFileName}`;
        styleElement.type = 'text/css';
        
        // 如果导入的是CSS字符串
        if (typeof scssModule.default === 'string') {
          styleElement.textContent = scssModule.default;
        } else if (scssModule.default && scssModule.default.toString) {
          styleElement.textContent = scssModule.default.toString();
        } else {
          console.warn('SCSS文件内容格式不正确');
          return;
        }
        
        // 添加到head
        document.head.appendChild(styleElement);
        
        console.log(`成功加载SCSS文件: ${scssFileName}.scss (开发环境)`);
      } else {
        // 生产环境：通过link标签加载CSS文件
        const basePath = '/';
        const cssPath = `${basePath}css/${scssFileName}.css`;
        
        // 创建link标签加载CSS文件
        const linkElement = document.createElement('link');
        linkElement.id = `dynamic-scss-${scssFileName}`;
        linkElement.rel = 'stylesheet';
        linkElement.type = 'text/css';
        linkElement.href = cssPath;
        
        // 添加到head
        document.head.appendChild(linkElement);
        
        console.log(`成功加载SCSS文件: ${scssFileName}.css (生产环境)`);
      }
      
      // 记录当前加载的文件
      this.currentLoadedFile = scssFileName;
      
    } catch (error) {
      console.error(`加载SCSS文件失败: ${scssFileName}`, error);
    }
  }

  /**
   * 移除当前加载的文件
   */
  removeCurrentFile() {
    if (this.currentLoadedFile) {
      const existingLink = document.getElementById(`dynamic-scss-${this.currentLoadedFile}`);
      if (existingLink) {
        existingLink.remove();
      }
      this.currentLoadedFile = null;
    }
  }

  /**
   * 清理所有动态加载的样式
   */
  clearAll() {
    this.removeCurrentFile();
  }
}

// 创建单例实例
const dynamicScssLoader = new DynamicScssLoader();

export default dynamicScssLoader;
