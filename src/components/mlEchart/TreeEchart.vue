<template>
	<ml-dialog 
        v-model="isShow" 
        :title="dialogTitle" 
        append-to-body
        :top="currentDialogConf.top"
        :width="currentDialogConf.width"
        :scrollbarHeight="currentDialogConf.height"
    >
		<div v-loading="loading" element-loading-text="加载中...">
			<Suspense>
				<template #default>
					<AsyncScEcharts
						v-if="isShow"
						:option="treeEchartOptions"
						height="60vh"
						width="100%"
						@chart-click="onChartClick"
					/>
				</template>
				<template #fallback>
					<div style="height:60vh"></div>
				</template>
			</Suspense>
		</div>
	</ml-dialog>
</template>

<script setup>
import { ref, defineAsyncComponent } from "vue";
const AsyncScEcharts = defineAsyncComponent(() => import("@/components/scEcharts/index.vue"));
let isShow = ref(false);
let dialogTitle = ref("");
let loading = ref(false);
let treeEchartOptions = ref({
	tooltip: {
		trigger: "item",
		triggerOn: "mousemove",
	},
	series: [
		{
			type: "tree",
			data: [],
			top: "1%",
			left: "7%",
			bottom: "1%",
			right: "20%",
			symbolSize: 7,
			label: {
				position: "left",
				verticalAlign: "middle",
				align: "right",
				fontSize: 9,
			},
			leaves: {
				label: {
					position: "right",
					verticalAlign: "middle",
					align: "left",
				},
			},
			emphasis: {
				focus: "descendant",
			},
			expandAndCollapse: true,
			animationDuration: 550,
			animationDurationUpdate: 750,
		},
	],
});

let currentDialogConf = ref({
    top: "15vh",
    width: "80%",
    height: "600px",
});

let nodeClickCallbackRef = ref(null);

let openDialog = (title, echartData = [], dialogConf = {}, echartOpts = {}, nodeClickCallback = null) => {
	isShow.value = true;
	dialogTitle.value = title;
    console.log(echartOpts,'echartOpts')
	// 注意：Object.assign/浅拷贝会整体替换 series 数组，导致默认配置丢失。
	// 这里进行保守合并：顶层浅并 + tooltip 合并 + 仅合并第一条 series 的字段，保留默认项。
	const base = treeEchartOptions.value || {};
	const incoming = echartOpts || {};
	treeEchartOptions.value = {
		...base,
		...incoming,
		tooltip: { ...(base.tooltip || {}), ...(incoming.tooltip || {}) },
		series: [
			{ ...(base.series?.[0] || {}), ...(incoming.series?.[0] || {}) }
		],
	};
	if (!Array.isArray(treeEchartOptions.value.series) || treeEchartOptions.value.series.length === 0) {
		treeEchartOptions.value.series = [{ type: "tree", data: [] }];
	}
	if (Array.isArray(echartData)) {
		treeEchartOptions.value.series[0].data = echartData;
	}
	// dialogConf 也做保守合并（顶层浅并），以保留默认弹窗参数
	const dlgBase = currentDialogConf.value || {};
	const dlgIncoming = dialogConf || {};
	currentDialogConf.value = { ...dlgBase, ...dlgIncoming };
	// 仅当传入的是函数时才注册回调
	nodeClickCallbackRef.value = typeof nodeClickCallback === 'function' ? nodeClickCallback : null;
};

// 对外抛出点击节点事件
const onChartClick = (params) => {
    // 这里仅转发，父组件可在使用 TreeEchart 时监听 @node-click
    // console.log('TreeEchart click:', params);
    if (typeof nodeClickCallbackRef.value === 'function') {
        nodeClickCallbackRef.value(params);
    }
};

defineExpose({
    openDialog,
});
</script>
