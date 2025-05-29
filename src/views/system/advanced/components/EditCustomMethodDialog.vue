<template>
	<ml-dialog
		v-model="dialogConf.show"
		:title="dialogConf.title"
		:width="dialogConf.width"
		:show-close="!dialogConf.loading"
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
								<template #prepend>/cm/call/</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="formData.methodType">
						<el-form-item label="方法配置" prop="javaCode">
							<div class="w-100">
								<mlCodeEditor
									v-model="formData.javaCode"
									mode="java"
									height="300"
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
import { ref } from "vue";
import { getOptionItems } from "@/api/system-manager";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
// API
import { saveCmRecord } from "@/api/advancedApi";
// 消息
import { ElMessage } from "element-plus";

const emit = defineEmits(["refresh"]);

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
 * 触发器JAVA脚本示例
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
	width: "700px",
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
			onSave(paramData);
		}
	});
};

// 格式化FormData数据
const formatFormData = (data) => {
	let { methodType } = data;
	if (methodType == 1) {
		data.methodConfig = data.javaCode;
	}
	return data;
};

const onSave = async (paramData) => {
	if (isView.value) {
		dialogConf.value.show = false;
		return;
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
