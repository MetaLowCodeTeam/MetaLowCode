<template>
    <!-- 单选项（示例） -->
    <OptionListView :enabledEntity="[{ 'User': ['jobTitle']}]"/>
</template>

<script setup>
import OptionListView from "../system/data-dict/option-manager.vue";
</script>
<style lang='scss' scoped>
</style>