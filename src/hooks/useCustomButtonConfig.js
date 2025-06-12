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
            name: "打开",
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
            name: "批量编辑",
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
            name: "编辑",
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
            name: "新建",
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
            name: "更多",
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
            name: "编辑",
            key: "edit",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Edit",
            showType: 1,
            type: "primary",
        },
        {
            name: "查看",
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

    // 默认详情按钮pc
    const defaultPcDetialButtonList = [
        {
            name: "新建相关",
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
            name: "编辑",
            key: "edit",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            icon: "Edit",
            showType: 1,
            type: "primary",
        },
        {
            name: "修改历史",
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
            name: "更多",
            key: "more",
            hide: false,
            // 是否内置按钮
            isNative: true,
            guid: getGuid(),
            type: "primary",
        },
    ];

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
            label: "详情(PC)",
            name: "pcDetial",
            buttonList: [],
        },
        {
            label: "底部(APP)",
            name: "appList",
            buttonList: [],
        },
        // {
        //     label: "详情底部(APP)",
        //     name: "appDetial",
        //     buttonList: [],
        // },
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
            let beforeEvent = customButtonEvent(el.beforeEvent);
            // 判断是否为 Promise
            if (beforeEvent instanceof Promise) {
                const asyncResult = await beforeEvent;
                if (!asyncResult) {
                    return;
                }
            } else if (!beforeEvent) {
                return;
            }
        }
        if (el.afterEvent) {
            currentCustomButtonAfterEvent.value = el.afterEvent;
        }
        let checkAuth = true;

        if (el.action !== 1 && el.filterJson?.items?.length > 0) {
            loading.value = true;
            let tabRes = await checkTables([el.filterJson], recordId);
            if (tabRes) {
                checkAuth = !!tabRes.data[0];
            }
            loading.value = false;
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
                editCb(multipleSelection.value[0]);
                break;
            case 3:
                loading.value = true;
                let transformId = el.selectDataTransform;
                let res = await getTransformMap({ recordId, transformId });
                console.log(el,'el')
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

    return {
        ...config,
        defaultPcTopButtonList,
        defaultPcColumnButtonList,
        tabList,
        defaultPcDetialButtonList,
        customButtonHandler,
        customButtonAfterEventCb,
    };
}