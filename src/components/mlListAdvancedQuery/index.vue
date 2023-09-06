<template>
    <!--  -->
    <div class="ml-list-advanced-query">
        <el-select ref="selectRefs" v-model="defaultValue">
            <template #empty>
                <div class="select-content">
                    <div
                        class="item"
                        v-for="(op,inx) of opList"
                        :key="inx"
                        @click="changeOp(op)"
                    >{{ op.label }}</div>
                </div>
            </template>
        </el-select>
        <div class="select-filter" @click="showAdvfilter = !showAdvfilter">
            <el-icon class="select-filter-icon" size="16">
                <ElIconFilter />
            </el-icon>
        </div>
        <div class="dropdown-menu-advfilter" :class="{'isShow':showAdvfilter}">
            <div class="conditionConf">
                <mlSetConditions ref='mlSetConditionsRefs' v-model="conditionConf" @confirm="conditionConfirm"/>
            </div>
            <div class="footer-box">
                <el-dropdown
                    split-button
                    type="primary"
                    @click="queryNow"
                    trigger="click"
                    popper-class="advfilter-popper"
                    @command="handleCommand"
                >
                    <el-icon>
                        <ElIconSearch />
                    </el-icon>立即查询
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="save">保存到常量查询</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-button class="ml-10" style="margin-top:-4px;height: 33px;" @click="refresh">
                    <el-icon>
                        <ElIconRefreshLeft />
                    </el-icon>重置
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    watch,
    onMounted,
    inject,
    nextTick,
    reactive,
    onBeforeMount,
    onBeforeUnmount,
} from "vue";
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: null,
});
const emits = defineEmits(["queryNow", "refresh"]);
// 默认选中
let defaultValue = ref("");
// 下拉框元素
let selectRefs = ref("");
// 下拉元素
let opList = ref([
    {
        label: "全部数据",
        value: "all",
    },
]);
// 是否显示高级查询条件
let showAdvfilter = ref(false);
let mlSetConditionsRefs = ref("");
watch(
    () => props.modelValue,
    () => {
        initData();
    },
    { deep: true }
);
onBeforeMount(() => {
    document.addEventListener("click", (e) => {
        let box = document.querySelector(".dropdown-menu-advfilter");
        let box2 = document.querySelector(".select-filter");
        let box3 = document.querySelector(".advfilter-popper");
        if (
            box.contains(e.target) ||
            box2.contains(e.target) ||
            box3.contains(e.target)
        ) {
        } else {
            showAdvfilter.value = false;
        }
    });
});
onBeforeUnmount(() => {
    document.removeEventListener("click", null);
});
onMounted(() => {
    initData();
});

// 初始化数据
const initData = () => {
    autoCurrentLabel(props.modelValue);
};

// 自动模拟options赋值
const autoCurrentLabel = (key) => {
    nextTick(() => {
        let findOp = opList.value.filter((el) => el.value == key);
        defaultValue.value = findOp[0].label;
        // opList.value.forEach((el) => {
        //     if(el.value )
        //     // defaultValue.value = el[key];
        // });
    });
};

const changeOp = (op) => {
    // console.log(,'selectRefs')
    // selectRefs.value.automaticDropdown = true;
    autoCurrentLabel(op.value);
    selectRefs.value.visible = false;
};

/***
 *  ****************************************** 过滤条件相关 beg
 */
// 条件框传值
let conditionConf = ref({
    type: 1,
    items: [],
    equation: "OR",
});

// 初始化条件
const initFilter = (filter) => {
    let { equation } = filter;
    if (!equation || equation === "OR") {
        filter.type = 1;
        filter.equation = "OR";
    } else if (equation === "AND") {
        filter.type = 2;
        filter.equation = "AND";
    } else {
        filter.type = 3;
    }
    return filter;
};

// 当前操作
let cutAction = ref("");

// 高级查询确认
const conditionConfirm = (e) => {
    if(e.items < 1){
        // $M
        $ElMessage.warning("请至少添加 1 个条件")
        return
    }
    console.log(cutAction.value,'cutAction.value')
}

// 立即查询
const queryNow = () => {
    cutAction.value = 'queryNow';
    mlSetConditionsRefs.value.confirm();
};
// 重置
const refresh = () => {
    console.log("refresh");
};
// 保存到常量查询
const handleCommand = (e) => {
    if (e == "save") {
        cutAction.value = 'save';
        mlSetConditionsRefs.value.confirm();
    }
};
</script>
<style lang='scss' scoped>
.ml-list-advanced-query {
    display: inline-block;
    position: relative;
}
.select-content {
    padding: 10px 0;
    font-size: 13px;
    line-height: 34px;
    color: #504e4e;
    .item {
        padding: 0 10px;
        &:hover {
            background: #eeeeee;
        }
    }
}
.select-filter {
    display: inline-block;
    line-height: 30px;
    border: 1px solid #dcdfe6;
    vertical-align: middle;
    border-left: 0;
    width: 30px;
    text-align: center;
    cursor: pointer;
    &:hover {
        border-color: #c0c4cc;
    }
    .select-filter-icon {
        color: #504e4e;
        position: relative;
        top: 4px;
    }
}
.dropdown-menu-advfilter {
    position: absolute;
    top: 47px;
    left: 0;
    background: #fff;
    z-index: 3000;
    // border: 1px solid rgba(0,0,0,.125);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    display: none;
    width: 600px;
    padding: 20px 0;
    padding-bottom: 0;
    line-height: 34px;
    font-size: 14px;
    .conditionConf {
        padding: 0 20px;
        padding-bottom: 10px;
    }
    &.isShow {
        display: block;
    }
    .footer-box {
        border-top: 1px solid #eee;
        padding: 10px 20px 10px 0;
        text-align: right;
    }
}
</style>