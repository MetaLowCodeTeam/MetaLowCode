<template>
	<!--  -->
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
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";

import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
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
    }
});

const emits = defineEmits(["update:modelValue"]);

let contentValue = ref();

const extensions = ref([javascript(), oneDark]);

watchEffect(() => {
	contentValue.value = props.modelValue;
	if (props.theme == "oneDark") {
		extensions.value = [props.mode == "java" ? java() : javascript(), oneDark];
	} else {
		extensions.value = [props.mode == "java" ? java() : javascript()];
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
</style>
