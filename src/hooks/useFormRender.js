
import { ref, nextTick } from "vue";
import { getFormLayout } from "@/api/system-manager";
import { queryById } from "@/api/crud";


export function useFormRender() {
    let haveLayoutJson = ref(false);
    const vFormRef = ref();
    const initFormLayout = async (entityName, id, cb) => {
        let res = await getFormLayout(entityName);
        if (res && res.data?.layoutJson) {
            haveLayoutJson.value = true;
            nextTick(async () => {
                let formData = await queryById(id);
                vFormRef.value.setFormJson(res.data.layoutJson);
                if (formData) {
                    vFormRef.value.setFormData(formData.data);
                    cb()
                }
                loading.value = false;
            });
        }
    }
    return {
        haveLayoutJson,
        vFormRef,
        initFormLayout
    }
}