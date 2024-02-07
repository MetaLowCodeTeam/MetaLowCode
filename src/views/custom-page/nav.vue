<template>
    <!--  -->
    <div class="custom-nav" v-loading="loading">
        <div class="nav-group" v-for="(item,inx) of navGroup" :key="inx">
            <div class="nav-group-name">{{ item.label }}</div>
            <div class="box-card">
                <!-- <div class="item-card">
                    <div>icon</div>
                    <div>内容</div>
                </div>-->
                <el-card class="item-card" v-for="(subItem,subInx) of item.children" :key="subInx">
                    <div class="item-icon">{{  }}</div>
                    <div class="item-text">
                        {{ subItem.name }}
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
/**
 * API
 */
import layoutConfig from "@/api/layoutConfig";
const Router = useRouter();

let layoutConfigId = ref("");
let loading = ref(false);

let navGroup = ref([
    {
        label: "最近使用",
        children: [],
    },
    {
        label: "工作台",
        children: [],
    },
]);

onMounted(() => {
    layoutConfigId.value = Router.currentRoute.value.query.layoutConfigId;
    // console.log(layoutConfigId.value, "layoutConfigId.value");
    if (layoutConfigId.value) {
        getNavigationById();
    }
});

let navList = ref([]);

// 获取导航数据
const getNavigationById = async () => {
    loading.value = true;
    let res = await layoutConfig.getNavigationById(layoutConfigId.value);
    console.log(res, "res");
    if (res && res.code == 200) {
        navList.value = res.data.config ? JSON.parse(res.data.config) : [];
        // 取有子集和没有子集的东西
        let hasChildren = [];
        let notChildren = [];
        if (navList.value.length > 0) {
            navList.value.forEach((el) => {
                el.label = el.name;
                if (el.children) {
                    hasChildren.push(el);
                } else {
                    notChildren.push(el);
                }
            });
        }
        navGroup.value[1].children = [...notChildren];
        navGroup.value.push(...hasChildren);
        console.log(navGroup.value, " navGroup.value");
    }
    loading.value = false;
};
</script>
<style lang='scss' scoped>
.custom-nav {
    height: 100%;
    padding: 20px;
    font-size: 14px;
    .nav-group {
        margin-bottom: 20px;
        .nav-group-name {
            font-size: 20px;
            margin-bottom: 10px;
        }
        .box-card {
            display: flex;
            .item-card {
                display: flex;
                width: 200px;
                height: 72px;
                // line-height: 72px;
                margin-bottom: 10px;
                margin-right: 35px;
                box-sizing: border-box;
                :deep(.el-card__body) {
                    padding: 10px !important;
                }
            }
        }
    }
}
</style>