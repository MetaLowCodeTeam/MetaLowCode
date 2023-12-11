import http from "@/utils/request"
export default {
    // 文件上传
    upload: async (file, config = {}) => {
        return await http.post("/excelData/upload", file, config);
    },
    // 检查导入文件
    checkFile: async (uploadFile) => {
        return await http.get("/excelData/check-file", { uploadFile });
    },
    // 开始导入
    begImport: async (data) => {
        return await http.post("/excelData/import-submit", data);
    },
    // 导入状态
    taskState: async (taskId) => {
        return await http.get("/heavyTask/taskState", { taskId });
    },
    
    // 导入进度
    importTrace: async (taskId) => {
        return await http.get("/excelData/import-trace", { taskId });
    },
    // 中断任务
    taskCancel: async (taskId) => {
        return await http.get("/heavyTask/cancel", { taskId });
    },
    
}