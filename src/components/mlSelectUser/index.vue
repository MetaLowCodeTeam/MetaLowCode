<!--
 * @Descripttion: 用户选择器组件
 * @version: 1.0
 * @Author: 邪七
 * @Date: 2023年6月28日11:30:05
 * @LastEditors: 邪七
 * @LastEditTime: 2023年6月28日11:30:56
-->
<template>
    <el-select
        ref="selectRefs"
        v-model="defaultValue"
        :size="size"
        :clearable="clearable"
        multiple
        :collapse-tags="collapseTags"
        :collapse-tags-tooltip="collapseTagsTooltip"
        :filterable="filterable"
        :placeholder="placeholder"
        :disabled="disabled"
        :filter-method="filterMethod"
        @remove-tag="removeTag"
        @visible-change="visibleChange"
        @clear="clear"
        :style="{'width': cardWidth}"
        class="ml-select-user"
    >
        <template #empty>
            <div class="mlselect-user-content" v-loading="loading">
                <el-row :gutter="20" class="mb-10">
                    <el-col :span="19">
                        <el-input
                            placeholder="请输入关键词搜索"
                            v-model="keyword"
                            clearable
                            @clear="getData"
                            @keyup.enter="getData"
                        ></el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary" @click="getData">查询</el-button>
                    </el-col>
                </el-row>
                <div class="mb-10">
                    <el-tabs
                        type="border-card"
                        class="mlselect-user-tabs"
                        v-model="cutTabCode"
                        @tab-change="getData"
                        v-if="tabList.length > 1"
                    >
                        <el-tab-pane
                            :name="tab.name"
                            :label="tab.label"
                            v-for="(tab,inx) of tabList"
                            :key="inx"
                        >
                            <!-- <div class="tab-item-title">
                                <div class="tab-item-check-box">
                                    <el-checkbox v-model="tab.isChecked" @change="checkTab(tab)"></el-checkbox>
                                </div>
                                <div class="tab-item-title-text">
                                    {{ tab.label }}名称
                                </div>
                            </div> -->
                            <div class="item-li-box">
                                <div
                                    class="tab-item-li"
                                    v-for="(item,itemInx) of tabData"
                                    :key="itemInx"
                                    @click="selectUser(item,tab)"
                                >
                                    {{ item[tab.itemName] }}
                                    <div class="tab-item-icon fr" v-if="item.isActive">
                                        <el-icon class="tab-item-icon-el">
                                            <ElIconSelect />
                                        </el-icon>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <div class="mlselect-tab item-li-box" v-else>
                        <div
                            class="tab-item-li"
                            v-for="(item,itemInx) of tabData"
                            :key="itemInx"
                            @click="selectUser(item,cutTabItem)"
                        >
                            {{ item[cutTabItem.itemName] }}
                            <div class="tab-item-icon fr" v-if="item.isActive">
                                <el-icon class="tab-item-icon-el">
                                    <ElIconSelect />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </el-select>
</template>

<script setup>
import { ref, watch, onMounted, inject, nextTick, reactive } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
const api = inject("$API");
const cloneDeep = inject("$CloneDeep");
const props = defineProps({
    modelValue: null,
    cardWidth: { type: String, default: "100%" },
    size: { type: String, default: "default" },
    clearable: { type: Boolean, default: false },
    placeholder: { type: String, default: "请选择" },
    multiple: { type: Boolean, default: false },
    filterable: { type: Boolean, default: false },
    collapseTags: { type: Boolean, default: false },
    collapseTagsTooltip: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: "all" },
    // 过滤条件
    filter: { 
        type: Object, 
            default: {
            User: {
                // 过滤对象，同listQuery fitler
                filter: null,
                // 过滤SQL， 同listQuery fitlerSql
                filterEasySql: null,
                // 过滤示例
                // filterEasySql: 'userName like "%006%"',
            },
            Role: {},
            Department: {},
            Team: {},
            JobPosition: {},
        } 
    }
});



const emit = defineEmits(["change", "update:modelValue"]);
// 加载状态
let loading = ref(false);
// 默认数据
let defaultValue = ref([]);
// 搜索值
let keyword = ref("");
// 页签
let tabConfig = ref([
    {
        label: "用户",
        name: "User",
        itemId: "userId",
        itemName: "userName",
    },
    {
        label: "角色",
        name: "Role",
        itemId: "roleId",
        itemName: "roleName",
    },
    {
        label: "部门",
        name: "Department",
        itemId: "departmentId",
        itemName: "departmentName",
    },
    {
        label: "团队",
        name: "Team",
        itemId: "teamId",
        itemName: "teamName",
    },
]);
let tabList = ref([]);
// 页签数据
let tabData = ref([]);
// 当前页签
let cutTabCode = ref("User");
let cutTabItem = reactive({});
watch(
    () => props.modelValue,
    () => {
        initData();
    },
    { deep: true }
);

