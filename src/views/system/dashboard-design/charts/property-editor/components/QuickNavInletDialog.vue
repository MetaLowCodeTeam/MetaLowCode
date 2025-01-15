<template>
    <mlDialog :title="(pageStatus == 1 ? '新建' : '编辑') + '快捷入口'" v-model="isShow" width="480px" append-to-body>
        <div v-loading="loading">
            <el-tabs v-model="cutMenu.type">
                <el-tab-pane label="关联项" :name="1"></el-tab-pane>
                <el-tab-pane label="外部地址" :name="2"></el-tab-pane>
                <el-tab-pane label="自定义页面" :name="3"></el-tab-pane>
            </el-tabs>
            <!-- 关联项目 -->
            <div v-if="cutMenu.type == 1" class="content-box">
                <el-select
                    v-model="cutMenu.entityCode"
                    filterable
                    placeholder="选择关联项"
                    class="w-100"
                    @change="associationChange"
                    size="default"
                >
                    <el-option-group
                        v-for="group in getGroupEntityList()"
                        :key="group.label"
                        :label="group.label"
                    >
                        <template v-for="(op,inx) of group.options" :key="inx">
                            <el-option :value="op.entityCode" :label="op.label" />
                        </template>
                    </el-option-group>
                </el-select>
            </div>
            <!-- 外部地址 -->
            <div class="content-box" v-if="cutMenu.type == 2">
                <el-input
                    v-model="cutMenu.outLink"
                    placeholder="输入外部地址，例：https://www.baidu.com/"
                    clearable
                    size="default"
                ></el-input>
            </div>
            <!-- 自定义页面 -->
            <div class="content-box" v-if="cutMenu.type == 3">
                <el-select
                    v-model="cutMenu.outLink"
                    filterable
                    placeholder="选择自定义页面"
                    class="w-100"
                    size="default"
                    no-data-text="暂未配置自定义导航"
                >
                    <el-option
                        v-for="(op,inx) of customPageList"
                        :key="inx"
                        :value="op.value"
                        :label="op.label"
                    />
                </el-select>
                <div class="mt-5">
                    <el-checkbox v-model="cutMenu.pcShow" size="default">
                        <span style="position: relative;top: 1px;">
                            PC显示
                            <span class="info-text">请确保PC端有该页面</span>
                        </span>
                    </el-checkbox>
                </div>
                <div>
                    <el-checkbox v-model="cutMenu.mobileShow" size="default">
                        <span style="position: relative;top: 1px;">
                            移动端显示
                            <span class="info-text">请确保移动端端有该页面</span>
                        </span>
                    </el-checkbox>
                </div>
            </div>
            <!-- 入口名称 -->
            <div class="mt-10 content-box">
                <el-input
                    v-model="cutMenu.name"
                    placeholder="入口名称"
                    class="ml-el-select-input"
                    clearable
                    size="default"
                >
                    <template #prepend>
                        <span class="select-icon-span" title="选择图标" @click="openSelectIconDialog">
                            <el-icon class="icon" v-if="!cutMenu.useIcon">
                                <SetUp />
                            </el-icon>
                            <el-icon class="icon" v-else :color="cutMenu.iconColor">
                                <component :is="cutMenu.useIcon" />
                            </el-icon>
                        </span>
                    </template>
                </el-input>
            </div>
            <!-- 入口打开方式 -->
            <div class="mt-10 content-box">
                <el-radio-group v-model="cutMenu.openType">
                    <el-radio :value="0">
                        <span class="radio-span">
                            新窗口打开
                            <el-tooltip
                                class="item"
                                effect="dark"
                                content="仅在电脑端生效，移动端为当前页面打开"
                                placement="top"
                            >
                                <span style="position: relative;top: 2px;">
                                    <el-icon>
                                        <QuestionFilled />
                                    </el-icon>
                                </span>
                            </el-tooltip>
                        </span>
                    </el-radio>
                    <el-radio :value="1">
                        <span class="radio-span">当前页面打开</span>
                    </el-radio>
                </el-radio-group>
            </div>
        </div>
        <template #footer>
            <div class="footer-div">
                <el-button @click="isShow = false" :loading="loading" size="default">取消</el-button>
                <el-button type="primary" @click="layoutSave" :loading="loading" size="default">保存</el-button>
            </div>
        </template>
    </mlDialog>
    <mlSelectIcon v-model="isShowIconDialog" :useIcon="cutMenuIcon" @confirmIcon="selectIcon" />
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
// 获取实体Store
import useCommonStore from "@/store/modules/common";
import useLayoutConfigStore from "@/store/modules/layoutConfig";

