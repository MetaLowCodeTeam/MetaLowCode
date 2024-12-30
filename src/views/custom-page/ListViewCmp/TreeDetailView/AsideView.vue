<style scoped lang="scss">
.aside-view {
	height: 100%;
	background: #fff;
    position: relative;
    .refresh-btn {
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
        z-index: 1000;
    }
}
</style>
<template>
	<div class="aside-view">
        <span class="refresh-btn" @click="handleRefresh">
            <el-icon :size="15" color="#000">
                <Refresh />
            </el-icon>
        </span>
		<el-tree
            v-if="reloadTree"
			ref="treeRef"
			node-key="id"
			@node-click="handleNodeClick"
			:expand-on-click-node="false"
			:current-node-key="currentNodeId"
			:highlight-current="true"
			v-loading="loading"
			element-loading-text="加载中..."
			lazy
			:load="loadNode"
            :filter-node-method="filterNode"
		>
			<template #default="{ node, data }">
				<span class="custom-tree-node">
					<span>
						<el-icon
							class="icon-top-2"
							:size="15"
							:color="data.icon?.color"
							v-if="data.icon?.name"
						>
							<component :is="data.icon?.name" />
						</el-icon>
						{{ node.label }}
					</span>
				</span>
			</template>
		</el-tree>
	</div>
</template>
<script setup>
import { ref, nextTick, onMounted, watch } from "vue";
import { getDataList } from "@/api/crud";
import { useRouter } from "vue-router";
// 公共方法
import useCommonStore from "@/store/modules/common";
const { queryEntityInfoByName } = useCommonStore();


let currentEntity = ref({});
onMounted(() => {
	let entity = Router.currentRoute.value.query.entity;
	currentEntity.value = queryEntityInfoByName(entity);
});

const Router = useRouter();
const emit = defineEmits(["node-click", "clearSearch"]);
const props = defineProps({
	treeData: {
		type: Array,
		default: () => [],
	},
    treeConfig: {
        type: Object,
        default: () => {},
    },
    treeSearchValue: {
        type: String,
        default: "",
    },
});
let loading = ref(false);
let currentNodeId = ref("");

const treeRef = ref(null);
const handleNodeClick = (data) => {
	currentNodeId.value = data.id;
	emit("node-click", data);
	treeRef.value.setCurrentKey(data.id);
};


const loadNode = async (node, resolve) => {
	if (node.level === 0) {
		// 初次加载数据
		return resolve(props.treeData);
	}
    let { 
        dataShowTree,
        contentsField,
        dataIcon,
        contentsParentField,
    } = props.treeConfig;
    // 如果不是目录 并且 没有勾选树状展示数据
    if(!node.data.isParent && !dataShowTree){
        return resolve([]);
    }
    let filter = {
        equation: "OR",
        items: []
    };
    // 如果是目录
    if(node.data.isParent){
        filter.items = [
            {
                fieldName: contentsField,
                value: node.data.id,
                op: "EQ",
            }
        ];
    }
    // 如果是树状展示数据
    else {
        filter.items = [
            {
                fieldName: contentsParentField,
                value: node.data.id,
                op: "EQ",
            }
        ];
    }
	let res = await getDataList(
		currentEntity.value.name,
		currentEntity.value.nameFieldName,
		filter,
		999,
		1,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null
	);
	if (res && res.data) {
		let parentList = node.data.children
			? node.data.children.filter((el) => el.isParent)
			: [];
		let newList = res.data.dataList.map((el) => {
			return {
				id: el[currentEntity.value.idFieldName],
				label: el[currentEntity.value.nameFieldName],
				icon: dataIcon,
				isLeaf: true,
			};
		});
		// 数组合并
		let childrenList = [...parentList, ...newList];
        nextTick(() => {
            treeRef.value?.filter(props.treeSearchValue);
        })
		return resolve(childrenList);
	}
};

let reloadTree = ref(true);

const handleRefresh = () => {
    reloadTree.value = false;
    emit('clearSearch')
    nextTick(() => {
        reloadTree.value = true;
    })
};

watch(() => props.treeSearchValue, (newVal) => {
    treeRef.value?.filter(newVal);
})


// 过滤树
const filterNode = (value, data) => {
    if (!value) return true
    return data.label.includes(value)
}

defineExpose({
	handleRefresh,
});
</script>
