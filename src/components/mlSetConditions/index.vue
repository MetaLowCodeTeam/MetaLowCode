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
                        v-model="item.filedName"
                        @change="fieldChange(item)"
                        filterable
                        no-match-text="无匹配文本"
                    >
                        <el-option
                            v-for="op in fieldList"
                            :key="op.name"
                            :label="op.label"
                            :value="op.name"
                        />
                    </el-select>
                </el-col>
                <!-- 条件类型 -->
                <el-col :span="4">
                    <el-select v-model="item.op">
                        <el-option
                            v-for="op in getSelectOp()"
                            :key="op"
                            :label="op_type[op]"
                            :value="op"
                        />
                    </el-select>
                </el-col>
                <!-- 条件值 -->
                <el-col :span="10">
                    <!-- 日期选择器 -->
                    <div v-if="showValueType(item.op) === 'datePicker'">
                        <el-date-picker
                            v-model="item.value"
                            type="date"
                            style="width: 100%;"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                        />
                    </div>
                    <!-- 日期区间 -->
                    <div v-else-if="showValueType(item.op) === 'datePickerBw'">
                        <el-date-picker
                            v-model="item.value"
                            type="date"
                            style="width: 100%;"
                            class="bw-start-icon mb-5"
                            :class="{'is-error':item.isError && !item.value}"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            @change="bwChange(item)"
                            @focus="clearError(item)"
                        />
                        <el-date-picker
                            v-model="item.value2"
                            type="date"
                            style="width: 100%;"
                            class="bw-end-icon"
                            :class="{'is-error':item.isError && !item.value2}"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            @change="bwChange(item)"
                            @focus="clearError(item)"
                        />
                    </div>
                    <!-- 数字输入框 -->
                    <div v-else-if="showValueType(item.op) === 'numberInput'">
                        <el-input-number
                            v-model="item.value"
                            :controls="false"
                            class="mlnumer-input w-100"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                        />
                    </div>
                    <!-- 数字输入框区间 -->
                    <div v-else-if="showValueType(item.op) === 'numberInputBw'">
                        <el-input-number
                            v-model="item.value"
                            :controls="false"
                            class="mlnumer-input w-100 bw-start-icon mb-5"
                            :class="{'is-error':item.isError && !item.value}"
                            @focus="clearError(item)"
                            @change="bwChange(item)"
                        />
                        <el-input-number
                            v-model="item.value2"
                            :controls="false"
                            class="mlnumer-input w-100 bw-end-icon"
                            :class="{'is-error':item.isError && !item.value2}"
                            @focus="clearError(item)"
                            @change="bwChange(item)"
                        />
                    </div>
                    <!-- 文本输入框 -->
                    <div v-else-if="showValueType(item.op) === 'textInput'">
                        <el-input
                            v-model="item.value"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                        />
                    </div>
                    <!-- 布尔类型 -->
                    <div v-else-if="showValueType(item.op) === 'booleanSelect'">
                        <el-select
                            v-model="item.value"
                            class="w-100"
                            :class="{'is-error':item.isError}"
                            @focus="clearError(item)"
                            placeholder=" "
                        >
                            <el-option label="是" value="1" />
                            <el-option label="否" value="0" />
                        </el-select>
                    </div>
                </el-col>
            </el-row>
        </div>
        <div class="mladd-conditions">
            <span class="text-btn" @click="addConditions">
                <el-icon size="18" class="add-icon">
                    <ElIconCirclePlusFilled />
                </el-icon>
                <span class="ml-8">添加条件</span>
            </span>
        </div>
        <div class="mlconditions-mode mt-10">
            <el-radio-group v-model="conditionConf.type" @change="conditionTypeChange">
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
            ></el-input>
        </div>
        <div class="mlconditions-footer mt-10" v-if="footer">
            <el-button type="primary" @click="confirm">确认</el-button>
            <el-button @click="cancel">取消</el-button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: null,
        footer: { type: Boolean, default: false },
    },
    data() {
        return {
            // 所有类型
            op_type: {
                LK: "包含",
                NLK: "不包含",
                IN: "包含",
                NIN: "不包含",
                EQ: "等于",
                NEQ: "不等于",
                GT: "大于",
                LT: "小于",
                GE: "大于等于",
                LE: "小于等于",
                BW: "区间",
                NL: "为空",
                NT: "不为空",
                BFD: "..天前",
                BFM: "..月前",
                BFY: "..年前",
                AFD: "..天后",
                AFM: "..月后",
                AFY: "..年后",
                RED: "最近..天",
                REM: "最近..月",
                REY: "最近..年",
                FUD: "未来..天",
                FUM: "未来..月",
                FUY: "未来..年",
                SFU: "本人",
                SFB: "本部门",
                SFD: "本部门及子部门",
                SFT: "所在团队",
                YTA: "昨天",
                TDA: "今天",
                TTA: "明天",
                CUW: "本周",
                CUM: "本月",
                CUQ: "本季度",
                CUY: "本年",
            },
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
            conditions: {
                filedName: "",
                op: "",
                value: "",
                value2: "",
                isError: false,
            },
            conditionConf: {},
            fieldList: [],
            loading: false,
            fieldType: "",
            // 最多可添加多少个条件
            maxConditionsLength: 9,
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
    },
    methods: {
        async getFieldSet() {
            this.loading = true;
            // 获取条件字段接口
            let param = {
                entity: "DemoCompany",
            };
            let res = await this.$API.system.setConditions.getFieldSet(param);
            if (res.data.code == 200) {
                this.fieldList = res.data.data;
                this.fieldList.push(
                    {
                        label: "是否禁用",
                        name: "isDisabled",
                        reserved: true,
                        type: "Boolean",
                    },
                    {
                        label: "认领状态",
                        name: "renling",
                        reserved: true,
                        type: "Option",
                    },
                    {
                        label: "测试金额",
                        name: "jine",
                        reserved: true,
                        type: "Money",
                    }
                );
            } else {
                console.log(res.data.message);
                this.$message.error("获取数据失败，请尝试刷新页面后重试");
            }
            this.loading = false;
        },
        // 字段切换
        fieldChange(item) {
            let filterField = this.fieldList.filter((el) => {
                if (el.name == item.filedName) {
                    return el.type;
                }
            });
            this.fieldType = filterField[0].type;
            console.log(this.fieldType, "this.fieldType");
            item.op = this.getSelectOp()[0];
            item.value = null;
            item.value2 = null;
            item.isError = false;
        },
        clearError(item) {
            item.isError = false;
        },
        // 条件类型切换
        conditionTypeChange(type) {
            if (type === 1) {
                this.conditionConf.equation = "OR";
            } else if (type === 2) {
                this.conditionConf.equation = "AND";
            } else {
                this.conditionConf.equation = "";
            }
        },
        // 获取条件op
        getSelectOp() {
            let { fieldType, numberFieldType } = this;
            let op = [];
            if (fieldType === "Date" || fieldType === "DateTime") {
                op = [
                    "TDA",
                    "YTA",
                    "TTA",
                    "GT",
                    "LT",
                    "EQ",
                    "BW",
                    "RED",
                    "REM",
                    "REY",
                    "FUD",
                    "FUM",
                    "FUY",
                    "BFD",
                    "BFM",
                    "BFY",
                    "AFD",
                    "AFM",
                    "AFY",
                    "CUW",
                    "CUM",
                    "CUQ",
                    "CUY",
                ];
            } else if (fieldType === "Tag") {
                op = ["IN", "NIN"];
            } else if (numberFieldType.includes(fieldType)) {
                op = ["GT", "LT", "EQ", "BW", "GE", "LE"];
            } else if (fieldType === "Reference") {
                op = ["IN", "NIN", "SFU", "SFB", "SFT"];
            } else if (fieldType === "Boolean") {
                op = ["EQ", "NL", "NT"];
            } else if (fieldType === "Option") {
                op = ["IN", "NIN", "NL", "NT"];
            } else if (
                fieldType === "Email" ||
                fieldType === "Url" ||
                fieldType === "TextArea" ||
                fieldType === "Text"
            ) {
                op = ["LK", "NLK", "EQ", "NEQ", "NL", "NT"];
            } else {
                op = [];
                for (const key in this.op_type) {
                    op.push(key);
                }
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
            let conditions = this.$cloneDeep(this.conditions);
            conditions.filedName = this.fieldList[0].name;
            this.fieldType = this.fieldList[0].type;
            conditions.type = this.fieldType;
            conditions.op = this.getSelectOp()[0];
            this.conditionConf.items.push(conditions);
        },
        // 删除条件
        delConditions(inx) {
            this.conditionConf.items.splice(inx, 1);
        },
        checkConditionList() {
            let flag = true;
            if (this.conditionConf.items.length > 0) {
                this.conditionConf.items.forEach((el) => {
                    if (!el.value && !this.op_no_value.includes(el.op)) {
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
                    this.$message.error("部分条件设置有误，请检查");
                    return;
                }
            }
            return flag;
        },
        // 确认
        confirm() {
            if (this.checkConditionList()) {
                let { items, equation } = this.conditionConf;
                this.$emit("confirm", { equation, items });
            }
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
        /**
         *
         * 条件value显示逻辑
         *
         */
        showValueType(op) {
            let { fieldType, numberFieldType, op_no_value } = this;
            // 时间选择框
            let op_date_picker = ["EQ", "GT", "LT"];
            if (
                (fieldType === "DateTime" || fieldType === "Date") &&
                op_date_picker.includes(op)
            ) {
                return "datePicker";
            }
            // 区间显示
            if (op === "BW") {
                if (fieldType === "DateTime" || fieldType === "Date") {
                    return "datePickerBw";
                }
                if (numberFieldType.includes(fieldType)) {
                    return "numberInputBw";
                }
            }
            // 数字输入框
            let op_numer_input = ["GT", "LT", "EQ", "GE", "LE"];
            if (
                numberFieldType.includes(fieldType) &&
                op_numer_input.includes(op)
            ) {
                return "numberInput";
            }
            // 如果是布尔类型，并且条件不是不为空
            if (fieldType === "Boolean" && op === "EQ") {
                return "booleanSelect";
            }
            // 不需要value条件
            if (op_no_value.includes(op)) {
                return;
            }
            // 文本输入框
            return "textInput";
        },
        // 区间值变化
        bwChange(item) {
            let defaultV1 = item.value;
            let defaultV2 = item.value2;
            let v1;
            let v2;
            // 时间区间
            if (this.fieldType === "DateTime" || this.fieldType === "Date") {
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
        .add-icon {
            // margin-top: 10px;
            position: relative;
            top: 4px;
        }
    }
}
</style>