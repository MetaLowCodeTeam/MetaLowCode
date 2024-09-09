<style lang="scss" scoped>
.info-div {
	border: 1px solid #e6a23c;
	box-sizing: border-box;
	padding: 10px 15px;
	border-radius: 4px;
}
</style>
<template>
	<!-- 指定字段 -->
	<ml-dialog
		title="指定字段"
		:width="width + 'px'"
		append-to-body
		v-model="isShow"
	>
		<div v-loading="loading" :element-loading-text="loadingText">
			<div class="mb-10 info-div">
				<el-icon
					style="position: relative; top: 2px"
					color="#e6a23c"
					size="16"
				>
					<WarningFilled />
				</el-icon>
				指定字段被更新时触发，默认为全部字段
			</div>
			<el-row :gutter="20">
				<el-col :span="6" v-for="(item, inx) of fields" :key="inx">
					<el-checkbox
						:label="item.fieldLabel"
						v-model="item.isSelected"
					>
					</el-checkbox>
				</el-col>
			</el-row>
		</div>
		<template #footer>
			<el-button @click="isShow = false"> 取消 </el-button>
			<el-button type="primary" @click="confirm"> 确定 </el-button>
		</template>
	</ml-dialog>
</template>
<script setup>
import { ref } from "vue";
import { queryEntityFields } from "@/api/crud";
const props = defineProps({
	// 弹窗是否显示
	isShow: {
		type: Boolean,
		default: false,
	},
	width: {
		type: Number,
		default: 700,
	},
});

const emit = defineEmits(["confirm"]);

let isShow = ref(false);
let loading = ref(false);
let loadingText = ref("字段加载中...");
let fields = ref([]);

const openDialog = async (entityCode, modifiedFields) => {
	isShow.value = true;
	loading.value = true;
	let res = await queryEntityFields(entityCode, false, false, true);
	if (res) {
		fields.value = res.data || [];
		fields.value.forEach((el) => {
			el.isSelected = false;
            if(modifiedFields.includes(el.fieldName)) {
                el.isSelected = true;
            }
		});
	}
	loading.value = false;
};

const confirm = () => {
    let filterSelected = fields.value.filter(el => el.isSelected);
    emit("confirm", filterSelected);
    isShow.value = false;
}

defineExpose({
	openDialog,
});
</script>
