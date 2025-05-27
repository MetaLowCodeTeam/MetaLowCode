<template>
	<!--  -->
    <div class="func-desc" v-if="funcParam">function({{ funcParam }}){</div>
	<codemirror
		v-model="contentValue"
		placeholder="Code gose here..."
		:style="{ height: _height }"
		:autofocus="true"
		:indent-with-tab="true"
		:tabSize="2"
		:extensions="extensions"
		@change="change"
	/>
    <div class="func-desc" v-if="funcParam">}</div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";

import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
// 引入SQL语言
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";

const props = defineProps({
	modelValue: {
		type: String,
		default: "",
	},
	height: {
		type: [String, Number],
		default: 300,
	},
	theme: {
		type: String,
		// ""(默认白色) or "oneDark"(深色)
		default: "oneDark",
	},
    mode: {
        type: String,
        default: "javascript",
    },
    funcParam: {
        type: String,
        default: "",
    },
});

const emits = defineEmits(["update:modelValue"]);

let contentValue = ref();

const extensions = ref([javascript(), oneDark]);

watchEffect(() => {
	contentValue.value = props.modelValue;
    const languageExtensions = {
        'javascript': javascript(),
        'java': java(),
        'sql': sql()
        // 未来可以在这里添加更多语言
    };
    const defaultExtension = javascript();
	if (props.theme == "oneDark") {
		extensions.value = [
            languageExtensions[props.mode] || defaultExtension,
            oneDark
        ];
	} else {
		extensions.value = [
            languageExtensions[props.mode] || defaultExtension,
        ];
	}
});

const change = (v) => {
	emits("update:modelValue", v);
};

const _height = computed(() => {
	return Number(props.height) ? Number(props.height) + "px" : props.height;
});
</script>
<style lang="scss" scoped>
.ml-code-editor {
	font-size: 14px;
	border: 1px solid #ddd;
	line-height: 150%;
}
.ml-code-editor:deep(.CodeMirror) {
	height: 100%;
}
.func-desc {
    color: #909399;
    line-height: 32px;
    background: #F4F4F5;
    box-sizing: border-box;
    padding-left: 10px;
}
</style>
