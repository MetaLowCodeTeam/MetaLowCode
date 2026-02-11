<template>
	<ml-dialog
		v-model="dialogConf.show"
		:title="dialogConf.title"
		:width="dialogConf.width"
		:show-close="!dialogConf.loading"
        showFullScreen
        @fullScreenChange="fullScreenChange"
	>
		<div v-loading="dialogConf.loading" element-loading-text="加载中...">
			<el-form 
                :model="formData" 
                :rules="rules" 
                ref="formRef"
                :disabled="isView"
            >
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="方法名称" prop="methodName">
							<el-input v-model="formData.methodName" clearable />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="方法类型" prop="methodType">
							<el-select
								v-model="formData.methodType"
								placeholder="请选择方法类型"
                                @change="onMethodTypeChange"
							>
								<el-option
									v-for="item in methodTypeList"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								/>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="方法地址" prop="methodUrl">
							<el-input v-model="formData.methodUrl" clearable>
								<template #prepend>
                                    {{ methodUrlPrefix[formData.methodType?.value || formData.methodType] }}
                                </template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="formData.methodType">
						<el-form-item label="方法配置" prop="javaCode">
							<div class="w-100">
								<mlCodeEditor
									v-model="formData.javaCode"
									mode="java"
									:height="isFullScreen ? 600 : 300"
                                    :disabled="isView"
								/>
							</div>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="closeDialog" :loading="dialogConf.loading">
				取消
			</el-button>
			<el-button
				type="primary"
				@click="confirm"
				:loading="dialogConf.loading"
			>
				确认
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getOptionItems } from "@/api/system-manager";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
// API
import { saveCmRecord } from "@/api/advancedApi";
// 消息
import { ElMessage } from "element-plus";
// 脚本验证
import trigger from "@/api/trigger";

const emit = defineEmits(["refresh"]);

// 方法地址前缀
const methodUrlPrefix = ref({
    1: '/cm/call/',
    2: '/cm/listQuery/',
});

// 默认java代码
let defaultJavaCode = `import cn.granitech.business.liteflow.context.CustomMethodContext;
import cn.granitech.business.liteflow.context.TriggerScriptContext;
import cn.granitech.business.service.CrudService;
import cn.granitech.variantorm.metadata.ID;
import com.yomahub.liteflow.script.ScriptExecuteWrap;
import com.yomahub.liteflow.script.body.CommonScriptBody;
import com.yomahub.liteflow.spi.holder.ContextAwareHolder;

import java.util.Map;

/**
 * 自定义方法JAVA脚本示例
 * 代码位置：cn.granitech.business.liteflow.cmp.CustomMethodDemo
 * CustomMethodDemo: 名称可以自行定义(不修改也行)
 * implements: 脚本类必须实现CommonScriptBody方法
 */
public class CustomMethodDemo implements CommonScriptBody {

    /**
     * 书写方法业务逻辑
     * @param param 调用方法时的传参
     * @return 返回值
     */
    private Object script(Map<String, Object> param) {
        //通过ContextAwareHolder.loadContextAware()可以获取到业务需要的bean
        CrudService crudService = ContextAwareHolder.loadContextAware().getBean(CrudService.class);


        return null;
    }


    /**
     * 脚本入口函数
     * 无需修改该方法
     */
    public Void body(ScriptExecuteWrap wrap) {
        //脚本上下文
        CustomMethodContext contextBean = wrap.getCmp().getContextBean(CustomMethodContext.class);
        contextBean.setResult(this.script( contextBean.getParam()));
        return null;
    }
}
`;

