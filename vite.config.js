/* eslint-disable */
import * as path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import legacy from "@vitejs/plugin-legacy"
// @see https://cn.vitejs.dev/config/
export default ({
    command,
    mode
}) => {
    const env = loadEnv(mode, process.cwd());
    let rollupOptions = {
        // external: ['vue', 'element-plus', 'echarts'],
        output: {
            // 分包
            manualChunks(id) {
                if (id.includes("node_modules")) { return id.toString().split("node_modules/")[1].split("/")[0].toString() }
            },
            // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
            // globals: {
            // 	vue: 'Vue',
            // 	'element-plus': 'ElementPlus',
            // },
        },
    };

    let optimizeDeps = {
        include: [`@/../lib/visual-design/designer.umd.js`,`@/../lib/flow-designer/meta-flow-designer.umd.cjs`]
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
        },
        '/picture': {
            target: env.VITE_API_SERVER,
            //ws: true,
            ws: false,
            rewrite: (path) => path
        },
        '/file': {
            target: env.VITE_API_SERVER,
            //ws: true,
            ws: false,
            rewrite: (path) => path
        }
    }

    // todo 替换为原有变量
    let define = {
        'process.env.NODE_ENV': command === 'serve' ? '"development"' : '"production"',
    }

    let esbuild = {}

    return {
        base: '/', // 公共基础路径
        // root: './', // index.html文件所在位置
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
            // target: ['edge90', 'chrome90', 'firefox90', 'safari15', 'esnext'],
            // cssTarget: 'chrome61',
            minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
            terserOptions: {
                compress: {
                    keep_infinity: true,  // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
                    drop_console: false,   // 生产环境去除 console
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

            //打包可视化分析插件
            visualizer(),
            legacy({
                targets: ['ie >= 11'],
                additionalLegacyPolyfills: ["regenerator-runtime/runtime"]
            })
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
                    additionalData: `@use './src/style/global.scss';`,
                    javascriptEnabled: true,
                    api: 'modern-compiler', // 修改api调用方式
                    silenceDeprecations: ['legacy-js-api'],
                }

            },
        },
    };
};
