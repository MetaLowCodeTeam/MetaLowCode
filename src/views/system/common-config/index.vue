<template>
    <!--  -->
    <div class="common-config">
        <el-card
            shadow="never"
            :header="card.label"
            v-for="(card,cardInx) of confList"
            :key="cardInx"
            style="margin-bottom: 20px;"
        >
            <el-descriptions :border="true" :column="1">
                <el-descriptions-item
                    v-for="(item,inx) of card.confs"
                    :key="inx"
                    :label="item.label"
                >12312321312321321321213</el-descriptions-item>
            </el-descriptions>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from "vue";

let confList = ref([
    {
        label: "通用配置",
        confs: [
            {
                label: "名称",
                key: "appName",
                type: "input",
                isEdit: false,
                required: true,
            },
            {
                label: "LOGO",
                key: "logo",
                type: "uptade",
                isEdit: false,
                required: true,
            },
            {
                label: "主色调",
                key: "themeColor",
                type: "picker",
                isEdit: false,
                required: true,
            },
            {
                label: "版本号",
                key: "dbVersion",
                type: "input",
                isEdit: false,
                required: false,
            },
            {
                label: "页面水印",
                key: "watermark",
                type: "input",
                isEdit: false,
                required: false,
            },
        ],
    },
    {
        label: "登录页配置",
        confs: [
            {
                label: "标题",
                key: "appTitle",
                type: "input",
                isEdit: false,
                required: true,
            },
            {
                label: "子标题",
                key: "appSubtitle",
                type: "input",
                isEdit: false,
                required: false,
            },
            {
                label: "简介",
                key: "appIntro",
                type: "input",
                isEdit: false,
                required: false,
            },
            {
                label: "页脚",
                key: "pageFooter",
                type: "input",
                isEdit: false,
                required: false,
            },
        ],
    },
   
]);

let isAllEdit = ref(false);
</script>
<style lang='scss' scoped>
.common-config {
    padding: 20px;
    padding-bottom: 0;
}
// .common-label {
//     width: 200px;
//     background: red;
// }
:deep(.el-descriptions__label) {
    width: 200px;
}
</style>