<template>
    <!--  -->
    <div class="step" v-loading="loading">
        <el-form label-width="120px">
            <el-form-item label="设置字段映射">
                <div class="table-box pl-20">
                    <el-table :data="tableData" style="width: 100%">
                        <el-table-column label="数据列" width="240" show-overflow-tooltip>
                            <template #default="scope">
                                <div class="raw-value text-ellipsis">
                                    <em class="row-inx">{{ scope.row.rowInx }}</em>
                                    <span>{{ scope.row.rawValue }}</span>
                                    <span class="row-icon">
                                        <el-icon size="16">
                                            <ElIconRight />
                                        </el-icon>
                                    </span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="导入到字段">
                            <template #default="scope">
                                <el-select
                                    v-model="scope.row.useFileds"
                                    placeholder="无"
                                    style="width: 50%;"
                                >
                                    <el-option
                                        :label="op.fieldLabel + (!op.isNullable ? '[必填]':'')"
                                        :value="op.fieldName"
                                        v-for="(op,inx) of scope.row.fields"
                                        :key="inx"
                                        filterable
                                    />
                                </el-select>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="w-100 mt-20 pl-20">
                    <el-button type="primary" style="width: 80px;" @click="begImport">开始导入</el-button>
                    <span class="ml-20 ml-a-span" @click="goBack">返回上一步</span>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { ElMessageBox } from "element-plus";
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const props = defineProps({
    modelValue: null,
});
const emits = defineEmits(["update:modelValue", "goBack", "importSuccess"]);
let loading = ref(false);
let fromData = ref({});
let tableData = ref([]);
onMounted(() => {
    fromData.value = props.modelValue;
    // 格式化表格数据
    formatTableData();
});

const begImport = async () => {
    let filterList = tableData.value.filter((el) => el.useFileds);
    let fieldsMapping = {};
    filterList.forEach((el) => {
        fieldsMapping[el.useFileds] = el.columnNo;
    });
    emits("update:modelValue", fromData.value);
    let param = { ...fromData.value };
    delete param.columns;
    delete param.fields;
    delete param.originalFilename;

    param.fieldsMapping = { ...fieldsMapping };
    param.owningUser = getUserId(fromData.value.owningUser);
    let filterMandatory = fromData.value.importFields.filter(el=> !el.isNullable);
    for (let index = 0; index < filterMandatory.length; index++) {
        const el = filterMandatory[index];
        if(!param.fieldsMapping.hasOwnProperty(el.fieldName)){
            $ElMessage.warning(el.fieldLabel + "为必填字段，请选择")
            return
        }
    }
    ElMessageBox.confirm(
        "请再次确认导入选项和字段映射。开始导入吗？",
        "提示：",
        {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
        }
    )
        .then(async () => {
            let res = await await $API.upload.begImport(param);
            loading.value = true;
            if (res) {
                emits("importSuccess", res.data);
            } 
            loading.value = false;
        })
        .catch(() => {});
    // let res = await $API.
};

// 获取用户ID
const getUserId = (users) => {
    if (users && users.length > 0) {
        return users[0].id;
    }
    return null;
};

// 返回上一步
const goBack = () => {
    emits("goBack");
};

// 格式化表格数据
const formatTableData = () => {
    let { columns ,fields} = fromData.value;
    let formatList = [];
    columns.forEach((el, inx) => {
        formatList.push({
            rawValue: el.rawValue,
            rowInx: createCellPos(inx),
            fields: fromData.value.importFields,
            useFileds: "",
            columnNo: el.columnNo,
        });
    });
    formatList.forEach(el=>{
        fields.forEach(subEl => {
            if(el.rawValue == subEl.fieldLabel){
                el.useFileds = subEl.fieldName
            }
        })
    })
    tableData.value = [...formatList];
};
// 格式化索引
const createCellPos = (n) => {
    var ordA = "A".charCodeAt(0);
    var ordZ = "Z".charCodeAt(0);
    var len = ordZ - ordA + 1;
    var s = "";
    while (n >= 0) {
        s = String.fromCharCode((n % len) + ordA) + s;

        n = Math.floor(n / len) - 1;
    }
    return s;
};
</script>
<style lang='scss' scoped>
.step {
    box-sizing: border-box;
    .table-box {
        width: 50%;
    }
}
.el-table {
    font-size: 14px;
    .raw-value {
        position: relative;
        padding-right: 16px;
        .row-inx {
            font-style: normal;
            background-color: #eee;
            display: inline-block;
            min-width: 30px;
            font-size: 12px;
            text-align: center;
            margin-right: 4px;
            padding-top: 1px;
            color: #777;
        }
        .row-icon {
            position: absolute;
            right: 0;
            top: 4px;
        }
    }
}
</style>