<template>
    <!--  -->
    <div class="ml-code-editor" :style="{'height':_height}">
        <textarea ref="textareaRef" v-model="contentValue"></textarea>
    </div>
</template>

<script setup>
import { markRaw, onMounted, ref, watch, computed } from "vue";

//框架
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";

//主题
import "codemirror/theme/idea.css";
import "codemirror/theme/darcula.css";

//功能
import "codemirror/addon/selection/active-line";

//语言
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/sql/sql";

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
    mode: {
        type: String,
        default: "javascript",
    },
    height: {
        type: [String, Number],
        default: 300,
    },
    options: {
        type: Object,
        default: () => {},
    },
    theme: {
        type: String,
        default: "idea",
    },
    readOnly: {
        type: Boolean,
        default: false,
    },
});

const emits = defineEmits(["update:modelValue"]);

let contentValue = ref();

let opt = ref({});

let coder = ref();

let textareaRef = ref();

watch(
    () => props.modelValue,
    () => {},
    { deep: true }
);

onMounted(() => {
    init();
});

// 初始化
const init = () => {
    opt.value = {
        theme: props.theme, //主题
        styleActiveLine: true, //高亮当前行
        lineNumbers: true, //行号
        lineWrapping: false, //自动换行
        tabSize: 4, //Tab缩进
        indentUnit: 4, //缩进单位
        indentWithTabs: true, //自动缩进
        mode: props.mode, //语言
        readOnly: props.readOnly, //只读
        ...props.options,
    }; 
    coder.value = markRaw(
        CodeMirror.fromTextArea(textareaRef.value, opt.value)
    );
    coder.value.on("change", (coder) => {
        contentValue.value = coder.getValue();
        emits("update:modelValue", contentValue.value);
    });
    loadContentValue();
};

// 加载value
const loadContentValue = () => {
    contentValue.value = props.modelValue;
    if (contentValue.value !== coder.value.getValue()) {
        coder.value.setValue(contentValue.value);
    }
};

const _height = computed(() => {
    return Number(props.height) ? Number(props.height) + "px" : props.height;
});
</script>
<style lang='scss' scoped>
.ml-code-editor {
    font-size: 14px;
    border: 1px solid #ddd;
    line-height: 150%;
}
.ml-code-editor:deep(.CodeMirror) {
    height: 100%;
}
</style>