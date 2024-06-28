<template>
	<!--  -->
	<el-form-item label="每页显示多少条" label-width="120px">
		<el-select
			v-model="optionModel.paginationSize"
			placeholder="请选择每页条数"
		>
			<el-option
				v-for="item in options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
	</el-form-item>
</template>

<script>
export default {
	name: "listSubForm-paginationSize-editor",
	props: {
		optionModel: Object,
	},
	data() {
		return {
			pageSizes: [20, 40, 80, 100, 200, 300, 400, 500],
			options: [],
		};
	},
    mounted(){
        this.options = this.pageSizes.map(el => {
            return {
                label: el + "条/页",
                value: el
            }
        })
    },
};
</script>