let defaultCustomQueryJavaCode = `import cn.granitech.business.liteflow.context.CustomListQueryContext;
import cn.granitech.business.service.CrudService;
import cn.granitech.util.FilterHelper;
import cn.granitech.variantorm.pojo.Pagination;
import cn.granitech.variantorm.pojo.QuerySchema;
import cn.granitech.web.pojo.ListQueryRequestBody;
import cn.granitech.web.pojo.ListQueryResult;
import cn.granitech.web.pojo.filter.Filter;
import com.yomahub.liteflow.script.ScriptExecuteWrap;
import com.yomahub.liteflow.script.body.CommonScriptBody;
import com.yomahub.liteflow.spi.holder.ContextAwareHolder;

import java.util.List;
import java.util.Map;

/**
 * 自定义列表查询接口JAVA脚本示例
 * 可用于替换列表的查询接口，需按列表要求返回参数
 *
 * 代码位置：cn.granitech.business.liteflow.cmp.CustomListQueryDemo
 * CustomListQueryDemo: 名称可以自行定义(不修改也行)
 * implements: 脚本类必须实现CommonScriptBody接口
 */
public class CustomListQueryDemo implements CommonScriptBody {

    /**
     * 书写自定义查询逻辑逻辑
     * @param requestBody 查询参数
     * @return 返回值
     */
    private ListQueryResult script(ListQueryRequestBody requestBody) {
        //通过ContextAwareHolder.loadContextAware()可以获取到业务需要的bean
        CrudService crudService = ContextAwareHolder.loadContextAware().getBean(CrudService.class);
        //建议手动设置查询实体，防止非法请求通过此接口查询其他实体数据
        requestBody.setMainEntity("实体名称");
        //查询示例
        if(true){ //调用crudService方法查询，会根据当前用户权限查询数据
            //前端传入的查询参数封装
            QuerySchema querySchema = requestBody.querySchema();
            //前端传入的分页封装
            Pagination pagination = requestBody.pagination();
            //固定地列表查询接口返回对象
            ListQueryResult queryResult = new ListQueryResult();
            List<Map<String, Object>> resultList = crudService.queryListMap(querySchema, pagination);
            //查询结果
            queryResult.setDataList(resultList);
            //查询数据统计相关，按需调用
            List<Map<String, Object>> statisticsList = crudService.queryListStatistics(querySchema, requestBody.getStatistics());
            queryResult.setStatisticsList(statisticsList);
            //需要返回分页对象，总条数会在接口中自动填充进去
            queryResult.setPagination(pagination);
            return queryResult;
        }else{ //调用baseService方法查询，会查询所有符合条件的数据，不做任何权限过滤
            ListQueryResult listQueryResult = crudService.queryListMap(requestBody);
            return listQueryResult;
        }
    }


    /**
     * 脚本入口函数
     * 无需修改该方法
     */
    public Void body(ScriptExecuteWrap wrap) {
        //脚本上下文
        CustomListQueryContext contextBean = wrap.getCmp().getContextBean(CustomListQueryContext.class);
        contextBean.setResult(this.script( contextBean.getRequestBody()));
        return null;
    }
}
`

let isFullScreen = ref(false);

const fullScreenChange = (v) => {
    isFullScreen.value = v;
}

const onMethodTypeChange = (val) => {
    if(val == 2){
        formData.value.javaCode = defaultCustomQueryJavaCode;
    }else{
        formData.value.javaCode = defaultJavaCode;
    }
}

// 默认数据
let defaultData = ref({
	methodName: "",
	methodUrl: "",
	methodType: "",
	methodConfig: "",
	isDisabled: false,
	// java脚本
	javaCode: defaultJavaCode,
});

let formData = ref({});

const rules = ref({
	methodName: [
		{ required: true, message: "请输入方法名称", trigger: "blur" },
	],
	methodUrl: [
		{ required: true, message: "请输入方法地址", trigger: "blur" },
		{
			pattern: /^[a-zA-Z]+$/,
			message: "只能输入大小写英文",
			trigger: "blur",
		},
	],
	methodType: [
		{ required: true, message: "请选择方法类型", trigger: "blur" },
	],
	methodParams: [
		{ required: true, message: "请输入方法参数", trigger: "blur" },
	],
	javaCode: [{ required: true, message: "请输入Java脚本", trigger: "blur" }],
});

let dialogConf = ref({
	title: "编辑自定义方法",
	width: "800px",
	loading: false,
	show: false,
});

// 是否查看
let isView = ref(false);

// 打开弹窗
const openDialog = (data, target) => {
	isView.value = false;
	dialogConf.value.show = true;
	formData.value = Object.assign({}, defaultData.value);
	if (target == "add") {
		dialogConf.value.title = "新增自定义方法";
	} else {
		dialogConf.value.title = "编辑自定义方法";
		formData.value = Object.assign({}, defaultData.value, data);
        formData.value.javaCode = formData.value.methodConfig;
		if (target == "view") {
			dialogConf.value.title = "查看自定义方法";
			isView.value = true;
		}
	}
	// 获取方法类型
	loadMethodType();
};

let methodTypeList = ref([]);
// 获取方法类型
const loadMethodType = async () => {
	dialogConf.value.loading = true;
	let res = await getOptionItems("CustomMethod", "methodType");
	if (res && res.code == 200) {
		methodTypeList.value = res.data;
		if (!formData.value.methodType && res.data.length > 0) {
			formData.value.methodType = res.data[0].value;
		}
        formData.value = formatFormData(formData.value);
	}
	dialogConf.value.loading = false;
};

// 关闭弹窗
const closeDialog = () => {
	dialogConf.value.show = false;
};

