/* eslint-disable */
import * as path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { loadEnv } from 'vite';
// // 配置ElementPlus按需导入
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// @see https://cn.vitejs.dev/config/
export default ({
    command,
    mode
}) => {
    const env = loadEnv(mode, process.cwd());
    let rollupOptions = {
        output: {// 分包
            manualChunks(id) {
                if (id.includes("node_modules")) { return id.toString().split("node_modules/")[1].split("/")[0].toString() }
            },
        },
    };

    let optimizeDeps = {
        include: ['@/../lib/visual-design/designer.umd.js']
    };

    let alias = {
        '.git': path.resolve(__dirname, './.git'),
        'docker': path.resolve(__dirname, './docker'),
        'docs': path.resolve(__dirname, './docs'),
        'node_modules': path.resolve(__dirname, './node_modules'),
        'public': path.resolve(__dirname, './public'),
        'src': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, 'src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
    }

    let proxy = {
        '/api': {
            target: env.VITE_API_SERVER,
            //ws: true,
            ws: false,
            rewrite: (path) => path.replace(/^\/api/, '')
        }
    }

    // todo 替换为原有变量
    let define = {
        'process.env.NODE_ENV': command === 'serve' ? '"development"' : '"production"',
    }

    let esbuild = {}

    return {
        // publicDir: '/web/', // index.html文件所在位置
        base: '/', // index.html文件所在位置
        // root: './', // js导入的资源路径，src
        resolve: {
            alias,
        },
        define: define,
        server: {
            // 局域网访问
            host: '0.0.0.0',
            allowedHosts: 'all',
            open: false, //运行后自动打开浏览器
            port: env.VITE_APP_PORT, //挂载端口
            // 代理
            proxy,
        },
        build: {
            target: ['es2015', 'es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
            cssTarget: 'chrome61',
            minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
            terserOptions: {
                compress: {
                    keep_infinity: true,  // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
                    drop_console: true,   // 生产环境去除 console
                    drop_debugger: true   // 生产环境去除 debugger
                },
            },
            manifest: false, // 是否产出maifest.json
            sourcemap: false, // 是否产出soucemap.json
            outDir: 'build', // 产出目录
            rollupOptions,
            commonjsOptions: {
                include: /node_modules|lib/  //这里记得把lib目录加进来，否则生产打包会报错！！
            }
        },
        esbuild,
        optimizeDeps,
        plugins: [
            vuePlugin(),
            // AutoImport({ resolvers: [ElementPlusResolver()] }),
            // Components({ resolvers: [ElementPlusResolver()] }),
            createSvgIconsPlugin({
                // Specify the icon folder to be cached
                iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
                // Specify symbolId format
                symbolId: 'icon-[dir]-[name]',
            }),
        ],
        css: {
            preprocessorOptions: {
                less: {
                    // 支持内联 JavaScript
                    javascriptEnabled: true,
                },
                scss: {
                    // 定义全局的scss变量
                    // 给导入的路径最后加上 ;
                    additionalData: `@import './src/style/global.scss';`,
                    javascriptEnabled: true,
                }

            },
        },
    };
};
