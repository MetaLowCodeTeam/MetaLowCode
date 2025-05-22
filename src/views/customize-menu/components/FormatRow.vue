<template>
    <!-- 自定义渲染 -->
    <div v-if="column.renderType == 'customizeRender'">
        <table-column-custom-render 
            :row="row" 
            :column="column" 
            :renderFn="getColumnRender(column)" 
            :listExposed="listExposed"
        />
    </div>
    <!-- 默认 -->
    <div :style="{'fontSize':column.fontSize + 'px','fontWeight':column.fontWeight,'color':column.fontColor}" v-else>
        <div
            class="text-ellipsis"
            v-if="column.fieldType == 'Reference' || column.fieldType == 'AnyReference'"
        >{{ row[column.fieldName]?.name }}</div>
        <div
            class="text-ellipsis"
            v-else-if="column.fieldType == 'Status'"
        >{{ row[column.fieldName]?.label }}</div>
        <div class="text-ellipsis" v-else-if="column.fieldType == 'AreaSelect'">
            <span
                v-if="row[column.fieldName] && (row[column.fieldName][1] == '市辖区' || row[column.fieldName][1] == '县')"
            >{{ row[column.fieldName][0] }}-{{ row[column.fieldName][2] }}</span>
            <span
                v-else-if="row[column.fieldName] && (row[column.fieldName][1] != '市辖区' || row[column.fieldName][1] != '县')"
            >{{ row[column.fieldName].join("-") }}</span>
            <span v-else></span>
        </div>
        <div
            class="text-ellipsis"
            v-else-if="column.fieldType == 'Percent'"
        >{{ row[column.fieldName] ? row[column.fieldName] + "%" : '' }}</div>
        <div
            class="text-ellipsis"
            v-else-if="column.fieldType == 'Option' || column.fieldType == 'CodeOption'"
        >{{ row[column.fieldName] ? row[column.fieldName].label : '' }}</div>
        <div
            class="text-ellipsis"
            v-else-if="column.fieldType == 'Boolean'"
        >{{ row[column.fieldName] == null ? "" : (row[column.fieldName] ? "是" : '否') }}</div>
        <div class="text-ellipsis" v-else-if="column.fieldName == nameFieldName">
            <span class="ml-a-span" @click.stop="openDetailDialog(row)">{{ row[column.fieldName] }}</span>
        </div>

        <div
            class="text-ellipsis"
            v-else-if="column.fieldType == 'Money'"
        >{{ numberToCurrencyNo(row[column.fieldName]) }}</div>
        <div
            class="text-ellipsis"
            v-else-if="column.fieldType == 'Picture'"
            :title="'图片：' + row[column.fieldName]?.length"
        >
            <div v-if="row[column.fieldName] && row[column.fieldName].length > 0">
                <el-image
                    class="row-img"
                    :src="formatUrl(img.url)"
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                    :preview-src-list="row[column.fieldName].map(item => formatUrl(item.url))"
                    :initial-index="inx"
                    preview-teleported
                    v-for="(img,inx) of row[column.fieldName]"
                    :key="inx"
                />
            </div>
        </div>

        <div
            class="text-ellipsis"
            v-else-if="column.fieldType == 'File'"
            :title="'文件：' + row[column.fieldName]?.length"
        >
            <template v-if="row[column.fieldName] && row[column.fieldName].length > 0">
                <span
                    @click.stop="openFilesDialog(row[column.fieldName])"
                    class="ml-a-span"
                >文件({{ row[column.fieldName]?.length }})</span>
            </template>

            <template v-else>
                <span
                    class="ml-a-span"
                    v-for="(field,inx) of row[column.fieldName]"
                    :key="inx"
                    @click.stop="downField(field.url,field.name)"
                >{{ field.name }}</span>
            </template>
        </div>
        <div 
            class="text-ellipsos" 
            v-else-if="column.fieldType == 'Location'"
        >
            {{ row[column.fieldName] ? row[column.fieldName].split(',')[2] : '' }}
        </div>
        <div 
            class="text-ellipsos" 
            v-else-if="column.fieldType == 'ReferenceList'"
        >
            {{  formatReferenceList(row[column.fieldName])  }}
        </div>
        <div v-else-if="column.fieldType == 'OuterReference'">
            {{ row[column.fieldName]?.name }}
        </div>
        <div class="text-ellipsis" v-else>
            <span v-if="row[column.fieldName] && typeof row[column.fieldName] == 'string' && row[column.fieldName].startsWith('data:image/png;base64,')">
                <el-image
                    class="row-img"
                    :src="row[column.fieldName]"
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                    :preview-src-list="[row[column.fieldName]]"
                    preview-teleported
                    fit="scale-down"
                />
            </span>
            <span v-else>{{ row[column.fieldName] }}</span>
        </div>
    </div>

    <FileDownOrPreview ref="FileDownOrPreviewRef" />
</template>

<script setup>
import { ref } from "vue";
import TableColumnCustomRender from "./table-column-custom-render";
// 文件下载和预览
import FileDownOrPreview from "@/components/mlOfficePreview/FileDownOrPreview.vue";

const props = defineProps({
    row: { type: Object, default: () => {} },
    column: { type: Object, default: () => {} },
    nameFieldName: { type: String, default: "" },
    nameFieldClick: { type: Function, default: null },
    listExposed: { type: Object, default: () => {} },
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
    if(props.nameFieldClick) {
        props.nameFieldClick(row);
    }else {
        emits("openDetailDialog", row);
    }
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


// 自定义渲染
const getColumnRender = (column)=> {
    return new Function('h', 'params', column.columnRender)
}


</script>
<style lang='scss' scoped>
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