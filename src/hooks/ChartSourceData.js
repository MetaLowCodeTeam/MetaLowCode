// import { inject } from "vue";
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { Utils } = VisualDesign.VFormSDK;
import { ElMessage } from "element-plus";

// const getFormConfig = inject('getFormConfig');

export default function useChartSourceData() {
    const getDataSourceData = async (options, fromConfig) => {
        let { dsName } = options;
        let dataSource = Utils.getDSByName(
            fromConfig,
            dsName
        );
        return await Utils.runDataSourceRequest(
            dataSource,
            { SERVER_API: import.meta.env.VITE_APP_BASE_API },
            null,
            false,
            ElMessage
        )
    }
    return {
        getDataSourceData
    }
}
