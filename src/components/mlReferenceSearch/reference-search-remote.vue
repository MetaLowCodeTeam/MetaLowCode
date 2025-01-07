<style lang="scss" scoped>
.remote-box {
    // position: relative;
    // height: 33px;
    display: flex;
}
.remote-select {
    flex: 1;
    :deep(.el-select__wrapper) {
        border-radius: 4px 0 0 4px;
    }
}
.remote-icon-box {
    height: 32px;
	width: 46px;
	text-align: center;
	border-radius: 0 4px 4px 0;
	border: 1px solid #e4e7ed;
    border-left: none;
    box-sizing: border-box;
    background: #F5F7FA;
    color: #909399;
    cursor: pointer;
}
</style>
<template>
	<div class="remote-box w-100">
		<el-select
			v-model="value"
			:multiple="multiple"
			filterable
			remote
			reserve-keyword
			:placeholder="placeholder"
			:remote-method="remoteMethod"
			:loading="loading"
			@change="handleChange"
			class="remote-select"
		>
			<el-option
				v-for="item in options"
				:key="item.id"
				:label="item.name"
				:value="item.id"
			/>
		</el-select>
		<div class="remote-icon-box" @click="onAppendButtonClick">
            <el-icon class="icon-top-1">
                <Search />
            </el-icon>
        </div>
	</div>
</template>
<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { refFieldQuery2 } from "@/api/crud";
const props = defineProps({
	fieldModel: {
		type: Object,
		default: null,
	},
	multiple: {
		type: Boolean,
		default: false,
	},
	placeholder: {
		type: String,
		default: "",
	},
	entity: {
		type: String,
		default: "",
	},
	refField: {
		type: String,
		default: "",
	},
	searchFields: {
		type: Array,
		default: [],
	},
});

const emit = defineEmits(["onSelectedRemote", "onAppendButtonClick"]);
let value = ref(null);
let loading = ref(false);
let options = ref([]);

const remoteMethod = async (query: string) => {
	if (query) {
		loading.value = true;
		let param = {
			entity: props.entity,
			refField: props.refField,
			pageNo: 1,
			pageSize: 10,
		};
		let filter = null;
		if (props.searchFields.length > 0) {
			filter = {
				equation: "OR",
				items: props.searchFields.map((el) => {
					return {
						fieldName: el,
						value: query,
						op: "LK",
					};
				}),
			};
		}
		let res = await refFieldQuery2(
			param.entity,
			param.refField,
			param.pageNo,
			param.pageSize,
			null,
			null,
			filter
		);
		if (res) {
			options.value = res.data.dataList.map((el) => {
				return {
					id: el[res.data.idFieldName],
					name: el[res.data.nameFieldName],
					row: el,
				};
			});
		}
		loading.value = false;
	} else {
		options.value = [];
	}
};

const handleChange = () => {
	let row = options.value.find((el) => el.id === value.value);
	emit("onSelectedRemote", {
		record: {
			id: row.id,
			label: row.name,
		},
		selectedRow: row.row,
	});
};

watchEffect(() => {
	value.value = props.fieldModel ? props.fieldModel.name : "";
});

const onAppendButtonClick = () => {
    // console.log('onAppendButtonClick')
    emit('onAppendButtonClick')
}

// watch(
// 	() => props.fieldModel,
// 	(newVal) => {
// 		if (value.value) {
// 			return;
// 		}
// 		if (newVal) {
// 			if (props.multiple) {
// 				value.value = props.fieldModel;
// 			} else {
// 				value.value = props.fieldModel.name;
// 			}
//             console.log(newVal,'newVal')
// 		}
// 	},
// 	{
// 		immediate: true,
// 	}
// );

// watchEffect(() => {
//     // console.log(props.fieldModel,'props.fieldModel')

//     if(value.value) {
//         return
//     }
// 	if (props.fieldModel) {
// 		// value.value = JSON.parse(JSON.stringify(props.fieldModel));
//         if(props.multiple) {
//             console.log(props.fieldModel,'多数据')
//             console.log(value.value, 'value---多')
//             value.value = props.fieldModel.map((el) => el.name);
//         }else {
//             value.value = props.fieldModel.name;
//             console.log(props.fieldModel,'单数据')
//         }
// 	}
//     // options.value = [
//     //     {
//     //         id: '1',
//     //         name: '2',
//     //     }
//     // ]
//     // console.log(value.value,'value.value')
// });
</script>
