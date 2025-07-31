<template>
	<!-- 设计查询面板 -->
	<ml-dialog title="设计查询面板" v-model="isShow" width="700" append-to-body>
		<div>
			<mlSetConditions
				v-model="dialogConditions"
				:entityName="entityName"
				notType
			/>
		</div>
		<template #footer>
			<div class="fl pl-20">
				<el-checkbox v-model="forbidUserModifyField" size="default">
					禁止用户修改字段
				</el-checkbox>
				<el-checkbox v-model="hideQueryMatchType" size="default">
					隐藏查询匹配类型
				</el-checkbox>
				<el-checkbox 
                    v-model="isSaveQueryValue" 
                    size="default" 
                    v-if="showSaveQueryValue"
                >
					是否保存查询值
				</el-checkbox>
			</div>
			<el-button size="default" @click="isShow = false">取消</el-button>
			<el-button size="default" type="primary" @click="conditionsConfirm">
				确认
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
    entityName: { type: String, default: "" },
    showSaveQueryValue: { type: Boolean, default: true },
});
const emit = defineEmits(["conditionsConfirm"]);
let isShow = ref(false);
let dialogConditions = ref({
    equation: "OR",
    items: [],
});
let forbidUserModifyField = ref(false);
let hideQueryMatchType = ref(false);
let isSaveQueryValue = ref(false);

const conditionsConfirm = () => {
    emit('conditionsConfirm', {
        filter: dialogConditions.value,
        forbidUserModifyField: forbidUserModifyField.value,
        hideQueryMatchType: hideQueryMatchType.value,
        isSaveQueryValue: isSaveQueryValue.value,
    });
    isShow.value = false;
}

const openDialog = (data) => {
    dialogConditions.value = Object.assign({}, dialogConditions.value, data.filter);
    forbidUserModifyField.value = data.forbidUserModifyField;
    hideQueryMatchType.value = data.hideQueryMatchType;
    isSaveQueryValue.value = data.isSaveQueryValue;
    isShow.value = true;
}

defineExpose({
    openDialog,
})

</script>

<style scoped>
/* Styles here */
</style>
