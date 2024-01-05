<template>
    <!--  -->
    <el-container>
        <el-header class="entity-action-section">
            实体列表
            <div style="float: right">
                <mlSearchInput
                    v-model="keyword"
                    placeholder="查询"
                    @confirm="filterEntityList"
                    @onInput="filterEntityList"
                    style="margin-right: 10px;"
                />
                <el-button type="primary" @click="createNewEntity('create')">
                    <i class="el-icon-plus"></i>&nbsp;新建实体
                </el-button>
            </div>
        </el-header>
        <el-main class="card-container" v-loading="loading">
            <el-collapse v-model="activeNames" class="collapse-entity">
                <el-collapse-item name="未分组">
                    <template #title>
                        <div class="collapse-title">
                            <span class="collapse-icon">
                                <el-icon>
                                    <ElIconGrid />
                                </el-icon>
                            </span>
                            未分组
                        </div>
                    </template>
                    <el-card
                        class="entity-card"
                        shadow="hover"
                        v-for="(entityItem, entityIdx) in notGroup"
                        :key="entityIdx"
                        @click=" (event) => showContextMenu(entityItem, event) "
                        @contextmenu.prevent=" (event) => showContextMenu(entityItem, event) "
                        @mouseenter="onEnterEntity(entityItem.name, entityItem.label, entityIdx)"
                        @mouseleave="onLeaveEntity"
                    >
                        <template #header>
                            <div>
                                <span>{{ entityItem.label }}</span>
                            </div>
                        </template>
                        <div>{{ entityItem.name }}</div>
                        <div v-if="!!entityItem.systemEntityFlag" class="system-flag system-entity">
                            <i title="系统实体">系</i>
                        </div>
                        <div v-if="!entityItem.detailEntityFlag" class="entity-flag main-entity">
                            <i title="主实体">主</i>
                        </div>
                        <div v-if="!!entityItem.detailEntityFlag" class="entity-flag detail-entity">
                            <i title="明细实体">从</i>
                        </div>
                        <div
                            v-if="!!entityItem.internalEntityFlag"
                            class="entity-flag detail-entity"
                        >
                            <i title="内部实体">内</i>
                        </div>
                    </el-card>
                </el-collapse-item>
                <template v-for="(op,name,inx) of entityGroup" :key="inx">
                    <el-collapse-item :name="name" v-if="op.length > 0">
                        <template #title>
                            <div class="collapse-title">
                                <span class="collapse-icon">
                                    <el-icon>
                                        <ElIconGrid />
                                    </el-icon>
                                </span>
                                {{name}}
                            </div>
                        </template>
                        <el-card
                            class="entity-card"
                            shadow="hover"
                            v-for="(entityItem, entityIdx) in op"
                            :key="entityIdx"
                            @click=" (event) => showContextMenu(entityItem, event) "
                            @contextmenu.prevent=" (event) => showContextMenu(entityItem, event) "
                            @mouseenter="onEnterEntity(entityItem.name, entityItem.label, entityIdx)"
                            @mouseleave="onLeaveEntity"
                        >
                            <template #header>
                                <div>
                                    <span>{{ entityItem.label }}</span>
                                </div>
                            </template>
                            <div>{{ entityItem.name }}</div>
                            <div
                                v-if="!!entityItem.systemEntityFlag"
                                class="system-flag system-entity"
                            >
                                <i title="系统实体">系</i>
                            </div>
                            <div
                                v-if="!entityItem.detailEntityFlag"
                                class="entity-flag main-entity"
                            >
                                <i title="主实体">主</i>
                            </div>
                            <div
                                v-if="!!entityItem.detailEntityFlag"
                                class="entity-flag detail-entity"
                            >
                                <i title="明细实体">从</i>
                            </div>
                            <div
                                v-if="!!entityItem.internalEntityFlag"
                                class="entity-flag detail-entity"
                            >
                                <i title="内部实体">内</i>
                            </div>
                        </el-card>
                    </el-collapse-item>
                </template>
            </el-collapse>
            <el-dialog
                :title="newEntityProps.activeType == 2 ? '复制实体' :'新建实体'"
                v-model="showNewEntityDialogFlag"
                v-if="showNewEntityDialogFlag"
                :show-close="false"
                class="new-entity-dialog"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
            >
                <EntityPropEditor
                    ref="EPEditor"
                    :entityProps="newEntityProps"
                    :show-title="false"
                    :filter-entity-method="filterMainEntity"
                ></EntityPropEditor>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button
                            type="primary"
                            @click="saveNewEntity"
                            style="width: 90px"
                            v-loading="EPEditor?.loading "
                        >保 存</el-button>
                        <el-button
                            v-loading="EPEditor?.loading"
                            @click="showNewEntityDialogFlag = false"
                        >取 消</el-button>
                    </div>
                </template>
            </el-dialog>

            <div
                id="contextMenu"
                v-show="contextMenuVisible"
                class="context-menu"
                @mouseenter="clearHideMenuTimer"
                @mouseleave="setHideMenuTimer"
            >
                <div
                    v-if="checkRole('r6001')"
                    class="context-menu__item"
                    @click="gotoEntityManager()"
                >字段管理</div>
                <div
                    v-if="checkRole('r6003')"
                    class="context-menu__item"
                    @click="gotoFormLayout()"
                >表单设计</div>
                <div
                    v-if="checkRole('r6008')"
                    class="context-menu__item"
                    @click="gotoListView()"
                >列表设计</div>
                <div class="context-menu-divider"></div>
                <div
                    v-if="checkRole('r6016')"
                    class="context-menu__item"
                    @click="gotoRoute('process-list', true,)"
                >流程设计</div>
                <div
                    v-if="checkRole('r6015')"
                    class="context-menu__item"
                    @click="gotoRoute('trigger-list', false)"
                >触发器设计</div>
                <div
                    v-if="checkRole('r45-2')"
                    class="context-menu__item"
                    @click="gotoRoute('templates-list', true)"
                >报表设计</div>
                <div class="context-menu-divider"></div>
				<div
					class="context-menu__item"
					@click="createNewEntity('copy')"
					v-if="!selectedEntityObj.systemEntityFlag"
				>复制实体</div>
                <div
                    v-if="checkRole('r6002')"
                    class="context-menu__item"
                    @click="deleteSelectedEntity()"
                >删除实体</div>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import {
    getEntitySet,
    createEntity,
    entityCanBeDeleted,
    deleteEntity,
    getAllTagsOfEntity,
    getEntityProps,
    hasDetailEntity,
    copyEntity,
} from "@/api/system-manager";
import EntityPropEditor from "./entity-editor/entity-property-editor.vue";
import useCommonStore from "@/store/modules/common";

