<template>
	<EntityList
		isReferenceComp
		:referenceEntity="myReferenceEntity"
		:listConf="useListConf"
		:paginationConf="listPaginationConf"
        :formEntityId="formEntityId"
        :referenceCompStatus="formStatus"
        :detailEntityFlag="detailEntityFlag"
        :refEntityBindingField="refEntityBindingField"
        :isVFormDesignMode="isVFormDesignMode"
		@referenceCompAdd="referenceCompAdd"
        @saveFinishCallBack="saveFinishCallBack"
        :modelName="modelName"
        ref="EntityListRefs"
	>
        <template #beforeOpenBtn>
            <el-button @click="getFormRef">示例按钮</el-button>
        </template>
    </EntityList>
</template>

<script>
import EntityList from "@/views/customize-menu/list.vue";
import { deepClone } from '@/utils/util';
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
        modelName: {
            type: String,
			default: "",
        },
		formRef: {},
	},
	watch: {
		listConf(newV) {
            this.useListConf = Object.assign({}, newV, this.listParamConf)
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
            // 绑定的列表配置文件
            useListConf: {},
            // 实际控制列表配置文件，
            // 列表配置以 listParamConf 为主。比如这里按钮设置true，无论你表单设置什么都以这里为主
			listParamConf: {
                // showAddBtn: true,
			},
			listPaginationConf: {
				size: 20,
			},
            myFormEntityId: "",
            formStatus:"",
		};
	},
	mounted() {
        this.useListConf = Object.assign({}, this.listConf, this.listParamConf)
		this.listPaginationConf.size = this.paginationSize
			? this.paginationSize * 1
			: 20;
		this.myReferenceEntity = this.referenceEntity;
        this.formStatus = this.formRef?.getGlobalDsv().formStatus;
	},
	methods: {
		referenceCompAdd(cb) {
			let formData = this.formRef.getFormData(false);
            if(formData) {
                let newFormData = deepClone(formData);
                newFormData.referenceCompName = this.formRef.referenceCompName;
                newFormData.referenceCompEntity = this.formRef.getGlobalDsv().formEntity;
                cb(newFormData);
            }
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
        getTableDataList(){
            return this.$refs.EntityListRefs.getTableDataList();
        },
        refresh(){
            this.$refs.EntityListRefs.refreshList();
        }

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