// 选择图标组件
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

const Router = useRouter();

// 取所有实体
const { unSystemEntityList } = storeToRefs(useCommonStore());
// 取所有路由
const { getNavigationApi } = useLayoutConfigStore();
const emit = defineEmits(["onConfirm"]);

let isShow = ref(false);

/**
 * 初始数据
 */
let loading = ref(false);
// 页面状态 1新建 2编辑
let pageStatus = ref(1);
// 当前操作菜单
let cutMenu = ref({});

// 已存在的实体集
let hasEntityList = ref([]);
// 自定义页面路由
let customPageList = ref([]);

// 默认入口
const DefaultMenu = {
    // 菜单名称
    name: "未命名",
    // 1 关联性  2 外部地址 3 自定义页面
    type: 1,
    // 关联项
    entityCode: null,
    // 外部地址、自定义页面、系统页面
    outLink: "",
    // 0 外部打开 1 当前页面打开
    openType: 0,
    // key
    guid: "",
    // 使用图标
    useIcon: "",
    // 图标颜色
    iconColor: "",
    // PC显示
    pcShow: true,
    // 移动端显示
    mobileShow: false,
};

// 打开数据弹框
const openDialog = async (status, cut, list) => {
    cutMenu.value = cut ? cloneDeep(cut) : cloneDeep(DefaultMenu);
    hasEntityList.value = cloneDeep(list);
    pageStatus.value = status;
    isShow.value = true;
    loading.value = true;

    await getNavigationApi();
    // 加载自定义列表
    loadCustomPageList();
    loading.value = false;
};
// 加载自定义列表
const loadCustomPageList = () => {
    const { getAllNav } = useLayoutConfigStore();
    customPageList.value = [];
    let nav = getAllNav();
    const processSubElements = (elements, layoutConfigId) => {
        elements.forEach(el => {
            if (el.type == 3) {
                customPageList.value.push({
                    label: el.name + '(' + el.outLink + ')',
                    value: el.outLink,
                    navigationId: layoutConfigId
                });
            }
            if (el.children) {
                processSubElements(el.children, layoutConfigId); // 递归处理子元素
            }
        });
    };
    nav.forEach(el => { 
        try {
            let config = JSON.parse(el.config);
            processSubElements(config, el.layoutConfigId); // 处理当前元素的配置
        } catch (error) {
            console.error("解析配置出错:", error); // 错误处理
        }
    });
};

// 实体分组
const getGroupEntityList = () => {
    let systemOptions = [
        // {
        //     label: "部门用户",
        //     entityCode: 22,
        //     name: "Department",
        // },
        // {
        //     label: "权限角色",
        //     entityCode: 23,
        //     name: "Role",
        // },
        // {
        //     label: "团队",
        //     entityCode: 24,
        //     name: "Team",
        // },
        // {
        //     label: "跟进",
        //     entityCode: 54,
        //     name: "FollowUp",
        // },
        // {
        //     label: "待办",
        //     entityCode: 55,
        //     name: "TodoTask",
        // },
    ];
    let newEntityList = [
        {
            label: "自定义实体",
            options: [...getEntityList()],
        },
        // {
        //     label: "系统内置",
        //     options: [...systemOptions],
        // },
        // {
        //     label: "审批流程",
        //     options: [
        //         {
        //             label: "待我处理",
        //             name: "approvalHandle",
        //             entityCode: "approvalHandle",
        //         },
        //         {
        //             label: "我提交的",
        //             name: "approvalSubmit",
        //             entityCode: "approvalSubmit",
        //         },
        //         {
        //             label: "抄送我的",
        //             name: "capprovalCc",
        //             entityCode: "capprovalCc",
        //         },
        //     ],
        // },
    ];
    return newEntityList;
};

// 格式化实体
const getEntityList = () => {
    return unSystemEntityList.value.filter((el) => !el.detailEntityFlag && el.appAbbr == Router.currentRoute.value.query.appAbbr);
};

