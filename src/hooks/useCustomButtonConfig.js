import { ref } from "vue";
import { getGuid } from "@/utils/util";
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
            // { label: "自定义", value: 4 },
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

    const tabList = ref([
        {
            label: "顶部(PC)",
            name: "pcTop",
            buttonList: [],
        },
        // {
        //     label: "操作列(PC)",
        //     name: "pcColumn",
        //     buttonList: [],
        // },
        // {
        //     label: "详情(PC)",
        //     name: "pcDetial",
        //     buttonList: [],
        // },
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

    return {
        ...config,
        defaultPcTopButtonList,
        tabList,
    };
}