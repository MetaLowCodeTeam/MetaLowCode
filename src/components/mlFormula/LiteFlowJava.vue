<template>
    <mlCodeEditor v-model="javaScriptVal" mode="java" height="500"/>
</template>

<script setup>
import { ref, watch, onMounted } from "vue"; 
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
const props = defineProps({
    modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);
let javaScriptVal = ref("");

let defaultValue = ref(`import cn.granitech.business.liteflow.context.TriggerScriptContext;
import cn.granitech.business.service.CrudService;
import cn.granitech.variantorm.metadata.ID;
import cn.granitech.variantorm.persistence.EntityRecord;
import com.yomahub.liteflow.script.ScriptExecuteWrap;
import com.yomahub.liteflow.script.body.CommonScriptBody;
import com.yomahub.liteflow.spi.holder.ContextAwareHolder;

import java.util.Map;

/**
 * 触发器JAVA脚本示例
 * 代码位置：cn.granitech.business.liteflow.cmp.TriggerScriptDemo
 * TriggerCompileScriptDemo: 名称可以自行定义(不修改也行)
 * implements: 脚本类必须实现CommonScriptBody接口
 */
public class TriggerScriptDemo implements CommonScriptBody {

    /**
     * 书写业务逻辑
     *
     * @param recordId        数据id
     * @param updateDataCache 修改数据（更新触发时才有值）
     * @return 返回值
     */
    private Object script(ID recordId, Map<String, Object> updateDataCache) {
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
        TriggerScriptContext contextBean = wrap.getCmp().getContextBean(TriggerScriptContext.class);
        contextBean.setResult(this.script(contextBean.getRecordId(), contextBean.getUpdateData()));
        return null;
    }
}`);


onMounted(() => {
    javaScriptVal.value = props.modelValue;
    if (!javaScriptVal.value) {
        javaScriptVal.value = defaultValue.value;
    }
})


watch(
    () => javaScriptVal.value,
    (newVal) => {
        emit("update:modelValue", newVal);
    },
    {
        deep: true,
    }
);

</script>

<style>

</style>