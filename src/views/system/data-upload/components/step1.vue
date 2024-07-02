<template>
    <!--  -->
    <div class="step" v-loading="loading">
        <el-form label-width="120px">
            <el-form-item label="选择导入实体">
                <el-select
                    v-model="fromData.mainEntity"
                    placeholder="选择导入实体"
                    style="width: 400px;"
                    filterable
                    @change="changeEntity"
                >
                    <el-option
                        :label="op.label"
                        :value="op.name"
                        v-for="(op,inx) of unSystemEntityList"
                        :key="inx"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="上传数据">
                <div class="w-100">
                    <ml-upload accept=".xls, .xlsx" @on-success="onSuccess" class="ml-upload">
                        <template #trigger>
                            <el-button>
                                <el-icon>
                                    <ElIconUpload />
                                </el-icon>上传文件
                            </el-button>
                        </template>
                    </ml-upload>
                    <span
                        class="file-name-span"
                        v-if="fromData.originalFilename"
                    >{{ fromData.originalFilename }}</span>
                </div>
                <div class="w-100 mt-5">
                    <ul class="upload-ui">
                        <li>有合并单元格的数据请处理过后再上传，否则可能出现表头识别有误</li>
                        <li>系统默认仅识别第一个 SHEET，且会将首行识别为表头</li>
                        <li>
                            主实体与明细实体请分别导入，更多帮助请
                            <a
                                class="ml-a-span"
                                href="https://melecode.com/docs/mlbook/user/user04.html#%E6%95%B0%E6%8D%AE%E5%AF%BC%E5%85%A5"
                                target="_blank"
                            >参考文档</a>
                        </li>
                    </ul>
                </div>
            </el-form-item>
            <el-form-item label="遇到重复记录时">
                <el-radio-group v-model="fromData.repeatOpt">
                    <el-radio :label="1">覆盖 (更新)</el-radio>
                    <el-radio :label="2">跳过</el-radio>
                    <el-radio :label="3">仍旧导入</el-radio>
                </el-radio-group>
                <div class="sm-title w-100 mt-5" v-if="fromData.repeatOpt != 3">
                    重复判断字段
                    <el-tooltip
                        class="sm-tip"
                        effect="dark"
                        content="选择的字段必须存在字段映射，否则会导致重复判断有误"
                        placement="top"
                    >
                        <el-icon class="sm-icon">
                            <ElIconQuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </div>
                <el-select
                    v-model="fromData.repeatFields"
                    placeholder="选择字段"
                    style="width: 400px;"
                    multiple
                    :multiple-limit="3"
                    v-if="fromData.repeatOpt != 3"
                >
                    <el-option
                        :label="op.fieldLabel"
                        :value="op.fieldName"
                        v-for="(op,inx) of fromData.fields"
                        :key="inx"
                        filterable
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="记录所属用户">
                <div style="width: 400px;">
                    <mlSelectUser type="User" v-model="fromData.owningUser" clearable />
                </div>
                <div class="w-100 mt-5 info-text">不选择则默认为当前用户，如字段映射中指定了用户则以映射为准</div>
                <div class="w-100 mt-20">
                    <el-button type="primary" style="width: 80px;" @click="nextStep">下一步</el-button>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { onMounted, ref, inject } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { queryEntityFields } from "@/api/crud";
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const { unSystemEntityList } = storeToRefs(useCommonStore());
const props = defineProps({
    modelValue: null,
});
const emits = defineEmits(["update:modelValue", "fileSuccess"]);
let fromData = ref({});
let loading = ref(false);
let entityCode = ref();
onMounted(() => {
    fromData.value = props.modelValue;
    // 初始化选中第一个实体
    if (unSystemEntityList.value.length > 0) {
        fromData.value.mainEntity = unSystemEntityList.value[0].name;
        entityCode.value = unSystemEntityList.value[0].entityCode;
        getEntityFields();
    }
});

const changeEntity = () => {
    fromData.value.repeatFields = [];
    let filterEntity = unSystemEntityList.value.filter(
        (el) => el.name == fromData.value.mainEntity
    );
    entityCode.value = filterEntity[0].entityCode;
    getEntityFields();
    emits("update:modelValue", fromData.value);
};
// 获取当前实体所有字段
const getEntityFields = async () => {
    loading.value = true;
    let res = await $API.upload.queryEntityFields(entityCode.value);;
    if (res) {
        fromData.value.fields = res.data || [];
        let importFields = [];
        fromData.value.importFields = [];
        fromData.value.fields.forEach((el) => {
            if (!el.isNullable) {
                importFields.push(el.fieldName);
                fromData.value.importFields.push(el);
            }
        });
        fromData.value.fields.forEach((el) => {
            if (!importFields.includes(el.fieldName)) {
                fromData.value.importFields.push(el);
            }
        });
    }
    loading.value = false;
};

// 上传成功附件
const onSuccess = (data) => {
    fromData.value.filePath = data.fileName;
    fromData.value.originalFilename = data.originalFilename;
    emits("update:modelValue", fromData.value);
};

// 下一步
const nextStep = async () => {
    let { filePath, repeatOpt, repeatFields } = fromData.value;
    if (!filePath) {
        $ElMessage.warning("请上传数据文件");
        return;
    }
    if (repeatOpt != 3 && repeatFields.length < 1) {
        $ElMessage.warning("请选择充重复判断字段");
        return;
    }
    // console.log($API.upload.checkFile,'$API.upload.checkFile')
    loading.value = true;
    let res = await $API.upload.checkFile(filePath);
    if (res) {
        fromData.value.columns = res.data;
        emits("update:modelValue", fromData.value);
        emits("fileSuccess");
    }
    loading.value = false;
};
</script>
<style lang='scss' scoped>
.step {
    .ml-upload {
        display: inline-block;
        margin-right: 10px;
    }
    .file-name-span {
        position: relative;
        top: -1px;
        font-weight: bold;
        text-decoration: underline;
    }
    .upload-ui {
        line-height: 24px;
        color: #878787;
        padding-left: 20px;
    }
    .sm-title {
        color: #666;
    }
    .sm-icon {
        position: relative;
        top: 1px;
    }
}
</style>