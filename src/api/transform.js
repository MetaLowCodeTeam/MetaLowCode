// 数据转换
import http from "@/utils/request"


// 根据实体查询数据转换
export function queryByEntity(data) {
    return http.get("/transform/queryByEntity", data);
}

// 删除数据转换
export function deleteRecord(data) {
    return http.get("/transform/deleteRecord", data);
}

// 根据id查询数据转换
export function queryById(data) {
    return http.get("/transform/queryById", data);
}

// 保存数据转换
export function saveTransform(data, config) {
    return http.post("transform/saveRecord", data, config); 
}

// 获取数据转换映射
export function getTransformMap(data) {
    return http.get("transform/getTransformMap", data);
}
