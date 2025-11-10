<template>
	<div class="cell">
		<el-row :gutter="8" style="width: 100%;height: 100%;">
			<el-col :span="4" :xs="24">
				<div class="cell-tree">
					<div class="tree-title">视频设备列表</div>
					<el-tree 
					    ref="deviceTreeRef" 
						:data="deviceTreeData"
						node-key="id"
						:highlight-current="true"
						@node-click="deviceNodeClick"
					    class="device-tree"></el-tree>
				</div>
			</el-col>
			<el-col :span="20" :xs="24">
				<div class="cell-tool">
					<div class="bk-button-group">
						<el-button-group>
							<el-button :type="getButtonType(0)" @click="splitView(0)">单屏</el-button>
							<el-button :type="getButtonType(1)" @click="splitView(1)">四分屏</el-button>
							<el-button :type="getButtonType(2)" @click="splitView(2)">九分屏</el-button>
							<el-button :type="getButtonType(3)" @click="splitView(3)">十六分屏</el-button>
						</el-button-group>
					</div>
				</div>
				<!-- 1 -->
				<div class="player" v-show="displayStates[0]">
					<div class="cell-player-1" :class="{ 'selected': selectedPlayer === 0 }" @click="selectPlayer(0)">
						<LivePlayer :videoUrl=videoArray[0] live />
					</div>
				</div>
				<!-- 4 -->
				<div class="player1" v-show="displayStates[1]">
					<div class="cell-player-4" :class="{ 'selected': selectedPlayer === 0 }" @click="selectPlayer(0)">
						<LivePlayer :videoUrl=videoArray[0] live />
					</div>
					<div class="cell-player-4" :class="{ 'selected': selectedPlayer === 1 }" @click="selectPlayer(1)">
						<LivePlayer :videoUrl=videoArray[1] live />
					</div>
					<div class="cell-player-4" :class="{ 'selected': selectedPlayer === 2 }" @click="selectPlayer(2)">
						<LivePlayer :videoUrl=videoArray[2] live />
					</div>
					<div class="cell-player-4" :class="{ 'selected': selectedPlayer === 3 }" @click="selectPlayer(3)">
						<LivePlayer :videoUrl=videoArray[3] live />
					</div>
				</div>
				<!-- 9 -->
				<div class="player2" v-show="displayStates[2]">
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 0 }" @click="selectPlayer(0)">
						<LivePlayer :videoUrl=videoArray[0] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 1 }" @click="selectPlayer(1)">
						<LivePlayer :videoUrl=videoArray[1] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 2 }" @click="selectPlayer(2)">
						<LivePlayer :videoUrl=videoArray[2] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 3 }" @click="selectPlayer(3)">
						<LivePlayer :videoUrl=videoArray[3] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 4 }" @click="selectPlayer(4)">
						<LivePlayer :videoUrl=videoArray[4] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 5 }" @click="selectPlayer(5)">
						<LivePlayer :videoUrl=videoArray[5] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 6 }" @click="selectPlayer(6)">
						<LivePlayer :videoUrl=videoArray[6] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 7 }" @click="selectPlayer(7)">
						<LivePlayer :videoUrl=videoArray[7] live />
					</div>
					<div class="cell-player-9" :class="{ 'selected': selectedPlayer === 8 }" @click="selectPlayer(8)">
						<LivePlayer :videoUrl=videoArray[8] live />
					</div>
				</div>
				<!-- 16 -->
				<div class="player4" v-show="displayStates[3]">

					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 0 }" @click="selectPlayer(0)">
						<LivePlayer :videoUrl=videoArray[0] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 1 }" @click="selectPlayer(1)">
						<LivePlayer :videoUrl=videoArray[1] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 2 }" @click="selectPlayer(2)">
						<LivePlayer :videoUrl=videoArray[2] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 3 }" @click="selectPlayer(3)">
						<LivePlayer :videoUrl=videoArray[3] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 4 }" @click="selectPlayer(4)">
						<LivePlayer :videoUrl=videoArray[4] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 5 }" @click="selectPlayer(5)">
						<LivePlayer :videoUrl=videoArray[5] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 6 }" @click="selectPlayer(6)">
						<LivePlayer :videoUrl=videoArray[6] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 7 }" @click="selectPlayer(7)">
						<LivePlayer :videoUrl=videoArray[7] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 8 }" @click="selectPlayer(8)">
						<LivePlayer :videoUrl=videoArray[8] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 9 }" @click="selectPlayer(9)">
						<LivePlayer :videoUrl=videoArray[9] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 10 }" @click="selectPlayer(10)">
						<LivePlayer :videoUrl=videoArray[10] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 11 }" @click="selectPlayer(11)">
						<LivePlayer :videoUrl=videoArray[11] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 12 }" @click="selectPlayer(12)">
						<LivePlayer :videoUrl=videoArray[12] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 13 }" @click="selectPlayer(13)">
						<LivePlayer :videoUrl=videoArray[13] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 14 }" @click="selectPlayer(14)">
						<LivePlayer :videoUrl=videoArray[14] live />
					</div>
					<div class="cell-player-16" :class="{ 'selected': selectedPlayer === 15 }" @click="selectPlayer(15)">
						<LivePlayer :videoUrl=videoArray[15] live />
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { crudListQuery } from "@/api/crud"
import LivePlayer from '@liveqing/liveplayer-v3'
import { ElMessage, ElMessageBox } from 'element-plus'

