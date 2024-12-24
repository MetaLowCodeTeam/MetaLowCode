<style scoped lang="scss">
.help-text {
	width: 300px;
	font-size: 13px;
	line-height: 1.5;
}
</style>
<template>
	<el-collapse-item name="1">
		<template #title>
			<h3>时间事件</h3>
		</template>
		<el-form @submit.prevent label-width="auto" label-position="top">
			<el-form-item label="类型">
				<el-select
					v-model="formData.timedType"
					placeholder="请选择"
					@change="timedTypeChange"
				>
					<el-option label="时间" :value="1" />
					<el-option label="持续" :value="2" />
					<el-option label="循环" :value="3" />
				</el-select>
			</el-form-item>
			<el-form-item
				label="条件"
				v-if="formData.timedType == 1"
				class="is-required"
			>
				<el-date-picker
					v-model="formData.timeDate"
					type="datetime"
					placeholder="请选择时间"
					class="w-100"
				/>
			</el-form-item>
			<el-form-item label="循环类型" v-if="formData.timedType == 3">
				<el-select v-model="formData.timeCycleType" placeholder="请选择">
					<el-option label="Cron 表达式" :value="1" />
					<el-option label="Flowable Duration表达式" :value="2" />
				</el-select>
			</el-form-item>
			<el-form-item
				v-if="formData.timedType == 3 && formData.timeCycleType == 1"
				class="is-required"
			>
				<template #label>
					<el-tooltip placement="top">
						<template #content>
							<div class="help-text">
								{{ helpText.flowableDuration }}
							</div>
						</template>
						<el-icon class="icon-top-2">
							<QuestionFilled />
						</el-icon>
					</el-tooltip>
					<span class="ml-2">Cron 表达式</span>
				</template>
				<el-input
					style="width: 200px; margin-right: 5px"
					v-model="formData.timeCycle"
					placeholder="0 * * * * ?"
					@blur="cronFormat"
					clearable
				></el-input>
				<el-button type="primary" @click="cronDialogIsShow = true"
					>配置</el-button
				>
				<mlDialog
					title="CRON表达式"
					append-to-body
					width="37%"
					v-model="cronDialogIsShow"
				>
					<mlCron
						max-height="400px"
						i18n="cn"
						@onConfirm="setCron"
						@close="cronDialogIsShow = false"
						:cronValue="formData.timeCycle"
					></mlCron>
				</mlDialog>
			</el-form-item>
			<el-form-item
				v-if="
					formData.timedType == 2 ||
					(formData.timedType == 3 && formData.timeCycleType == 2)
				"
				class="is-required"
			>
				<template #label>
					<el-tooltip placement="top">
						<template #content>
							<div class="help-text">
								{{ helpText.flowableDuration }}
							</div>
						</template>
						<el-icon class="icon-top-2">
							<QuestionFilled />
						</el-icon>
					</el-tooltip>
					<span class="ml-2">Flowable Duration表达式</span>
				</template>
				<el-input
					v-model="formData.timeDuration"
					placeholder="请输入Flowable Duration表达式"
				/>
			</el-form-item>
		</el-form>
	</el-collapse-item>
</template>

<script setup>
import { reactive, ref } from "vue";
import mlCron from "@/components/mlCron/index.vue";
const props = defineProps({
	formData: { Type: Object, default: () => {} },
});
let helpText = reactive({
	// flowable 表达式
	flowableDuration:
		"指定定时器之前要等待多长时间。S 表示秒，M 表示分，D 表示天；P 表示时间段，T 表示精确到时间的时间段。\n注意：时间格式依然为 ISO 8601 格式，一年两个月三天四小时五分六秒内，可以写成 P1Y2M3DT4H5M6S。\nP 是开始标记，T 是时间和日期分割标记，没有日期只有时间 T 是不能省去 的，比如 1 小时执行一次应该写成 PT1H。",
	// 循环
	cycle: "指定重复执行的间隔，可以用来定期启动流程实例。 \n timeCycle 的设置目前有两种方 式：ISO 8601 和 Cron 表达式。\n R 表示需要执行的次数，R2/PT1M 表示执行两次，每次间隔 1 分钟。其中 endDate 是可选的配置，定时器将会在指定的时间停止工作。",
});

const timedTypeChange = () => {
	props.formData.timeCycle = "";
	props.formData.timeDuration = "";
	props.formData.timeDate = "";
};


let cronDialogIsShow = ref(false);

// 格式化CRON  第一位默认0
const cronFormat = () => {
    if (props.formData.timeCycle) {
        let myCron = props.formData.timeCycle.slice(1);
        props.formData.timeCycle = "0" + myCron;
    }
};

// 确认设置表达式
const setCron = (v) => {
    props.formData.timeCycle = v;
    cronDialogIsShow.value = false;
};
</script>
