<template>
    <el-select
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :loading="loading"
        @change="handleChange"
        clearable
        filterable
        :filter-method="filterEntityMethod"
        @clear="handleClear"
    >
        <el-option-group
            v-for="(group, groupIndex) in filteredGroupedEntityList"
            :key="groupIndex"
            :label="group.tag"
        >
            <el-option
                v-for="item in group.items"
                :key="item.entityCode"
                :label="item.label"
                :value="item.name"
            ></el-option>
        </el-option-group>
    </el-select>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getEntitySet } from "@/api/system-manager";

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
    disabled: {
        type: Boolean,
        default: false
    },
    // 是否选择主实体
    isSelectMainEntity: {
        type: Boolean,
        default: false
    },
    // 占位符
    placeholder: {
        type: String,
        default: "请选择实体"
    }   
});

const emit = defineEmits(["update:modelValue", "change"]);

let loading = ref(false);
let tableData = ref([]);
let groupedEntityList = ref([]);
let searchQuery = ref("");

const loadEntityList = async () => {
    loading.value = true;
    try {
        let res = await getEntitySet();
        if (res && res.code == 200) {
            let entityItems = res.data;
            if (!!entityItems) {
                tableData.value = entityItems.filter((entity) => {
            if (props.isSelectMainEntity) {
                return entity.detailEntityFlag === false;
            }
            return true;
        }).map(entity => ({
            name: entity.name,
            label: props.isSelectMainEntity 
                ? entity.label + '(' + entity.name + ')'
                : entity.label + '(' + (entity.detailEntityFlag ? '从实体：' : '主实体：') + entity.name + ')',
            entityCode: entity.name,
            tags: entity.tags || ''
        }));
            }
            updateGroupedEntityList();
        }
    } catch (error) {
        console.error('加载实体列表失败:', error);
    } finally {
        loading.value = false;
    }
};

const updateGroupedEntityList = () => {
    const groups = {};
    tableData.value.forEach(item => {
        const tags = item.tags || '';
        if (!tags) {
            if (!groups['未分类']) {
                groups['未分类'] = [];
            }
            groups['未分类'].push(item);
        } else {
            const tagArray = tags.split(',');
            tagArray.forEach(tag => {
                const trimmedTag = tag.trim();
                if (!groups[trimmedTag]) {
                    groups[trimmedTag] = [];
                }
                groups[trimmedTag].push(item);
            });
        }
    });
    
    groupedEntityList.value = Object.keys(groups).map(tag => ({
        tag: tag,
        items: groups[tag]
    }));
};

const filteredGroupedEntityList = computed(() => {
    if (!searchQuery.value) {
        return groupedEntityList.value;
    }
    
    return groupedEntityList.value.map(group => ({
        tag: group.tag,
        items: group.items.filter(item => {
            const searchText = searchQuery.value.toLowerCase();
            const label = (item.label || '').toLowerCase();
            const name = (item.name || '').toLowerCase();
            return label.includes(searchText) || name.includes(searchText);
        })
    })).filter(group => group.items.length > 0);
});

const filterEntityMethod = (query) => {
    searchQuery.value = query;
};

const handleChange = (value) => {
    emit("update:modelValue", value);
    emit("change", value);
};

const handleClear = () => {
    emit("update:modelValue", "");
    emit("change", "");
};

onMounted(() => {
    loadEntityList();
});
</script>

<style lang="scss" scoped>
</style>
