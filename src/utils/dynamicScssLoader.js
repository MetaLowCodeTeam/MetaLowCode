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
      // 获取应用基础路径
      const basePath = '/';
      
      // 构建CSS文件路径
      const cssPath = `${basePath}css/${scssFileName}.css`;
      
      // 创建link标签加载CSS文件
      const linkElement = document.createElement('link');
      linkElement.id = `dynamic-scss-${scssFileName}`;
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = cssPath;
      
      // 添加到head
      document.head.appendChild(linkElement);
      
      // 记录当前加载的文件
      this.currentLoadedFile = scssFileName;
      
      console.log(`成功加载SCSS文件: ${scssFileName}.css`);
    } catch (error) {
      console.error(`加载SCSS文件失败: ${scssFileName}.css`, error);
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
