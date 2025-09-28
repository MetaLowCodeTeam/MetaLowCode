<template>
	<el-card shadow="never" class="options-card">
		<template #header>
			<div class="options-card-header">
				<div class="options-card-header-title">选项管理</div>
				<el-button type="primary" @click="addOption" link>
					新增选项
				</el-button>
			</div>
		</template>
		<div class="options-card-body">
			<div
				class="options-card-body-item"
				v-for="(item, inx) in myOptionItems"
				:key="inx"
			>
				<div class="label-item">
					<span>
                        {{ item.label }}
                    </span>
					<span v-if="showCode">
						({{ item.value }})
					</span>
				</div>
				<div class="option-item">
					<el-button
						link
						type="primary"
						class="option-item-insert"
						title="插入"
						icon="el-icon-plus"
						@click="insertOption(inx)"
					></el-button>
					<el-button
						link
						type="primary"
						class="option-item-up"
						title="上移"
						icon="el-icon-top"
						@click="upOption(inx)"
					></el-button>
					<el-button
						link
						type="primary"
						class="option-item-down"
						title="下移"
						icon="el-icon-bottom"
						@click="downOption(inx)"
					></el-button>
					<el-button
						link
						type="primary"
						class="option-item-edit"
						title="编辑"
						icon="el-icon-edit"
						@click="editOption(inx)"
					></el-button>
					<el-button
						link
						type="primary"
						class="option-item-delete"
						title="删除"
						icon="el-icon-delete"
						@click="deleteOption(inx)"
					></el-button>
				</div>
			</div>
		</div>
	</el-card>
</template>
<script setup>
import { watchEffect, ref } from "vue";

const props = defineProps({
	optionItems: {
		type: Array,
		default: () => [],
	},
    showCode: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(["addOption", "insertOption", "upOption", "downOption", "editOption", "deleteOption"]);

let myOptionItems = ref([]);

watchEffect(() => {
	myOptionItems.value = props.optionItems;
});

const addOption = () => {
	emit("addOption");
};

const insertOption = (inx) => {
	emit("insertOption", inx);
};

const upOption = (inx) => {
	emit("upOption", inx);
};

const downOption = (inx) => {
	emit("downOption", inx);
};

const editOption = (inx) => {
	emit("editOption", inx);
};

const deleteOption = (inx) => {
	emit("deleteOption", inx);
};

</script>
<style scoped lang="scss">
.options-card {
	.options-card-header {
		display: flex;
		align-items: center;
		.options-card-header-title {
			flex: 1;
		}
	}
	.options-card-body-item {
		display: flex;
		height: 24px;
		line-height: 24px;
        
        .label-item {
            // flex: 1;
            width: calc(100% - 120px);
            // 超出部分省略
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
		.option-item {
            display: none;
            :deep(.el-button+.el-button) {
                margin-left: 2px;
            }
		}
        &:hover {
            background-color: #f0f2f5;
            border-radius: 4px;
            .option-item {
                display: block;
            }
        }
	}
}
</style>
