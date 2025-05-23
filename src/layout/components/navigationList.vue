<template>
    <el-popover 
        placement="top" 
        :width="200" 
        :trigger="trigger" 
        :popper-style="{'padding':0}"
        popper-class="nav-popover-box"
    >
        <div class="nav-list">
            <el-scrollbar max-height="300px">
                <div
                    class="nav-item text-ellipsis"
                    v-for="(item,inx) of navigationList"
                    :key="inx"
                    :class="{'is-active':chosenNavigationId == item.layoutConfigId}"
                    @click="navClick(item)"
                >
                {{ item.configName }}
                <div class="action-icon" v-if="$TOOL.checkRole('r6007')">
                    <span class="icon-span edit-icon mr-5" @click.stop="editMenu(item)">
                        <el-icon>
                            <ElIconEditPen />
                        </el-icon>
                    </span>
                    <span class="icon-span" @click.stop="delMenu(item,inx)">
                        <el-icon size="16">
                            <ElIconCloseBold />
                        </el-icon>
                    </span>
                    </div>
                </div>
            </el-scrollbar>
            <div class="add-box" v-if="$TOOL.checkRole('r6007')">
                <el-button class="add-btn mt-5 w-100" size="small" @click="editMenu({})">
                    <el-icon class="top-1 mr-3">
                        <ElIconPlus />
                    </el-icon>添加导航
                </el-button>
            </div>
        </div>
        <template #reference>
            <div class="adminui-side-bottom" @click="TOGGLE_menuIsCollapse" v-if="!isDockLayout">
                <el-icon v-if="menuIsCollapse">
                    <el-icon-expand />
                </el-icon>
                <el-icon v-else>
                    <el-icon-fold />
                </el-icon>
            </div>
            <div style="height: 100%;width: 100%;display: flex;align-items: center;justify-content: center;" v-else>
                <el-icon size="16">
                    <ElIconGrid />
                </el-icon>
            </div>
        </template>
    </el-popover>
    <setMen v-model="setMenDialog" v-if="setMenDialog" :menuInfo="menuInfo" />
</template>

<script setup>
import { onMounted, ref, inject, nextTick } from "vue";
import setMen from "./setMenu.vue";
import { storeToRefs } from "pinia";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import useGlobalStore from "@/store/modules/global";
const props = defineProps({
    trigger: {
        type: String,
        default: 'hover',
    },
    isDockLayout: {
        type: Boolean,
        default: false,
    },
});
const { TOGGLE_menuIsCollapse } = useGlobalStore();
const router = useRouter();
const { navigationList, chosenNavigationId } = storeToRefs(
    useLayoutConfigStore()
);

const { setNavigationList } = useLayoutConfigStore();
const { menuIsCollapse } = storeToRefs(useGlobalStore());

const $API = inject("$API");
const $TOOL = inject("$TOOL");
const appPath = import.meta.env.VITE_APP_PATH;
// 导航点击
const navClick = async (item) => {
    let res = await $API.layoutConfig.saveUserLayoutCache(
        "NAV",
        item.layoutConfigId
    );
    if (res) {
        window.location.href = "/";
    }
};

// 设置菜单弹框
let setMenDialog = ref(false);
// 弹框需要的数据
let menuInfo = ref({});

// 编辑导航
const editMenu = (item) => {
    setMenDialog.value = true;
    menuInfo.value = Object.assign({}, item);
};
// 删除导航
const delMenu = (item, inx) => {
    // deleteConfig
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res = await $API.layoutConfig.deleteConfig(item.layoutConfigId);
            if (res) {
                // 如果删除的是选中导航
                if (chosenNavigationId.value == item.layoutConfigId) {
                    router.go(0);
                }
                let copyList = [...navigationList.value];
                copyList.splice(inx, 1);
                setNavigationList(copyList);
            }
        })
        .catch(() => {});
};
</script>
<style lang='scss' scoped>
.nav-list {
    padding: 10px 0;
    .top-1 {
        position: relative;
        top: -1px;
    }
    .nav-item {
        height: 32px;
        line-height: 32px;
        cursor: pointer;
        padding: 0 10px;
        position: relative;
        &.is-active {
            color: var(--el-color-primary);
        }
        .action-icon {
            position: absolute;
            right: 10px;
            top: 4px;
            display: none;
            .icon-span {
                cursor: pointer;
                display: inline-block;
                color: #a1a1a1;
                &:hover {
                    color: #666;
                }
                &.edit-icon {
                    position: relative;
                    top: -1px;
                }
            }
        }
        &:hover {
            background: #dedede;
            .action-icon {
                display: block;
            }
        }
    }
    .add-box {
        padding: 0 10px;
    }
}


</style>
