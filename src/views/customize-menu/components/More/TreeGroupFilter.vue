<template>
	<!--  -->
	<ml-dialog
		title="树状分组筛选设置"
		v-model="isShow"
		append-to-body
		width="500"
		draggable
	>
		<div v-loading="loading">
            <div>
				<el-checkbox v-model="groupConf.isOpen" label="开启树状分组" />
            </div>
			<el-tabs v-model="groupConf.groupType" class="demo-tabs" v-if="groupConf.isOpen">
				<el-tab-pane
					v-for="item in tabsList"
					:key="item.value"
					:label="item.label"
					:name="item.value"
				/>
			</el-tabs>
			<!-- 基于当前数据分组 -->
			<template v-if="groupConf.groupType == 1 && groupConf.isOpen">
				<div class="header-box">
					<el-button type="primary" @click="addGroup">
						新增筛选层级
					</el-button>
				</div>
				<el-card class="box-card" shadow="never">
					<div
						class="item-group"
						v-for="(item, inx) of groupConf.groupList"
						:key="inx"
						:class="['select-' + inx]"
					>
						<el-select
							v-model="item.fieldGroup"
							placeholder="选择分组字段（多选）"
							multiple
							clearable
							:class="[
								'box-select',
								item.error ? 'is-error' : '',
							]"
							@focus="item.error = false"
							value-key="name"
							filterable
						>
							<el-option
								v-for="item in fieldList"
								:key="item.name"
								:label="item.label"
								:value="item"
							/>
						</el-select>
						<span class="del-group" @click="delGroup(inx)">
							<el-icon>
								<ElIconCloseBold />
							</el-icon>
						</span>
					</div>
				</el-card>
			</template>
			<!-- 基于引用实体分组 -->
			<template v-if="groupConf.groupType == 2 && groupConf.isOpen">
				<GroupRefEntity
					:reference-field-list="referenceFieldList"
					:entityCode="entityCode"
					:referenceField="groupConf.referenceField"
					:referenceFieldParent="groupConf.referenceFieldParent"
					ref="groupRefEntityRef"
				/>
			</template>
			<div class="mt-5" v-if="groupConf.isOpen">
				<el-checkbox
					v-model="groupConf.isAccordion"
					label="手风琴模式"
				/>
				<el-checkbox
					v-if="groupConf.groupType == 2"
					v-model="groupConf.isMultiple"
					label="开启多选"
				/>
				<el-checkbox
					v-model="groupConf.isStrictly"
					v-if="groupConf.groupType == 2 && groupConf.isMultiple"
					label="开启父子节点选择关联"
				/>
			</div>
		</div>
		<template #footer>
			<el-button style="width: 70px" @click="isShow = false">
				取消
			</el-button>
			<el-button
				style="width: 70px"
				type="primary"
				@click="confirmFieldGroup"
			>
				确认
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
/**
 * API
 */
import { getFieldSet } from "@/api/system-manager";
import layoutConfig from "@/api/layoutConfig";

import GroupRefEntity from "./Group-RefEntity.vue";

const { queryEntityNameByCode } = useCommonStore();
const props = defineProps({
	modelValue: null,
	entityCode: { type: [Number, String], default: "" },
	layoutConfig: { type: Object, default: () => {} },
	// 实体模块名称
	modelName: {
		type: String,
		default: "",
	},
});

const emits = defineEmits(["update:modelValue", "confirm"]);

let isShow = ref(false);
let myLayoutConf = ref({});
watch(
	() => props.modelValue,
	() => {
		isShow.value = props.modelValue;
		loadFields();
		initLayoutConf();
	},
	{ deep: true }
);

watch(
	() => props.layoutConfig,
	() => {
		initLayoutConf();
	},
	{
		deep: true,
	}
);

watch(
	() => isShow.value,
	() => {
		emits("update:modelValue", isShow.value);
	},
	{ deep: true }
);

onMounted(() => {
	isShow.value = props.modelValue;
	// 加载字段
	loadFields();
	// 初始化配置信息
	initLayoutConf();
});

/**
 * 加载字段数据
 */
let loading = ref(false);
let entityName = ref("");
// 所有字段
let fieldList = ref([]);

// 引用字段
let referenceFieldList = ref([]);

