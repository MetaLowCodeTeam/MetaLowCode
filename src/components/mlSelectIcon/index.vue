<template>
    <mlDialog title="图标选择器" append-to-body width="37%" v-model="dialogIsShow">
        <el-input v-model="keyWord" size="large" placeholder="搜索">
            <template #prefix>
                <el-icon class="el-input__seatch">
                    <ElIconSearch />
                </el-icon>
            </template>
        </el-input>
        <div class="mt-20">
            <el-tabs>
                <el-tab-pane v-for="item in iconData" :key="item.name" lazy>
                    <template #label>
                        {{item.name}}
                        <el-tag size="small" type="info">{{item.icons.length}}</el-tag>
                    </template>
                    <div class="ml-icon-select__list">
                        <el-scrollbar>
                            <ul>
                                <el-empty
                                    v-if="item.icons.length==0"
                                    :image-size="100"
                                    description="未查询到相关图标"
                                />
                                <li
                                    v-for="icon in item.icons"
                                    :key="icon"
                                    @click="selectIcon(icon)"
                                >
                                    <span :data-icon="icon"></span>
                                    <el-icon>
                                        <component :is="icon" />
                                    </el-icon>
                                    <span class="icon-name">{{ getIconName(icon) }}</span>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </mlDialog>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import config from "@/config/iconSelect";
const props = defineProps({
    modelValue: null,
});

const emit = defineEmits(["update:modelValue", "confirmIcon"]);
let dialogIsShow = ref(false);
let keyWord = ref("");
watch(
    () => props.modelValue,
    () => {
        dialogIsShow.value = props.modelValue;
    },
    { deep: true }
);
watch(
    () => dialogIsShow,
    (newV) => {
        emit("update:modelValue", newV);
    },
    { deep: true }
);
watch(
    () => keyWord,
    (val) => {
        search(val.value);
    },
    { deep: true }
);
let iconData = ref([]);
onMounted(() => {
    dialogIsShow.value = props.modelValue;
    iconData.value = JSON.parse(JSON.stringify(config.icons));
});

const search = (text) => {
    if (text) {
        const filterData = JSON.parse(JSON.stringify(config.icons));
        filterData.forEach((t) => {
            t.icons = t.icons.filter((n) => n.includes(text));
        });
        iconData.value = filterData;
    } else {
        iconData.value = JSON.parse(JSON.stringify(config.icons));
    }
};

const getIconName = (name) => {
    let tempSplit = name.split("-");
    return tempSplit[tempSplit.length - 1];
};

const selectIcon = (icon) => {
    emit("confirmIcon", icon);
};
</script>

<style lang="scss" scoped>
.ml-icon-select__list {
    height: 270px;
    overflow: auto;
}
.ml-icon-select__list ul {
}
.ml-icon-select__list li {
    display: inline-block;
    width: 80px;
    height: 80px;
    margin: 5px;
    vertical-align: top;
    transition: all 0.1s;
    border-radius: 4px;
    position: relative;
}
.ml-icon-select__list li span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    cursor: pointer;
}

.ml-icon-select__list li .icon-name {
    // width: 100%;
    text-align: center;
    height: 20px;
    top: 50px;
}
.ml-icon-select__list li i {
    display: inline-block;
    width: 100%;
    height: 60px;
    font-size: 26px;
    color: #6d7882;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
}
.ml-icon-select__list li:hover {
    box-shadow: 0 0 1px 4px var(--el-color-primary);
    background: var(--el-color-primary-light-5);
}
.ml-icon-select__list li:hover i {
    color: var(--el-color-primary);
}
</style>