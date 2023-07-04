<template>
    <el-dialog
        class="mldialog"
        :append-to-body="appendToBody"
        :width="width"
        v-model="isShow"
        :show-close="false"
        @close="close"
        :close-on-click-modal="false"
    >
        <template #header>
            <span class="my-title">{{ title }}</span>
            <span class="fr close-icon" @click="close">
                <el-icon size="20">
                    <ElIconClose />
                </el-icon>
            </span>
        </template>
        <slot></slot>
        <template #footer v-if="isShowFooter">
            <slot name="footer"></slot>
        </template>
    </el-dialog>
</template>

<script>
import { useSlots } from "vue";
export default {
    props: {
        title: { type: String, defalut: "123" },
        modelValue: null,
        appendToBody: { type: Boolean, default: false },
        width: { type: String, default: "50%" },
    },
    watch: {
        modelValue: {
            handler() {
                this.isShow = this.modelValue;
            },
            deep: true,
        },
    },
    data() {
        return {
            isShow: null,
            isShowFooter: false,
        };
    },
    mounted() {
        this.isShow = this.modelValue;
        this.slots = useSlots();
        if(this.slots.footer){
            this.isShowFooter = true;
        }
    },
    methods: {
        close() {
            this.isShow = false;
            this.$emit("update:modelValue", this.isShow);
        },
    },
};
</script>

<style>
</style>