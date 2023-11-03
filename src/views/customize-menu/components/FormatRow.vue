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
        <span class="ml-a-span" @click.stop="openDetilDialog(row)">{{ row[column.fieldName] }}</span>
    </div>
    <div class="text-ellipsis" v-else-if="column.fieldType == 'Picture'" :title="'图片：' + row[column.fieldName]?.length">
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
const emits = defineEmits(["openDetilDialog"]);

const formatUrl = (url) => {
    return import.meta.env.VITE_APP_BASE_API + url;
};

const downField = (url, fileName) => {
    window.open(
        import.meta.env.VITE_APP_BASE_API + url + "?fileName=" + fileName
    );
};

const openDetilDialog = (row) => {
    emits("openDetilDialog", row);
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