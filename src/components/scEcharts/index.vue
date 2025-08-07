<template>
    <div 
        ref="scEchartsContainer" 
        :style="{height:height, width:width, minHeight: '100px', minWidth: '100px', position: 'relative'}"
    >
        <!-- 加载状态覆盖层 -->
        <div 
            v-if="loading" 
            style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10;"
        >
            <div style="color: #999;">
                <i class="el-icon-loading" style="margin-right: 8px;"></i>
                图表加载中...
            </div>
        </div>
        <!-- ECharts容器 -->
        <div 
            ref="scEcharts" 
            :style="{height: '100%', width: '100%'}"
        ></div>
    </div>
</template>

<script>
// 动态导入 echarts 和主题
let echarts = null;
let isEchartsLoaded = false;

const loadEcharts = async () => {
    if (!isEchartsLoaded) {
        const [echartsModule, T, liquidfill] = await Promise.all([
            import("echarts"),
            import("./echarts-theme-T.js"),
            import('echarts-liquidfill')
        ]);
        
        echarts = echartsModule;
        echarts.registerTheme("T", T.default);
        isEchartsLoaded = true;
    }
    return echarts;
};

const unwarp = (obj) => obj && (obj.__v_raw || obj.valueOf() || obj);

export default {
    name: "scEcharts",
    props: {
        height: { type: String, default: "100%" },
        width: { type: String, default: "100%" },
        nodata: { type: Boolean, default: false },
        option: { type: Object, default: () => {} },
    },
    data() {
        return {
            isActivat: false,
            myChart: null,
            loading: true,
            initRetryCount: 0,
            maxRetries: 10,
        };
    },
    watch: {
        option: {
            deep: true,
            handler(v) {
                this.$nextTick(() => {
                    this.updateChart(v);
                });
            },
        },
    },
    computed: {
        myOptions: function () {
            return this.option || {};
        },
    },
    activated() {
        if (!this.isActivat) {
            this.$nextTick(() => {
                this.safeResize();
            });
        }
    },
    deactivated() {
        this.isActivat = false;
    },
    beforeUnmount() {
        if (this.myChart) {
            try {
                this.myChart.dispose();
                this.myChart = null;
            } catch (error) {
                console.warn('Error disposing chart:', error);
            }
        }
    },
    mounted() {
        this.isActivat = true;
        // 确保DOM完全准备好后再初始化
        this.$nextTick(() => {
            setTimeout(() => {
                this.draw();
            }, 300);
        });
    },
    methods: {
        async draw() {
            try {
                // 检查重试次数
                if (this.initRetryCount >= this.maxRetries) {
                    console.error('ECharts initialization failed after maximum retries');
                    this.loading = false;
                    return;
                }
                
                // 更严格的DOM检查
                if (!this.isDOMReady()) {
                    this.initRetryCount++;
                    console.warn(`ECharts DOM element not ready, retrying... (${this.initRetryCount}/${this.maxRetries})`);
                    setTimeout(() => this.draw(), 200);
                    return;
                }
                
                // 动态加载 echarts
                const echartsInstance = await loadEcharts();
                
                // 再次检查DOM元素
                if (!this.isDOMReady()) {
                    this.initRetryCount++;
                    console.warn(`ECharts DOM element lost during loading, retrying... (${this.initRetryCount}/${this.maxRetries})`);
                    setTimeout(() => this.draw(), 200);
                    return;
                }
                
                // 销毁之前的图表实例（如果存在）
                if (this.myChart) {
                    try {
                        this.myChart.dispose();
                    } catch (e) {
                        console.warn('Error disposing previous chart:', e);
                    }
                }
                
                // 初始化图表
                var myChart = echartsInstance.init(this.$refs.scEcharts, "T");
                if (this.myOptions && Object.keys(this.myOptions).length > 0) {
                    myChart.setOption(this.myOptions);
                }
                this.myChart = myChart;
                this.loading = false;
                this.initRetryCount = 0; // 重置重试计数
                
                // console.log('ECharts initialized successfully');
                // window.addEventListener('resize', () => myChart.resize());
            } catch (error) {
                console.error('Failed to load echarts:', error);
                this.loading = false;
                this.initRetryCount++;
                
                // 如果还有重试机会，继续重试
                if (this.initRetryCount < this.maxRetries) {
                    setTimeout(() => this.draw(), 500);
                }
            }
        },
        // 更严格的DOM就绪检查
        isDOMReady() {
            const container = this.$refs.scEchartsContainer;
            const element = this.$refs.scEcharts;
            
            if (!container || !element) {
                // console.debug('DOM check failed: container or element is null/undefined');
                return false;
            }
            
            // 检查容器是否在DOM中
            if (!document.contains(container) || !document.contains(element)) {
                // console.debug('DOM check failed: elements not in document');
                return false;
            }
            
            // 检查容器是否有尺寸
            const containerRect = container.getBoundingClientRect();
            if (containerRect.width < 10 || containerRect.height < 10) {
                // console.debug(`DOM check failed: container too small (${containerRect.width}x${containerRect.height})`);
                return false;
            }
            
            // 检查ECharts元素是否有尺寸
            const rect = element.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10) {
                // console.debug(`DOM check failed: echarts element too small (${rect.width}x${rect.height})`);
                return false;
            }
            
            // 检查元素是否可见
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') {
                // console.debug('DOM check failed: element is hidden');
                return false;
            }
            
            // console.debug(`DOM check passed: container (${containerRect.width}x${containerRect.height}), echarts (${rect.width}x${rect.height})`);
            return true;
        },
        // 安全的图表更新方法
        updateChart(newOptions) {
            if (!this.myChart || this.loading) {
                // console.debug('Chart update skipped: chart not ready or loading');
                return;
            }
            
            if (!newOptions || typeof newOptions !== 'object') {
                // console.debug('Chart update skipped: invalid options');
                return;
            }
            
            // 检查DOM是否仍然就绪
            if (!this.isDOMReady()) {
                // console.debug('Chart update skipped: DOM not ready');
                return;
            }
            
            try {
                const chartInstance = unwarp(this.myChart);
                if (chartInstance && typeof chartInstance.setOption === 'function') {
                    // 不清空图表，直接更新选项
                    chartInstance.setOption(newOptions, true); // notMerge=true 避免合并问题
                    // console.debug('Chart options updated successfully');
                } else {
                    console.warn('Chart instance is invalid');
                }
            } catch (error) {
                console.warn('Error updating chart options:', error);
                // 如果更新失败，尝试重新初始化
                this.safeRedraw();
            }
        },
        // 安全的重新绘制方法
        safeRedraw() {
            if (this.loading) return;
            
            // console.debug('Attempting safe chart redraw');
            this.loading = true;
            this.initRetryCount = 0;
            
            setTimeout(() => {
                this.draw();
            }, 100);
        },
        // 安全的resize方法
        safeResize() {
            if (!this.myChart || this.loading) {
                // console.debug('Chart resize skipped: chart not ready or loading');
                return;
            }
            
            if (!this.isDOMReady()) {
                // console.debug('Chart resize skipped: DOM not ready');
                return;
            }
            
            try {
                const chartInstance = unwarp(this.myChart);
                if (chartInstance && typeof chartInstance.resize === 'function') {
                    chartInstance.resize();
                    // console.debug('Chart resized successfully');
                } else {
                    console.warn('Chart instance is invalid for resize');
                }
            } catch (error) {
                console.warn('Error resizing chart:', error);
            }
        },
    },
};
</script>
