<template>
    <div class="echarts-box" ref='echartsBox' style="width:100%;height: 100%;">
        <div ref="scEcharts" :style="{height:height, width:width}"></div>
    </div>
	
</template>

<script>
	import * as echarts from 'echarts';
	import T from './echarts-theme-T.js';
	echarts.registerTheme('T', T);
	const unwarp = (obj) => obj && (obj.__v_raw || obj.valueOf() || obj);

	export default {
		...echarts,
		name: "scEcharts",
		props: {
			height: { type: String, default: "100%" },
			width: { type: String, default: "100%" },
			nodata: {type: Boolean, default: false },
			option: { type: Object, default: () => {} }
		},
		data() {
			return {
				isActivat: false,
				myChart: null
			}
		},
		watch: {
			option: {
				deep:true,
				handler (v) {
					unwarp(this.myChart).setOption(v);
				}
			}
		},
		computed: {
			myOptions: function() {
				return this.option || {};
			}
		},
		activated(){
			if(!this.isActivat){
				this.$nextTick(() => {
					this.myChart.resize()
				})
			}
		},
		deactivated(){
			this.isActivat = false;
		},
		mounted(){
			this.isActivat = true;
			// this.$nextTick(() => {
			// 	this.draw();
			// })
            // 
            setTimeout(() => {
                this.draw();
            }, 100);
		},
		methods: {
			draw(){
				// console.log(,'offsetWidth')
                let monthWidth = this.$refs.echartsBox.offsetWidth + "px";
                let monthHeight = this.$refs.echartsBox.offsetHeight + "px";
                this.$refs.scEcharts.style.width = monthWidth;
                this.$refs.scEcharts.style.height = monthHeight;
                console.log(monthWidth,'monthWidth');
                console.log(monthHeight,'monthHeight');
                var myChart = echarts.init(this.$refs.scEcharts, 'T');
				myChart.setOption(this.myOptions);
				this.myChart = myChart;
				// window.addEventListener('resize', () => myChart.resize());
			},
            resize(){
                // let monthWidth = this.$refs.echartsBox.offsetWidth + "px";
                // let monthHeight = this.$refs.echartsBox.offsetHeight + "px";
                // this.$refs.scEcharts.style.width = monthWidth;
                // this.$refs.scEcharts.style.height = monthHeight;
                // console.log(this.myChart,'this.myChart')
                // this.myChart.resize()
          
				this.myChart.resize()
            },
		}
	}
</script>
