/**
 * 构建自定义CSS文件脚本
 * 将SCSS文件编译为独立的CSS文件，用于生产环境动态加载
 */

const fs = require('fs');
const path = require('path');
const sass = require('sass');

// 自定义SCSS文件目录
const scssDir = path.join(__dirname, '../src/style/customScss');
// 输出CSS文件目录
const cssDir = path.join(__dirname, '../build/css');

// 确保输出目录存在
if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
}

// 需要编译的SCSS文件
const scssFiles = ['custom1.scss', 'custom2.scss'];

console.log('开始编译自定义SCSS文件...');

scssFiles.forEach(fileName => {
    const scssPath = path.join(scssDir, fileName);
    const cssFileName = fileName.replace('.scss', '.css');
    const cssPath = path.join(cssDir, cssFileName);
    
    try {
        if (fs.existsSync(scssPath)) {
            // 编译SCSS为CSS
            const result = sass.compile(scssPath, {
                style: 'compressed', // 压缩输出
                sourceMap: false
            });
            
            // 写入CSS文件
            fs.writeFileSync(cssPath, result.css);
            console.log(`✅ 成功编译: ${fileName} -> ${cssFileName}`);
        } else {
            console.log(`⚠️  文件不存在: ${scssPath}`);
        }
    } catch (error) {
        console.error(`❌ 编译失败: ${fileName}`, error.message);
    }
});

console.log('自定义CSS文件编译完成！');
