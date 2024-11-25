<template>
	<div
		class="pl-20 item"
		:class="{ 'div-disabled': multipleSelection.length != 1 }"
		v-if="
			copyConf.openCopy &&
			$TOOL.checkRole('r' + layoutConfig.entityCode + '-2')
		"
		@click="openCopyDialog"
	>
		<span class="icon-t2">
			<el-icon>
				<ElIconCopyDocument />
			</el-icon>
		</span>
		复制
	</div>
	<ml-dialog
		title="复制"
		v-model="copyDialogConf.isShow"
		appendToBody
		width="600px"
		:closeOnClickOutside="false"
		:closeOnPressEscape="false"
		:closeOnClickModal="false"
	>
		<div
			v-loading="copyDialogConf.loading"
			element-loading-text="复制中..."
		>
			<div>
				<span class="icon-t2">
					<el-icon>
						<WarningFilled />
					</el-icon>
				</span>
				是否确认复制：{{ copyDialogConf.title }} ?
			</div>
			<div class="mt-10">
				<el-radio-group v-model="copyDialogConf.type">
					<el-radio :value="1">复制完成后打开编辑弹框</el-radio>
					<el-radio :value="2">复制完成后打开详情弹框</el-radio>
				</el-radio-group>
			</div>
		</div>
		<template #footer>
			<el-button
				@click="copyDialogConf.isShow = false"
				:loading="copyDialogConf.loading"
			>
				取 消
			</el-button>
			<el-button
				type="primary"
				:disabled="copyDialogConf.recordIds == ''"
				@click="confirmCopy"
				:loading="copyDialogConf.loading"
			>
				确 认
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { watchEffect, ref, inject, reactive } from "vue";
const $TOOL = inject("$TOOL");
import { cloneRecord } from "@/api/crud";
const props = defineProps({
	layoutConfig: {
		type: Object,
		default: () => ({}),
	},
	multipleSelection: {
		type: Object,
		default: () => [],
	},
});

const emits = defineEmits(["copySuccess"]);

// 传参配置
let propLayoutConfig = ref({});
let copyConf = ref({
	// 打开复制功能
	openCopy: false,
	// 允许用户选择级联复制
	allowUsersSelect: false,
	// 默认级联删除
	cascades: [],
	// 是否跳过唯一性检查
	skipDuplicationCheck: false,
});

watchEffect(() => {
	propLayoutConfig.value = props.layoutConfig;
	let { STYLE } = propLayoutConfig.value;
	if (STYLE && STYLE.config) {
		let config = JSON.parse(STYLE.config);
		copyConf.value = Object.assign(copyConf.value, config.copyConf);
	}
});

/**
 * 复制弹框配置
 */
let copyDialogConf = ref({
	title: "",
	isShow: false,
	recordIds: "",
	loading: false,
	type: 1,
});
const openCopyDialog = () => {
	let row = props.multipleSelection[0];
	let { idFieldName, nameFieldName } = propLayoutConfig.value;
	copyDialogConf.value = {
		title: `${row[nameFieldName]}`,
		isShow: true,
		recordIds: row[idFieldName],
		type: 1,
	};
};

const confirmCopy = async () => {
	copyDialogConf.value.loading = true;
	let { recordIds, type } = copyDialogConf.value;
	let param = {
		body: {
			recordIds: [recordIds],
			cascades: copyConf.value.cascades,
			skipDuplicationCheck: copyConf.value.skipDuplicationCheck,
		},
	};
	let res = await cloneRecord(param.body);
	if (res) {
		emits("copySuccess", {
			type,
			recordId: res.data[0],
		});
        copyDialogConf.value.isShow = false;
	}

	copyDialogConf.value.loading = false;
};
</script>
<style lang="scss" scoped>
.icon-t2 {
	position: relative;
	top: 2px;
}
.item {
	height: 26px;
	line-height: 26px;
	cursor: pointer;
	position: relative;
	&.is-active {
		color: var(--el-color-primary);
	}
	.action-icon {
		position: absolute;
		right: 10px;
		top: 4px;
		display: none;
		.icon-span {
			cursor: pointer;
			display: inline-block;
			color: #a1a1a1;
			&:hover {
				color: #666;
			}
			&.edit-icon {
				position: relative;
				top: -2px;
			}
		}
	}
	&:hover {
		background: #dedede;
		.action-icon {
			display: block;
		}
	}
	&.div-disabled {
		background: #fff;
		cursor: default;
	}
}
</style>
