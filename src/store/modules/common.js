import { defineStore } from 'pinia';
import { reactive, ref } from 'vue'
import { getEntitySet } from '@/api/system-manager'
import tool from '@/utils/tool';
const useCommonStore = defineStore('commonStore', () => {
    // 所有实体label
    let allEntityLabel = reactive({});
    // 所有实体Name
    let allEntityName = reactive({});
    // 所有实体Code
    let allEntityCode = reactive({});
    // 非系统实体
    let unSystemEntityList = ref([]);
    // 审批流程实体
    let processEntityList = ref([]);
    // 系统配置
    let publicSetting = ref({
        webVer: "1.3.14 20240202"
    });
    const getEntityList = () => {
        return new Promise(async (resolve, reject) => {
            let res = await getEntitySet();
            if (res && res.data) {
                refreshCache(res.data)
            }
            resolve();
        });
    }
    const refreshCache = (list) => {
        unSystemEntityList.value = [];
        processEntityList.value = [];
        list.forEach(el => {
            allEntityLabel[el.entityCode] = el.label;
            allEntityName[el.entityCode] = el.name;
            allEntityCode[el.name] = el.entityCode;
            if (!el.systemEntityFlag) {
                unSystemEntityList.value.push(el);
            }
            if (!el.systemEntityFlag && !el.detailEntityFlag) {
                processEntityList.value.push(el);
            }
        })
    }
    const queryEntityNameById = (id) => {
        return allEntityName[parseInt(id.split('-')[0])];
    }
    const queryEntityCodeById = (id) => {
        return parseInt(id.split('-')[0]);
    }
    const queryEntityNameByLabel = (name) => {
        return allEntityLabel[allEntityCode[name]];
    }
    const queryEntityNameByCode = (code) => {
        return allEntityName[code];
    }
    const setPublicSetting = (data) => {
        publicSetting.value.APP_NAME = data.appName;
        publicSetting.value.APP_VER = data.dbVersion;
        publicSetting.value.APP_LOGO = data.logo;
        publicSetting.value.APP_PAGE_FOOTER = data.pageFooter;
        publicSetting.value.APP_TITLE = data.appTitle;
        publicSetting.value.APP_SUB_TITLE = data.appSubtitle;
        publicSetting.value.APP_INTRO = data.appIntro;
        publicSetting.value.APP_WATERMARK = data.watermark;
        publicSetting.value.APP_PLUGINID = data.pluginIdList;
        publicSetting.value.APP_COLOR = data.themeColor
        publicSetting.value.productType = data.productType;
        publicSetting.value.trialVersionFlag = data.trialVersionFlag;
        publicSetting.value.webVer += "(" + data.version + ")";
    }
    const setUserInfo = (user) => {
        let userInfo = {
            userName: user.userName,
            loginName: user.loginName,
            userId: user.userId,
            dashboard: "1",
            departmentId: user.departmentId,
            jobTitle: user.jobTitle,
            email: user.email,
            mobilePhone: user.mobilePhone,
            ownerTeam: user.ownerTeam,
            departmentName: user.departmentName,
        };
        tool.data.set("USER_INFO", userInfo);
    }
    return {
        allEntityLabel,
        getEntityList,
        unSystemEntityList,
        processEntityList,
        refreshCache,
        allEntityName,
        allEntityCode,
        queryEntityNameById,
        queryEntityCodeById,
        queryEntityNameByLabel,
        queryEntityNameByCode,
        publicSetting,
        setPublicSetting,
        setUserInfo
    }
})

export default useCommonStore