<template>
    <!--  -->
    <el-container>
        <el-header class="entity-action-section">
            实体列表
            <div style="float: right">
                <div class="entity-search-wrapper">
                    <el-input
                        v-model="keyword"
                        style="max-width: 600px"
                        placeholder="输入关键词搜索..."
                        class="input-with-select"
                        clearable
                        @input="filterEntityList"
                    >
                        <template #prepend>
                            <el-select 
                                v-model="searchTag" 
                                style="width: 100px"
                                @change="filterEntityList"
                            >
                                <el-option label="全部标签" value="全部标签" />
                                <el-option label="未分组" value="未分组" />
                                <el-option 
                                    v-for="(op,inx) of allTags" 
                                    :key="inx" 
                                    :label="op" 
                                    :value="op" 
                                />
                            </el-select>
                        </template>
                    </el-input>
                </div>
                <el-button type="primary" @click="createNewEntity('create')">
                    <i class="el-icon-plus"></i>&nbsp;新建实体
                </el-button>
                <el-popover trigger="click">
                    <div class="table-setting-item-box">
                        <div class="item" @click="openImportExportDialog('export')" v-if="!props.isAppManagement">
                            <span class="icon-top-1">
                                <el-icon>
                                    <ElIconDownload />
                                </el-icon>
                            </span>
                            导出实体
                        </div>
                        <div class="item" @click="openImportExportDialog('import')" v-if="!props.isAppManagement">
                            <span class="icon-top-1">
                                <el-icon>
                                    <ElIconUpload />
                                </el-icon>
                            </span>
                            导入实体
                        </div>
                        <div class="item" @click="openCopyEntityDialog" v-if="props.isAppManagement">
                            <span class="icon-top-1">
                                <el-icon>   
                                    <CopyDocument />
                                </el-icon>
                            </span> 
                            从实体中复制
                        </div>
                    </div>
                    <template #reference>
                        <el-button type="primary" plain>
                            更多
                            <el-icon style="transform: rotate(90deg);">
                                <ElIconMoreFilled />
                            </el-icon>
                        </el-button>
                    </template>
                </el-popover>
            </div>
        </el-header>
        <el-main class="card-container" v-loading="loading">
            <el-collapse v-model="activeNames" class="collapse-entity">
                <el-collapse-item name="未分组" v-if="(searchTag == '未分组' || searchTag == '全部标签') && notGroup.length > 0">
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
                    <EntityListCard :entityList="notGroup" :isAppManagement="isAppManagement" @handleCommand="handleCommand"/>
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
                        <EntityListCard :entityList="op" :isAppManagement="isAppManagement" @handleCommand="handleCommand"/>
                    </el-collapse-item>
                </template>
                <el-empty v-if="showEmpty" description="暂无数据" />
            </el-collapse>
            <el-dialog
                :title="newEntityProps.activeType == 2 ? '复制实体' :'新建实体'"
                v-model="showNewEntityDialogFlag"
                v-if="showNewEntityDialogFlag"
                :show-close="false"
                class="new-entity-dialog"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                draggable
            >
                <div v-loading="saveLoading">
                    <EntityPropEditor
                        ref="EPEditor"
                        :entityProps="newEntityProps"
                        :show-title="false"
                        :filter-entity-method="filterMainEntity"
                    />
                </div>
                
                <template #footer>
                    <div class="dialog-footer">
                        <el-button
                            type="primary"
                            @click="saveNewEntity"
                            style="width: 90px"
                            :loading="saveLoading"
                        >
                            保 存
                        </el-button>
                        <el-button
                            :loading="saveLoading"
                            @click="showNewEntityDialogFlag = false"
                        >
                            取 消
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </el-main>
    </el-container>
    <EntityImportExport ref="entityImportExportRef" :entityList="entityItems"/>
    <EntitySelected 
        ref="entitySelectedRef"
        @selectEntity="selectCopyEntity"
        title="选择实体复制"
    />
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
import EntityListCard from "./entity-list-card.vue";
import { storeToRefs } from "pinia";
import { inject, h, onMounted, ref, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { textIsSystemKeyword } from "@/utils/keyword-check";
import EntityImportExport from "./entity-import-export.vue";
import EntitySelected from "./entity-selected.vue";
import http from "@/utils/request";

const { refreshCache } = useCommonStore();
const { publicSetting } = storeToRefs(useCommonStore());
const router = useRouter();
const $TOOL = inject("$TOOL");

const props = defineProps({
    isAppManagement: {
        type: Boolean,
        default: false
    }
})

let keyword = ref("");
let searchTag = ref("全部标签");


let loading = ref(false);
let entityItems = ref([]);
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

let appAbbr = ref("");

onMounted(() => {
    initEntity();
});

const checkRole = (rightStr) => {
    return $TOOL.checkRole(rightStr);
};

const initEntity = () => {
    if(props.isAppManagement) {
        appAbbr.value = router.currentRoute.value.query.appAbbr;
    }
    loading.value = true;
    Promise.all([getEntityList(), getAllTags()]).then(() => {
        loading.value = false;
        filterEntityList();
    });
};

const getEntityList = () => {
    return new Promise(async (resolve, reject) => {
        let res = await getEntitySet(appAbbr.value || "NOT_APP");
        if (res && res.data) {
            entityItems.value = res.data;
            refreshCache(res.data || []);
        }
        resolve();
    });
};

const getAllTags = () => {
    return new Promise(async (resolve, reject) => {
        let res = await getAllTagsOfEntity(appAbbr.value);
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

let showEmpty = ref(false);

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
                if(searchTag.value == '全部标签'){
                    entityGroup.value[subEl].push(el);
                }else {
                    if(searchTag.value != '未分组' && subEl == searchTag.value){
                        entityGroup.value[searchTag.value].push(el);
                    }
                }
            });
        } else {
            notGroup.value.push(el);
        }
    });
    if(searchTag.value == '全部标签'){
        showEmpty.value = availableEntityList.value.length == 0;
    }else if(searchTag.value == '未分组'){
        showEmpty.value = notGroup.value.length == 0;
    }else {
        showEmpty.value = entityGroup.value[searchTag.value].length == 0;
    }
};
const appPath = import.meta.env.VITE_APP_PATH;
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
        newEntityProps.value.physicalName = "";
        newEntityProps.value.activeType = 1;
    }
};

