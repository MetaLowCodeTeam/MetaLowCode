<template>
    <el-popover placement="top" :width="200" trigger="hover" :popper-style="{'padding':0}">
        <div class="nav-list">
            <div
                class="nav-item text-ellipsis"
                v-for="(item,inx) of navigationList"
                :key="inx"
                :class="{'is-active':useNav.layoutConfigId == item.layoutConfigId}"
                @click="navClick(item)"
            >
                {{ item.configName }}
                <div class="action-icon">
                    <span class="icon-span edit-icon mr-5" @click.stop="editMenu(item)">
                        <el-icon>
                            <ElIconEditPen />
                        </el-icon>
                    </span>
                    <el-popover :visible="visible" placement="top" :width="160">
                        <p>Are you sure to delete this?</p>
                        <div style="text-align: right; margin: 0">
                        <el-button size="small" text @click="visible = false">cancel</el-button>
                        <el-button size="small" type="primary" @click="visible = false"
                            >confirm</el-button
                        >
                        </div>
                        <template #reference>
                        <el-button @click="visible = true">Delete</el-button>
                        </template>
                    </el-popover>
                    <span class="icon-span" @click.stop="delMenu(item)">
                        <el-icon size="16">
                            <ElIconCloseBold />
                        </el-icon>
                    </span>
                </div>
            </div>
            <div class="add-box">
                <el-button class="add-btn mt-5 w-100" size="small" @click="editMenu({})">
                    <el-icon class="top-1 mr-3">
                        <ElIconPlus />
                    </el-icon>添加导航
                </el-button>
            </div>
        </div>
        <template #reference>
            <div class="adminui-side-bottom">
                <el-icon>
                    <el-icon-menu />
                </el-icon>
            </div>
        </template>
    </el-popover>
    <setMen v-model="setMenDialog" v-if="setMenDialog" :menuInfo="menuInfo" />
</template>

<script setup>
import { onMounted, ref, inject } from "vue";
import setMen from "./setMenu.vue";
import { storeToRefs } from "pinia";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { ElMessageBox } from "element-plus";

const { navigationList } = storeToRefs(useLayoutConfigStore());
const $API = inject("$API");
// 使用的导航
let useNav = ref({});
onMounted(() => {
    if (navigationList.value && navigationList.value.length > 0) {
        useNav.value = Object.assign({}, navigationList.value[0]);
    }
});
// 导航点击
const navClick = (item) => {
    useNav.value = Object.assign({}, item);
    $API.layoutConfig.useNavChang(item.layoutConfigId);
};

let visible = ref(false);

// 设置菜单弹框
let setMenDialog = ref(false);
// 弹框需要的数据
let menuInfo = ref();

// 编辑导航
const editMenu = (item) => {
    setMenDialog.value = true;
    menuInfo.value = Object.assign({}, item);
};
// 删除导航
// const delMenu = (item) => {
    // deleteConfig
    // ElMessageBox.confirm("是否确认删除?", "提示：", {
    //     confirmButtonText: "确认",
    //     cancelButtonText: "取消",
    //     type: "warning",
    // })
    //     .then(async () => {
           
    //     })
    //     .catch(() => {});
// };
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
            color: #409eff;
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