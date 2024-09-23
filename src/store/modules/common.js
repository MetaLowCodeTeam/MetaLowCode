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
        webVer: "1.6.86 20240923"
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
            allEntityList.value.push(el);
        })
    }
    // 根据ID查实体名称
    const queryEntityNameById = (id) => {
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
    const queryAllEntityList = () => {
        return allEntityList.value
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
        publicSetting.value.pluginIdList = data.pluginIdList;
        publicSetting.value.webVer += "(" + data.version + ")";
        publicSetting.value.appMode = data.appMode;
        publicSetting.value.homeURL = data.homeURL;
        publicSetting.value.mobilePhoneLogin = data.mobilePhoneLogin;
        publicSetting.value.approvalModifiableEntity = data.approvalModifiableEntity || "";
    }
    // 传入实体名称拿主实体或者明细实体CODE
    const queryEntityCodeByEntityName = (name) => {
        let entity = allEntityList.value.filter(el => el.name == name && el.detailEntityFlag ? el.mainEntityCode : el.entityCode);
        if (entity.length > 0) {
            return entity[0].entityCode;
        }
        return "";
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
        setUserInfo,
        queryNameByObj,
        checkModifiableEntity,
        queryAllEntityList,
        queryEntityCodeByEntityName
    }
})

export default useCommonStore
