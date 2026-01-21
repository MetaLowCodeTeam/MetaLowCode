import { defineStore } from 'pinia';
import { reactive, ref } from 'vue'
import { getEntitySet } from '@/api/system-manager'
import tool from '@/utils/tool';

const useCommonStore = defineStore('commonStore', () => {
    // 所有源实体
    let allEntityList = ref([]);
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
        webVer: "1.8.424 20260121"
    });

    // 添加登录状态管理
    const isLoginProcessing = ref(false);
    const loginPromise = ref(null); 

    // 设置登录处理状态
    const setLoginProcessing = (processing) => {
        isLoginProcessing.value = processing;
    };

    // 创建登录 Promise
    const createLoginPromise = () => {
        loginPromise.value = new Promise((resolve) => {
            // 这里会在 App.vue 中 resolve
            window.resolveLoginPromise = resolve;
        });
        return loginPromise.value;
    };

    // 完成登录处理
    const completeLogin = () => {
        if (window.resolveLoginPromise) {
            window.resolveLoginPromise();
            window.resolveLoginPromise = null;
        }
    };

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
        allEntityList.value = [];
        list.forEach(el => {
            allEntityLabel[el.entityCode] = el.label;
            allEntityName[el.entityCode] = el.name;
            allEntityCode[el.name] = el.entityCode;
            if (!el.systemEntityFlag && !el.internalEntityFlag) {
                unSystemEntityList.value.push(el);
            }
            if (!el.systemEntityFlag && !el.detailEntityFlag && !el.internalEntityFlag) {
                processEntityList.value.push(el);
            }
            allEntityList.value.push(el);
        })
    }
    // 根据ID查实体名称
    const queryEntityNameById = (id) => {
        if(!id) {
            return "";
        }
        return allEntityName[parseInt(id.split('-')[0])];
    }
    // 根据ID查名称字段
    const queryNameByObj = (id, obj) => {
        let entityName = queryEntityNameById(id);
        if(!entityName || !obj){
            return id;
        }
        let findCurtEntity = allEntityList.value.filter(el=> entityName == el.name);
        if(findCurtEntity.length < 1) {
            return id;
        }
        let nameFieldName = obj[findCurtEntity[0].nameFieldName];
        if(nameFieldName == null) {
            return id;
        }
        return nameFieldName;
    }
    // 根据ID查实体Code
    const queryEntityCodeById = (id) => {
        return parseInt(id.split('-')[0]);
    }
    // 根据实体名称查实体label
    const queryEntityLabelByName = (name) => {
        return allEntityLabel[allEntityCode[name]];
    }
    // 根据code查实体名称
    const queryEntityNameByCode = (code) => {
        return allEntityName[code];
    }
    // 根据名称查实体Code
    const queryEntityCodeByName = (name) => {
        return allEntityCode[name];
    }
    // 获取所有实体
    const queryAllEntityList = (internalEntityFlag = false, appAbbr = "") => {
        // internalEntityFlag = 内部实体
        // internalEntityFlag为true时返回所有实体，否则只返回internalEntityFlag为false的实体
        let list = internalEntityFlag ? allEntityList.value : allEntityList.value.filter(el => !el.internalEntityFlag);
        return list.filter(el => appAbbr ? el.appAbbr == appAbbr : !appAbbr);
    }
    const setPublicSetting = (data) => {
        // 初始化清空多租户ID，避免缓存
        publicSetting.value.tenantId = "";
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
        publicSetting.value.commonVer = publicSetting.value.webVer + "(" + data.version + ")";
        publicSetting.value = Object.assign(publicSetting.value, data);
        publicSetting.value.approvalModifiableEntity = data.approvalModifiableEntity || "";
        // publicSetting.value.appMode = data.appMode;
        // publicSetting.value.homeURL = data.homeURL;
        // publicSetting.value.productType = data.productType;
        // publicSetting.value.trialVersionFlag = data.trialVersionFlag;
        // publicSetting.value.pluginIdList = data.pluginIdList;
        // publicSetting.value.mobilePhoneLogin = data.mobilePhoneLogin;
        if(!data.layoutConfig) {
            publicSetting.value.layoutConfig = "header";
        }
    }
    const setPublicSettingByKey = (key, value) => {
        publicSetting.value[key] = value;
    }
    // 传入实体名称拿主实体或者明细实体CODE
    const queryEntityCodeByEntityName = (name) => {
        let entity = allEntityList.value.filter(el => el.name == name);
        if (entity.length > 0) {
            return entity[0].detailEntityFlag ? entity[0].mainEntityCode : entity[0].entityCode;
        }
        return "";
    }
    // 检查实体是否明细(传入实体名称 or 实体CODE)
    const checkDetailEntityFlag = (value) => {
        let flag = false;
        for (let index = 0; index < allEntityList.value.length; index++) {
            const el = allEntityList.value[index];
            if (el.name == value || el.entityCode == value) {
                return el.detailEntityFlag;
            }

        }
        return flag
    }
    const setUserInfo = (user) => {
        let userInfo = {
            dashboard: "1",
            ...user,
        };
        tool.data.set("USER_INFO", userInfo);
    }
    // 检测实体审批状态是否可编辑  返回true 可编辑  false 不可编辑
    const checkModifiableEntity = (id, status) => {
        let curtEntityName = queryEntityNameById(id);
        let approvalModifiableEntity = publicSetting.value.approvalModifiableEntity.split(",");
        // 审批中... 不可编辑
        if(status == 1) {
            return false;
        }else if(status == 3) {
            // 审批完成 返回true false
            return approvalModifiableEntity.includes(curtEntityName)
        }else {
            return true;
        }
    }
    // 根据实体名称查 实体信息
    const queryEntityInfoByName = (name) => {
        let entity = allEntityList.value.filter(el => el.name == name);
        if(entity.length > 0) {
            return entity[0];
        }
        return {};
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
        queryEntityLabelByName,
        queryEntityNameByCode,
        queryEntityCodeByName,
        publicSetting,
        setPublicSetting,
        setPublicSettingByKey,
        setUserInfo,
        queryNameByObj,
        checkModifiableEntity,
        queryAllEntityList,
        queryEntityCodeByEntityName,
        checkDetailEntityFlag,
        queryEntityInfoByName,
        isLoginProcessing,
        setLoginProcessing,
        createLoginPromise,
        completeLogin,
    }
})

export default useCommonStore
