<template>
	<promoter
		v-if="nodeConfig.type == 0"
		v-model="nodeConfig"
	></promoter>


	<branch
		v-if="nodeConfig.type == 4"
		v-model="nodeConfig"
		:executePath="executePath"
        @error-click="errorClick"
	>
		<template v-slot="slot">
			<node-wrap
				v-if="slot.node"
				v-model="slot.node.childNode"
				:executePath="executePath"
				@error-click="errorClick"
			></node-wrap>
		</template>
	</branch>

	<node-wrap
		v-if="nodeConfig.childNode"
		v-model="nodeConfig.childNode"
		:executePath="executePath"
		@error-click="errorClick"
	></node-wrap>
</template>

<script>
	import promoter from './nodes/promoter.vue'
	import branch from './nodes/branch.vue'

	export default {
		props: {
			modelValue: { type: Object, default: () => ({}) },
			executePath: { type: String, default: "" },
		},
		emits: ['update:modelValue','errorClick'],
		components: { promoter, branch },
		data() {
			return { nodeConfig: {} }
		},
		watch: {
			modelValue(val) {
				this.nodeConfig = val
			},
			nodeConfig(val) {
				this.$emit('update:modelValue', val)
			},
		},
		mounted() {
			this.nodeConfig = this.modelValue
		},
		methods: {
            errorClick(item) {
                this.$emit('errorClick', item)
            }
        },
	}
</script>

<style>
</style>
