<template>
	<!--  -->
	<EntityList
		class="mb-10"
		:style="{
			height: tableHeight + 'px',
		}"
		v-if="entityCode"
		isReferenceComp
		:referenceEntity="myReferenceEntity"
		:listConf="listParamConf"
		:paginationConf="listPaginationConf"
        :formEntityId="formEntityId"
		@referenceCompAdd="referenceCompAdd"
        @saveFinishCallBack="saveFinishCallBack"
        ref="EntityListRefs"
	/>
	<el-empty v-else description="请先绑定明细实体" />
</template>

<script>
import EntityList from "@/views/customize-menu/list.vue";
import useCommonStore from "@/store/modules/common";
// import { storeToRefs } from "pinia";
// const { allEntityCode } = useCommonStore();
export default {
	components: {
		EntityList,
	},
	props: {
        formEntityId: {
			type: String,
			default: "",
		},
		referenceEntity: {
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
		tableHeight: {
			type: [Number, String],
			default: 294,
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
			this.entityCode =
				useCommonStore().allEntityCode[this.myReferenceEntity];
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
				// 是否显示头部
				showHeader: true,
				// 是否显示高级查询
				showAdvancedQuery: true,
				// 是否显示快速查询
				showQuickQuery: true,
				// 是否显示打开按钮
				showOpenBtn: true,
				// 是否显示编辑按钮
				showEditBtn: true,
				// 是否显示新建按钮
				showAddBtn: true,
				// 是否显示更多按钮
				showMoreBtn: true,
			},
			listPaginationConf: {
				size: 20,
			},
            myFormEntityId: "",
		};
	},
	mounted() {
		this.listParamConf = Object.assign(this.listParamConf, this.listConf);
		this.listPaginationConf.size = this.paginationSize
			? this.paginationSize * 1
			: 20;
		this.myReferenceEntity = this.referenceEntity;
		this.entityCode =
			useCommonStore().allEntityCode[this.myReferenceEntity];
        
	},
	methods: {
		referenceCompAdd(cb) {
            console.log(this.formRef.getGlobalDsv().formEntity,'this.formRef')
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
            // console.log(this.formRef.getGlobalDsv(),'回调后的DVS')
            let formEntityIdFieldName = this.formRef.getGlobalDsv().formEntityIdFieldName;
            this.myFormEntityId = data[formEntityIdFieldName];
            // console.log(data,'00 回调后拿到的数据');
            // console.log(this.myFormEntityId,'01 获取回调主表的行ID');
            data.recordId = this.myFormEntityId;
            this.formRef.getGlobalDsv()?.setRowRecordId(this.myFormEntityId)
            this.$refs.EntityListRefs.saveSubFormListCb(data);
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