let formRef = ref(null);
// 确认
const confirm = () => {
  
	formRef.value.validate(async (valid) => {
		if (valid) {
			let paramData = formatFormData(formData.value);
            const result = validateJavaSyntaxSimple(paramData.javaCode);
            if(!result.isValid) {
                ElMessage.error(result.errors.join('\n'));
                return;
            }
			onSave(paramData);
		}
	});
};

/**
 * 简化版Java语法校验器
 * 只检查最基本的语法错误
 */
const validateJavaSyntaxSimple = (javaCode) => {
    const errors = [];
    const lines = javaCode.split('\n');
    
    // 1. 检查大括号匹配
    let braceCount = 0;
    lines.forEach((line, index) => {
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        // if (braceCount < 0) {
        //     errors.push(`第${index + 1}行: 多余的右大括号 "}"`);
        // }
    });
    
    if (braceCount > 0) {
        errors.push(`代码缺少 ${braceCount} 个右大括号 "}"`);
    } else if (braceCount < 0) {
        errors.push(`代码缺少 ${-braceCount} 个左大括号 "{"`);
    }
    
    // 2. 检查分号缺失（简单版）
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // 跳过空行、注释、类/方法声明等
        if (trimmedLine === '' || 
            trimmedLine.startsWith('//') || 
            trimmedLine.startsWith('*') ||
            trimmedLine.startsWith('/*') ||
            trimmedLine.endsWith('{') ||
            trimmedLine.endsWith('}') ||
            trimmedLine.startsWith('import ') ||
            trimmedLine.startsWith('package ') ||
            trimmedLine.includes(' class ') ||
            trimmedLine.includes(' if ') ||
            trimmedLine.includes(' for ') ||
            trimmedLine.includes(' while ') ||
            trimmedLine.startsWith('public ') ||
            trimmedLine.startsWith('private ') ||
            trimmedLine.startsWith('protected ')) {
            return;
        }
        
        // 检查应该是语句但缺少分号
        if (trimmedLine !== '' && 
            !trimmedLine.endsWith(';') && 
            !trimmedLine.endsWith('{') && 
            !trimmedLine.endsWith('}')) {
            // 简单的语句判断：包含 = 或 方法调用
            if (trimmedLine.includes('=') || 
                (trimmedLine.includes('(') && trimmedLine.includes(')'))) {
                errors.push(`可能缺少分号 ";"`);
            }
        }
    });
    
    // 3. 检查引号匹配
    let inString = false;
    let inChar = false;
    
    lines.forEach((line, index) => {
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const prevChar = i > 0 ? line[i - 1] : '';
            
            // 跳过转义字符
            if (prevChar === '\\') continue;
            
            if (char === '"' && !inChar) {
                inString = !inString;
            } else if (char === "'" && !inString) {
                inChar = !inChar;
            }
        }
        
        // 检查行尾是否还在字符串/字符中
        if (inString) {
            errors.push(`字符串引号未闭合`);
        }
        if (inChar) {
            errors.push(`字符单引号未闭合`);
        }
    });
    
    // 4. 检查类声明
    const hasClass = javaCode.includes('class ');
    const hasMainBrace = javaCode.includes('{') && javaCode.includes('}');
    
    if (hasClass && !hasMainBrace) {
        errors.push('类声明缺少大括号');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        errorCount: errors.length
    };
}


// 格式化FormData数据
const formatFormData = (data) => {
	let { methodType } = data;
	if (methodType == 1 || methodType.value == 1) {
		data.methodConfig = data.javaCode;
	}
	return data;
};

const onSave = async (paramData) => {
	if (isView.value) {
		dialogConf.value.show = false;
		return;
	}
    const lines = paramData.javaCode.split('\n');
    // 如果第一行以 'package' 开头，则删除第一行
    if (lines.length > 0 && lines[0].trim().startsWith('package')) {
        paramData.methodConfig = lines.slice(1).join('\n');
    } else {
        paramData.methodConfig = paramData.javaCode;
    }
    dialogConf.value.loading = true;
    if(paramData.methodType == 1 || paramData.methodType.value == 1 || paramData.methodType == 2 || paramData.methodType.value == 2){
        let checkRes = await trigger.detail.scriptValidator(paramData.methodConfig);
        if(!checkRes || !checkRes.data){
            dialogConf.value.loading = false;
            return
        }
    }
	dialogConf.value.loading = true;
	let res = await saveCmRecord(paramData.customMethodId, paramData);
	if (res && res.code == 200) {
		ElMessage.success("保存成功");
		closeDialog();
		emit("refresh");
	}
	dialogConf.value.loading = false;
};

defineExpose({
	openDialog,
	closeDialog,
});
</script>

<style></style>
