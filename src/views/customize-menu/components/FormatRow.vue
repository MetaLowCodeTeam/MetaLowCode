<template>
    <div
        class="text-ellipsis"
        v-if="column.fieldType == 'Reference'"
    >{{ row[column.fieldName]?.name }}</div>
    <div
        class="text-ellipsis"
        v-else-if="column.fieldType == 'Status'"
    >{{ row[column.fieldName]?.label }}</div>
    <div
        class="text-ellipsis"
        v-else-if="column.fieldType == 'AreaSelect'"
    >
        <span v-if="row[column.fieldName] && (row[column.fieldName][1] == '市辖区' || row[column.fieldName][1] == '县')">
            {{ row[column.fieldName][0] }}-{{ row[column.fieldName][2] }}
        </span>
        <span v-else-if="row[column.fieldName] && (row[column.fieldName][1] != '市辖区' || row[column.fieldName][1] != '县')">
            {{ row[column.fieldName].join("-") }}
        </span>
        <span v-else></span>
    </div>
    <div
        class="text-ellipsis"
        v-else-if="column.fieldType == 'Percent'"
    >{{ row[column.fieldName] ? row[column.fieldName] + "%" : '' }}</div>
    <div
        class="text-ellipsis"
        v-else-if="column.fieldType == 'Option'"
    >{{ row[column.fieldName] ? row[column.fieldName].label : '' }}</div>
    <div
        class="text-ellipsis"
        v-else-if="column.fieldType == 'Boolean'"
    >{{ row[column.fieldName] == null ? "" : (row[column.fieldName] ? "是" : '否') }}</div>
    <div class="text-ellipsis" v-else-if="column.fieldName == nameFieldName">
        <span class="ml-a-span" @click.stop="openDetailDialog(row)">{{ row[column.fieldName] }}</span>
    </div>

    <div class="text-ellipsis" v-else-if="column.fieldType == 'Money'">{{ numberToCurrencyNo(row[column.fieldName]) }}</div>
    <div
        class="text-ellipsis"
        v-else-if="column.fieldType == 'Picture'"
        :title="'图片：' + row[column.fieldName]?.length"
    >
        <img
            class="row-img"
            :src="formatUrl(img.url)"
            alt
            v-for="(img,inx) of row[column.fieldName]"
            :key="inx"
            @click.stop="downField(img.url,img.name)"
        />
    </div>

    <div
        class="text-ellipsis"
        v-else-if="column.fieldType == 'File'"
        :title="'文件：' + row[column.fieldName]?.length"
    >
        <template v-if="row[column.fieldName] && row[column.fieldName].length > 0">
            <span
                @click.stop="openFilesDialog(row[column.fieldName])"
                class="ml-a-span"
            >文件({{ row[column.fieldName]?.length }})</span>
        </template>

        <template v-else>
            <span
                class="ml-a-span"
                v-for="(field,inx) of row[column.fieldName]"
                :key="inx"
                @click.stop="downField(field.url,field.name)"
            >{{ field.name }}</span>
        </template>
    </div>
    <div class="text-ellipsis" v-else>{{ row[column.fieldName] }}</div>
    <mlDialog v-model="filesDialog" title="文件下载" appendToBody width="400px">
        <el-scrollbar max-height="400px">
            <div v-for="(field,inx) of filesList" :key="inx" class="field-item">
                <span
                    class="ml-a-span"
                    @click.stop="downField(field.url,field.name)"
                >{{ field.name }}</span>
            </div>
        </el-scrollbar>
    </mlDialog>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
    row: { type: Object, default: () => {} },
    column: { type: Object, default: () => {} },
    nameFieldName: { type: String, default: "" },
});
const emits = defineEmits(["openDetailDialog"]);

const formatUrl = (url) => {
    return import.meta.env.VITE_APP_BASE_API + url;
};

const downField = (url, fileName) => {
    window.open(
        import.meta.env.VITE_APP_BASE_API + url + "?fileName=" + fileName
    );
};

const openDetailDialog = (row) => {
    emits("openDetailDialog", row);
};

/**
 * 多文件下载
 */
let filesDialog = ref(false);
let filesList = ref([]);

const openFilesDialog = (list) => {
    filesDialog.value = true;
    filesList.value = [...list];
};

const numberToCurrencyNo = (value) => {
    if (!value) return 0;
    // 获取整数部分
    const intPart = Math.trunc(value);
    // 整数部分处理，增加,
    const intPartFormat = intPart
        .toString()
        .replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
    // 预定义小数部分
    let floatPart = "";
    // 将数值截取为小数部分和整数部分
    const valueArray = value.toString().split(".");
    if (valueArray.length === 2) {
        // 有小数部分
        floatPart = valueArray[1].toString(); // 取得小数部分
        return intPartFormat + "." + floatPart;
    }
    return intPartFormat + floatPart;
};
</script>
<style lang='scss' scoped>
.row-img {
    width: 40px;
    height: 40px;
    margin-right: 5px;
    cursor: pointer;
    border-radius: 5px;
    &:last-child {
        margin-right: 0px;
    }
}
.field-item {
    margin-bottom: 5px;
}
</style>