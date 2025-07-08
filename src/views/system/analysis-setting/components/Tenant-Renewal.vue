<template>
	<ml-dialog
		v-model="isShow"
		:title="dialogTitle"
		width="520px"
		draggable
		:show-close="!loading"
	>
		<div v-loading="loading" element-loading-text="加载中...">
			<el-form :model="form" label-width="80px">
				<el-form-item label="到期时间" class="is-required">
					<el-radio-group v-model="form.expiryDateType">
						<el-radio :value="1">长期</el-radio>
						<el-radio :value="2">指定时间</el-radio>
					</el-radio-group>
					<el-date-picker
						class="ml-20"
						v-model="form.expiryDate"
						type="datetime"
						placeholder="请选择到期时间"
						:disabled-date="disabledDate"
						v-if="form.expiryDateType == 2"
					/>
				</el-form-item>
				<el-form-item label="备注">
					<el-input
						v-model="form.remarks"
						type="textarea"
						:rows="3"
					/>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button type="primary" @click="onSave"> 保存 </el-button>
			<el-button @click="isShow = false">取消</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { tenantRenewal } from "@/api/plugins";

const emits = defineEmits(["refresh"]);

const isShow = ref(false);
const loading = ref(false);
let dialogTitle = ref("");

const form = ref({
	expiryDateType: 1,
	expiryDate: null,
	remarks: "",
	recordId: "",
});

let oldExpiryDate = ref(null);

const disabledDate = (time) => {
    if(oldExpiryDate.value){
        // 将字符串转换为 Date 对象
        const oldDate = new Date(oldExpiryDate.value);
        return time.getTime() < oldDate.getTime();
    }
	return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期
};

const openDialog = (row) => {
	isShow.value = true;
    dialogTitle.value = "续期" + row.tenantName;
	form.value = {
		expiryDateType: row.expiryDate ? 2 : 1,
		expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
		recordId: row.tenantId,
		remarks: "",
	};
    oldExpiryDate.value = row.expiryDate ? row.expiryDate : '长期';
};


const onSave = async () => {
	if (form.value.expiryDateType == 2 && !form.value.expiryDate) {
		ElMessage.error("请选择到期时间");
		return;
	}
    // 判断是否有修改
    if (
        (form.value.expiryDateType == 1 && oldExpiryDate.value === '长期') // 原本就是长期
        ||
        (form.value.expiryDateType == 2 && oldExpiryDate.value !== '长期' && form.value.expiryDate && (new Date(form.value.expiryDate).getTime() === new Date(oldExpiryDate.value).getTime())) // 指定时间且没变
    ) {
        isShow.value = false;
        return;
    }
    if(form.value.expiryDateType == 1){
        form.value.expiryDate = null;
    }
    let { recordId, expiryDate, remarks } = form.value;
    
    loading.value = true;
    let res = await tenantRenewal({
        recordId,
        expiryDate,
        remarks,
    });
    if(res && res.code == 200){
        ElMessage.success("续期成功");
        emits("refresh");
        isShow.value = false;
    }
    loading.value = false;
};

defineExpose({
	openDialog,
});
</script>

<style scoped>
/* Styles here */
</style>
