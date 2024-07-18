<!--
 * @Descripttion: 条件设置器组件
 * @version: 1.0
 * @Author: 邪七
 * @Date: 2023年6月28日11:30:05
 * @LastEditors: 邪七
 * @LastEditTime: 2023年6月28日11:30:56
-->
<template>
    <div class="mlset-conditions" v-loading="loading">
        <div class="mlconditions-list-box">
            <el-row
                class="mb-10 mlconditions-list"
                :gutter="10"
                v-for="(item,inx) of conditionConf.items"
                :key="inx"
            >
                <!-- 字段名 -->
                <el-col :span="10">
                    <div class="field-one">
                        <span class="field-inx">{{ inx+1 }}</span>
                        <el-icon size="18" class="remove-icon" @click="delConditions(inx)">
                            <ElIconRemoveFilled />
                        </el-icon>
                    </div>
                    <el-select
                        class="field-select"
                        v-model="item.fieldName"
                        @change="fieldChange(item)"
                        filterable
                        no-match-text="无匹配文本"
                        size="default"
                    >
                        <el-option
                            v-for="op in fieldList"
                            :key="op.fieldName"
                            :label="op.label"
                            :value="op.fieldName"
                        />
                    </el-select>
                </el-col>
                <!-- 条件类型 -->
                <el-col :span="4">
                    <el-select v-model="item.op" size="default" @change="getOpCom(item)">
                        <el-option
                            v-for="op in getSelectOp(item)"
                            :key="op"
                            :label="op_type[op]"
                            :value="op"
                        />
                    </el-select>
                </el-col>
                <!-- 条件值 -->
                <el-col :span="10">
                    <!-- 日期选择器 -->
                    <div v-if="item.opCom =='datePicker'">
                        <el-date-picker
                            size="default"
                            v-model="item.value"
                            type="date"
                            style="width: 100%;"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            clearable
                        />
                    </div>
                    <!-- 日期区间 -->
                    <div v-else-if="item.opCom =='datePickerBw' && item.type != 'DateTime'">
                        <el-date-picker
                            size="default"
                            v-model="item.value"
                            type="date"
                            style="width: 100%;"
                            class="bw-start-icon mb-5"
                            :class="{'is-error':item.isError && !item.value}"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            @change="bwChange(item)"
                            @focus="clearError(item)"
                            clearable
                        />
                        <el-date-picker
                            size="default"
                            v-model="item.value2"
                            type="date"
                            style="width: 100%;"
                            class="bw-end-icon"
                            :class="{'is-error':item.isError && !item.value2}"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            @change="bwChange(item)"
                            @focus="clearError(item)"
                            clearable
                        />
                    </div>
                    <!-- 时间区间 -->
                    <div v-else-if="item.opCom =='datePickerBw' && item.type == 'DateTime'">
                        <el-date-picker
                            size="default"
                            v-model="item.value"
                            type="datetime"
                            style="width: 100%;"
                            class="bw-start-icon mb-5"
                            :class="{'is-error':item.isError && !item.value}"
                            format="YYYY/MM/DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            @change="bwChange(item)"
                            @focus="clearError(item)"
                            :default-time="defaultTimeLE"
                            clearable
                        />
                        <el-date-picker
                            size="default"
                            v-model="item.value2"
                            type="datetime"
                            style="width: 100%;"
                            class="bw-end-icon"
                            :class="{'is-error':item.isError && !item.value2}"
                            format="YYYY/MM/DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            @change="bwChange(item)"
                            @focus="clearError(item)"
                            :default-time="defaultTimeGE"
                            clearable
                        />
                    </div>
                    
                    <!-- 数字输入框 -->
                    <div v-else-if="item.opCom =='numberInput' && (item.type != 'DateTime' && item.op != 'LE' && item.op != 'GE')">
                        <el-input-number
                            size="default"
                            v-model="item.value"
                            :controls="false"
                            class="mlnumer-input w-100"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            clearable
                        />
                    </div>
                    <!-- 数字输入框区间 -->
                    <div v-else-if="item.opCom =='numberInputBw'">
                        <el-input-number
                            size="default"
                            v-model="item.value"
                            :controls="false"
                            class="mlnumer-input w-100 bw-start-icon mb-5"
                            :class="{'is-error':item.isError && !item.value}"
                            @focus="clearError(item)"
                            @change="bwChange(item)"
                            clearable
                        />
                        <el-input-number
                            size="default"
                            v-model="item.value2"
                            :controls="false"
                            class="mlnumer-input w-100 bw-end-icon"
                            :class="{'is-error':item.isError && !item.value2}"
                            @focus="clearError(item)"
                            @change="bwChange(item)"
                            clearable
                        />
                    </div>
                    <!-- 文本输入框 -->
                    <div v-else-if="item.opCom =='textInput'">
                        <el-input
                            size="default"
                            v-model="item.value"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            clearable
                        />
                    </div>
                    <!-- 布尔类型 -->
                    <div v-else-if="item.opCom =='booleanSelect'">
                        <el-select
                            size="default"
                            v-model="item.value"
                            class="w-100"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            placeholder=" "
                            clearable
                        >
                            <el-option label="是" value="1" />
                            <el-option label="否" value="0" />
                        </el-select>
                    </div>
                    <!-- 用户下拉框 -->
                    <div v-else-if="item.opCom =='userSelect'">
                        <el-select
                            size="default"
                            v-model="item.value"
                            class="w-100"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            placeholder=" "
                            filterable
                            no-match-text="无匹配文本"
                            clearable
                        >
                            <el-option
                                v-for="(userOp,userInx) of userList"
                                :label="userOp.userName"
                                :value="userOp.userId"
                                :key="userInx"
                            />
                        </el-select>
                    </div>

                    <!-- 部门下拉框 -->
                    <div v-else-if="item.opCom =='departmentSelect'">
                        <el-select
                            size="default"
                            v-model="item.value"
                            class="w-100"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            placeholder=" "
                            filterable
                            no-match-text="无匹配文本"
                            clearable
                        >
                            <el-option
                                v-for="(departmentOp,departmentInx) of departmentList"
                                :label="departmentOp.departmentName"
                                :value="departmentOp.departmentId"
                                :key="departmentInx"
                            />
                        </el-select>
                    </div>
                    <!-- 类型为Tag 和 option的 -->
                    <div v-else-if="item.opCom =='optionData'">
                        <el-select
                            size="default"
                            v-model="item.value"
                            class="w-100"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            placeholder=" "
                            clearable
                        >
                            <el-option
                                v-for="(userOp,userInx) of item.optionData"
                                :label="userOp.label || userOp.value"
                                :value="userOp.value + ''"
                                :key="userInx"
                            />
                        </el-select>
                    </div>
                    <div v-else-if="item.opCom =='referenceSearch'">
                        <el-input 
                            v-model="item.value2" 
                            readonly 
                            :class="{'is-error':item.isError}" 
                            @focus="clearError(item)"
                        >
                            <template #append>
                                <el-button @click="openReferenceDialog(item)">
                                    <el-icon>
                                        <ElIconSearch />
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-input>
                        <el-dialog
                            title="请选择"
                            class="reference-dialog"
                            v-model="item.showReferenceDialogFlag"
                            append-to-body
                            width="520"
                            v-if="formatEntityName"
                        >
                            <ReferenceSearchTable
                                :entity="formatEntityName"
                                :refField="item.fieldName"
                                @recordSelected="(event)=> setReferRecord(event,item) "
                            />
                        </el-dialog>
                    </div>
                    <!-- DateTime类型 -->
                    <div v-else-if="item.type == 'DateTime'">
                        <el-date-picker
                            v-model="item.value"
                            type="datetime"
                            format="YYYY/MM/DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            :default-time="defaultTimeLE"
                            v-if="item.op == 'LE'"
                        />
                        <el-date-picker
                            v-model="item.value"
                            type="datetime"
                            format="YYYY/MM/DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            :default-time="defaultTimeGE"
                            v-else-if="item.op == 'GE'"
                        />
                        <el-date-picker
                            size="default"
                            v-model="item.value"
                            type="date"
                            style="width: 100%;"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            v-else-if="item.op == 'DEQ'"
                        />
                    </div>
                </el-col>
            </el-row>
        </div>
        <div class="mladd-conditions mt-20">
            <span class="ml-a-span" @click="addConditions">
                <el-icon size="18" class="add-icon">
                    <ElIconCirclePlusFilled />
                </el-icon>
                <span class="ml-8">添加条件</span>
            </span>
            <slot name="afterAddConditions"></slot>
        </div>
        <div class="mlconditions-mode mt-10" v-if="!notType">
            <el-radio-group
                v-model="conditionConf.type"
                @change="conditionTypeChange"
                size="default"
            >
                <el-radio :label="1">符合任一</el-radio>
                <el-radio :label="2">符合全部</el-radio>
                <el-radio :label="3">高级表达式</el-radio>
            </el-radio-group>
            <el-input
                class="mt-5"
                v-if="conditionConf.type == 3"
                v-model="conditionConf.equation"
                clearable
                :placeholder="getPlaceholder()"
                size="default"
                :class="{'is-error':errorEquation}"
            ></el-input>
        </div>
        <div class="mlconditions-footer mt-10" v-if="footer">
            <el-button type="primary" @click="confirm" size="default">确认</el-button>
            <el-button @click="cancel" size="default">取消</el-button>
        </div>
    </div>
