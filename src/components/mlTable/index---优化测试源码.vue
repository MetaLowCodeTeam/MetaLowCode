<template>
	<!--  -->
	<div>
		<el-table ref="TableRef" :data="sliceTable" height="400px">
			<el-table-column type="selection" width="40"> </el-table-column>
			<el-table-column
				prop="name"
				label="姓名"
				width="120"
			></el-table-column>
			<el-table-column
				prop="age"
				label="年龄"
				width="120"
			></el-table-column>
			<el-table-column prop="address" label="住址"></el-table-column>
			<el-table-column
				v-for="(item, inx) of columns"
				:key="inx"
				:prop="item.prop"
				:label="item.label"
				:width="120"
			></el-table-column>
		</el-table>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";

let TableRef = ref();

let tableData = ref([]);

// 开始索引
let startIndex = ref(0);
let sliceTable = ref([]);

let columns = ref([]);

onMounted(() => {
	// 挂载
	TableRef.value &&
		TableRef.value.$refs.bodyWrapper.addEventListener(
			"mousewheel",
			scrollBehavior
		);

	loadTableData();
});

const loadTableData = () => {
	for (let i = 0; i < 50; i++) {
		columns.value.push({
			prop: "column" + (i + 1),
			label: "测试数据列" + (i + 1),
		});
	}

	for (let i = 0; i < 500; i++) {
		let obj = {
			id: i + 1,
			name: "zhangsan" + (i + 1),
			age: 12,
			address: "随时随刻上课上课上课上课上课上课",
		};
		columns.value.forEach((el) => {
			obj[el.prop] = "测试数据啊啊";
		});
		tableData.value.push(obj);
	}

	sliceTable.value = tableData.value.slice(0, 50);
};

onUnmounted(() => {
	// 卸载
	TableRef.value &&
		TableRef.value.$refs.bodyWrapper.removeEventListener(
			"mousewheel",
			scrollBehavior
		);
});

// 滚动行为
function scrollBehavior(e) {
	// 滚动方向判定
	const scrollDirection = e.deltaY > 0 ? "down" : "up";
	if (scrollDirection === "down") {
		// 获取提供实际滚动的容器
		const dom =
			TableRef.value.$refs.bodyWrapper.getElementsByClassName(
				"el-scrollbar__wrap"
			)[0];
		const { clientHeight, scrollTop, scrollHeight } = dom;
		// console.log(clientHeight + scrollTop, scrollHeight);
		// 父容器高度 + 子容器距离父容器顶端的高度 = 子容器可滚动的高度
		if (scrollHeight - (clientHeight + scrollTop) <= 300) {
			// console.log("竖向滚动条已经滚动到底部");
			if (sliceTable.value.length < tableData.value.length) {
				sliceTable.value.push(
					...tableData.value.slice(
						sliceTable.value.length,
						sliceTable.value.length + 50
					)
				);
			}
		}
	}
}
</script>
<style lang="scss" scoped></style>
