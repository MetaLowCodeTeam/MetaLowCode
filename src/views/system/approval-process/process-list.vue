<template>
    <el-container v-loading="loading" element-loading-text="加载中...">
        <el-aside width="280px">
            <div class="fields-list">
                <div class="fields-list-header">实体列表</div>
                <div class="fields-list-box">
                    <div
                        class="fields-list-item text-ellipsis"
                        v-for="(field,inx) of fieldsList"
                        :key="inx"
                        :class="{'is-active':field.name == defaultCoode}"
                        @click="fieldCheck(field)"
                        :title="field.label"
                    >{{ field.label }}</div>
                </div>
            </div>
        </el-aside>

        <el-container class="main-container">
            <el-header class="props-action-section">操作区</el-header>

            <el-main style="margin: 0 auto">
                <el-button @click="test">点击查看审核流程（demo）</el-button>
            </el-main>
        </el-container>
    </el-container>
</template>
  
<script setup>
import { getEntitySet } from "@/api/system-manager";
import { inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const message = inject("$ELMessage");
const router = useRouter();
let loading = ref(false);
let defaultCoode = ref("");
let fieldsList = ref([]);

onMounted(() => {
    getEntitySet()
        .then((res) => {
            if (res.code === 200) {
                fieldsList.value = res.data || [];
                defaultCoode.value = fieldsList.value[0].name;
            } else {
                message.error("获取实体数据失败：" + res.message);
            }
        })
        .catch((err) => {
            console.log(err);
            message.error("接口调用失败，请尝试刷新页面后重试");
        });
});

// 字段点击触发
const fieldCheck = (item) => {
    console.log("字段点击：", item);
    defaultCoode.value = item.name;
};

const test = () => {
    router.push({
        path: "/process-detail",
        query: {
            approvalConfigId: "0000030-b105364997e64227b6f567bbd900a78b",
        },
    });
};
// export default {
//     name: "OptionManager",
//     data() {
//         return {
//             loading: false,
//             defaultCoode: "all",
//             fieldsList: [
//                 {
//                     name: "全部实体",
//                     code: "all",
//                 },
//                 {
//                     name: "企业-股东信息股东信息股东信息股东信息股东信息",
//                     code: "1",
//                 },
//                 {
//                     name: "企业列表",
//                     code: "2",
//                 },
//                 {
//                     name: "企业认领管理",
//                     code: "3",
//                 },
//                 {
//                     name: "合同管理",
//                     code: "4",
//                 },
//                 {
//                     name: "园区咨询",
//                     code: "5",
//                 },
//                 {
//                     name: "批量消息通知",
//                     code: "6",
//                 },
//                 {
//                     name: "招商服务",
//                     code: "7",
//                 },
//                 {
//                     name: "物业管理",
//                     code: "8",
//                 },
//             ],
//         };
//     },
//     mounted() {
//         this.getFieldList();
//     },
//     methods: {
//         getFieldList() {
//             this.loading = true;
//             setTimeout(() => {
//                 this.getTableData();
//             }, 1000);
//         },
//         fieldCheck(item) {
//             this.defaultCoode = item.code;
//             this.getTableData();
//         },
//         getTableData() {
//             this.loading = true;
//             setTimeout(() => {
//                 this.loading = false;
//             }, 1000);
//         },
//         test() {
//             this.$router.push({
//                 path: "/process-detail",
//                 query: {
//                     approvalConfigId:
//                         "0000030-b105364997e64227b6f567bbd900a78b",
//                 },
//             });
//         },
//     },
// };
//
</script>
  
  <style lang="scss" scoped>
.main-container {
    min-width: 720px;
    border-left: 2px solid #eeeeee;
    background: #ffffff;
}

.el-aside {
    background-color: #ffffff;
}

.fields-list {
    height: 100%;
    .fields-list-header {
        font-size: 14px;
        height: 54px;
        line-height: 54px;
        border-bottom: 1px dashed #eeeeee;
        padding-left: 20px;
    }
    .fields-list-box {
        height: calc(100% - 55px);
        overflow-y: auto;
        padding: 10px 20px;
        font-size: 14px;
        .fields-list-item {
            height: 36px;
            line-height: 36px;
            cursor: pointer;
            border-radius: 2px;
            padding: 0 20px;
            &:hover {
                background: #eee;
            }
            &.is-active {
                background: $--color-primary;
                color: #fff;
            }
        }
    }
}
</style>
  