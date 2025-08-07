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
                <el-button type="primary" size="default" link @click="moreSetting">更多设置</el-button>
			</div>
			<el-button size="default" @click="isShow = false">取消</el-button>
			<el-button size="default" type="primary" @click="conditionsConfirm">
				确认
			</el-button>
		</template>
	</ml-dialog>
    <ml-dialog title="更多设置" v-model="isShowMoreSetting" width="500" append-to-body>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-checkbox v-model="forbidUserModifyField" size="default">
                    禁止用户修改字段
                </el-checkbox>
            </el-col>
            <el-col :span="12">
                <el-form-item label="标签位置" class="mb-0" label-width="70px" size="default">
                    <el-select v-model="labelPosition" :disabled="!forbidUserModifyField">
                        <el-option label="居左" :value="1"></el-option>
                        <el-option label="居中" :value="2"></el-option>
                        <el-option label="居右" :value="3"></el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-radio-group v-model="labelPosition" :disabled="!forbidUserModifyField">
                    <el-radio :label="1">
                        标签居左
                    </el-radio>
                    <el-radio :label="2">
                        标签居右
                    </el-radio>
                </el-radio-group> -->
            </el-col>
            <el-col :span="12">
                <el-checkbox v-model="hideQueryMatchType" size="default">
                    隐藏查询匹配类型
                </el-checkbox>
            </el-col>
            <el-col :span="12" v-if="showSaveQueryValue">
                <el-checkbox v-model="isSaveQueryValue" size="default">
                    是否保存查询值
                </el-checkbox>
            </el-col>
        </el-row>
        <template #footer>
            <el-button 
                size="default" 
                @click="isShowMoreSetting = false"
            >
                取消
            </el-button>
            <el-button 
                size="default" 
                type="primary" 
                @click="isShowMoreSetting = false"
            >
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
let labelPosition = ref(3);

const conditionsConfirm = () => {
    emit('conditionsConfirm', {
        filter: dialogConditions.value,
        forbidUserModifyField: forbidUserModifyField.value,
        hideQueryMatchType: hideQueryMatchType.value,
        isSaveQueryValue: isSaveQueryValue.value,
        labelPosition: labelPosition.value,
    });
    isShow.value = false;
}

const openDialog = (data) => {
    dialogConditions.value = Object.assign({}, dialogConditions.value, data.filter);
    forbidUserModifyField.value = data.forbidUserModifyField;
    hideQueryMatchType.value = data.hideQueryMatchType;
    isSaveQueryValue.value = data.isSaveQueryValue;
    labelPosition.value = data.labelPosition || 3;
    isShow.value = true;
}

let isShowMoreSetting = ref(false);
const moreSetting = () => {
    isShowMoreSetting.value = true;
}

defineExpose({
    openDialog,
})

</script>

<style scoped>
/* Styles here */
</style>
