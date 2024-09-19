<style lang="scss" scoped>
.item-box {
	.item-title {
		font-weight: bold;
		margin-bottom: 5px;
	}
}
</style>
<template>
	<!-- 添加自定义标签 -->
	<mlDialog v-model="isShow" title="自定义标签设置" width="500">
		<div class="ml-dialog-content">
			<div class="item-box">
				<div class="item-title">选择实体</div>
				<el-select
					v-model="curtEntity"
					placeholder="请选择实体"
					value-key="entityCode"
					class="w-100"
					clearable
                    :class="{'is-error' : selectEntityError}"
                    @focus="selectEntityError = false"
				>
					<el-option
						v-for="item in entityList"
						:key="item.entityCode"
						:label="item.entityLabel"
						:value="item"
					/>
				</el-select>
			</div>
			<div class="item-box mt-10">
				<div class="item-title">过滤条件</div>
				<el-input
					v-model="filterEasySql"
					class="w-100"
					:autosize="{ minRows: 2, maxRows: 4 }"
					type="textarea"
					placeholder="请输入过滤条件"
				/>
			</div>
		</div>
        <template #footer>
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary" @click="confirm">确认</el-button>
        </template>
	</mlDialog>
</template>

<script setup>
import { ref } from "vue";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
const { queryAllEntityList } = useCommonStore();
const emit = defineEmits(["confirm"]);

let isShow = ref(false);

let entityList = ref([]);

let curtEntity = ref({});
let filterEasySql = ref("");
let selectEntityError = ref(false);
const openDialog = () => {
	isShow.value = true;
	// console.log(queryAllEntityList(),'sss')
	entityList.value = queryAllEntityList().map((el) => {
		return {
			entityCode: el.entityCode,
			entityName: el.name,
			entityLabel: el.label,
			filterEasySql: "",
			isCustomLabel: true,
		};
	});
};

const confirm = () => {
    if(!curtEntity.value.entityName) {
        selectEntityError.value = true;
        ElMessage.error("请选择实体.");
        return
    }
    curtEntity.value.filterEasySql = filterEasySql.value;
    emit("confirm", curtEntity.value);
    isShow.value = false;
}

defineExpose({
	openDialog,
});
</script>
