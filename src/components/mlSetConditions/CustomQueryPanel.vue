<style lang="scss" scoped>
.ml-customize-query {
	margin-bottom: 6px;
	display: flex;
	overflow: hidden;
	:deep(.is-horizontal) {
		display: none !important;
	}
	.conditions-comp {
		width: calc(100% - 180px);
	}
	.conditions-action {
		width: 180px;
		text-align: right;
	}
	.split-query-btn {
		margin-right: 12px;
		:deep(.el-button) {
			padding: 0 10px;
		}
	}
}
:deep(.conditions-comp) {
    .el-row {
        border: 0 !important;
        padding: 0 !important;
    }
}
:deep(.ml-conditions-list) {
    margin-bottom: 5px !important;
}
</style>
<template>
	<div class="ml-customize-query">
		<div class="conditions-comp" >
			<mlSetConditions
				v-model="compConditions"
				:entityName="entityName"
				displayedComp
				:forbidUserModifyField="forbidUserModifyField"
				:hideQueryMatchType="hideQueryMatchType"
                :labelPosition="labelPosition"
                v-if="compConditions.items.length > 0"
			/>
		</div>
		<div class="conditions-action">
			<el-dropdown
				split-button
				type="primary"
				@click="onSearch('OR')"
				size="default"
				class="split-query-btn"
				@command="onSearch"
			>
				查询
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="OR">
							符合任一条件
						</el-dropdown-item>
						<el-dropdown-item command="AND">
							符合全部条件
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-button @click="onReset" style="width: 74px">
				重置
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from "vue";
const props = defineProps({
    entityName: { type: String, default: "" },
    // 禁止用户修改字段
    forbidUserModifyField: { type: Boolean, default: false },
    // 隐藏查询匹配类型
    hideQueryMatchType: { type: Boolean, default: false },
    // 标签位置
    labelPosition: { type: Number, default: 3 },
    // 查询条件
    filter: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["reset", "onSearch"]);



const notEmptyItems = [
	"NL",
	"NT",
	"SFU",
	"SFB",
	"SFD",
	"SFT",
	"YTA",
	"TDA",
	"TTA",
	"CUW",
	"CUM",
	"CUQ",
	"CUY",
	"REFD",
	"REFU",
];


let compConditions = ref({
    equation: "OR",
    items: [],
});


watch(() => props.filter, (newVal) => {
    compConditions.value = Object.assign({}, compConditions.value, newVal);
}, {
    immediate: true,
    deep: true,
})


const onSearch = (command) => {
	compConditions.value.equation = command;
	let newCompConditions = {
		equation: command,
		items: [],
	};
    let tempItems = JSON.parse(JSON.stringify(compConditions.value.items));
    tempItems.forEach(el => {
        if(el.value && typeof el.value == 'string' && el.type !== "DateTime" && el.type !== "Date") {
            el.value = el.value.replace(/\s/g, '');
        }
        // 如果是多引用类型 且不是 为空不为空
        if(el.type == 'ReferenceList' && el.op != 'NL' && el.op != 'NT'){
            const { queryEntityInfoByName } = useCommonStore();
            let idFieldName = queryEntityInfoByName(props.entityName).idFieldName;
            // 如果是本人、本部门
            if(el.op == "REFD" || el.op == "REFU"){
                el.value = idFieldName;
            }
            // 如果是包含
            if(el.op == "REF"){
                el.value2 = el.value;
                el.value = idFieldName;
            }
        }
        if(el.type == "DateTime" || el.type == "Date"){
            if(el.value == 0) {
                el.value = null;
            }
            if(el.value2 == 0) {
                el.value2 = null;
            }
        }
    })
	newCompConditions.items = tempItems.filter(
		(el) =>
			(el.value !== undefined && el.value !== null && el.value !== "") ||
			(el.value2 !== undefined && el.value2 !== null && el.value2 !== "") ||
			notEmptyItems.includes(el.op)
	);
	emit("onSearch", newCompConditions);
};

const onReset = () => {
	let newCompConditions = JSON.parse(JSON.stringify(compConditions.value));
	newCompConditions.items = [];
	compConditions.value.items.forEach((el) => {
        el.refLabel = null;
		el.value = null;
		el.value2 = null;
        el.value3 = null;
	});
	emit("reset", newCompConditions);
};

</script>
