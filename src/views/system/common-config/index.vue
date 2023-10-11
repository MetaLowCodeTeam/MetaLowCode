<template>
    <!--  -->
    <div class="common-config">
        <el-card shadow="never" header="配置">
            <el-descriptions :border="true" :column="1">
                <el-descriptions-item
                    v-for="(item,inx) of confList"
                    :key="inx"
                    :label="item.label"
                >
                    12312321312321321321213
                </el-descriptions-item>
            </el-descriptions>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from "vue";

let confList = ref([
    {
        label: "app名称",
        key: "appName",
        type: "input",
        isEdit:false,
    },
    {
        label: "app标题",
        key: "appTitle",
        type: "input",
        isEdit:false,
    },
    {
        label: "app小标题",
        key: "appSubtitle",
        type: "input",
        isEdit:false,
    },
    {
        label: "app信息",
        key: "appIntro",
        type: "input",
        isEdit:false,
    },
    {
        label: "页脚",
        key: "pageFooter",
        type: "input",
        isEdit:false,
    },
    {
        label: "版本号",
        key: "dbVersion",
        type: "input",
        isEdit:false,
    },
    {
        label: "logo",
        key: "logo",
        type: "uptade",
        isEdit:false,
    },
    // {
    //     label: "黑夜模式logo",
    //     key: "logoWhite",
    //     type: "uptade",
    // },
    {
        label: "主题颜色",
        key: "themeColor",
        type: "picker",
        isEdit:false,
    },
    {
        label: "水印",
        key: "watermark",
        type: "radio",
        isEdit:false,
    },
    
]);

let isAllEdit = ref(false);
</script>
<style lang='scss' scoped>
.common-config {
    padding: 20px;
}
// .common-label {
//     width: 200px;
//     background: red;
// }
:deep(.el-descriptions__label){
    width: 200px;
}
</style>