import { storeToRefs } from "pinia";
import { inject, h, onMounted, ref, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { textIsSystemKeyword } from "@/utils/keyword-check";
const { refreshCache } = useCommonStore();
const { publicSetting } = storeToRefs(useCommonStore());
const router = useRouter();
const $TOOL = inject("$TOOL");
let keyword = ref("");
let loading = ref(false);
let entityItems = ref("");
let showNewEntityDialogFlag = ref(false);
let newEntityProps = ref({
    name: "",
    label: "",
    entityCode: null,
    layoutable: true,
    listable: true,
    authorizable: true,
    assignable: false,
    shareable: false,
    mainEntity: "",
    detailEntityFlag: false,
    useTag: [],
});

let hoverEntityIdx = ref(-1);

let selectedEntityObj = ref({});
let contextMenuVisible = ref(false);
let hideMenuTimerId = ref(null);

let availableEntityList = ref([]);

let allTags = ref([]);

let notGroup = ref([]);
let entityGroup = ref({});
let activeNames = ref(["未分组"]);
onMounted(() => {
    initEntity();
});

const checkRole = (rightStr) => {
    return $TOOL.checkRole(rightStr);
};

const initEntity = () => {
    loading.value = true;
    Promise.all([getEntityList(), getAllTags()]).then(() => {
        loading.value = false;
        filterEntityList();
    });
};

const getEntityList = () => {
    return new Promise(async (resolve, reject) => {
        let res = await getEntitySet();
        if (res && res.data) {
            entityItems.value = res.data;
            refreshCache(res.data || []);
        }
        resolve();
    });
};

const getAllTags = () => {
    return new Promise(async (resolve, reject) => {
        let res = await getAllTagsOfEntity();
        if (res && res.data) {
            allTags.value = res.data;
            res.data.forEach((el) => {
                entityGroup.value[el] = [];
                activeNames.value.push(el);
            });
        }
        resolve();
    });
};

const filterEntityList = () => {
    let filterEntitys = entityItems.value.filter((entityItem) => {
        return (
            entityItem.name !== "ApprovalConfig" &&
            entityItem.name !== "ReportConfig" &&
            entityItem.name !== "TriggerConfig" &&
            entityItem.name !== "MetaApi" &&
            entityItem.name !== "Chart"
        );
    });
    if (keyword.value) {
        availableEntityList.value = filterEntitys.filter(
            (el) =>
                el.name
                    .toLocaleUpperCase()
                    .indexOf(keyword.value.toLocaleUpperCase()) != -1 ||
                el.label
                    .toLocaleUpperCase()
                    .indexOf(keyword.value.toLocaleUpperCase()) != -1
        );
    } else {
        availableEntityList.value = [...filterEntitys];
    }
    for (const key in entityGroup.value) {
        if (entityGroup.value.hasOwnProperty.call(entityGroup.value, key)) {
            entityGroup.value[key] = [];
        }
    }
    notGroup.value = [];
    availableEntityList.value.forEach((el) => {
        el.newTags = el.tags ? el.tags.split(",") : [];
        if (el.newTags.length > 0) {
            el.newTags.forEach((subEl) => {
                entityGroup.value[subEl].push(el);
            });
        } else {
            notGroup.value.push(el);
        }
    });
};

let EPEditor = ref("");
// 新建实体
const createNewEntity = (target) => {
    newEntityProps.value.name = "";
    newEntityProps.value.label = "";
    newEntityProps.value.entityCode = null;
    newEntityProps.value.layoutable = true;
    newEntityProps.value.listable = true;
    newEntityProps.value.authorizable = true;
    newEntityProps.value.assignable = false;
    newEntityProps.value.shareable = false;
    newEntityProps.value.mainEntity = "";
    newEntityProps.value.detailEntityFlag = false;
    newEntityProps.value.useTag = allTags.value.map((el) => {
        return {
            name: el,
            checked: false,
        };
    });
    showNewEntityDialogFlag.value = true;
    // 如果是复制实体
    if (target == "copy") {
        // 复制
        newEntityProps.value.activeType = 2;
        nextTick(async () => {
            EPEditor.value.loading = true;
            let res = await getEntityProps(selectedEntityObj.value.name);
            if (res && res.data) {
                newEntityProps.value = Object.assign(
                    newEntityProps.value,
                    res.data
                );
                // 获取该实体标签
                if (newEntityProps.value.tags) {
                    let cutEntityTag = newEntityProps.value.tags;
                    newEntityProps.value.useTag.forEach((el) => {
                        if (cutEntityTag.includes(el.name)) {
                            el.checked = true;
                        }
                    });
                }
                newEntityProps.value.name = "";
                newEntityProps.value.label = "";

                let subEntityRes = await hasDetailEntity(
                    selectedEntityObj.value.name
                );
                newEntityProps.value.hasDetailEntity =
                    subEntityRes?.data || false;
            }
            EPEditor.value.loading = false;
        });
    }
    // 新建
    else {
        newEntityProps.value.activeType = 1;
    }
};

const saveNewEntity = () => {
    EPEditor.value.validateForm(async () => {
        if (textIsSystemKeyword(newEntityProps.value.name)) {
            ElMessage.error("实体不能使用系统保留关键字，请修改。");
            return;
        }

        newEntityProps.value = Object.assign(
            newEntityProps.value,
            EPEditor.value.entityProps
        );
        const mainEntityName = !newEntityProps.value.mainEntity
            ? "null"
            : newEntityProps.value.mainEntity;
        EPEditor.value.loading = true;
        let tags = [];
        if (newEntityProps.value.useTag) {
            newEntityProps.value.useTag.forEach((el) => {
                if (el.checked) {
                    tags.push(el.name);
                }
            });
        }
        newEntityProps.value.tags = tags.join(",");

        delete newEntityProps.value.useTag;
        let res;
        // 是复制
        if (newEntityProps.value.activeType == 2) {
            let params = {
                sourceEntity: newEntityProps.value,
                mainEntityName,
                operations: eval(
                    EPEditor.value.copyEntiytSelectedType.join("+")
                ),
            };
            res = await copyEntity(params);
        } else {
            res = await createEntity(newEntityProps.value, mainEntityName);
        }
        if (res && res.code == 200) {
            ElMessage.success("保存成功");
            showNewEntityDialogFlag.value = false;
            initEntity();
        }
        EPEditor.value.loading = false;
    });
};

const onEnterEntity = (entityName, entityLabel, entityIdx) => {
    hoverEntityIdx.value = entityIdx;
};

const onLeaveEntity = () => {
    hoverEntityIdx.value = -1;
};

const gotoEntityManager = () => {
    router.push({
        name: "FieldManager",
        query: {
            entity: selectedEntityObj.value.name,
            entityLabel: selectedEntityObj.value.label,
        },
    });
};

const gotoFormLayout = () => {
    if (selectedEntityObj.value.layoutable !== true) {
        ElMessage.info("当前实体不允许设计表单");
        return;
    }

    router.push({
        name: "FormDesign",
        query: {
            entity: selectedEntityObj.value.name,
            entityLabel: selectedEntityObj.value.label,
        },
    });
};

const gotoListView = () => {
    if (
        selectedEntityObj.value.systemEntityFlag ||
        selectedEntityObj.value.internalEntityFlag
    ) {
        ElMessage.info("当前实体不允许设计列表");
        return;
    }

    if (selectedEntityObj.value.detailEntityFlag) {
        ElMessage.info("明细实体不允许设计列表");
        return;
    }

    router.push("/web/" + selectedEntityObj.value.name + "/list");
};

const gotoRoute = (routePage, disableDetailEntity) => {
    if (
        selectedEntityObj.value.systemEntityFlag ||
        selectedEntityObj.value.internalEntityFlag
    ) {
        ElMessage.info("当前实体不允许此操作");
        return;
    }

    if (disableDetailEntity && selectedEntityObj.value.detailEntityFlag) {
        ElMessage.info("明细实体不允许此操作");
        return;
    }

    router.push(
        "/web/" +
            routePage +
            "?entityCode=" +
            selectedEntityObj.value.entityCode
    );
};

const deleteSelectedEntity = () => {
    if (publicSetting.value.trialVersionFlag) {
        ElMessage.error("试用版本已禁用删除实体功能，敬请谅解");
        return;
    }
    entityCanBeDeleted(selectedEntityObj.value.name)
        .then((res) => {
            if (res.error != null) {
                ElMessage({ message: res.error, type: "error" });
                return;
            }

            if (res.data !== true) {
                ElMessage.info("提示：系统实体、内部实体不能被删除！");
                return;
            }

            let confirmText = [
                "实体删除后不能恢复，是否确认删除?",
                "1. 删除实体会清空该实体的所有数据，包括实体所有字段、表单布局和列表设置，且不能恢复；’",
                "2. 如该实体包含明细实体，请先删除明细实体；",
                "3. 如有其他实体引用字段指向该实体，请手工删除引用字段；",
            ];
            let pTags = [];
            confirmText.forEach((ct) => {
                pTags.push(h("p", null, ct));
            });
            ElMessageBox.confirm("删除提醒", {
                message: h("div", null, pTags),
                showCancelButton: true,
                type: "warning",
            })
                .then(() => {
                    //再次确认删除
                    ElMessageBox.prompt('请输入大写"MLC"', "再次确认删除", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        inputPattern: /^MLC$/,
                        inputErrorMessage: "输入不正确",
                    })
                        .then(({ value }) => {
                            if (value === "MLC") {
                                executeDeleteEntity(
                                    selectedEntityObj.value.name
                                );
                            }
                        })
                        .catch((err) => {
                            console.error("eeee", err);
                            //ElMessage.error(err.message)
                            ElMessage({ type: "info", message: "已取消删除" });
                        });
                })
                .catch(() => {
                    ElMessage({ type: "info", message: "已取消删除" });
                });
        })
        .catch((res) => {
            ElMessage({ message: res.message, type: "error" });
        });
};