// 选择实体触发
const associationChange = (entityCode) => {
    let linkEntity;
    for (let index = 0; index < getGroupEntityList().length; index++) {
        const element = getGroupEntityList()[index];
        for (let j = 0; j < element.options.length; j++) {
            const subEl = element.options[j];
            if (subEl.entityCode == entityCode) {
                linkEntity = subEl;
                continue;
            }
        }
    }
    cutMenu.value.isSystemEntity = false;
    cutMenu.value.name = linkEntity.label;
    cutMenu.value.entityCode = linkEntity.entityCode;
    cutMenu.value.entityName = linkEntity.name;
};


/**
 * 图标弹框
 */

let isShowIconDialog = ref(false);
// 当前菜单ICON
let cutMenuIcon = ref({});

// 打开选择图标弹框
const openSelectIconDialog = () => {
    isShowIconDialog.value = true;
    cutMenuIcon.value = {
        name: cutMenu.value.useIcon,
        color: cutMenu.value.iconColor || "",
    };
};

// 选择图标
const selectIcon = ({ name, color }) => {
    cutMenu.value.useIcon = name;
    cutMenu.value.iconColor = color;
    isShowIconDialog.value = false;
};

/**
 * 最终保存
 */
// 系统内置
const SystemEntityName = [
    "Department",
    "Role",
    "Team",
    "approvalHandle",
    "approvalSubmit",
    "capprovalCc",
];
const SystemEntityPath = {
    Department: "entity-user",
    Role: "entity-role",
    Team: "entity-team",
    approvalHandle: "approval-handle",
    approvalSubmit: "approval-submit",
    capprovalCc: "approval-cc",
};

// 弹框保存
const layoutSave = () => {
    let { type, entityCode, entityName, outLink, guid } = cutMenu.value;

    // 验证关联项
    if (type == 1 && !entityCode) {
        ElMessage.warning("请选择关联项");
        return;
    }

    // 处理系统内置逻辑
    handleSystemEntity(type, entityName);

    // 验证外部地址或自定义页面
    if (!validateOutLink(type, outLink)) return;

    // 处理新建或编辑逻辑
    if (!guid) {
        createNewEntry();
    } else {
        updateExistingEntry(guid);
    }

    emit("onConfirm", hasEntityList.value);
    isShow.value = false;
};

// 处理系统内置逻辑
const handleSystemEntity = (type, entityName) => {
    if (type == 1 && SystemEntityName.includes(entityName)) {
        cutMenu.value.isSystemEntity = true;
        cutMenu.value.outLink = SystemEntityPath[cutMenu.value.entityName];
    }
};

// 验证外部地址或自定义页面
const validateOutLink = (type, outLink) => {
    if (type == 2 || type == 3) {
        if (!outLink) {
            ElMessage.warning(type == 2 ? "请输入外部地址" : "请选择自定义页面");
            return false;
        }
        cutMenu.value.entityCode = "";
        cutMenu.value.entityName = "";
        if (type == 3) {
            cutMenu.value.navigationId = customPageList.value.find(el => outLink == el.value)?.navigationId;
        }
    }
    return true;
};

// 创建新条目
const createNewEntry = () => {
    cutMenu.value.guid = getGuid();
    hasEntityList.value.push(cutMenu.value);
};

// 更新现有条目
const updateExistingEntry = (guid) => {
    hasEntityList.value.forEach((el, inx) => {
        if (el.guid == guid) {
            hasEntityList.value[inx] = cloneDeep(cutMenu.value);
        }
    });
};

/**
 * 方法
 */
// 复制
const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data));
};
// gudie
const getGuid = () => {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * 导出
 */

defineExpose({
    openDialog,
});
</script>

<style lang="scss" scoped>
.content-box {
    box-sizing: border-box;
    padding: 0 8px;
}
.select-icon-span {
    // padding: 0 10px;
    // background: #fff;
    border-radius: 4px 0 0 4px;
    cursor: pointer;
    position: relative;
    width: 30px;
    height: 32px;
    .icon {
        font-size: 18px;
        position: absolute;
        left: 6px;
        top: 7px;
        // color: #404040;
    }
    &:hover {
        background: #eeeeee;
    }
}
.radio-span {
    font-size: 13px;
    position: relative;
}
</style>
