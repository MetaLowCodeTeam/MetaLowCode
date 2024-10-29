<template>
	<FullCalendar ref="FullCalendarRef" :options="calendarOptions" />
</template>

<script setup>
import { onMounted, ref, watchEffect } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayjs from "dayjs";
const props = defineProps({
    // 是否可拖拽
    eventStartEditable: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(["initCalendarData", "getCalendarList", "handleClick"]);

// watchEffect(() => {
//     console.log(props.eventStartEditable, 'eventStartEditable')
// })

let calendarOptions = ref({
	plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
	locale: "zh-cn", // 中文
	initialView: "dayGridMonth",
	headerToolbar: false,
	// headerToolbar: {
	//     left: "prev,next today",
	// 	center: "title",
	// 	right: "dayGridMonth,dayGridWeek,dayGridDay",
	// },
	height: "auto",
	// colorJSON: {
	// 	green: { title: "#00B578", class: "green" },
	// 	red: { title: "#FA5151", class: "red" },
	// 	orange: { title: "#FF8F1F", class: "orange" },
	// 	yellow: { title: "#FFC300", class: "yellow" },
	// 	cyan: { title: "#07B9B9", class: "cyan" },
	// 	blue: { title: "#3662EC", class: "blue" },
	// 	purple: { title: "#8A38F5", class: "purple" },
	// 	magenta: { title: "#EB2F96", class: "magenta" },
	// },
	eventStartEditable: props.eventStartEditable, // 允许拖拽内容
    eventResizableFromStart: false, // 允许拖拽开始时间
    droppable: false,
	events: [],
	aspectRatio: 2.2,
	locale: "zh-cn",
	// eventLimit: true,
	buttonText: {
		today: "回到今天",
		month: "月",
		week: "周",
		list: "列",
		day: "日",
	},
	allDayText: "全天",
	eventDrop: function (info) {
		// 拖拽停止时触发
		handleDrop(info);
	},
	eventClick: function (info) {
		// 点击查看时触发
		handleClick(info);
	},
    // eventResize: function (info) {
    //     // 拖拽时触发
    //     handleResize(info);
    // }
});

let FullCalendarRef = ref();

onMounted(() => {
	// 获取标题、今天
	toCalendarApi();
});

const setCalendarList = (list) => {
    calendarOptions.value.events = list;
	// calendarOptions.value.events = [
	// 	{ title: "事件 1", date: "2024-10-01", ceshi1Id: "1"  },
	// 	{ title: "事件 2", date: "2024-10-16", ceshi1Id: "2" },
	// ];
};

const toCalendarApi = (api, param) => {
	let calendarApi = FullCalendarRef.value?.getApi() || {};
	if (api) {
		calendarApi[api](param);
	}
    let activeStart = formatDate(calendarApi.view.activeStart);
    let activeEnd = formatDate(calendarApi.view.activeEnd);
    // 检测今天是否在活动时间范围内
    const today = formatDate(new Date());
    const isTodayInRange = today >= activeStart && today <= activeEnd;
    let calendarData = {
        activeStart,
        activeEnd,
        title: calendarApi.view.title,
        isTodayInRange
    }
	emit("initCalendarData", calendarData)
};


// 拖拽触发
const handleDrop = (info) => {
    const params = { ...info.event.extendedProps };
    let currentStart = dayjs(info.event.start).format('YYYY-MM-DD HH:mm:ss');
    emit("handleDrop", params, currentStart);
    
    // console.log(props.calendarField, 'calendarField');
    // console.log(params, 'handleDrop');
    // console.log(currentStart, 'currentStart');
    // console.log(props.idFieldName, 'idFieldName');
    // console.log(currentStart, 'currentStart');
    // getCurrentData(info);
}

// 改变时间触发
// const handleResize = (info) => {
// }

// 点击触发
const handleClick = (info) => {
    let params = { ...info.event.extendedProps };
    emit("handleClick", params);
}



const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // 获取 YYYY-MM-DD 格式
};


defineExpose({
	toCalendarApi,
    setCalendarList
});
</script>