onMounted(() => {
    if(publicSetting.value.openJobPosition){
        tabConfig.value.push({
            label: "岗位",
            name: "JobPosition",
            itemId: "jobPositionId",
            itemName: "jobTitle",
        });
    }
    initData();
});

// 初始化数据
const initData = () => {
    defaultValue.value = props.modelValue;
    autoCurrentLabel();
    if (props.type === "all") {
        tabList.value = cloneDeep(tabConfig.value);
    } else {
        let types = props.type.split();
        tabList.value = [];
        tabConfig.value.forEach((el) => {
            types.forEach((subEl) => {
                if (el.name == subEl) {
                    tabList.value.push(el);
                }
            });
        });
        cutTabCode.value = tabList.value[0].name;
    }
};

// 获取数据
let getData = async () => {
    loading.value = true;
    // 查询参数
    let param = {
        search: keyword.value,
    };
    // 当前tab
    cutTabItem = tabList.value.filter((el) => cutTabCode.value == el.name)[0];
    // 当前默认选中的IDs
    let cutSelectedIds = defaultValue.value
        ? defaultValue.value.map((el) => el.id)
        : [];
    tabData.value = [];
    // 获取当前tab接口
    let res = await api.common["get" + cutTabCode.value](param, props.filter[cutTabCode.value]);
    if (res) {
        tabData.value = res.data.map((el) => {
            el.isActive = false;
            // 如果该ID已在选中集里，默认选中
            if (cutSelectedIds.includes(el[cutTabItem.itemId])) {
                el.isActive = true;
            }
            return el;
        });
    }
    loading.value = false;
};

let selectRefs = ref("");

// 自动模拟options赋值
let autoCurrentLabel = () => {
 
    nextTick(() => {
        selectRefs.value.states.selected.forEach((item) => {
            item.currentLabel = item.value.name;
        });
    });
};
// 选择用户
let selectUser = (item, tab) => {
    if (!item.isActive) {
        item.isActive = true;
        let value = {
            name: item[tab.itemName],
            id: item[tab.itemId],
        };
        if (props.multiple) {
            defaultValue.value.push(value);
        } else {
            tabData.value.forEach((el) => {
                el.isActive = false;
                if (value.id === el[tab.itemId]) {
                    el.isActive = true;
                }
            });
            defaultValue.value[0] = value;
        }
    } else {
        item.isActive = false;
        defaultValue.value.forEach((el, inx) => {
            if (el.id === item[tab.itemId]) {
                defaultValue.value.splice(inx, 1);
            }
        });
    }
    autoCurrentLabel();
    emit("update:modelValue", defaultValue.value);
    emit("change", defaultValue.value);
};
// 表格显示隐藏回调
let visibleChange = (visible) => {
    if (visible) {
        keyword.value = null;
        getData();
    } else {
        autoCurrentLabel();
    }
};

// tags删除后回调
let removeTag = (item) => {
    let cutTabItem = tabList.value.filter(
        (el) => cutTabCode.value == el.name
    )[0];
    tabData.value.forEach((el) => {
        if (item.id == el[cutTabItem.itemId]) {
            el.isActive = false;
        }
    });
    emit("update:modelValue", defaultValue.value);
};
//清空后的回调
let clear = () => {
    tabData.value.forEach((el) => {
        el.isActive = false;
    });
    emit("update:modelValue", defaultValue.value);
};
// 自定义搜索方法
let filterMethod = (keyword) => {
    if (!keyword) {
        keyword.value = null;
        return false;
    }
    keyword.value = keyword;
    getData();
};
</script>

<style lang="scss" scoped>
.mlselect-user-content {
    padding: 20px;
    .mlselect-tab {
        border: 1px solid #dcdfe6;
    }
    .item-li-box {
        max-height: 300px;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .tab-item-title {
        font-size: 14px;
        box-sizing: border-box;
        display: flex;
        border-bottom: 1px solid #dcdfe6;
        border-top: 1px solid #dcdfe6;
        justify-content: center;
        align-items: center;
        height: 40px;
        background: #f5f7fa;
        .tab-item-check-box {
            width: 50px;
            border-right: 1px solid #dcdfe6;
        }
        .tab-item-title-text {
            flex: 1;
            font-weight: bold;
        }
    }
    .tab-item-li {
        font-size: 14px;
        cursor: pointer;
        line-height: 40px;
        border-bottom: 1px solid #dcdfe6;
        box-sizing: border-box;
        padding: 0 20px;
        &:last-child {
            border-bottom: 0;
        }
        &:hover {
            background: var(--el-color-primary);
            color: #fff;
        }
        .tab-item-icon {
            .tab-item-icon-el {
                position: relative;
                top: 2px;
            }
        }
    }
}
</style>