<template>
    <el-form-item label="维度指标设置">
        <el-button @click="drawer = true">点击设置</el-button>
    </el-form-item>
    <el-drawer v-model="drawer" title="维度指标设置" size="460">
        <div class="drawer-main">
            <div class="form-box" ref="formBoxRefs">
                <el-form>
                    <el-form-item label="维度">
                        <div class="input-box">
                            <VueDraggableNext
                                class="draggable-box"
                                group="list"
                                :list="dimension"
                                @add="(e) => addCom(e,'dimension')"
                            >
                                <div
                                    class="item-tag"
                                    v-for="(tag,inx) of dimension"
                                    :key="inx"
                                    :title="'原名：' + tag.label"
                                    ref="buttonRef"
                                >
                                    <el-popover
                                        placement="bottom"
                                        popper-class="fields-popover"
                                        :width="80"
                                        trigger="click"
                                        @hide="tag.showEdit = false"
                                        ref="fieldsPopoverRefs"
                                    >
                                        <div class="popover-div" v-if="!tag.showEdit">
                                            <div class="popover-item" @click="editAlias(tag)">修改显示名</div>
                                            <el-popover
                                                placement="right"
                                                :width="60"
                                                trigger="hover"
                                                popper-class="fields-popover"
                                                ref="sortPopoverRefs"
                                            >
                                                <div class="popover-div">
                                                    <div
                                                        class="popover-item"
                                                        :class="{'is-active':!tag.sort}"
                                                        @click="onSort(tag,'',inx)"
                                                    >默认</div>
                                                    <div
                                                        class="popover-item"
                                                        :class="{'is-active':tag.sort == 'ASC'}"
                                                        @click="onSort(tag,'ASC',inx)"
                                                    >升序</div>
                                                    <div
                                                        class="popover-item"
                                                        :class="{'is-active':tag.sort == 'DESC'}"
                                                        @click="onSort(tag,'DESC',inx)"
                                                    >降序</div>
                                                </div>
                                                <template #reference>
                                                    <div class="popover-item">
                                                        排序
                                                        <span
                                                            style="position: relative;top:2px;float: right;"
                                                        >
                                                            <el-icon>
                                                                <ElIconArrowRight />
                                                            </el-icon>
                                                        </span>
                                                    </div>
                                                </template>
                                            </el-popover>
                                        </div>
                                        <div class="popover-div" style="padding: 10px;" v-else>
                                            <div class="w-100">
                                                <el-input v-model="tag.editAlias" size="small"></el-input>
                                            </div>
                                            <div class="w-100 mt-10" style="text-align: right;">
                                                <el-button size="small" @click="cannerAlias(inx)">取消</el-button>
                                                <el-button
                                                    size="small"
                                                    type="primary"
                                                    @click="confirmAlias(tag,inx)"
                                                >确认</el-button>
                                            </div>
                                        </div>
                                        <template #reference>
                                            <span class="drop-down-box">
                                                <span class="arrow-down">
                                                    <el-icon>
                                                        <ElIconArrowDown />
                                                    </el-icon>
                                                </span>
                                                <SvgIcon
                                                    class="sort-icon ml-3"
                                                    v-if="tag.sort=='ASC'"
                                                    icon-name="fields-asc"
                                                />
                                                <SvgIcon
                                                    class="sort-icon ml-3"
                                                    v-if="tag.sort=='DESC'"
                                                    icon-name="fields-desc"
                                                />
                                                {{ tag.alias }}
                                            </span>
                                        </template>
                                    </el-popover>
                                    <span class="close-span" @click.stop="delCom(inx,'dimension')">
                                        <el-icon>
                                            <ElIconCircleCloseFilled />
                                        </el-icon>
                                    </span>
                                </div>
                            </VueDraggableNext>
                        </div>
                    </el-form-item>
                    <el-form-item label="指标">
                        <div class="input-box"></div>
                    </el-form-item>
                </el-form>
            </div>
            <div class="item-box" ref="itemBoxRefs" :style="{'height': setItemBoxHeight()}">
                <div class="item-title">可用字段</div>
                <div class="item-list-box">
                    <el-scrollbar>
                        <VueDraggableNext :group="{ name: 'list', pull: 'clone',put: false }">
                            <div
                                class="item-list yichu"
                                v-for="(item,inx) of fields"
                                :key="inx"
                                :title="item.label"
                            >
                                <span class="lh">{{ item.type }}</span>
                                {{ item.label }}
                            </div>
                        </VueDraggableNext>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <template #footer>
            <div style="flex: auto;padding-top: 10px;">
                <el-button size="default" @click="onCancel">取消</el-button>
                <el-button size="default" type="primary" @click="drawer = false">确认</el-button>
            </div>
        </template>
    </el-drawer>
</template>
<script setup>
import { onMounted, ref, watch, inject } from "vue";
import { ElMessageBox } from "element-plus";
import { VueDraggableNext } from "vue-draggable-next";

