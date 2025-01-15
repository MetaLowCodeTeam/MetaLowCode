<style scoped lang="scss">
.el-card.entity-card:hover {
	border-color: var(--el-color-primary) !important;

	.entity-menu-icon {
		.el-icon {
			display: block;
		}
	}
}

.el-card.entity-card {
	font-size: 13px;
	width: 180px;
	float: left;
	margin: 10px;
	position: relative;
	cursor: pointer;
	border-top-width: 6px;

	:deep(.el-card__header) {
		height: 36px; /* 指定高度，以避免中英文字体高度不一致导致el-card自动换行出现问题 */
		text-align: center;
		border-bottom: 1px dotted #ebeef5;
		padding: 0;
		line-height: 36px;
		background: #f7f7f7;
		font-size: 13px;
		white-space: nowrap;
	}

	:deep(.el-card__body) {
		text-align: center;
		font-size: 14px;
		padding: 12px 12px 16px 12px;
	}

	.entity-flag-wrapper {
		margin-top: -6px;
	}

	.system-flag {
		margin-right: 3px;

		i {
			font-size: 11px;
			color: #fff;
			margin: 0 5px;
			cursor: pointer;
		}
	}

	.system-flag.system-entity {
		background: #42b983;
	}

	.entity-flag {
		i {
			font-size: 11px;
			color: #fff;
			margin: 0 5px;
			cursor: pointer;
		}
	}

	.entity-flag.main-entity {
		background: var(--el-color-primary) !important;
	}

	.entity-flag.detail-entity {
		background: var(--el-color-primary) !important;
		opacity: 0.5;
	}

	.entity-menu-icon {
		position: absolute;
		bottom: 0;
		right: 8px;
		height: 22px;
		line-height: 22px;
		z-index: 10;

		.el-icon {
			font-size: 18px;
			color: var(--el-color-primary) !important;
			display: none;
		}
	}

	.entity-item-tool {
		.field-tool {
			font-size: 12px;
			position: absolute;
			bottom: -5px;
			left: 6px;
		}

		.layout-tool {
			font-size: 12px;
			position: absolute;
			bottom: -5px;
			right: 6px;
		}

		.field-tool-center {
			font-size: 12px;
			position: absolute;
			bottom: -5px;
			left: 55px;
		}
	}
}
</style>
<template>
	<el-card
		class="entity-card"
		shadow="hover"
		v-for="(entityItem, entityIdx) in entityList"
		:key="entityIdx"
		@mouseenter="onEnterEntity(entityItem, entityIdx)"
		@mouseleave="onLeaveEntity"
	>
		<template #header>
			<div>
				<span>{{ entityItem.label }}</span>
			</div>
		</template>
		<div class="entity-flag-wrapper">
			<span
				v-if="!!entityItem.systemEntityFlag"
				class="system-flag system-entity"
			>
				<i title="系统实体">系</i>
			</span>
			<span
				v-if="!entityItem.detailEntityFlag"
				class="entity-flag main-entity"
			>
				<i title="主实体">主</i>
			</span>
			<span
				v-if="!!entityItem.detailEntityFlag"
				class="entity-flag detail-entity"
			>
				<i title="明细实体">从</i>
			</span>
			<span
				v-if="!!entityItem.internalEntityFlag"
				class="entity-flag detail-entity"
			>
				<i title="内部实体">内</i>
			</span>
		</div>
		<div>{{ entityItem.name }}</div>
		<div class="entity-menu-icon">
			<el-dropdown
				v-if="entityItem.showMenuFlag"
				@command="(command) => handleCommand(command, entityItem)"
			>
				<el-icon title="显示菜单"><Tools /></el-icon>
				<template #dropdown>
					<!-- 明细实体 -->
					<template v-if="!entityItem.detailEntityFlag && !isDesign">
						<el-dropdown-menu>
							<el-dropdown-item
								v-if="$TOOL.checkRole('r6001')"
								command="c10"
							>
								<el-icon><Memo /></el-icon>字段管理
							</el-dropdown-item>
							<el-dropdown-item
								v-if="$TOOL.checkRole('r6003')"
								command="c20"
							>
								<el-icon><Postcard /></el-icon>表单设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6008') &&
									!entityItem.systemEntityFlag
								"
								command="c30"
							>
								<el-icon><ScaleToOriginal /></el-icon>列表设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6016') &&
									!entityItem.systemEntityFlag
								"
								command="c40"
								divided
							>
								<el-icon><Share /></el-icon>流程设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6015') &&
									!entityItem.systemEntityFlag
								"
								command="c50"
							>
								<el-icon><Link /></el-icon>触发器设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r45-2') &&
									!entityItem.systemEntityFlag
								"
								command="c60"
							>
								<el-icon><Files /></el-icon>报表设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="!entityItem.systemEntityFlag"
								command="c70"
								divided
							>
								<el-icon><CopyDocument /></el-icon>复制实体
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6002') &&
									!entityItem.systemEntityFlag
								"
								command="c80"
							>
								<el-icon><Delete /></el-icon>删除实体
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
					<template
						v-else-if="entityItem.detailEntityFlag && !isDesign"
					>
						<el-dropdown-menu>
							<el-dropdown-item
								v-if="$TOOL.checkRole('r6001')"
								command="c10"
							>
								<el-icon><Memo /></el-icon>字段管理
							</el-dropdown-item>
							<el-dropdown-item
								v-if="$TOOL.checkRole('r6003')"
								command="c20"
							>
								<el-icon><Postcard /></el-icon>表单设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="!entityItem.systemEntityFlag"
								command="c70"
								divided
							>
								<el-icon><CopyDocument /></el-icon>复制实体
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6002') &&
									!entityItem.systemEntityFlag
								"
								command="c80"
							>
								<el-icon><Delete /></el-icon>删除实体
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
					<template v-else>
						<el-dropdown-menu>
							<el-dropdown-item command="c110">
								<el-icon><Memo /></el-icon>实体设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6016') &&
									!entityItem.systemEntityFlag
								"
								command="c40"
								divided
							>
								<el-icon><Share /></el-icon>流程设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6015') &&
									!entityItem.systemEntityFlag
								"
								command="c50"
							>
								<el-icon><Link /></el-icon>触发器设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r45-2') &&
									!entityItem.systemEntityFlag
								"
								command="c60"
							>
								<el-icon><Files /></el-icon>报表设计
							</el-dropdown-item>
							<el-dropdown-item
								v-if="!entityItem.systemEntityFlag"
								command="c70"
								divided
							>
								<el-icon><CopyDocument /></el-icon>复制实体
							</el-dropdown-item>
							<el-dropdown-item
								v-if="
									$TOOL.checkRole('r6002') &&
									!entityItem.systemEntityFlag
								"
								command="c80"
							>
								<el-icon><Delete /></el-icon>删除实体
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</template>
			</el-dropdown>
		</div>
	</el-card>
</template>

<script setup>
import { ref, inject } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const $TOOL = inject("$TOOL");
const props = defineProps({
	entityList: {
		type: Array,
		default: () => [],
	},
	isDesign: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["handleCommand"]);
let hoverEntityIdx = ref(-1);

const onEnterEntity = (entityItem, entityIdx) => {
	hoverEntityIdx.value = entityIdx;
	entityItem.showMenuFlag = true;
};

const onLeaveEntity = () => {
	hoverEntityIdx.value = -1;
};

// 点击实体
const onEntityClick = (entityItem) => {
	if (props.isDesign) {
		router.push({
			name: "AppDesignEntity",
			query: {
				entity: entityItem.name,
				entityLabel: entityItem.label,
				appName: router.currentRoute.value.query.appName,
				appAbbr: router.currentRoute.value.query.appAbbr,
			},
		});
	}
};

const handleCommand = (command, entityItem) => {
    if(command === 'c110') {
        onEntityClick(entityItem);
        return;
    }
	emit("handleCommand", command, entityItem);
};
</script>
