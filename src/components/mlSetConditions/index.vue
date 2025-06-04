<!--
 * @Descripttion: 条件设置器组件
 * @version: 1.0
 * @Author: 邪七
 * @Date: 2023年6月28日11:30:05
 * @LastEditors: 邪七
 * @LastEditTime: 2023年6月28日11:30:56
-->
<template>
    <div class="ml-set-conditions" v-loading="loading">
        <template v-if="!displayedComp">
            <div class="ml-conditions-list-box">
                <el-scrollbar max-height="300px">
                    <el-row
                        class="mb-10 ml-conditions-list"
                        :gutter="10"
                        v-for="(item,inx) of conditionConf.items"
                        :key="inx"
                    >
                        <template v-if="item.op == 'SQL'">
                            <el-col :span="24">
                                <div class="field-one">
                                    <span class="field-inx">{{ inx+1 }}</span>
                                    <el-icon size="18" class="remove-icon" @click="delConditions(inx)">
                                        <ElIconRemoveFilled />
                                    </el-icon>
                                </div>
                                <el-input class="field-select" placeholder="请输入SQL" v-model="item.value" clearable/>
                            </el-col>
                        </template>
                        <template v-else>
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
                                <div v-else-if="item.opCom =='numberInput' && (item.type != 'DateTime' || (item.type == 'DateTime' && item.op != 'LE' && item.op != 'GE'))">
                                    <el-input-number
                                        size="default"
                                        v-model="item.value"
                                        :controls="false"
                                        class="ml-number-input w-100"
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
                                        class="ml-number-input w-100 bw-start-icon mb-5"
                                        :class="{'is-error':item.isError && !item.value}"
                                        @focus="clearError(item)"
                                        @change="bwChange(item)"
                                        clearable
                                    />
                                    <el-input-number
                                        size="default"
                                        v-model="item.value2"
                                        :controls="false"
                                        class="ml-number-input w-100 bw-end-icon"
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
                                        v-model="item.refLabel" 
                                        readonly 
                                        :class="{'is-error':item.isError}" 
                                        @focus="clearError(item)"
                                        size="default"
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
                                        size="default"
                                    >
                                        <ReferenceSearchTable
                                            v-if="item.showReferenceDialogFlag"
                                            :entity="formatEntityName"
                                            :refField="item.fieldName"
                                            :defaultSelected="{id: item.value, name: item.refLabel}"
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
                                        size="default"
                                    />
                                    <el-date-picker
                                        v-model="item.value"
                                        type="datetime"
                                        format="YYYY/MM/DD HH:mm:ss"
                                        value-format="YYYY-MM-DD HH:mm:ss"
                                        :default-time="defaultTimeGE"
                                        v-else-if="item.op == 'GE'"
                                        size="default"
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
                        </template>
                    </el-row>
                </el-scrollbar>
                

            </div>
            <div class="ml-add-conditions mt-10">
                <span class="ml-a-span" @click="addConditions">
                    <el-icon size="18" class="add-icon">
                        <ElIconCirclePlusFilled />
                    </el-icon>
                    <span class="ml-8">添加条件</span>
                </span>
                <span class="ml-a-span ml-10" v-if="enableSql" @click="addSql">
                    <el-icon size="18" class="add-icon">
                        <ElIconCirclePlusFilled />
                    </el-icon>
                    <span class="ml-8">添加SQL条件</span>
                </span>
                <slot name="afterAddConditions"></slot>
            </div>
            <div class="ml-conditions-mode mt-10" v-if="!notType">
                <el-radio-group
                    v-model="conditionConf.type"
                    @change="conditionTypeChange"
                    size="default"
                >
                    <el-radio :value="1">符合任一</el-radio>
                    <el-radio :value="2">符合全部</el-radio>
                    <el-radio :value="3">高级表达式</el-radio>
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
        </template>
        <template v-else>
            <div class="ml-conditions-list-box">
                <el-row class="ml-conditions-list" :gutter="20">
                    <el-col 
                        :span="8"
                        v-for="(item,inx) of conditionConf.items"
                        :key="inx"
                        class="mb-5"
                    >
                        <el-row :gutter="5">
                            <!-- 字段名 -->
                            <el-col :span="9" class="text-right" v-if="forbidUserModifyField">
                                <div class="field-label yichu">
                                    {{ getFieldLabel(item.fieldName) }}
                                </div>
                            </el-col>
                            <el-col :span="9" v-else>
                                <el-select
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
                            <el-col :span="5" v-if="!hideQueryMatchType">
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
                            <el-col :span="hideQueryMatchType ? 15 : 10">
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
                                <div 
                                    v-else-if="item.opCom =='datePickerBw' && item.type != 'DateTime' && !displayedComp"
                                    style="line-height: 32px; height: 64px;"
                                >
                                    <el-date-picker
                                        size="default"
                                        v-model="item.value"
                                        type="date"
                                        style="width: 100%;height: 32px;"
                                        class="bw-start-icon"
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
                                        style="width: 100%;height: 32px;margin-top: 5px;"
                                        class="bw-end-icon"
                                        :class="{'is-error':item.isError && !item.value2}"
                                        format="YYYY/MM/DD"
                                        value-format="YYYY-MM-DD"
                                        @change="bwChange(item)"
                                        @focus="clearError(item)"
                                        clearable
                                    />
                                </div>
                                <div v-else-if="item.opCom =='datePickerBw' && item.type != 'DateTime' && displayedComp">
                                    <el-date-picker
                                        size="default"
                                        v-model="item.value3"
                                        type="daterange"
                                        unlink-panels
                                        start-placeholder="起"
                                        end-placeholder="止"
                                        style="width: 90%;height: 32px;position: relative;top: 1px;"
                                        value-format="YYYY-MM-DD"
                                        @change="bwInputChange(item)"
                                    />
                                </div>
                                <!-- 时间区间 -->
                                <div 
                                    v-else-if="item.opCom =='datePickerBw' && item.type == 'DateTime' && !displayedComp"
                                    style="line-height: 32px; height: 64px; "
                                >
                                    <el-date-picker
                                        size="default"
                                        v-model="item.value"
                                        type="datetime"
                                        style="width: 100%;height: 32px;"
                                        class="bw-start-icon"
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
                                        style="width: 100%;height: 32px;margin-top: 5px;"
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
                                <div v-else-if="item.opCom =='datePickerBw' && item.type == 'DateTime' && displayedComp">
                                    <el-date-picker
                                        size="default"
                                        v-model="item.value3"
                                        @change="bwInputChange(item)"
                                        type="datetimerange"
                                        start-placeholder="起"
                                        end-placeholder="止"
                                        format="YYYY-MM-DD HH:mm:ss"
                                        date-format="YYYY/MM/DD ddd"
                                        time-format="A hh:mm:ss"
                                        value-format="YYYY-MM-DD HH:mm:ss"
                                        style="width: 90%;height: 32px;position: relative;top: 1px;"
                                    />
                                </div>
                                
                                <!-- 数字输入框 -->
                                <div v-else-if="item.opCom =='numberInput' && (item.type != 'DateTime' || (item.type == 'DateTime' && item.op != 'LE' && item.op != 'GE'))">
                                    <el-input-number
                                        size="default"
                                        v-model="item.value"
                                        :controls="false"
                                        class="ml-number-input w-100"
                                        :class="{'is-error':item.isError}"
                                        @focus="clearError(item)"
                                        style="margin-top: 1px;"
                                        clearable
                                    />
                                </div>
                                <!-- 数字输入框区间 -->
                                <div 
                                    v-else-if="item.opCom =='numberInputBw' && !displayedComp"
                                    style="line-height: 36px; height: 64px; "
                                >
                                    <el-input-number
                                        size="default"
                                        v-model="item.value"
                                        :controls="false"
                                        class="ml-number-input w-100 bw-start-icon"
                                        :class="{'is-error':item.isError && !item.value}"
                                        @focus="clearError(item)"
                                        @change="bwChange(item)"
                                        clearable
                                        style="height: 32px;"
                                    />
                                    <el-input-number
                                        size="default"
                                        v-model="item.value2"
                                        :controls="false"
                                        class="ml-number-input w-100 bw-end-icon"
                                        :class="{'is-error':item.isError && !item.value2}"
                                        style="margin-top: 5px;height: 32px;"
                                        @focus="clearError(item)"
                                        @change="bwChange(item)"
                                        clearable
                                    />
                                </div>
                                <div v-else-if="item.opCom =='numberInputBw' && displayedComp">
                                    <el-input-number 
                                        size="default"
                                        v-model="item.value"
                                        :class="{'is-error':item.isError && !item.value}"
                                        @focus="clearError(item)"
                                        @change="bwChange(item)"
                                        clearable
                                        :controls="false"
                                        style="width: 49%;height: 32px;"
                                    >
                                        <template #prefix>
                                            <span>起</span>
                                        </template>
                                    </el-input-number>
                                    <el-input-number
                                        size="default"
                                        v-model="item.value2"
                                        :class="{'is-error':item.isError && !item.value2}"
                                        style="width: 49%;margin-left: 2%;height: 32px;"
                                        @focus="clearError(item)"
                                        @change="bwChange(item)"
                                        :controls="false"
                                        clearable
                                        
                                    >
                                        <template #prefix>
                                            <span>止</span>
                                        </template>
                                    </el-input-number>
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
                                        v-model="item.refLabel" 
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
                                            v-if="item.showReferenceDialogFlag"
                                            :entity="formatEntityName"
                                            :refField="item.fieldName"
                                            :defaultSelected="{id: item.value, name: item.refLabel}"
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
                        
                    </el-col>
                </el-row>
            </div>
            
        </template>
        <div class="ml-conditions-footer mt-10" v-if="footer">
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
        notType: { type: Boolean, default: false },
        // 是否作为组件暂时
        displayedComp: { type: Boolean, default: false },
        // 禁止用户修改字段
        forbidUserModifyField: { type: Boolean, default: false },
        // 隐藏查询匹配类型
        hideQueryMatchType: { type: Boolean, default: false },
        // 是否开启SQL
        enableSql: { type: Boolean, default: false },
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
                "REFD",
                "REFU",
            ],
            // 数组类型的字段
            numberFieldType: ["Money", "Integer", "Decimal", "Percent"],
            conditionConf: {},
            fieldList: [],
            loading: false,
            fieldType: "",
            // 最多可添加多少个条件
            maxConditionsLength: 99,
            // 无效高级表达式
            errorEquation: false,
            conditionsConfig: {},
            // 格式化的实体名称
            formatEntityName: "",
            defaultTimeLE:"",
            defaultTimeGE:"",
            notEmptyItems: [
                "NL",
                "NT",
                "SFU",
                "SFB",
                "SFD",
                "SFT",
                "YTA",
                "TDA",
                "TTA",
                "CUW",
                "CUM",
                "CUQ",
                "CUY",
                "REFD",
                "REFU",
            ]
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
        getFieldLabel(fieldName) {
            return this.fieldList.find(el => el.fieldName === fieldName)?.label;
        },
        openReferenceDialog(item) {
            item.showReferenceDialogFlag = true;
            this.clearError(item);
        },
        setReferRecord(event, item) {
            item.value = event.id;
            item.refLabel = event.label;
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
                        refLabel: "", 
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
            this.conditionConf.items.forEach((el) => {
                if(el.op == 'SQL'){
                    conditionList.push(el);                         
                }
                this.fieldList.forEach((subEl) => {
                    subEl.showReferenceDialogFlag = false;
                    if (subEl.fieldName === el.fieldName) {
                        let newItem = Object.assign({ ...subEl }, el);
						this.getOpCom(newItem);
                        // 兼容老数据 如果是引用类型 且 label 为空 且 value2 有值
                        if(newItem.type == "Reference" && !newItem.refLabel && newItem.value2){
                            newItem.refLabel = newItem.value2;
                        }
                        if(newItem.op == "REF" && newItem.value2){
                            newItem.value = newItem.value2;
                            newItem.value2 = "";
                        }
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
            if (type == "Reference" || type == "ReferenceList") {
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
        // 添加SQL
        addSql() {
            this.conditionConf.items.push({
                fieldName: "sql",
                op: "SQL",
                value: "",
            });
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
        async confirm(noVerification) {
            let { items, equation, type } = this.conditionConf;
            // 如果需要进行条件校验
            if(!noVerification) {
                if(!this.checkConditionList()) {
                    return;
                }
            }
            if (type === 3 && equation) {
                await this.checkEquation();
                if (this.errorEquation) {
                    this.$message.error("无效高级表达式");
                    return;
                }
            }
            let tempItems = JSON.parse(JSON.stringify(items));
            tempItems.forEach(el => {
                if(el.op !== 'SQL' && el.value && typeof el.value == 'string' && el.type !== "DateTime" && el.type !== "Date") {
                    el.value = el.value.replace(/\s/g, '');
                }
                // 如果是多引用类型
                if(el.type == 'ReferenceList'){
                    const { queryEntityInfoByName } = useCommonStore();
                    let idFieldName = this.formatEntityName == "ApprovalTask" ? "approvalTaskId" : queryEntityInfoByName(this.formatEntityName).idFieldName;
                    // 如果是本人、本部门
                    if(el.op == "REFD" || el.op == "REFU"){
                        el.value = idFieldName;
                    }
                    // 如果是包含
                    if(el.op == "REF" || el.op == "REFNL" || el.op == "REFNT"){
                        el.value2 = el.op == "REF" ? el.value : "";
                        el.value = idFieldName;
                    }
                }
            })
            // 如果不需要进行条件校验
            if(noVerification) {
                tempItems = tempItems.filter(el => (el.value !== undefined && el.value !== null && el.value !== "") || (el.value2 !== undefined && el.value2 !== null && el.value2 !== "") || this.notEmptyItems.includes(el.op))
            }
            this.$emit("confirm", { equation, items: tempItems });
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
        // 区间Input组件赋值
        bwInputChange(item) {
            if(item.value3){
                item.value = item.value3[0];
                item.value2 = item.value3[1];
            }else {
                item.value = "";
                item.value2 = "";
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.ml-set-conditions {
    :deep(.is-horizontal) {
		display: none !important;
	}
    .ml-conditions-list-box {
        margin-bottom: -10px;
        .ml-conditions-list {
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

    .ml-add-conditions {
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

.field-label {
    font-size: 14px;
    margin-right: 10px;
    color: #303030;
}
</style>
