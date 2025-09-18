<template>
    <ml-dialog title="图标选择器" append-to-body width="37%" v-model="dialogIsShow">
        <el-input v-model="keyWord" size="large" placeholder="搜索">
            <template #prefix>
                <el-icon class="el-input__seatch">
                    <ElIconSearch />
                </el-icon>
            </template>
        </el-input>
        <div class="mt-20">
            <el-tabs>
                <el-tab-pane v-for="item in iconData" :key="item.name" :label="item.label">
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
                                    :class="{'is-active': selectedIcon.name == icon}"
                                >
                                    <span :data-icon="icon"></span>
                                    <el-icon v-if="item.value == 'default'">
                                        <component :is="icon" class="el-icon"/>
                                    </el-icon>
                                    <component 
                                        v-else 
                                        :is="icon" 
                                        class="park-icon"
                                    />
                                    <span class="icon-name">{{ getIconName(icon) }}</span>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <template #footer>
            <span class="fl ml-10">
                <el-color-picker v-model="selectedIcon.color" show-alpha :predefine="getElColorPickerPredefineColors()" />
                <span class="ml-5">选择颜色</span>
            </span>
            <el-button style="width: 80px;" @click="clearIcon" size="default" plain>清空</el-button>
            <el-button style="width: 80px;" @click="dialogIsShow = false" size="default" plain>取消</el-button>
            <el-button type="primary" style="width: 80px;" @click="confirmIcon" size="default">确认</el-button>
            
        </template>
    </ml-dialog>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import config from "@/config/iconSelect";
import { getElColorPickerPredefineColors } from "@/utils/util";
const props = defineProps({
    modelValue: null,
    useIcon: {
        type: Object,
        default: () => {
            return {
                name: "",
                color: "",
            };
        },
    },
});

const emit = defineEmits(["update:modelValue", "confirmIcon"]);
let dialogIsShow = ref(false);
let keyWord = ref("");

watch(
    () => props.modelValue,
    () => {
        dialogIsShow.value = props.modelValue;
        selectedIcon.value = { ...props.useIcon };
    },
    { deep: true }
);
watch(
    () => dialogIsShow.value,
    () => {
        emit("update:modelValue", dialogIsShow.value);
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
// 当前选中的Icon
let selectedIcon = ref({
    name: "",
    color: "",
});

onMounted(() => {
    dialogIsShow.value = props.modelValue;
    iconData.value = JSON.parse(JSON.stringify(config.icons)).map(
        el => {
            el.label = el.name + "(" + el.icons.length + ")";
            return el;
        }
    );
});

const search = (text) => {
    if (text) {
        // 将搜索文本转换为大写
        const upperText = text.toUpperCase(); 
        const filterData = JSON.parse(JSON.stringify(config.icons));
        filterData.forEach((t) => {
            t.icons = t.icons.filter((n) => {
                // 将图标名称也转换为大写后进行比较
                return n.toUpperCase().includes(upperText); 
            });
        });
        iconData.value = filterData;
    } else {
        iconData.value = JSON.parse(JSON.stringify(config.icons));
    }
};

// 清空图标
const clearIcon = () => {
    selectedIcon.value.name = "";
    selectedIcon.value.color = "";
};


const getIconName = (name) => {
    let tempSplit = name.split("-");
    return tempSplit[tempSplit.length - 1];
};

const selectIcon = (icon) => {
    selectedIcon.value.name = icon;
};

// 确认选中图标
const confirmIcon = () => {
    emit("confirmIcon", selectedIcon.value);
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
.ml-icon-select__list li:hover,
.ml-icon-select__list li.is-active {
    box-shadow: 0 0 1px 4px var(--el-color-primary);
    background: var(--el-color-primary-light-5);
}
.ml-icon-select__list li:hover i,
.ml-icon-select__list li:hover .park-icon,
.ml-icon-select__list li.is-active i,
.ml-icon-select__list li.is-active .park-icon {
    color: var(--el-color-primary);
}

.footer-box {
    height: 32px;
    text-align: right;
    padding-right: 45px;
    padding-left: 20px;
}
.park-icon {
    font-size: 22px;
    color: #6d7882;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    padding-top: 18px;
}
</style>