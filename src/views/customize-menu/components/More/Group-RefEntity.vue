<template>
	<el-form label-position="top">
		<el-form-item label="引用字段">
			<el-select
				v-model="groupConf.referenceField"
				placeholder="选择引用字段"
				clearable
				class="w-100"
				@change="changeReferenceField"
			>
				<el-option
					v-for="item in referenceFieldList"
					:key="item.name"
					:label="item.label"
					:value="item.name"
				/>
			</el-select>
		</el-form-item>
		<el-form-item
			label="配置树形数据的父子关系字段"
			v-loading="filedLoading"
		>
			<el-select
				v-model="groupConf.referenceFieldParent"
				placeholder="选择父子引用字段"
				clearable
				class="w-100"
			>
				<el-option
					v-for="item in referenceFieldParentList"
					:key="item.fieldName"
					:label="item.fieldLabel"
					:value="item.fieldName"
				/>
			</el-select>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { onMounted, ref, watchEffect } from "vue";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameByCode } = useCommonStore();
import { queryReferToEntityFields } from "@/api/crud";

const props = defineProps({
	referenceFieldList: {
		type: Array,
		default: () => [],
	},
	entityCode: { type: Number },
	referenceField: { type: String },
	referenceFieldParent: { type: String },
});

let filedLoading = ref(false);

let groupConf = ref({
	referenceField: "",
	referenceFieldParent: "",
    fieldReferTo: '',
    fieldReferType: 'Reference',
});

let referenceFieldParentList = ref([]);

onMounted(() => {
	groupConf.value = {
		referenceField: props.referenceField,
		referenceFieldParent: props.referenceFieldParent,
	};
	if (groupConf.value.referenceField) {
		initRefFieldList();
	}
});

const initRefFieldList = async () => {
	filedLoading.value = true;
	let entityName = queryEntityNameByCode(props.entityCode);
	let res = await queryReferToEntityFields(
		entityName,
		groupConf.value.referenceField,
		true,
		false,
		true
	);
	if (res) {
        groupConf.value.fieldReferType = res.data.field.type
		// 拿到引用实体的实体名称
		if (res.data.field.referTo && res.data.field.referTo[0]) {
			groupConf.value.fieldReferTo = res.data.field.referTo[0]?.name;
		}
        let filterField = [
            "createdBy",
            "modifiedBy",
            "ownerUser",
            "ownerDepartment"
        ];
		let fieldList = res.data.fieldList || [];
		referenceFieldParentList.value = fieldList.filter(
			(el) =>
                !filterField.includes(el.fieldName) &&
				el.fieldType == "Reference" && el.referenceName == groupConf.value.fieldReferTo
		);
	}
	filedLoading.value = false;
};

const changeReferenceField = () => {
    groupConf.value.referenceFieldParent = ''; 
	if (groupConf.value.referenceField) {
		initRefFieldList();
	}
};

defineExpose({
	groupConf,
});
</script>

<style></style>
