import config from "./config"
import api from './api'
import tool from './utils/tool'
import http from "./utils/request"
import { permission, rolePermission } from './utils/permission'
import COMMON_CONFIG from './config/common';

import scTable from './components/scTable/index.vue'
import scTableColumn from './components/scTable/column.js'
import scQrCode from './components/scQrCode/index.vue'

import SimpleTable from './components/simpleTable/index.vue'

import auth from './directives/auth'
import auths from './directives/auths'
import authsAll from './directives/authsAll'
import role from './directives/role'
import time from './directives/time'
import copy from './directives/copy'
import errorHandler from './utils/errorHandler'
import SvgIcon from "./components/svgIcon/index.vue";

import * as elIcons from '@element-plus/icons-vue'
import * as scIcons from './assets/icons'

import mlSelectUser from './components/mlSelectUser/index.vue';
import mlSetConditions from './components/mlSetConditions/index.vue';

import mlDialog from './components/mlDialog/index.vue';
import mlPagination from './components/mlPagination/index.vue';
import mlSearchInput from './components/mlSearchInput/index.vue';
import mlSingleList from './components/mlSingleList/index.vue';
import mlListDetails from './components/mlListDetails/index.vue';
import mlActiveDialog from "./components/mlActiveDialog/index.vue";
import mlEntityMenuAndList from "./components/mlEntityMenuAndList/index.vue";
import mlLogo from './components/mlLogo/index.vue';
import mlAvatar from './components/mlAvatar/index.vue';
import mlUpload from "./components/mlUpload/index.vue";
import mlWaterMark from './components/mlWaterMark/index.vue';
import { ElMessage } from 'element-plus'

// 集成ParkIcons图标
import * as ParkIcons from '@icon-park/vue-next';
import {Popup, Picker, PickerGroup, DatePicker, TimePicker, Cascader, Checkbox, Icon} from 'vant'
export default {
	install(app) {
		//挂载全局对象
        app.config.globalProperties.$CloneDeep = data => JSON.parse(JSON.stringify(data));
		app.config.globalProperties.$CONFIG = config;
		app.config.globalProperties.$TOOL = tool;
		app.config.globalProperties.$HTTP = http;
		app.config.globalProperties.$API = api;
		app.config.globalProperties.$AUTH = permission;
		app.config.globalProperties.$ROLE = rolePermission;
        app.provide('$CONFIG',config)
        app.provide('$TOOL', tool);
        app.provide('$CloneDeep', (data) => JSON.parse(JSON.stringify(data)));
        app.provide('$API', api);
        app.provide('$ElMessage', ElMessage);
        app.provide('COMMON_CONFIG',COMMON_CONFIG);

        // 注册vant组件
        app.use(Popup);
        app.use(Picker);
        app.use(PickerGroup);
        app.use(DatePicker);
        app.use(TimePicker);
        app.use(Cascader);
        app.use(Checkbox);
        app.use(Icon);

		// 注册全局组件
        app.component('mlSelectUser', mlSelectUser);
        app.component('mlSetConditions', mlSetConditions);
        app.component('mlDialog', mlDialog);
        app.component('mlPagination', mlPagination);
        app.component('mlSearchInput', mlSearchInput);
        app.component('mlSingleList', mlSingleList);
        app.component('mlListDetails', mlListDetails);
        app.component('mlActiveDialog', mlActiveDialog);
        app.component('mlEntityMenuAndList', mlEntityMenuAndList);
        app.component('mlUpload', mlUpload);
        app.component('mlWaterMark', mlWaterMark);
        app.component('mlLogo', mlLogo);
        app.component('mlAvatar', mlAvatar);
		app.component('scTable', scTable);
		app.component('scTableColumn', scTableColumn);
		app.component('scQrCode', scQrCode);
		app.component('SimpleTable', SimpleTable)
		app.component('SvgIcon', SvgIcon)


		//注册全局指令
		app.directive('auth', auth)
		app.directive('auths', auths)
		app.directive('auths-all', authsAll)
		app.directive('role', role)
		app.directive('time', time)
		app.directive('copy', copy)

		//统一注册el-icon图标
		for(let icon in elIcons){
			app.component(`ElIcon${icon}`, elIcons[icon])
		}
		//统一注册sc-icon图标
		for(let icon in scIcons){
			app.component(`ScIcon${icon}`, scIcons[icon])
		}

        // 定义一个图标前缀，例如 'park-'
        const iconPrefix = 'park-';
        Object.keys(ParkIcons).forEach((iconName) => {
            app.component(`${iconPrefix}${iconName}`, ParkIcons[iconName]);
        });

		//关闭async-validator全局控制台警告
		window.ASYNC_VALIDATOR_NO_WARNING = 1

		//全局代码错误捕捉
		app.config.errorHandler = errorHandler
	}
}
