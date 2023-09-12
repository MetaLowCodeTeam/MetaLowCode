<template>
    <el-popover placement="bottom" trigger="click" :popper-style="{'padding':0}">
        <div class="table-setting-item-box">
            <!-- 导入导出 -->
            <!-- <div class="pl-5 item div-disabled">导入导出</div>
            <div class="pl-20 item" @click="dataExportFn">
                <span class="icon-t1">
                    <el-icon>
                        <ElIconDownload />
                    </el-icon>
                </span>
                数据导出
            </div>
            <div class="pl-20 item" @click="dataUploadFn">
                <span class="icon-t1">
                    <el-icon>
                        <ElIconUpload />
                    </el-icon>
                </span>
                数据导入
            </div>-->
            <!-- 列显示 -->
            <div class="pl-5 mt-15 div-disabled">列显示</div>
            <div
                class="pl-20 item"
                :class="{'is-active':defaultColumnShow == 'SELF'}"
                @click="changeColumnShow('SELF')"
            >
                自定义列显示
                <div class="action-icon">
                    <span class="icon-span edit-icon" @click.stop="editColumn('SELF')">
                        <el-icon>
                            <ElIconEditPen />
                        </el-icon>
                    </span>
                </div>
            </div>
            <div
                class="pl-20 item"
                :class="{'is-active':defaultColumnShow == 'ALL'}"
                @click="changeColumnShow('ALL')"
            >
                默认列显示
                <div class="action-icon">
                    <span class="icon-span edit-icon" @click.stop="editColumn('ALL')">
                        <el-icon>
                            <ElIconEditPen />
                        </el-icon>
                    </span>
                </div>
            </div>
        </div>
        <template #reference>
            <el-button>
                更多
                <el-icon style="transform: rotate(90deg);">
                    <ElIconMoreFilled />
                </el-icon>
            </el-button>
        </template>
    </el-popover>
    <SetColumn
        v-model="editColumnDialog.isShow"
        v-if="editColumnDialog.isShow"
        :editColumnDialog="editColumnDialog"
        @confirm="editColumnConfirm"
    />
</template>

<script setup>
import { ref, onBeforeMount, inject, reactive } from "vue";
import SetColumn from "./SetColumn.vue";
const emits = defineEmits(["changeColumnShow", "editColumnConfirm"]);
const props = defineProps({
    defaultColumnShow: { type: String, default: "" },
    layoutConfig: { type: Object, default: () => {} },
});
const $API = inject("$API");
/**
 **************************************************************  列显示 beg
 */
// 编辑列弹框是否显示
let editColumnDialog = reactive({
    isShow: false,
});
const editColumn = (type) => {
    editColumnDialog.isShow = true;
    editColumnDialog.chosenListType = type;
    editColumnDialog = Object.assign(
        editColumnDialog,
        props.layoutConfig[type]
    );
};
const changeColumnShow = (type) => {
    emits("changeColumnShow", type);
};
const editColumnConfirm = () => {
    emits("editColumnConfirm");
};
/**
 **************************************************************  列显示 end
 */
</script>
<style lang='scss' scoped>
.table-setting-item-box {
    padding: 10px 0;
    .hr {
        border-top: 1px solid #e3e3e3;
        margin: 10px 0;
    }
    .item {
        height: 26px;
        line-height: 26px;
        cursor: pointer;
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
                    top: -2px;
                }
            }
        }
        &:hover {
            background: #dedede;
            .action-icon {
                display: block;
            }
        }
        &.div-disabled {
            background: #fff;
            cursor: default;
        }
    }
}
</style>