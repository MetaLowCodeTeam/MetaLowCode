<!--
 * @Descripttion: 自定义实体新建编辑组件示例。
 * @version: 1.0
 * @Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/kon80ysuog88r0um?singleDoc# 《自定义实体新建编辑PC》
 * @Author: 邪七
 * @Date: 2024年05月28日11:30:56
 * @LastEditors: 邪七
 * @LastEditTime: 2024年05月28日11:30:56
-->
<template>
	<!--  -->
	<EntityListEdit
		ref="EntityListEditRefs"
        :editConf="editConf"
        nameFieldName="dataSourceName"
        @saveFinishCallBack="onConfirm"
	>
		<!-- 更多插槽看 第4行 API -->
		<template #beforeCancelBtn>
			<el-button type="success" @click="testLink" :loading="loading">测试链接</el-button>
		</template>
	</EntityListEdit>
</template>

<script setup>
/**
 * 自定义实体详情
 */
// 1 引入详情组件
import EntityListEdit from "@/views/customize-menu/edit.vue";
// API
import { testDbConnection } from "@/api/plugins";
import { ElMessage } from "element-plus";
const emits = defineEmits(["onConfirm"]);
// 2 定义该详情组件名称
defineOptions({
	name: "test-edit",
});
import { ref } from "vue";

let editConf = ref({
    // 是否显示底部
	showFooter: true,
    // 是否显示确认按钮
    showConfirmBtn: true,
    // 是否显示取消按钮
    showCancelBtn: true,
    showConfirmAndSubmitBtn: false,
    showConfirmRefreshBtn: false,
});

// 打开详情
let EntityListEditRefs = ref();
const openDialog = (data) => {
    // console.log(id);
	// console.log(props.);
	EntityListEditRefs.value?.openDialog(data);
};

let loading = ref(false);

const testLink = () => {
    let formRef = EntityListEditRefs.value?.getFormRef();
    formRef.getFormData().then(async (res) => {
        EntityListEditRefs.value.loading = true
        loading.value = true
        let params = {
            jdbcUrl: res.dataSourceUrl,
            username: res.dataSourceAccount,
            password: res.dataSourcePassword,
            type: res.dataSourceType,
        }
        let res2 = await testDbConnection(params);
        if(res2 && res2.code == 200) {
            ElMessage.success('测试成功')
        }
        loading.value = false
        EntityListEditRefs.value.loading = false
    })
};

const onConfirm = () => {
    emits("onConfirm")
}

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