const deviceTreeData = ref([])
let displayStates = ref([false, true, false, false])
let maxViewCount = ref(4)
let videoArray = ref(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
const selectedPlayer = ref(null) // 添加选中播放器状态

const splitView = (i) => {
	for (let j = 0; j < displayStates.value.length; j++) {
		displayStates.value[j] = false
	}
	displayStates.value[i] = true
	maxViewCount.value = (i + 1) * (i + 1)

	localStorage.setItem('videoPlay_displayStates', JSON.stringify(displayStates.value))
}

const getButtonType = (buttonIndex) => {
	return displayStates.value[buttonIndex] ? "primary" : ""
}

// 选择播放器函数
const selectPlayer = (index) => {
	selectedPlayer.value = selectedPlayer.value === index ? null : index
}

const getDeviceTreeData = async () => {
	const queryBody = {
		mainEntity: 'DeviceInfo',
		fieldsList: 'deviceInfoId, deviceName, videoPlaybackLink',
		filter: null
	}
	queryBody.filter = {
		"equation": "AND",
		"items": [
			{
				"fieldName": "deviceType",
				"op": "EQ",
				"value": "0001024-5f39586d1cfb4151baa53fda7c78f20b",
				"value2": ""
			},
			{
				"fieldName": "videoPlaybackLink",
				"op": "NT",
				"value": "",
				"value2": ""
			}
		]
	}

	const resultData = await crudListQuery(queryBody)
	if (resultData?.data?.dataList) {
		deviceTreeData.value.length = 0
		resultData.data.dataList.map(item => {
			deviceTreeData.value.push({
				id: item.deviceInfoId,
				label: item.deviceName,
				videoUrl: item.videoPlaybackLink
			})
		})
	}
}

const initDisplayStatesAndPlayList = () => {
	displayStates.value = JSON.parse(localStorage.getItem('videoPlay_displayStates')) || [false, true, false, false]
	videoArray.value = JSON.parse(localStorage.getItem('videoPlay_videoArray')) || ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
}

const deviceNodeClick = async (node) => {
	if (!node.videoUrl) {
		return
	}

	let foundFlag = false
	for (let i = 0; i < maxViewCount.value; i++) {
		if (videoArray.value[i] === node.videoUrl) {
			foundFlag = true
			selectPlayer(i)
			const currentView = i + 1
			ElMessage.info(`当前视频正在第${currentView}窗口播放`)
			break
		}
	}

	if (!foundFlag) {
		let blankPlayerFlag = false
		for (let i = 0; i < maxViewCount.value; i++) {
			if (videoArray.value[i] === '') {
				videoArray.value[i] = node.videoUrl
				blankPlayerFlag = true
				selectPlayer(i)
				break
			}
		}

		if (blankPlayerFlag) {
			localStorage.setItem('videoPlay_videoArray', JSON.stringify(videoArray.value))
		} else {
			if ((selectedPlayer.value == null) || (selectPlayer.value > maxViewCount.value - 1)) {
				ElMessage.info('视频播放窗口已全部占用，请选中一个播放窗口替换')
			} else {
				selectPlayer(selectedPlayer.value)
				ElMessageBox.confirm('视频播放窗口已全部占用，确认在选中窗口播放吗？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					videoArray.value[selectedPlayer.value] = node.videoUrl
					localStorage.setItem('videoPlay_videoArray', JSON.stringify(videoArray.value))
				}).catch(() => {
					//
				})
			}
		}
	}
}

onMounted(() => { 
	getDeviceTreeData()
	initDisplayStatesAndPlayList()
})

</script>

<style scoped lang="scss">
.cell-tree {
	background-color: #fff;
	padding: 10px;
	height: calc(100% - 20px);

	.tree-title {
		font-size: 14px;
		text-align: center;
		font-weight: bold;
		color: #303133;
		margin-bottom: 10px;
	}

	.device-tree {
		height: calc(100% - 40px);
	}
}

.cell-tool .bk-button-group {
	margin-top: 12px;
	margin-bottom: 10px;
}

.player, .player1, .player2, .player4 {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.cell-player-4 {
	width: 50%;
	height: 50% !important;
	box-sizing: border-box;
	background-color: black;
	border: 1px solid white;
	color: white;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s ease;
}

.cell-player-1.selected, .cell-player-4.selected, .cell-player-9.selected, .cell-player-16.selected {
	border: 3px solid #409eff;
	box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.cell-player-1 {
	width: 100%;
	box-sizing: border-box;
	background-color: black;
	border: 1px solid white;
	color: white;
	text-align: center;
}

.cell-player-9 {
	width: 33.33%;
	height: 33.33% !important;
	box-sizing: border-box;
	background-color: black;
	border: 1px solid white;
	color: white;
	text-align: center;
}

.cell-player-16 {
	width: 25%;
	height: 25% !important;
	box-sizing: border-box;
	background-color: black;
	border: 1px solid white;
	color: white;
	text-align: center;
}

.cell {
	display: flex;
	flex-direction: column;
	height: 100%;
}
</style>
