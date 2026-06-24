// import { inject } from "vue";
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { Utils } = VisualDesign.VFormSDK;
import { ElMessage } from "element-plus";
import {globalDsvDefaultData} from "@/utils/util";
// const getFormConfig = inject('getFormConfig');

export default function useChartSourceData() {
    const getDataSourceData = async (options, fromConfig, dsv) => {
        let { dsName } = options;
        let dataSource = Utils.getDSByName(
            fromConfig,
            dsName
        );
        return await Utils.runDataSourceRequest(
            dataSource,
            Object.assign({}, globalDsvDefaultData(), dsv),
            null,
            false,
            ElMessage
        )
    }
    return {
        getDataSourceData
    }
}
