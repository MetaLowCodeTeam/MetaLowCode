<template>
	<EntityList
		isReferenceComp
		:referenceEntity="myReferenceEntity"
		:listConf="listParamConf"
		:paginationConf="listPaginationConf"
        :formEntityId="formEntityId"
        :referenceCompStatus="formStatus"
        :detailEntityFlag="detailEntityFlag"
        :refEntityBindingField="refEntityBindingField"
        :isVFormDesignMode="isVFormDesignMode"
		@referenceCompAdd="referenceCompAdd"
        @saveFinishCallBack="saveFinishCallBack"
        ref="EntityListRefs"
	>
        <template #beforeOpenBtn>
            <el-button @click="getFormRef">示例按钮</el-button>
        </template>
    </EntityList>
</template>

<script>
import EntityList from "@/views/customize-menu/list.vue";
export default {
	name: "test-list-sub-form",
	components: {
		EntityList,
	},
	props: {
        isVFormDesignMode: {
            type: Boolean,
            default: false,
        },
        formEntityId: {
			type: String,
			default: "",
		},
		referenceEntity: {
			type: String,
			default: "",
		},
		detailEntityFlag: {
			type: Boolean,
			default: true,
		},
		refEntityBindingField: {
			type: String,
			default: "",
		},
		listConf: {
			type: Object,
			default: () => {},
		},
		paginationSize: {
			type: [Number, String],
			default: 20,
		},
		formRef: {},
	},
	watch: {
		listConf(newV) {
			this.listParamConf = Object.assign(this.listParamConf, newV);
		},
		paginationSize(newV) {
			this.listPaginationConf.size = newV ? newV * 1 : 20;
		},
		referenceEntity(newV) {
			this.myReferenceEntity = newV;
		},
        formEntityId(newV) {
			this.myFormEntityId = newV;
		},
	},
	data() {
		return {
			myReferenceEntity: "",
			entityCode: "",
			listParamConf: {
			},
			listPaginationConf: {
				size: 20,
			},
            myFormEntityId: "",
            formStatus:"",
		};
	},
	mounted() {
		this.listParamConf = Object.assign(this.listParamConf, this.listConf);
		this.listPaginationConf.size = this.paginationSize
			? this.paginationSize * 1
			: 20;
		this.myReferenceEntity = this.referenceEntity;
        this.formStatus = this.formRef?.getGlobalDsv().formStatus;
	},
	methods: {
		referenceCompAdd(cb) {
			this.formRef
				.getFormData()
				.then((formData) => {
                    let newFromData = formData;
                    newFromData.referenceCompName = this.formRef.referenceCompName;
                    newFromData.referenceCompEntity = this.formRef.getGlobalDsv().formEntity;
					cb(newFromData);
				})
				.catch((err) => {
					console.log(err, "err");
					this.$message.error("表单校验失败，请修改后重新提交");
				});
		},
        // 新建\编辑成功后回调
        saveFinishCallBack(data){
            let formEntityIdFieldName = this.formRef.getGlobalDsv().formEntityIdFieldName;
            this.myFormEntityId = data[formEntityIdFieldName];
            data.recordId = this.myFormEntityId;
            this.formRef.getGlobalDsv()?.setRowRecordId(this.myFormEntityId)
            this.$refs.EntityListRefs.saveSubFormListCb(data);
        },
        // 获取表单组件
        getFormRef() {
            console.log(this.formRef);
        },

	},
};
</script>
<style lang="scss" scoped>
.form-design-entity-list {
	margin-bottom: 10px;
}
:deep(.table-footer) {
	z-index: 998 !important;
}
:deep(.table-search-box) {
	height: 63px !important;
	border-left: 1px solid #ebeef5;
	border-right: 1px solid #ebeef5;
}
</style>
