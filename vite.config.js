/* eslint-disable */
import legacyPlugin from '@vitejs/plugin-legacy';
import * as path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import { loadEnv } from 'vite';
// @see https://cn.vitejs.dev/config/
export default ({
    command,
    mode
}) => {
    const env = loadEnv(mode, process.cwd());
    let rollupOptions = {};

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
        base: './', // index.html文件所在位置
        root: './', // js导入的资源路径，src
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
            target: 'es2015',
            minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
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
            legacyPlugin({
                targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15'],
            }), vuePlugin(),
        ],
        css: {
            preprocessorOptions: {
                less: {
                    // 支持内联 JavaScript
                    javascriptEnabled: true,
                },
            },
        },
    };
};