const executeDeleteEntity = (entity) => {
    deleteEntity(entity)
        .then((res) => {
            if (res && res.data) {
                ElMessage.success("实体已删除");
                initEntity();
            }
        })
        .catch((res) => {
            ElMessage({ message: res.message, type: "error" });
        });
};

const filterMainEntity = (filterList, callBack) => {
    filterList.length = 0; /* 清空数组，不能用filterList=[]，否则SimpleTable显示不出数据！！ */
    filterList = entityItems.value.filter((entity) => {
        if (entity.systemEntityFlag || entity.internalEntityFlag) {
            //
        } else if (entity.detailEntityFlag === false) {
            filterList.push({ name: entity.name, label: entity.label });
        }
    });

    callBack();
};

const hideContextMenu = (event) => {
    contextMenuVisible.value = false;
    clearHideMenuTimer();
};

const contextMenuSetting = (menu, event) => {
    if (event.clientX > 1800) {
        menu.style.left = event.clientX - 100 + "px";
    } else {
        menu.style.left = event.clientX + 1 + "px";
    }
    if (event.clientY > 700) {
        menu.style.top = event.clientY - 70 + "px";
    } else {
        menu.style.top = event.clientY - 50 + "px";
    }
};

const showContextMenu = (entity, event) => {
    clearHideMenuTimer();
    contextMenuVisible.value = false;
    contextMenuVisible.value = true;
    //event.preventDefault() //关闭浏览器右键默认事件
    selectedEntityObj.value = {
        name: entity.name,
        label: entity.label,
        entityCode: entity.entityCode,
        layoutable: entity.layoutable,
        listable: entity.listable,
        systemEntityFlag: entity.systemEntityFlag,
        detailEntityFlag: entity.detailEntityFlag,
    };
    let menu = document.querySelector("#contextMenu");
    contextMenuSetting(menu, event);
    setHideMenuTimer();
};