defineOptions({
    name: "setDimensional-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});

const emits = defineEmits(["update:optionModel"]);
const $ElMessage = inject("$ElMessage");

watch(
    () => props.optionModel,
    () => {
        initDimensional();
    },
    { deep: true }
);
onMounted(() => {
    initDimensional();
});
// 维度
let dimension = ref([]);
// 指标
let metrics = ref([]);
// 初始化纬度、指标
const initDimensional = () => {
    dimension.value = props.optionModel.setDimensional?.dimension || [];
    metrics.value = props.optionModel.setDimensional?.metrics || [];
};

/**
 * 所有字段
 */
let fields = [
    {
        label: "字段1",
        alias: "字段1",
        code: "code1",
        type: "N",
        sort: "",
        showEdit: false,
        editAlias: "",
    },
    {
        label: "字段2",
        alias: "字段2",
        code: "code2",
        type: "N",
        sort: "",
        showEdit: false,
        editAlias: "",
    },
    {
        label: "字段3",
        alias: "字段3",
        code: "code3",
        type: "N",
        sort: "",
        showEdit: false,
        editAlias: "",
    },
    {
        label: "字段4",
        alias: "字段4",
        code: "code4",
        type: "S",
        sort: "",
        showEdit: false,
        editAlias: "",
    },
    {
        label: "字段5",
        alias: "字段5",
        code: "code5",
        type: "S",
        sort: "",
        showEdit: false,
        editAlias: "",
    },
];

let drawer = ref(false);
const onCancel = () => {
    console.log(dimension.value);
    drawer.value = false;
};
// 设置可选字段高度
let formBoxRefs = ref();
let itemBoxRefs = ref();
const setItemBoxHeight = () => {
    let formHeight = formBoxRefs.value?.offsetHeight;
    if (formHeight) {
        formHeight += 60;
        return "calc(100% - " + formHeight + "px)";
    }
    return "calc(100% - 175px)";
};
/**
 * 拖拽
 */
// 新加字段
const addCom = (e, target) => {
    let cutField = { ...fields[e.oldIndex] };

    let checkHasDimension = dimension.value.filter(
        (el) => el.label == cutField.label
    );
    let checkHasMetrics = metrics.value.filter(
        (el) => el.label == cutField.label
    );
    if (checkHasDimension.length > 0) {
        $ElMessage.warning("添加失败，同一字段不能重复添加维度");
        return;
    }
    if (checkHasMetrics.length > 0) {
        $ElMessage.warning("添加失败，同一字段不能重复添加指标");
        return;
    }
    if (target == "dimension") {
        dimension.value.push(cutField);
    }
};
// 删除字段
const delCom = (inx, target) => {
    if (target == "dimension") {
        dimension.value.splice(inx, 1);
    }
};
let fieldsPopoverRefs = ref();
let sortPopoverRefs = ref();
// 字段修改别名
const editAlias = (tag) => {
    tag.editAlias = tag.alias;
    tag.showEdit = true;
};
const confirmAlias = (tag, inx) => {
    if (tag.editAlias) {
        tag.alias = tag.editAlias;
        cannerAlias(inx);
    }
};
// 取消修改别名
const cannerAlias = (inx) => {
    fieldsPopoverRefs.value[inx].hide();
};
// 字段排序
const onSort = (tag, target, inx) => {
    dimension.value.forEach((el) => {
        el.sort = "";
    });
    metrics.value.forEach((el) => {
        el.sort = "";
    });
    tag.sort = target;
    fieldsPopoverRefs.value[inx].hide();
    sortPopoverRefs.value[inx].hide();
};
</script>
<style lang="scss" scoped>
.drawer-main {
    // padding: 20px;
    height: 100%;
    border-bottom: 1px solid #e5e5e5;
    .form-box {
        border-top: 1px solid #e5e5e5;
        padding: 20px;
        padding-bottom: 0;
        .input-box {
            border-radius: 4px;
            border: 1px solid #e5e5e5;
            padding: 3px 10px;
            width: 100%;
            min-height: 32px;
            .draggable-box {
                min-height: 32px;
                .item-list {
                    display: none;
                }
            }

            .item-tag {
                display: inline-block;
                line-height: 24px;
                cursor: pointer;
                position: relative;
                color: #fff;
                .drop-down-box {
                    display: inline-block;
                    background: var(--el-color-primary);
                    color: #fff;
                    margin-right: 5px;
                    border-radius: 20px;
                    height: 24px;
                    line-height: 24px;
                    padding: 0 25px;
                    padding-left: 10px;
                    .arrow-down {
                        position: relative;
                        top: 2px;
                    }
                }

                .close-span {
                    display: none;
                    position: absolute;
                    right: 10px;
                    top: 2px;
                }
                &:hover {
                    .close-span {
                        display: inline-block;
                    }
                }
            }
        }
    }
    .item-box {
        border-top: 1px solid #e5e5e5;
        padding: 20px 0;
        .item-title {
            font-size: 14px;
            font-weight: bold;
            padding-left: 20px;
        }
        .item-list-box {
            height: calc(100% - 12px);
            .item-list {
                padding-left: 15px;
                height: 32px;
                line-height: 32px;
                cursor: all-scroll;
                user-select: none;
                .lh {
                    color: var(--el-color-primary);
                }
                &:hover {
                    background: #e6e6e6;
                }
            }
        }
    }
}
</style>
