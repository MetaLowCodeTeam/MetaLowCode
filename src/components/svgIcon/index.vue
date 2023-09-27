<template>
    <svg aria-hidden="true" :style="{ width: size + 'px', height: size + 'px' }">
        <use :xlink:href="symbolId" :fill="color" />
    </svg>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    iconName: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: ''
    },
    size: {
        type: [Number, String],
        default: 18
    }
})
const symbolId = computed(() => `#icon-${props.iconName}`);

</script>


<style scoped>
.svg-icon {
    fill: currentColor;
    vertical-align: middle;
}
</style>