const setHideMenuTimer = () => {
    hideMenuTimerId.value = setTimeout(() => {
        hideContextMenu();
    }, 3000);
};

const clearHideMenuTimer = () => {
    clearTimeout(hideMenuTimerId.value);
};
</script>

<style lang="scss" scoped>
.collapse-entity {
    .collapse-title {
        font-size: 14px;
        font-weight: bold;
        color: #777;
        .collapse-icon {
            position: relative;
            top: 2px;
        }
    }
    :deep(.el-collapse-item__header) {
        height: 38px;
        line-height: 38px;
    }
}
.el-main.card-container {
    background: #ffffff;
}

.el-main.card-container:after {
    content: "";
    display: block;
    clear: both;
}

.el-header.entity-action-section {
    height: 54px !important; /* 解决内部按钮居中问题 */
    line-height: 54px; /* 解决内部按钮居中问题 */
    font-size: 16px;
    text-align: center;
    border-bottom: 1px dashed #eeeeee;
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
    }

    :deep(.el-card__body) {
        text-align: center;
        font-size: 14px;
        padding: 12px 12px 16px 12px;
    }

    .system-flag {
        position: absolute;
        bottom: 0;
        right: 23px;
        height: 22px;
        line-height: 22px;
        z-index: 9;

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
        position: absolute;
        bottom: 0;
        right: 0;
        height: 22px;
        line-height: 22px;
        z-index: 9;

        i {
            font-size: 11px;
            color: #fff;
            margin: 0 5px;
            cursor: pointer;
        }
    }

    .entity-flag.main-entity {
        background: #4ab7bd;
    }

    .entity-flag.detail-entity {
        background: #cccccc;
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

.context-menu {
    position: absolute;
    background-color: #fff;
    width: 100px;
    /*height: 106px;*/
    font-size: 12px;
    color: #444040;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    white-space: nowrap;
    z-index: 1000;
}

.context-menu__item {
    display: block;
    line-height: 34px;
    text-align: center;
}

.context-menu__item:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.context-menu__item.hidden {
    display: none;
}

.context-menu__item:hover {
    cursor: pointer;
    background: #409eff;
    border-color: #66b1ff;
    color: #fff;
}

.context-menu-divider {
    line-height: 4px;
    height: 4px;
    background-color: #fff2f3;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>

<style lang="scss">
.new-entity-dialog {
    .el-dialog__header {
        margin: 0;
        background-color: var(--el-color-primary) !important;

        .el-dialog__title {
            color: #fff;
        }
    }
}
</style>
