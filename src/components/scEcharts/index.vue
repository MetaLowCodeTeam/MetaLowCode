<template>
    <div 
        ref="scEcharts" 
        :style="{height:height, width:width}"
        v-loading="loading"
        element-loading-text="正在加载图表..."
    >
        <div v-if="loading" style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">
            图表加载中...
        </div>
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
        };
    },
    watch: {
        option: {
            deep: true,
            handler(v) {
                unwarp(this.myChart)?.clear();
                unwarp(this.myChart)?.setOption(v);
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
                this.myChart.resize();
            });
        }
    },
    deactivated() {
        this.isActivat = false;
    },
    mounted() {
        this.isActivat = true;
        setTimeout(() => {
            this.draw();
        }, 500);
    },
    methods: {
        async draw() {
            try {
                // 动态加载 echarts
                const echartsInstance = await loadEcharts();
                
                // 初始化图表
                var myChart = echartsInstance.init(this.$refs.scEcharts, "T");
                myChart.setOption(this.myOptions);
                this.myChart = myChart;
                this.loading = false;
                
                // window.addEventListener('resize', () => myChart.resize());
            } catch (error) {
                console.error('Failed to load echarts:', error);
                this.loading = false;
            }
        },
    },
};
</script>
