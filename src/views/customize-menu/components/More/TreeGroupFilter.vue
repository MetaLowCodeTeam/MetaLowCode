<template>
    <!--  -->
    <ml-dialog title="树状分组筛选设置" v-model="isShow" append-to-body width="500">
        <div v-loading="loading">
            <div class="header-box">
                <el-button type="primary" @click="addGroup">新增筛选层级</el-button>
            </div>
            <el-card class="box-card" shadow="never" v-if="groupList.length > 0">
                <div
                    class="item-group"
                    v-for="(item,inx) of groupList"
                    :key="inx"
                    :class="['select-' + inx]"
                >
                    <el-select
                        v-model="item.fieldGroup"
                        placeholder="选择分组字段（多选）"
                        multiple
                        clearable
                        :class="['box-select', item.error ? 'is-error' : '']"
                        @focus="item.error = false"
                    >
                        <el-option
                            v-for="item in fieldList"
                            :key="item.name"
                            :label="item.label"
                            :value="item.name"
                        />
                    </el-select>
                    <span class="del-group" @click="delGroup(inx)">
                        <el-icon>
                            <ElIconCloseBold />
                        </el-icon>
                    </span>
                </div>
            </el-card>
            <div class="footer-box">
                <el-button style="width: 70px;">取消</el-button>
                <el-button style="width: 70px;" type="primary" @click="confirmFieldGroup">确认</el-button>
            </div>
        </div>
    </ml-dialog>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import useCommonStore from "@/store/modules/common";

/**
 * API
 */
import { getFieldSet } from "@/api/system-manager";
import { ElMessage } from "element-plus";

const { queryEntityNameByCode } = useCommonStore();
const props = defineProps({
    modelValue: null,
    entityCode: { type: Number },
});

const emits = defineEmits(["update:modelValue"]);

let isShow = ref(false);

watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
        loadFields();
    },
    { deep: true }
);

watch(
    () => isShow.value,
    () => {
        emits("update:modelValue", isShow.value);
    },
    { deep: true }
);

onMounted(() => {
    isShow.value = props.modelValue;
    loadFields();
});

/**
 * 加载字段数据
 */
let loading = ref(false);
let entityName = ref("");
// 所有字段
let fieldList = ref([]);

// 加载字段
const loadFields = async () => {
    // 弹框显示才调接口
    if (!isShow.value) {
        return;
    }
    entityName.value = queryEntityNameByCode(props.entityCode);
    loading.value = true;
    let res = await getFieldSet(entityName.value);
    if (res && res.code == 200) {
        // 这些类型无法选择
        let needType = [
            // 引用
            "Reference",
            // 布尔
            "Boolean",
            // 整数
            "Integer",
            // 精度小数
            "Decimal",
            // 百分比
            "Percent",
            // 金额
            "Money",
            // 文本
            "Text",
            // 单选项
            "Option",
            // 多选项
            "Tag",
            // 地区选择
            "AreaSelect",
            // 时间
            "Date",
        ];
        fieldList.value = res.data.filter((el) => needType.includes(el.type));
        console.log(fieldList.value, "可选字段");
    }
    loading.value = false;
};

/**
 * 分组数据
 */
let groupList = ref([]);

// 新建分组
const addGroup = () => {
    if (groupList.value.length < 5) {
        groupList.value.push({
            fieldGroup: [],
            error: false,
        });
    } else {
        ElMessage.warning("最多可添加5个层级");
    }
};

// 删除分组
const delGroup = (inx) => {
    groupList.value.splice(inx, 1);
};

// 确认字段分组
const confirmFieldGroup = () => {
    if (groupList.value.length < 1) {
        ElMessage.error("还未新增筛选层级");
        return;
    }
    for (let index = 0; index < groupList.value.length; index++) {
        const element = groupList.value[index];
        if (element.fieldGroup.length < 1) {
            element.error = true;
            ElMessage.error("该层级还未选择分组字段");
            return;
        }
    }
    // console.log(groupList.value);
};
</script>
<style lang='scss' scoped>
.header-box {
    margin-top: -10px;
}
.box-card {
    margin-top: 10px;
    .item-group {
        margin-bottom: 10px;
        &:last-child {
            margin-bottom: 0;
        }
        &.select-1 {
            padding-left: 5px;
        }
        &.select-2 {
            padding-left: 10px;
        }
        &.select-3 {
            padding-left: 15px;
        }
        &.select-4 {
            padding-left: 20px;
        }
    }
    .box-select {
        width: calc(100% - 32px);
    }
    .del-group {
        width: 30px;
        height: 30px;
        line-height: 30px;
        float: right;
        margin-top: 1px;
        text-align: center;
        font-size: 18px;
        border-radius: 4px;
        padding-top: 2px;
        box-sizing: border-box;
        cursor: pointer;
        &:hover {
            background: #f2f6fc;
        }
    }
}
.footer-box {
    margin-top: 10px;
    text-align: right;
}
</style>