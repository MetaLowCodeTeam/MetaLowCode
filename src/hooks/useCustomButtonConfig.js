import { ref } from "vue";
import { getGuid } from "@/utils/util";
import { getTransformMap } from "@/api/transform";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import http from "@/utils/request";
import { checkTables } from "@/api/layoutConfig";
export default function useCustomButtonConfig() {
    const config = {
        // 按钮类型
        buttonTypeList: [
            { label: "默认", value: "default" },
            { label: "主要", value: "primary" },
            { label: "成功", value: "success" },
            { label: "警告", value: "warning" },
            { label: "危险", value: "danger" },
            { label: "信息", value: "info" },
            // { label: "自定义", value: "custom" },
        ],
        // 显示类型
        showTypeList: [
            { label: "默认", value: 1 },
            { label: "仅图标", value: 2 },
            { label: "仅文字", value: 3 },
        ],
        // 选择动作
        actionList: [
            { label: "新建", value: 1 },
            { label: "编辑", value: 2 },
            { label: "基于选中新建", value: 3 },
            { label: "自定义", value: 4 },
        ],
        // 可用类型
        availableTypeList: [
            { label: "勾选一条数据", value: 1 },
            { label: "勾选多条数据", value: 2 },
        ],
        // 默认自定义按钮配置
        defaultButtonConfig: {
            // 按钮名称
            name: "",
            // 按钮图标
            icon: "",
            // 按钮图标颜色
            iconColor: "",
            // 按钮类型 按钮类型，在设置color时，后者优先。
            type: "default",
            // 按钮颜色
            color: "",
            // 按钮尺寸
            size: "",
            // 按钮显示类型 1默认 2仅图标 3仅文字
            showType: 1,
            // 显示位置
            showPosition: 1,
            // 可用类型
            availableType: 1,
            // 执行动作
            action: 1,
            // 选择实体
            selectEntity: "",
            // 选择表单
            selectForm: "",
            // 选择数据转换
            selectDataTransform: "",
            // 自定义权限
            customCode: "",
            // 权限取反
            reversalCustomCode: false,
            // 过滤条件
            filterJson: {},
            // 不满足条件时的提示文案
            errorTipText: "",
            // 不满足条件时显示方式 1禁用 2隐藏
            errorShowType: 1,
            // 执行脚本
            customScript: "",
            // 前置事件
            beforeEvent: "",
            // 完成回调
            afterEvent: "",
            // guid
            guid: "",
            // 子集按钮
            subButtonList: null,
        },
    };

    // 默认顶部按钮PC
    const defaultPcTopButtonList = [
        {
            defaultName: "打开",
            name: "",
            key: "open",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Notification",
            showType: 1,
            type: "default",
        },
        {
            defaultName: "批量编辑",
            name: "",
            key: "batchEdit",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "ElIconEdit",
            showType: 1,
            type: "default",
        },
        {
            defaultName: "编辑",
            name: "",
            key: "edit",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Edit",
            showType: 1,
            type: "default",
        },
        {
            defaultName: "新建",
            name: "",
            key: "new",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Plus",
            type: "primary",
            showType: 1,
        },
        {
            defaultName: "更多",
            name: "",
            key: "more",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            type: "default",
        },
    ];

    // 默认操作列按钮PC
    const defaultPcColumnButtonList = [
        {
            defaultName: "编辑",
            name: "",
            key: "edit",
            hide: false,
            hideTip: "如果本身没有编辑权限即便设置显示也会隐藏",
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Edit",
            showType: 1,
            type: "primary",
        },
        {
            defaultName: "查看",
            name: "",
            key: "open",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "",
            showType: 1,
            type: "primary",
        },
    ];

    // 默认编辑按钮PC
    const defaultPcEditButtonList = [
        {
            defaultName: "取消",
            name: "",
            key: "cancel",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "",
            showType: 1,
            type: "default"
        },
        {
            defaultName: "保存",
            name: "",
            key: "save",
            hide: false,
            hideTip: "如果本身是审批状态会隐藏",
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Select",
            showType: 1,
            type: "primary"
        },
        {
            defaultName: "保存并刷新",
            name: "",
            key: "saveRefresh",
            hide: false,
            hideTip: "如果本身是审批状态会隐藏",
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Refresh",
            showType: 1,
            type: "primary"
        },
        {
            defaultName: "保存并提交",
            name: "",
            key: "saveSubmit",
            hide: false,
            hideTip: "如果本身没有审批流程且是审批状态会隐藏",
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "SetUp",
            showType: 1,
            type: "primary"
        },
    ];

    // 默认详情按钮pc
    const defaultPcDetailButtonList = [
        {
            defaultName: "新建相关",
            name: "",
            key: "newRelated",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Plus",
            showType: 1,
            type: "primary",
        },
        {
            defaultName: "编辑",
            name: "",
            key: "edit",
            hide: false,
            hideTip: "如果本身没有编辑权限即便设置显示也会隐藏",
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Edit",
            showType: 1,
            type: "primary",
        },
        {
            defaultName: "修改历史",
            name: "",
            key: "history",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Clock",
            showType: 1,
            type: "primary",
        },
        {
            defaultName: "更多",
            name: "",
            key: "more",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            type: "primary",
        },
    ];

    // 默认详情APP
    const defaultAppDetailButtonList = [
        {
            defaultName: "新建相关",
            name: "",
            key: "newRelated",
            hide: false,
            hideTip: "如果PC没有配置过新建相关页签，则APP不显示",
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "",
            showType: 1,
            type: "primary",
        },
        {
            defaultName: "编辑",
            name: "",
            key: "edit",
            hide: false,
            hideTip: "如果本身没有编辑权限即便设置显示也会隐藏",
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "EditPen",
            type: "primary",
        },
        {
            defaultName: "更多操作",
            name: "",
            key: "more",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            type: "primary",
        },
    ]

    // 自定义按钮页签
    const tabList = ref([
        {
            label: "顶部(PC)",
            name: "pcTop",
            buttonList: [],
        },
        {
            label: "操作列(PC)",
            name: "pcColumn",
            buttonList: [],
        },
        {
            label: "编辑弹框(PC)",
            name: "pcEdit",
            buttonList: [],
        },
        {
            label: "详情弹框(PC)",
            name: "pcDetail",
            buttonList: [],
        },
        {
            label: "底部(Mobile)",
            name: "appList",
            buttonList: [],
        },
        {
            label: "详情底部(Mobile)",
            name: "appDetail",
            buttonList: [],
        },
    ]);

    // 当前自定义按钮后置事件
    let currentCustomButtonAfterEvent = ref(null);
    let multipleSelection = ref();
    let refExposed = ref();
    let currentRouter = ref(null);
    // 自定义按钮处理
    const customButtonHandler = async (
        // 按钮自己
        el, 
        // 当前数据
        rows, 
        // 当前组件导出的方法
        exposed, 
        // 当前数据Id
        recordId, 
        // 当前组件Loading
        loading, 
        // 新建回调
        addCb, 
        // 编辑回调
        editCb, 
        // 基于选中新建回调
        recordAddCb,
        // 路由
        router
    ) => {
        multipleSelection.value = rows;
        refExposed.value = exposed;
        currentRouter.value = router;
        if (el.beforeEvent) {
            let beforeEventResult; // 用于存储 beforeEvent 的最终结果
            let hasError = false;   // 标志是否发生错误
            try {
                // 捕获 customButtonEvent 函数调用本身可能抛出的同步错误
                const rawResult = customButtonEvent(el.beforeEvent);
    
                // 判断是否为 Promise
                if (rawResult instanceof Promise) {
                    // 等待 Promise 完成，并捕获 Promise 拒绝（rejected）的错误
                    beforeEventResult = await rawResult;
                } else {
                    // 如果是同步值
                    beforeEventResult = rawResult;
                }
            } catch (error) {
                // 捕获了同步错误（如 ReferenceError）或 Promise 拒绝的错误
                console.error("beforeEvent 函数执行或 Promise 拒绝时发生错误:", error);
                hasError = true; // 标记发生错误
                // 发生错误时，通常也应该中断后续操作
                return;
            }
    
            // 只有当没有发生错误时，才进行结果判断
            if (!hasError) {
                // 统一判断：只有当 beforeEventResult 严格等于 false 时才中断
                if (beforeEventResult === false) {
                    console.log("beforeEvent 返回 false，中断执行。");
                    return;
                }
            }
        }
        if (el.afterEvent) {
            currentCustomButtonAfterEvent.value = el.afterEvent;
        }
        let checkAuth = true;
        // 如果不是新建，并且有过滤条件，则需要检查过滤条件
        if (el.action !== 1 && el.filterJson?.items?.length > 0) {
            loading.value = true;
            let tabRes = await checkTables([el.filterJson], recordId);
            if (tabRes) {
                checkAuth = !!tabRes.data[0];
                loading.value = false;
            }else {
                loading.value = false;
                return
            }
        }
        if (!checkAuth) {
            ElMessage.error(el.errorTipText || "选择数据不符合条件，无法使用该功能。");
            return;
        }
        switch (el.action) {
            case 1:
                addCb({
                    entityName: el.selectEntity,
                    formId: el.selectForm
                })
                break;
            case 2:
                editCb(multipleSelection.value[0], el.selectForm);
                break;
            case 3:
                loading.value = true;
                let transformId = el.selectDataTransform;
                let res = await getTransformMap({ recordId, transformId });
                if (res && res.code == 200) {
                    recordAddCb({
                        entityName: el.selectEntity,
                        formId: el.selectForm,
                        localDsv: {
                            backfillFormData: res.data,
                        }
                    })
                }
                loading.value = false;
                break;
            case 4:
                customButtonEvent(el.customScript);
                break;
        }
    }

    // 封装自定义按钮事件
    const customButtonEvent = (eventStr) => {
        let customParam = {
            rows: multipleSelection.value,
            refExposed: refExposed.value,
            elementEvent: {
                ElMessageBox,
                ElLoading,
                ElMessage
            },
            http,
            router:currentRouter.value,
            appPath: import.meta.env.VITE_APP_PATH,
        };
        let event = new Function('rows', 'exposed', eventStr)(customParam.rows, customParam);
        return event;
    }
    // 调用后置事件
    const customButtonAfterEventCb = () =>  {
        if(currentCustomButtonAfterEvent.value) {
            customButtonEvent(currentCustomButtonAfterEvent.value);
            currentCustomButtonAfterEvent.value = null;
        }
    }

    // 获取自定义按钮
    const getCustomAppButtons = (CUSTOM_BUTTON, key) => {
        let customAppButtons = [];
        if (CUSTOM_BUTTON && CUSTOM_BUTTON.config) {
            try {
                const configObj = JSON.parse(CUSTOM_BUTTON.config);
                customAppButtons = configObj?.[key] ?? [];
            } catch (e) {
                console.error("解析 CUSTOM_BUTTON.config 失败:", e);
                customAppButtons = [];
            }
        }
        return customAppButtons;
    }

    return {
        ...config,
        defaultPcTopButtonList,
        defaultPcColumnButtonList,
        tabList,
        defaultPcDetailButtonList,
        defaultAppDetailButtonList,
        defaultPcEditButtonList,
        getCustomAppButtons,
        customButtonHandler,
        customButtonAfterEventCb,
    };
}