<style lang="scss" scoped>
.item-box {
	.item-title {
		font-weight: bold;
		margin-bottom: 5px;
	}
}
</style>
<template>
	<!-- 添加自定义标签 -->
	<mlDialog v-model="isShow" title="自定义标签设置" width="500" append-to-body :showClose="!loading">
		<div class="ml-dialog-content" v-loading="loading">
			<div class="item-box">
				<div class="item-title">选择实体</div>
				<el-select
					v-model="curtEntity"
					placeholder="请选择实体"
					value-key="entityCode"
					class="w-100"
					clearable
                    :class="{'is-error' : selectEntityError}"
                    @focus="selectEntityError = false"
                    filterable
				>
					<el-option
						v-for="item in entityList"
						:key="item.entityCode"
						:label="item.entityLabel"
						:value="item"
					/>
				</el-select>
			</div>
			<div class="item-box mt-10">
				<div class="item-title">过滤条件</div>
				<el-input
					v-model="filterEasySql"
					class="w-100"
					:autosize="{ minRows: 2, maxRows: 4 }"
					type="textarea"
					placeholder="请输入过滤条件，如：关联id = {主实体id字段}"
				/>
			</div>
            <div class="item-box mt-10">
                <div class="item-title">
                    <el-checkbox v-model="enableCustomQuery">使用自定义查询接口</el-checkbox>
                </div>
            </div>
            <div class="item-box mt-10" v-if="enableCustomQuery">
                <el-select 
                    v-model="customQueryUrl" 
                    placeholder="请输入自定义查询接口" 
                    clearable
                    filterable
                    allow-create
                >
                    <el-option 
                        v-for="item in customQueryList" 
                        :key="item.methodUrl" 
                        :label="item.methodName" 
                        :value="item.methodUrl"
                    ></el-option>
                </el-select>
                <!-- <div class="item-title">自定义查询接口</div> -->
            </div>
		</div>
        <template #footer>
            <el-button @click="isShow = false" :loading="loading">取消</el-button>
            <el-button type="primary" @click="confirm" :loading="loading">确认</el-button>
        </template>
	</mlDialog>
</template>

<script setup>
import { ref } from "vue";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
import { useRouter } from 'vue-router';
import { queryCustomListQuery } from "@/api/advancedApi";
const router = useRouter();
const { queryAllEntityList } = useCommonStore();
const emit = defineEmits(["confirm"]);

let isShow = ref(false);
let loading = ref(false)

let entityList = ref([]);

let curtEntity = ref({});
let filterEasySql = ref("");
let selectEntityError = ref(false);
// 是否使用自定义查询接口
let enableCustomQuery = ref(false);
let customQueryList = ref([]);
let customQueryUrl = ref("");

const openDialog = async () => {
	isShow.value = true;
	entityList.value = queryAllEntityList(true, router.currentRoute.value.query.appAbbr).map((el) => {
		return {
			entityCode: el.entityCode,
			entityName: el.name,
			entityLabel: el.label,
			filterEasySql: "",
			isCustomLabel: true,
		};
	});
    filterEasySql.value = "";
    customQueryList.value = [];
    loading.value = true;
    let res = await queryCustomListQuery();
    if(res?.code == 200) {
        customQueryList.value = res.data;
    }
    loading.value = false;
};

const confirm = () => {
    if(!curtEntity.value.entityName) {
        selectEntityError.value = true;
        ElMessage.error("请选择实体.");
        return
    }
    curtEntity.value.filterEasySql = filterEasySql.value;
    curtEntity.value.customQueryUrl = customQueryUrl.value;
    curtEntity.value.enableCustomQuery = enableCustomQuery.value;
    emit("confirm", curtEntity.value);
    curtEntity.value = {};
    isShow.value = false;
}

defineExpose({
	openDialog,
});
</script>
