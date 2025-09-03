<template>
    <div class="add-node-btn-box" :class="{'is-highlight': isHighlight}">
        <div class="add-node-btn" >
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: { type: Object, default: () => {} },
        isHighlight: { type: Boolean, default: false },
    },
    data() {
        return {};
    },
    mounted() {},
    methods: {},
};
</script>

<style>
</style>
