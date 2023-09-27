<template>
    <svg
        aria-hidden="true"
        class="svg-icon"
        :style="{ width: size + 'px', height: size + 'px'}"
    >
        <use :xlink:href="symbolId" />
    </svg>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    iconName: {
        type: String,
        required: true
    },
    // color: {
    //     type: String,
    //     default: 'red'
    // },
    size: {
        type: [Number, String],
        default: 18
    }
})
const symbolId = computed(() => `#icon-${props.iconName}`);

</script>


<style scoped>
.svg-icon {
    vertical-align: middle;
    fill: currentColor;
}
</style>