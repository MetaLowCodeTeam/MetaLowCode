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
    <div class="text-ellipsis" v-else-if="column.fieldName == nameFiledName">
        <span class="ml-a-span" @click.stop="openDetilDialog(row)">{{ row[column.fieldName] }}</span>
    </div>
    <div class="text-ellipsis" v-else-if="column.fieldType == 'Picture'" :title="'图片：' + row[column.fieldName]?.length">
        <img
            class="row-img"
            :src="formatUrl(img.url)"
            alt
            v-for="(img,inx) of row[column.fieldName]"
            :key="inx"
        />
    </div>
    <div class="text-ellipsis" v-else>{{ row[column.fieldName] }}</div>
</template>

<script setup>
const props = defineProps({
    row: { type: Object, default: () => {} },
    column: { type: Object, default: () => {} },
    nameFiledName: { type: String, default: "" },
});
const emits = defineEmits(["openDetilDialog"]);

const formatUrl = (url) => {
    return import.meta.env.VITE_APP_BASE_API + url;
};

const openDetilDialog = (row) => {
    emits("openDetilDialog", row);
};
</script>
<style lang='scss' scoped>
.row-img {
    width: 40px;
    height: 40px;
    margin-right: 5px;
    cursor: pointer;
    border-radius: 5px;
    &:last-child{
        margin-right: 0px;
    }
}
</style>