</template>

<script>
import conditionsConfig from "@/config/conditionsConfig";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
import useCommonStore from "@/store/modules/common";

export default {
    components: {
        ReferenceSearchTable,
    },
    props: {
        modelValue: null,
        footer: { type: Boolean, default: false },
        // 实体名称兼CODE
        entityName: { type: [String, Number], default: "" },
        // 是否需要显示类型
        notType: { type: Boolean, default: false }
    },
    data() {
        return {
            // 所有类型
            op_type: {},
            // 不需要输入框的条件
            op_no_value: [
                "NL",
                "NT",
                "SFU",
                "SFB",
                "SFD",
                "YTA",
                "TDA",
                "TTA",
                "CUW",
                "CUM",
                "CUQ",
                "CUY",
            ],
            // 数组类型的字段
            numberFieldType: ["Money", "Integer", "Decimal", "Percent"],
            conditionConf: {},
            fieldList: [],
            loading: false,
            fieldType: "",
            // 最多可添加多少个条件
            maxConditionsLength: 9,
            // 无效高级表达式
            errorEquation: false,
            // 所有用户
            userList: [],
            // 所有部门
            departmentList: [],
            conditionsConfig: {},
            // 格式化的实体名称
            formatEntityName: "",
            defaultTimeLE:"",
            defaultTimeGE:"",
        };
    },
    watch: {
        modelValue: {
            handler() {
                this.conditionConf = this.modelValue;
            },
            deep: true,
        },
    },
    mounted() {
        this.conditionConf = this.modelValue;
        this.getFieldSet();
        this.conditionsConfig = { ...conditionsConfig };
        this.op_type = { ...this.conditionsConfig.op_type };
        this.defaultTimeLE = new Date(2000, 1, 1, 0, 0, 1);
        this.defaultTimeGE = new Date(2000, 1, 1, 23, 59, 59);
    },
    methods: {
        openReferenceDialog(item) {
            item.showReferenceDialogFlag = true;
            this.clearError(item);
        },
        setReferRecord(event, item) {
            item.value = event.id;
            item.value2 = event.label;
            item.showReferenceDialogFlag = false;
        },
        async getFieldSet() {
            const { queryEntityNameByCode } = useCommonStore();
            this.loading = true;
            let entity = this.entityName;
            if (!isNaN(entity)) {
                entity = queryEntityNameByCode(entity);
            }
            this.formatEntityName = entity;
            // 获取条件字段接口
            let param = {
                entity,
            };
            let res = await this.$API.common.getFieldListOfFilter(param);
            let resUser = await this.$API.common.getUser(param);
            let resDepartment = await this.$API.common.getDepartment(param);
            this.userList = resUser ? resUser.data || [] : [];
            this.departmentList = resDepartment ? resDepartment.data || [] : [];
            if (res) {
                let list = res.data || [];
                this.fieldList = list.map((el) => {
                    return {
                        fieldName: el.name,
                        op: "",
                        opCom: "",
                        value: "",
                        value2: "",
                        isError: false,
                        referTo: el.referTo,
                        type: el.type,
                        label: el.label,
                        optionData: el.optionData,
                    };
                });
                // 初始化已有字段
                if (
                    this.conditionConf.items &&
                    this.conditionConf.items.length > 0
                ) {
                    this.initConditionList();
                }
            }
            this.loading = false;
        },
        // 初始化已有字段
        initConditionList() {
            let conditionList = [];
            this.fieldList.forEach((el) => {
                this.conditionConf.items.forEach((subEl) => {
                    el.showReferenceDialogFlag = false;
                    if (el.fieldName === subEl.fieldName) {
                        let newItem = Object.assign({ ...el }, subEl);
						this.getOpCom(newItem);
                        conditionList.push(newItem);
                    }
                });
            });
            this.conditionConf.items = conditionList;
            // let { items, equation } = this.conditionConf;
        },
        // 字段切换
        fieldChange(item) {
            let metadata = this.fieldList.filter(
                (res) => res.fieldName === item.fieldName
            );
            Object.assign(item, metadata[0]);
            item.op = this.getSelectOp(item)[0];
            // 获取条件组件
            this.getOpCom(item);
        },
        // 条件组件
        getOpCom(item) {
            item.opCom = this.conditionsConfig.getShowCom(item);
        },
        clearError(item) {
            item.isError = false;
        },
        // 条件类型切换
        conditionTypeChange(type) {
            this.errorEquation = false;
            if (type === 1) {
                this.conditionConf.equation = "OR";
            } else if (type === 2) {
                this.conditionConf.equation = "AND";
            } else {
                this.conditionConf.equation = "";
            }
        },
        // 获取条件op
        getSelectOp(item) {
            let { type, referTo } = item;
            let op = [];
            // 如果是引用类型
            if (type == "Reference") {
                let referenceObj = { ...this.conditionsConfig[type] };
                // 有单独设定的 条件
                if (referenceObj.referenceFilters.includes(referTo)) {
                    op = [...referenceObj[referTo]];
                } else {
                    op = [...referenceObj.All];
                }
            } else {
                op = this.conditionsConfig[type]
                    ? [...this.conditionsConfig[type]]
                    : [];
            }
            return op;
        },
        // 添加条件
        addConditions() {
            if (this.fieldList.length < 1) {
                this.$message.error("暂未获取到条件字段，请尝试刷新页面后重试");
                return;
            }
            if (
                this.conditionConf.items.length >
                this.maxConditionsLength - 1
            ) {
                this.$message.warning(
                    `最多可添加 ${this.maxConditionsLength} 个条件`
                );
                return;
            }
            let condition = this.$CloneDeep(this.fieldList[0]);
            // console.log(condition,'condition')
            this.fieldChange(condition);
            this.conditionConf.items.push(condition);
        },
        // 删除条件
        delConditions(inx) {
            this.conditionConf.items.splice(inx, 1);
        },
        // 检测条件
        checkConditionList(notNeedMsg) {
            let flag = true;
            if (this.conditionConf.items.length > 0) {
                this.conditionConf.items.forEach((el) => {
                    if (
                        !el.value &&
                        el.value !== 0 &&
                        !this.op_no_value.includes(el.op)
                    ) {
                        flag = false;
                        el.isError = true;
                    }
                    // 区间
                    if (el.op === "BW" && (!el.value || !el.value2)) {
                        flag = false;
                        el.isError = true;
                    }
                });
                if (!flag) {
                    // 不需要提示
                    if(notNeedMsg){
                        return
                    }
                    this.$message.error("部分条件设置有误，请检查");
                    return;
                }
            }
            return flag;
        },
        // 检测高级表达式是否成立
        async checkEquation() {
            let param = {
                equation: this.conditionConf.equation,
            };
            let res = await this.$API.common.isEquation(param);
            this.errorEquation = !res;
        },
        // 确认
        async confirm() {
            let { items, equation, type } = this.conditionConf;
            if (!this.checkConditionList()) {
                return;
            }
            if (type === 3 && equation) {
                await this.checkEquation();
                if (this.errorEquation) {
                    this.$message.error("无效高级表达式");
                    return;
                }
            }
            this.$emit("confirm", { equation, items });
        },
        // 取消
        cancel() {
            this.$emit("cancel");
        },
        // 获取高级表达式底纹
        getPlaceholder() {
            let conditionList = [];
            this.conditionConf.items.forEach((el, inx) => {
                conditionList.push(inx + 1);
            });
            return conditionList.join(" or ");
        },

        // 区间值变化
        bwChange(item) {
            let { type } = item;
            let defaultV1 = item.value;
            let defaultV2 = item.value2;
            let v1;
            let v2;
            // 时间区间
            if (type === "DateTime" || type === "Date") {
                v1 = new Date(item.value).getTime();
                v2 = new Date(item.value2).getTime();
            }
            // 数字区间
            else {
                v1 = defaultV1;
                v2 = defaultV2;
            }
            if (defaultV1 && defaultV2 && v1 > v2) {
                item.value = defaultV2;
                item.value2 = defaultV1;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.mlset-conditions {
    .mlconditions-list-box {
        margin-bottom: -10px;
        .mlconditions-list {
            .field-one {
                display: inline-block;
                width: 20px;
                text-align: center;
                height: 28px;
                line-height: 28px;
                margin-right: 5px;
                .field-inx {
                    font-size: 12px;
                    // display: none;
                }
                .remove-icon {
                    display: none;
                    position: relative;
                    // left: 5px;
                    top: 4px;
                    cursor: pointer;
                }
            }
            .field-select {
                width: calc(100% - 25px);
            }
            &:hover {
                .field-inx {
                    display: none;
                }
                .remove-icon {
                    display: block;
                }
            }
        }
    }

    .mladd-conditions {
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #eee;
        font-size: 14px;
        .add-icon {
            // margin-top: 10px;
            position: relative;
            top: 4px;
        }
    }
}
</style>