let saveLoading = ref(false);

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
            
        saveLoading.value = true;
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
        let paramsEntityProps = JSON.parse(JSON.stringify(newEntityProps.value));
        if(props.isAppManagement){
            paramsEntityProps.appAbbr = appAbbr.value;
            paramsEntityProps.name = appAbbr.value + "_" + paramsEntityProps.name;
        }
        let res;
        // 是复制
        if (newEntityProps.value.activeType == 2) {
            let params = {
                sourceEntity: paramsEntityProps,
                mainEntityName,
                operations: eval(
                    EPEditor.value.copyEntiytSelectedType.join("+")
                ),
            };
            res = await copyEntity(params);
        } else {
            res = await createEntity(paramsEntityProps, mainEntityName);
        }
        if (res && res.code == 200) {
            ElMessage.success("保存成功");
            showNewEntityDialogFlag.value = false;
            await getRightMap();
            initEntity();
        }
        saveLoading.value = false;
    });
};

const getRightMap = async () => {
    let getRightMapRes = await http.get("/user/getRightMap");
    if (getRightMapRes) {
        $TOOL.data.set("rightMap", getRightMapRes.data || {});
    }
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
    router.push(appPath + selectedEntityObj.value.name + "/list");
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
    let routerObj = {
        path: appPath + routePage,
        query: {
            entityCode: selectedEntityObj.value.entityCode,
        }
    };
    if(props.isAppManagement) {
        routerObj.query.appName = router.currentRoute.value.query.appName;
        routerObj.query.appAbbr = router.currentRoute.value.query.appAbbr;
        routerObj.query.meteAppendTitle = selectedEntityObj.value.label;
    }
    router.push(routerObj);
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
        if (entity.internalEntityFlag) {
            //
        } else if (entity.detailEntityFlag === false) {
            filterList.push({ name: entity.name, label: entity.label, tags: entity.tags });
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

const handleCommand = (command, entityItem) => {
	selectedEntityObj.value = entityItem;
	if (command === 'c10') {
		gotoEntityManager();
	} else if (command === 'c20') {
		gotoFormLayout();
	} else if (command === 'c30') {
		gotoListView();
	} else if (command === 'c40') {
		gotoRoute(props.isAppManagement ? 'designApp/designApprovalProcess' : 'process-list', true);
	} else if (command === 'c50') {
		gotoRoute(props.isAppManagement ? 'designApp/designTrigger' : 'trigger-list', false);
	} else if (command === 'c60') {
		gotoRoute(props.isAppManagement ? 'designApp/designReportDesign' : 'templates-list', true);
	} else if (command === 'c70') {
        // 如果复制的实体存在标签，且不在所有标签数组中，就push进去
        if(entityItem.tags &&!allTags.value.includes(entityItem.tags)){
            allTags.value.push(entityItem.tags);
        }
		createNewEntity('copy');
	} else if (command === 'c80') {
		deleteSelectedEntity();
	}
};

// 导入导出实体
const entityImportExportRef = ref(null);
const openImportExportDialog = (type) => {
    entityImportExportRef.value.openDialog(type);
}

// 选择实体组件
const entitySelectedRef = ref();

// 打开复制实体弹窗
const openCopyEntityDialog = () => {
    entitySelectedRef.value.openDialog("NOT_APP");
}
// 选择复制实体
const selectCopyEntity = (row) => {
    row.appAbbr = appAbbr.value;
    handleCommand('c70',row);
}

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
</style>

<style lang="scss">
.new-entity-dialog {
    padding: 0;
	.el-dialog__header {
		margin: 0;
		background-color: var(--el-color-primary) !important;
        padding: 0px 20px;
        height: 60px;
        line-height: 66px;
        box-sizing: border-box;
		.el-dialog__title {
			color: #fff;
            font-size: 20px;
		}
        .el-dialog__headerbtn:focus .el-dialog__close, .el-dialog__headerbtn:hover .el-dialog__close {
            color: #fff;
        }
	}
    
    .el-dialog__footer {
        padding: 10px 20px;
    }
}
.entity-search-wrapper {
    display: inline-block;
    width: 360px;
    margin-right: 10px;
    .input-with-select .el-input-group__prepend {
        background-color: var(--el-fill-color-blank);
    }
}
// .entity-anchor-section {
//     box-sizing: border-box;
//     padding-left: 5px;
//     .search-input-wrapper {
//         border-bottom: 1px solid #e4e7ed;
//         box-sizing: border-box;
//     }
//     .entity-anchor-item {
//         padding: 4px 0;
//         color: #909399;
//         cursor: pointer;
//         padding-left: 10px;
//         box-sizing: border-box;
//         &:hover {
//             background-color: #f5f7fa;
//         }
//         &.is-active {
//             color: var(--el-color-primary);
//         }
//     }
// }

.table-setting-item-box { 
    .item {
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        position: relative;
        &:hover {
            background: #dedede;
            .action-icon {
                display: block;
            }
        }
    }
}
</style>
