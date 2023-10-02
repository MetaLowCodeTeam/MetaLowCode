<template>
    <div
        class="item-tag"
        v-for="(tag,inx) of list"
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
                            <span style="position: relative;top:2px;float: right;">
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
                    <el-button size="small" type="primary" @click="confirmAlias(tag,inx)">确认</el-button>
                </div>
            </div>
            <template #reference>
                <span class="drop-down-box">
                    <span class="arrow-down">
                        <el-icon>
                            <ElIconArrowDown />
                        </el-icon>
                    </span>
                    <SvgIcon class="sort-icon ml-3" v-if="tag.sort=='ASC'" icon-name="fields-asc" />
                    <SvgIcon
                        class="sort-icon ml-3"
                        v-if="tag.sort=='DESC'"
                        icon-name="fields-desc"
                    />
                    {{ tag.alias }}
                </span>
            </template>
        </el-popover>
        <span class="close-span" @click.stop="delCom(inx)">
            <el-icon>
                <ElIconCircleCloseFilled />
            </el-icon>
        </span>
    </div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
const props = defineProps({
    modelValue: null,
});
const emits = defineEmits(["update:modelValue", "onSort"]);

let list = ref([]);

watch(
    () => props.modelValue,
    () => {
        list.value = props.modelValue;
    },
    { deep: true }
);
onMounted(() => {
    list.value = props.modelValue;
});
// 删除字段
const delCom = (inx) => {
    list.value.splice(inx, 1);
    emits("update:modelValue", list.value);
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
    fieldsPopoverRefs.value[inx].hide();
    sortPopoverRefs.value[inx].hide();
    emits("update:modelValue", list.value);
    emits("onSort", { tag, target });
};
</script>

<style lang="scss" scoped>
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
</style>