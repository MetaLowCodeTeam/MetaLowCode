<template>
	<!--  -->
	<ml-dialog :title="dialogConf.title" v-model="dialogConf.show" width="500">
		<el-form
			label-width="80px"
			v-loading="dialogConf.loading"
			:element-loading-text="dialogConf.loadingText"
			@submit.prevent
			class="action-form"
		>
			<el-form-item label="源实体" class="is-required">
				<el-select
					v-model="dialogConf.sourceEntity"
					placeholder="请选择源实体"
					filterable
					style="width: 100%"
				>
					<el-option
						:label="op.label"
						:value="op.entityCode"
						v-for="(op, inx) of unSystemEntityList"
						:key="inx"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="目标实体" class="is-required">
				<el-select
					v-model="dialogConf.targetEntity"
					placeholder="请选择目标实体"
					filterable
					style="width: 100%"
				>
					<el-option
						:label="op.label"
						:value="op.entityCode"
						v-for="(op, inx) of unSystemEntityList"
						:key="inx"
					/>
				</el-select>
			</el-form-item>
		</el-form>
        <template #footer>
            <el-button>取消</el-button>
            <el-button type="primary">确认</el-button>
        </template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
/**
 * 所有实体
 */
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { unSystemEntityList, processEntityList, publicSetting } = storeToRefs(
	useCommonStore()
);

let dialogConf = ref({
	show: false,
	loading: false,
	loadingText: "数据保存中...",
	title: "",
    sourceEntity:"",
    targetEntity:"",
});

const openDialog = (row) => {
	dialogConf.value.title = (!!row ? "编辑" : "新建") + "记录转化";
	dialogConf.value.show = true;
	console.log(dialogConf.value, "dialogConf.value");
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped>
.action-form {
	.el-form-item {
		margin-bottom: 12px !important;
	}
}
</style>