// 加载字段
const loadFields = async () => {
	// 弹框显示才调接口
	if (!isShow.value) {
		return;
	}
	entityName.value = queryEntityNameByCode(props.entityCode);
	loading.value = true;
	let res = await getFieldSet(entityName.value);
	if (res && res.code == 200) {
		// 只有这些类型可以筛选
		let needType = [
			// 引用
			"Reference",
			// 布尔
			"Boolean",
			// 整数
			"Integer",
			// 精度小数
			"Decimal",
			// 百分比
			"Percent",
			// 金额
			"Money",
			// 文本
			"Text",
			// 单选项
			"Option",
			// 多选项
			"Tag",
			// 地区选择
			"AreaSelect",
			// 时间
			"Date",
			"DateTime",
		];
		fieldList.value = res.data.filter((el) => needType.includes(el.type));
		referenceFieldList.value = res.data.filter(
			(el) => el.type == "Reference"
		);
	}
	loading.value = false;
};

/**
 * 分组数据
 */

const tabsList = ref([
	{
		label: "基于当前数据分组",
		value: 1,
	},
	{
		label: "基于引用实体分组",
		value: 2,
	},
]);

let layoutConfigId = ref("");
let groupConf = ref({
	// 分组数据
	groupList: [
		{
			fieldGroup: [],
			error: false,
		},
	],
	// 分组类型 1：基于当前数据分组 2：基于引用实体分组
	groupType: 1,
	// 引用字段
	referenceField: "",
	// 引用字段to
	fieldReferTo: "",
	// 父子引用字段
	referenceFieldParent: "",
	// 是否开启多选
	isMultiple: false,
	// 是否 开启树状分组
	isOpen: true,
	// 手风琴模式
	isAccordion: false,
	// 是否开启父子关联
	isStrictly: true,
});

// 初始化数据
const initLayoutConf = () => {
	if (!props.layoutConfig) {
		return;
	}
	myLayoutConf.value = props.layoutConfig;
	let { TREE_GROUP } = myLayoutConf.value;
	if (TREE_GROUP) {
		layoutConfigId.value = TREE_GROUP.layoutConfigId;
		groupConf.value = Object.assign(
			groupConf.value,
			JSON.parse(TREE_GROUP.config)
		);
	}
};

// 新建分组
const addGroup = () => {
	if (groupConf.value.groupList.length < 5) {
		groupConf.value.groupList.push({
			fieldGroup: [],
			error: false,
		});
	} else {
		ElMessage.warning("最多可添加5个层级");
	}
};

// 删除分组
const delGroup = (inx) => {
	if (groupConf.value.groupList.length == 1) {
		ElMessage.warning("至少保留1个层级");
		return;
	}
	groupConf.value.groupList.splice(inx, 1);
};

let groupRefEntityRef = ref(null);

// 确认字段分组
const confirmFieldGroup = async () => {
	if (groupConf.value.groupType == 1 && groupConf.value.isOpen) {
		for (let index = 0; index < groupConf.value.groupList.length; index++) {
			const element = groupConf.value.groupList[index];
			if (element.fieldGroup.length < 1) {
				element.error = true;
				ElMessage.error("该层级还未选择分组字段");
				return;
			}
		}
	}
	if (groupConf.value.groupType == 2 && groupConf.value.isOpen) {
		groupConf.value = Object.assign(
			groupConf.value,
			groupRefEntityRef.value.groupConf
		);
		if (!groupConf.value.referenceField) {
			ElMessage.error("请选择引用字段");
			return;
		}
		if (!groupConf.value.referenceFieldParent) {
			ElMessage.error("请选择引用父字段");
			return;
		}
	}
	let param = {
		config: JSON.stringify(groupConf.value),
		entityCode: props.entityCode,
	};
	loading.value = true;
	let res = await layoutConfig.saveConfig(
		layoutConfigId.value,
		"TREE_GROUP",
		param,
		props.modelName
	);
	if (res) {
		ElMessage.success("保存成功");
		emits("confirm");
		isShow.value = false;
	}
	loading.value = false;
};
</script>
<style lang="scss" scoped>
.box-card {
	margin-top: 10px;
	.item-group {
		margin-bottom: 10px;
		&:last-child {
			margin-bottom: 0;
		}
		&.select-1 {
			padding-left: 5px;
		}
		&.select-2 {
			padding-left: 10px;
		}
		&.select-3 {
			padding-left: 15px;
		}
		&.select-4 {
			padding-left: 20px;
		}
	}
	.box-select {
		width: calc(100% - 32px);
	}
	.del-group {
		width: 30px;
		height: 30px;
		line-height: 30px;
		float: right;
		margin-top: 1px;
		text-align: center;
		font-size: 18px;
		border-radius: 4px;
		padding-top: 2px;
		box-sizing: border-box;
		cursor: pointer;
		&:hover {
			background: #f2f6fc;
		}
	}
}
.footer-box {
	text-align: right;
}
</style>
