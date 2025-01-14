<style lang="scss" scoped>
.not-column-div {
	font-size: 24px;
	text-align: center;
	color: #999;
	margin-top: 100px;
	.lh-span-a {
		cursor: pointer;
		color: var(--el-color-primary);
	}
}
</style>
<template>
	<template v-if="showColumnSet">
		<!-- 如果是默认列显示，但是默认列没有值 -->
		<div
			v-if="defaultColumnShow == 'ALL' && tableColumn.length < 1"
			class="not-column-div"
		>
			<!-- 判断自定义列是否有值 -->
			<div
				v-if="
					layoutConfig.SELF?.FILTER &&
					layoutConfig.SELF?.FILTER?.length > 0
				"
			>
				默认列显示未配置,
				<span class="lh-span-a" @click="changeColumnShow('SELF')"
					>使用自定义列显示</span
				>
			</div>
			<div v-else>
				默认列显示未配置，
				<span class="lh-span-a" @click="editColumn('SELF')"
					>配置自定义列显示</span
				>
			</div>
		</div>
		<!-- 如果是自定义列显示，但是默认列没有值 -->
		<div
			v-else-if="defaultColumnShow == 'SELF' && tableColumn.length < 1"
			class="not-column-div"
		>
			<!-- 判断默认列是否有值 -->
			<div
				v-if="
					layoutConfig.ALL?.FILTER &&
					layoutConfig.ALL?.FILTER?.length > 0
				"
			>
				自定义列显示未配置,
				<span class="lh-span-a" @click="editColumn('SELF')"
					>前去配置</span
				>
				或
				<span class="lh-span-a" @click="changeColumnShow('ALL')"
					>使用默认配置</span
				>
			</div>
			<div v-else>
				自定义列显示未配置,
				<span class="lh-span-a" @click="editColumn('SELF')"
					>前去配置</span
				>
			</div>
		</div>
	</template>
	<template v-else>
		<div class="not-column-div">
			默认列显示未配置，
			<span
				class="lh-span-a"
				@click="editColumn('ALL')"
				v-if="$TOOL.checkRole('r6000')"
			>
				配置默认列显示
			</span>
			<span class="lh-span-a" v-else>联系管理员配置</span>
		</div>
	</template>
</template>
<script setup>
import { inject } from "vue";
const $TOOL = inject("$TOOL");
const props = defineProps({
	layoutConfig: {
		type: Object,
		default: () => ({}),
	},
	defaultColumnShow: {
		type: String,
		default: "ALL",
	},
	tableColumn: {
		type: Array,
		default: () => [],
	},
	// 是否显示列设置
	showColumnSet: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["changeColumnShow", "editColumn"]);

const changeColumnShow = (target) => {
	emit("changeColumnShow", target);
};

const editColumn = (target) => {
	emit("editColumn", target);
};
</script>
