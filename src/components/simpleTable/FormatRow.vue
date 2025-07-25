<template>
	<div class="text-ellipsis" v-if="column.type == 'Reference' || column.type == 'AnyReference'">
		{{ row[column.prop]?.name }}
	</div>
	<div class="text-ellipsis" v-else-if="column.type == 'Status'">
		{{ row[column.prop]?.label }}
	</div>
	<div class="text-ellipsis" v-else-if="column.type == 'AreaSelect'">
		<span
			v-if="
				row[column.prop] &&
				(row[column.prop][1] == '市辖区' || row[column.prop][1] == '县')
			"
			>{{ row[column.prop][0] }}-{{ row[column.prop][2] }}</span
		>
		<span
			v-else-if="
				row[column.prop] &&
				(row[column.prop][1] != '市辖区' || row[column.prop][1] != '县')
			"
			>{{ row[column.prop].join("-") }}</span
		>
		<span v-else></span>
	</div>
	<div class="text-ellipsis" v-else-if="column.type == 'Percent'">
		{{ row[column.prop] ? row[column.prop] + "%" : "" }}
	</div>
	<div class="text-ellipsis" v-else-if="column.type == 'Option' || column.type == 'CodeOption'">
		{{ row[column.prop] ? row[column.prop].label : "" }}
	</div>
	<div class="text-ellipsis" v-else-if="column.type == 'Boolean'">
		{{ row[column.prop] == null ? "" : row[column.prop] ? "是" : "否" }}
	</div>
	<div class="text-ellipsis" v-else-if="column.type == 'Money'">
		{{ numberToCurrencyNo(row[column.prop]) }}
	</div>
    <div 
        class="text-ellipsos" 
        v-else-if="column.type == 'Location'"
    >
        {{ row[column.prop] ? row[column.prop].split(',')[2] : '' }}
    </div>
    <div 
        class="text-ellipsos" 
        v-else-if="column.type == 'ReferenceList'"
    >
        {{  formatReferenceList(row[column.prop])  }}
    </div>
    <div v-else-if="column.type == 'OuterReference'">
        {{ row[column.prop]?.name }}
    </div>
    <div v-else-if="column.type == 'Cascader'">
       {{ row[column.prop] ? row[column.prop + '$label'] : "" }}
    </div>
	<div
		class="text-ellipsis"
		v-else-if="column.type == 'Picture'"
		:title="'图片：' + row[column.prop]?.length"
	>
        <div v-if="row[column.prop] && row[column.prop].length > 0">
            <el-image
                class="row-img"
                :src="formatUrl(img.url)"
                :zoom-rate="1.2"
                :max-scale="7"
                :min-scale="0.2"
                :preview-src-list="row[column.prop].map(item => formatUrl(item.url))"
                :initial-index="inx"
                preview-teleported
                fit="cover"
                v-for="(img,inx) of row[column.prop]"
                :key="inx"
            />
        </div>
	</div>

	<div
		class="text-ellipsis"
		v-else-if="column.type == 'File'"
		:title="'文件：' + row[column.prop]?.length"
	>
		<template v-if="row[column.prop] && row[column.prop].length > 0">
			<span
				@click.stop="openFilesDialog(row[column.prop])"
				class="ml-a-span"
				>文件({{ row[column.prop]?.length }})</span
			>
		</template>

		<template v-else>
			<span
				class="ml-a-span"
				v-for="(field, inx) of row[column.prop]"
				:key="inx"
				@click.stop="downField(field.url, field.name)"
				>{{ field.name }}</span
			>
		</template>
	</div>
	<div class="text-ellipsis" v-else>
        <span v-if="row[column.prop] && typeof row[column.prop] == 'string' &&  row[column.prop].startsWith('data:image/png;base64,')">
            <el-image
                class="row-img"
                :src="row[column.fieldName]"
                :zoom-rate="1.2"
                :max-scale="7"
                :min-scale="0.2"
                :preview-src-list="[row[column.fieldName]]"
                :initial-index="4"
                preview-teleported
                fit="cover"
            />
        </span>
        <span v-else>{{ row[column.prop] }}</span>
    </div>
    <FileDownOrPreview ref="FileDownOrPreviewRef" />
</template>

<script setup>
import { ref } from "vue";
// 文件下载和预览
import FileDownOrPreview from "@/components/mlOfficePreview/FileDownOrPreview.vue";

const props = defineProps({
	row: { type: Object, default: () => {} },
	column: { type: Object, default: () => {} },
});
const emits = defineEmits(["openDetailDialog"]);

const formatUrl = (url) => {
	return import.meta.env.VITE_APP_BASE_API + url;
};

const downField = (url, fileName) => {
	window.open(
		import.meta.env.VITE_APP_BASE_API + url + "?fileName=" + fileName
	);
};

const openDetailDialog = (row) => {
	emits("openDetailDialog", row);
};

// 格式化多引用显示
const formatReferenceList = (list) => {
    if(list && list.length > 0){
        let names = list.map((item) => item.name);
        return names.join(",");
    }
    return ""
}

/**
 * 多文件下载
 */
const FileDownOrPreviewRef = ref();
const openFilesDialog = (list) => {
	FileDownOrPreviewRef.value?.openDialog(list);
};

const numberToCurrencyNo = (value) => {
	if (!value) return 0;
	// 获取整数部分
	const intPart = Math.trunc(value);
	// 整数部分处理，增加,
	const intPartFormat = intPart
		.toString()
		.replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
	// 预定义小数部分
	let floatPart = "";
	// 将数值截取为小数部分和整数部分
	const valueArray = value.toString().split(".");
	if (valueArray.length === 2) {
		// 有小数部分
		floatPart = valueArray[1].toString(); // 取得小数部分
		return intPartFormat + "." + floatPart;
	}
	return intPartFormat + floatPart;
};


</script>
<style lang="scss" scoped>
.row-img {
	width: 40px;
	height: 40px;
	margin-right: 5px;
	cursor: pointer;
	border-radius: 5px;
	&:last-child {
		margin-right: 0px;
	}
}
.field-item {
	margin-bottom: 5px;
}
.preview-box {
	text-align: center;
}
</style>
