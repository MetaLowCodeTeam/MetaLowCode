<template>
	<promoter v-if="nodeConfig.type==0" v-model="nodeConfig" :isHideAddNode="isHideAddNode"></promoter>

	<approver v-if="nodeConfig.type==1" v-model="nodeConfig" :isHideAddNode="isHideAddNode"></approver>

	<send v-if="nodeConfig.type==2" v-model="nodeConfig" :isHideAddNode="isHideAddNode"></send>

	<branch v-if="nodeConfig.type==4" v-model="nodeConfig" :isHideAddNode="isHideAddNode">
		<template v-slot="slot">
			<node-wrap v-if="slot.node" v-model="slot.node.childNode" :isHideAddNode="isHideAddNode"></node-wrap>
		</template>
	</branch>

	<node-wrap v-if="nodeConfig.childNode" v-model="nodeConfig.childNode" :isHideAddNode="isHideAddNode"></node-wrap>

</template>

<script>
	import approver from './nodes/approver.vue'
	import promoter from './nodes/promoter.vue'
	import branch from './nodes/branch.vue'
	import send from './nodes/send.vue'

	export default {
		props: {
			modelValue: { type: Object, default: () => {} },
            isHideAddNode: { type: Boolean, default: false },
		},
		components: {
			approver,
			promoter,
			branch,
			send
		},
		data() {
			return {
				nodeConfig: {},
			}
		},
		watch:{
			modelValue(val){
				this.nodeConfig = val
			},
			nodeConfig(val){
				this.$emit("update:modelValue", val)
			}
		},
		mounted() {
			this.nodeConfig = this.modelValue
		},
		methods: {

		}
	}
</script>

<style>
</style>
