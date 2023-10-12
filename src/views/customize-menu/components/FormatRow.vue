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
    <div class="text-ellipsis" v-else-if="column.isNameField">
        <span class="ml-a-span" @click.stop="openDetilDialog(row)">{{ row[column.fieldName] }}</span>
    </div>
    <div class="text-ellipsis" v-else>{{ row[column.fieldName] }}</div>
</template>

<script setup>
const props = defineProps({
    row: { type: Object, default: () => {} },
    column: { type: Object, default: () => {} },
});
const emits = defineEmits(["openDetilDialog"]);

const openDetilDialog = (row)=>{
    emits('openDetilDialog',row)
}
</script>
<style lang='scss' scoped>

</style>