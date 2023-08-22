<style lang="scss">
.vue3-cron-div {
    .el-input-number__decrease,
    .el-input-number__increase {
        top: 1px !important;
    }

    .language {
        position: absolute;
        right: 25px;
        z-index: 1;
    }

    .el-tabs {
        box-shadow: none;
    }

    .tabBody {
        overflow: auto;

        .el-row {
            margin: 20px 0;

            .long {
                .el-select {
                    width: 350px;
                }
            }

            .el-input-number {
                width: 110px;
            }
        }
    }

    .myScroller {
        &::-webkit-scrollbar {
            /*滚动条整体样式*/
            width: 5px;
            /*高宽分别对应横竖滚动条的尺寸*/
            height: 1px;
        }

        &::-webkit-scrollbar-thumb {
            /*滚动条里面小方块*/
            border-radius: 10px;
            background-color: skyblue;
            background-image: -webkit-linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.2) 25%,
                transparent 25%,
                transparent 50%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0.2) 75%,
                transparent 75%,
                transparent
            );
        }

        &::-webkit-scrollbar-track {
            /*滚动条里面轨道*/
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
            background: #ededed;
            border-radius: 10px;
        }
    }

    .bottom {
        width: 100%;
        margin-top: 5px;
        height: 28px;
        // display: flex;
        // align-items: center;
        // justify-content: space-around;

        .value {
            float: left;
            font-size: 14px;
            vertical-align: middle;

            span:nth-child(1) {
                color: red;
            }
        }
        .buttonDiv {
            float: right;
        }
    }
    .preview {
        margin: 32px 0;
        padding: 16px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 3px;
    }

    .preview .title {
        display: flex;
        justify-content: center;
        margin-top: -28px;
    }

    .preview .label {
        padding: 0 16px;
        background-color: #ffffff;
    }
    .preview .list {
        margin-bottom: 0;
        padding-left: 16px;
        list-style: none;
        li {
            line-height: 22px;
        }
    }
}
</style>
<template>
    <div class="vue3-cron-div">
        <!-- <el-button
            class="language"
            text
            type="primary"
            @click="state.language = state.language === 'en' ? 'cn' : 'en'"
        >
            {{
            state.language === 'en' ? 'cn' : 'en'
            }}
        </el-button>-->
        <el-tabs type="border-card" v-model="activeTab">
            <el-tab-pane name="second">
                <template #label>
                    <span>
                        <i class="el-icon-date"></i>
                        {{ state.text.Seconds.name }}
                    </span>
                </template>
                <div class="tabBody myScroller" :style="{ 'max-height': maxHeight }">
                    <el-row>
                        <el-radio v-model="state.second.cronEvery" label="1" :disabled="disabled">
                            {{
                            state.text.Seconds.every
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.second.cronEvery" label="2" :disabled="disabled">
                            {{ state.text.Seconds.interval[0]
                            }}
                            <el-input-number
                                size="small"
                                v-model="state.second.incrementIncrement"
                                :min="1"
                                :max="60"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Seconds.interval[1] || "" }}
                            <el-input-number
                                size="small"
                                v-model="state.second.incrementStart"
                                :min="0"
                                :max="59"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Seconds.interval[2] || "" }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio
                            class="long"
                            v-model="state.second.cronEvery"
                            label="3"
                            :disabled="disabled"
                        >
                            {{
                            state.text.Seconds.specific
                            }}
                            <el-select
                                size="small"
                                multiple
                                v-model="state.second.specificSpecific"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 60"
                                    :key="index"
                                    :value="val - 1"
                                >{{ val - 1 }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.second.cronEvery" label="4" :disabled="disabled">
                            {{ state.text.Seconds.cycle[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.second.rangeStart"
                                :min="1"
                                :max="60"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Seconds.cycle[1] || "" }}
                            <el-input-number
                                size="small"
                                v-model="state.second.rangeEnd"
                                :min="0"
                                :max="59"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Seconds.cycle[2] || "" }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane name="minute">
                <template #label>
                    <span>
                        <i class="el-icon-date"></i>
                        {{ state.text.Minutes.name }}
                    </span>
                </template>
                <div class="tabBody myScroller" :style="{ 'max-height': maxHeight }">
                    <el-row>
                        <el-radio v-model="state.minute.cronEvery" label="1" :disabled="disabled">
                            {{
                            state.text.Minutes.every
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.minute.cronEvery" label="2" :disabled="disabled">
                            {{ state.text.Minutes.interval[0]
                            }}
                            <el-input-number
                                size="small"
                                v-model="state.minute.incrementIncrement"
                                :min="1"
                                :max="60"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Minutes.interval[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.minute.incrementStart"
                                :min="0"
                                :max="59"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Minutes.interval[2] || "" }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio
                            class="long"
                            v-model="state.minute.cronEvery"
                            label="3"
                            :disabled="disabled"
                        >
                            {{
                            state.text.Minutes.specific
                            }}
                            <el-select
                                size="small"
                                multiple
                                v-model="state.minute.specificSpecific"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 60"
                                    :key="index"
                                    :value="val - 1"
                                >{{ val - 1 }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.minute.cronEvery" label="4" :disabled="disabled">
                            {{ state.text.Minutes.cycle[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.minute.rangeStart"
                                :min="1"
                                :max="60"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Minutes.cycle[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.minute.rangeEnd"
                                :min="0"
                                :max="59"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Minutes.cycle[2] }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane name="hour">
                <template #label>
                    <span>
                        <i class="el-icon-date"></i>
                        {{ state.text.Hours.name }}
                    </span>
                </template>
                <div class="tabBody myScroller" :style="{ 'max-height': maxHeight }">
                    <el-row>
                        <el-radio v-model="state.hour.cronEvery" label="1" :disabled="disabled">
                            {{
                            state.text.Hours.every
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.hour.cronEvery" label="2" :disabled="disabled">
                            {{ state.text.Hours.interval[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.hour.incrementIncrement"
                                :min="0"
                                :max="23"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Hours.interval[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.hour.incrementStart"
                                :min="0"
                                :max="23"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Hours.interval[2] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio
                            class="long"
                            v-model="state.hour.cronEvery"
                            label="3"
                            :disabled="disabled"
                        >
                            {{
                            state.text.Hours.specific
                            }}
                            <el-select
                                size="small"
                                multiple
                                v-model="state.hour.specificSpecific"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 24"
                                    :key="index"
                                    :value="val - 1"
                                >{{ val - 1 }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.hour.cronEvery" label="4" :disabled="disabled">
                            {{ state.text.Hours.cycle[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.hour.rangeStart"
                                :min="0"
                                :max="23"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Hours.cycle[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.hour.rangeEnd"
                                :min="0"
                                :max="23"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Hours.cycle[2] }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane name="day">
                <template #label>
                    <span>
                        <i class="el-icon-date"></i>
                        {{ state.text.Day.name }}
                    </span>
                </template>
                <div class="tabBody myScroller" :style="{ 'max-height': maxHeight }">
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="1" :disabled="disabled">
                            {{
                            state.text.Day.every
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="2" :disabled="disabled">
                            {{ state.text.Day.intervalWeek[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.week.incrementIncrement"
                                :min="1"
                                :max="7"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Day.intervalWeek[1] }}
                            <el-select
                                size="small"
                                v-model="state.week.incrementStart"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 7"
                                    :key="index"
                                    :label="state.text.Week[val - 1]"
                                    :value="val"
                                ></el-option>
                            </el-select>
                            {{ state.text.Day.intervalWeek[2] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="3" :disabled="disabled">
                            {{ state.text.Day.intervalDay[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.day.incrementIncrement"
                                :min="1"
                                :max="31"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Day.intervalDay[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.day.incrementStart"
                                :min="1"
                                :max="31"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Day.intervalDay[2] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio
                            class="long"
                            v-model="state.day.cronEvery"
                            label="4"
                            :disabled="disabled"
                        >
                            {{
                            state.text.Day.specificWeek
                            }}
                            <el-select
                                size="small"
                                multiple
                                v-model="state.week.specificSpecific"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 7"
                                    :key="index"
                                    :label="state.text.Week[val - 1]"
                                    :value="
                  ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][val - 1]
                "
                                ></el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio
                            class="long"
                            v-model="state.day.cronEvery"
                            label="5"
                            :disabled="disabled"
                        >
                            {{
                            state.text.Day.specificDay
                            }}
                            <el-select
                                size="small"
                                multiple
                                v-model="state.day.specificSpecific"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 31"
                                    :key="index"
                                    :value="val"
                                >{{ val }}</el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="6" :disabled="disabled">
                            {{
                            state.text.Day.lastDay
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="7" :disabled="disabled">
                            {{
                            state.text.Day.lastWeekday
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="8" :disabled="disabled">
                            {{ state.text.Day.lastWeek[0] }}
                            <el-select
                                size="small"
                                v-model="state.day.cronLastSpecificDomDay"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 7"
                                    :key="index"
                                    :label="state.text.Week[val - 1]"
                                    :value="val"
                                ></el-option>
                            </el-select>
                            {{ state.text.Day.lastWeek[1] || "" }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="9" :disabled="disabled">
                            <el-input-number
                                size="small"
                                v-model="state.day.cronDaysBeforeEomMinus"
                                :min="1"
                                :max="31"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Day.beforeEndMonth[0] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="10" :disabled="disabled">
                            {{ state.text.Day.nearestWeekday[0]
                            }}
                            <el-input-number
                                size="small"
                                v-model="state.day.cronDaysNearestWeekday"
                                :min="1"
                                :max="31"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Day.nearestWeekday[1] }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.day.cronEvery" label="11" :disabled="disabled">
                            {{ state.text.Day.someWeekday[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.week.cronNthDayNth"
                                :min="1"
                                :max="5"
                                :disabled="disabled"
                            ></el-input-number>
                            <el-select
                                size="small"
                                v-model="state.week.cronNthDayDay"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 7"
                                    :key="index"
                                    :label="state.text.Week[val - 1]"
                                    :value="val"
                                ></el-option>
                            </el-select>
                            {{ state.text.Day.someWeekday[1] }}
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane name="month">
                <template #label>
                    <span>
                        <i class="el-icon-date"></i>
                        {{ state.text.Month.name }}
                    </span>
                </template>
                <div class="tabBody myScroller" :style="{ 'max-height': maxHeight }">
                    <el-row>
                        <el-radio v-model="state.month.cronEvery" label="1" :disabled="disabled">
                            {{
                            state.text.Month.every
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.month.cronEvery" label="2" :disabled="disabled">
                            {{ state.text.Month.interval[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.month.incrementIncrement"
                                :min="0"
                                :max="12"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Month.interval[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.month.incrementStart"
                                :min="0"
                                :max="12"
                                :disabled="disabled"
                            ></el-input-number>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio
                            class="long"
                            v-model="state.month.cronEvery"
                            label="3"
                            :disabled="disabled"
                        >
                            {{
                            state.text.Month.specific
                            }}
                            <el-select
                                size="small"
                                multiple
                                v-model="state.month.specificSpecific"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 12"
                                    :key="index"
                                    :label="val"
                                    :value="val"
                                ></el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.month.cronEvery" label="4" :disabled="disabled">
                            {{ state.text.Month.cycle[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.month.rangeStart"
                                :min="1"
                                :max="12"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Month.cycle[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.month.rangeEnd"
                                :min="1"
                                :max="12"
                                :disabled="disabled"
                            ></el-input-number>
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane name="year">
                <template #label>
                    <span>
                        <i class="el-icon-date"></i>
                        {{ state.text.Year.name }}
                    </span>
                </template>
                <div class="tabBody myScroller" :style="{ 'max-height': maxHeight }">
                    <el-row>
                        <el-radio v-model="state.year.cronEvery" label="1" :disabled="disabled">
                            {{
                            state.text.Year.every
                            }}
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.year.cronEvery" label="2" :disabled="disabled">
                            {{ state.text.Year.interval[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.year.incrementIncrement"
                                :min="1"
                                :max="99"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Year.interval[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.year.incrementStart"
                                :min="2018"
                                :max="2118"
                                :disabled="disabled"
                            ></el-input-number>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio
                            class="long"
                            v-model="state.year.cronEvery"
                            label="3"
                            :disabled="disabled"
                        >
                            {{
                            state.text.Year.specific
                            }}
                            <el-select
                                size="small"
                                filterable
                                multiple
                                v-model="state.year.specificSpecific"
                                :disabled="disabled"
                                
                            >
                                <el-option
                                    v-for="(val, index) in 100"
                                    :key="index"
                                    :label="2017 + val"
                                    :value="2017 + val"
                                ></el-option>
                            </el-select>
                        </el-radio>
                    </el-row>
                    <el-row>
                        <el-radio v-model="state.year.cronEvery" label="4" :disabled="disabled">
                            {{ state.text.Year.cycle[0] }}
                            <el-input-number
                                size="small"
                                v-model="state.year.rangeStart"
                                :min="2018"
                                :max="2118"
                                :disabled="disabled"
                            ></el-input-number>
                            {{ state.text.Year.cycle[1] }}
                            <el-input-number
                                size="small"
                                v-model="state.year.rangeEnd"
                                :min="2018"
                                :max="2118"
                                :disabled="disabled"
                            ></el-input-number>
                        </el-radio>
                    </el-row>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="preview">
            <div class="title">
                <span class="label">{{ state.previewLabel }}</span>
            </div>
            <ul class="list">
                <li v-for="preview in state.previews" :key="preview">{{ preview }}</li>
            </ul>
        </div>
        <!-- <div class="footer">

        </div> -->
        <!-- {{ state.cron }} -->
        <div class="bottom">
            <div class="value">
                <span>cron预览：</span>
                <el-tag>{{ state.cron }}</el-tag>
            </div>
            <div class="buttonDiv">
                <el-button
                    type="primary"
                    @click.stop="onConfirm"
                    :disabled="disabled"
                >{{ state.text.Save }}</el-button>
                <el-button type="primary" @click="close">{{ state.text.Close }}</el-button>
            </div>
        </div>
    </div>
</template>
<script>
import Language from "./language";
import cronParser from "cron-parser";
import { reactive, computed, toRefs, defineComponent, ref } from "vue";
export default defineComponent({
    name: "vue3Cron",
    props: {
        cronValue: {},
        i18n: {},
        maxHeight: {},
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const { i18n } = toRefs(props);
        const activeTab = ref("second");
        const state = reactive({
            previewTime: 10,
            language: i18n.value,
            second: {
                cronEvery: "1",
                incrementStart: 3,
                incrementIncrement: 5,
                rangeStart: 0,
                rangeEnd: 0,
                specificSpecific: [],
            },
            minute: {
                cronEvery: "1",
                incrementStart: 3,
                incrementIncrement: 5,
                rangeStart: 0,
                rangeEnd: 0,
                specificSpecific: [],
            },
            hour: {
                cronEvery: "1",
                incrementStart: 3,
                incrementIncrement: 5,
                rangeStart: 0,
                rangeEnd: 0,
                specificSpecific: [],
            },
            day: {
                cronEvery: "1",
                incrementStart: 1,
                incrementIncrement: 1,
                rangeStart: 0,
                rangeEnd: 0,
                specificSpecific: [],
                cronLastSpecificDomDay: 1,
                cronDaysBeforeEomMinus: 0,
                cronDaysNearestWeekday: 0,
            },
            week: {
                cronEvery: "1",
                incrementStart: 1,
                incrementIncrement: 1,
                specificSpecific: [],
                cronNthDayDay: 1,
                cronNthDayNth: 1,
            },
            month: {
                cronEvery: "1",
                incrementStart: 3,
                incrementIncrement: 5,
                rangeStart: 0,
                rangeEnd: 0,
                specificSpecific: [],
            },
            year: {
                cronEvery: "1",
                incrementStart: 2017,
                incrementIncrement: 1,
                rangeStart: 0,
                rangeEnd: 0,
                specificSpecific: [],
            },
            output: {
                second: "",
                minute: "",
                hour: "",
                day: "",
                month: "",
                Week: "",
                year: "",
            },
            text: computed(() => Language[state.language || "cn"]),
            secondsText: computed({
                get: () => {
                    let seconds = "";
                    let cronEvery = state.second.cronEvery;
                    switch (cronEvery.toString()) {
                        case "1":
                            seconds = "*";
                            break;
                        case "2":
                            seconds =
                                state.second.incrementStart +
                                "/" +
                                state.second.incrementIncrement;
                            break;
                        case "3":
                            state.second.specificSpecific.map((val) => {
                                seconds += val + ",";
                            });
                            seconds = seconds.slice(0, -1);
                            break;
                        case "4":
                            seconds =
                                state.second.rangeStart +
                                "-" +
                                state.second.rangeEnd;
                            break;
                    }
                    return seconds;
                },
                set: (value) => {
                    if (value === "*") {
                        state.second.cronEvery = "1";
                        return;
                    }
                    if (value.includes("/")) {
                        state.second.cronEvery = "2";
                        const valueArr = value.split("/");
                        state.second.incrementStart = Number(valueArr[0]);
                        state.second.incrementIncrement = Number(valueArr[1]);
                        return;
                    }
                    if (
                        value.includes(",") ||
                        (value.length > 0 &&
                            !Number.isNaN(Number(value)) &&
                            Number(value) < 60 &&
                            Number(value) >= 0)
                    ) {
                        state.second.cronEvery = "3";
                        const valueArr = value.split(",");
                        state.second.specificSpecific = valueArr.map((item) =>
                            Number(item)
                        );
                        return;
                    }
                    if (value.includes("-")) {
                        state.second.cronEvery = "4";
                        const valueArr = value.split("-");
                        state.second.rangeStart = Number(valueArr[0]);
                        state.second.rangeEnd = Number(valueArr[1]);
                        return;
                    }
                },
            }),
            minutesText: computed({
                get: () => {
                    let minutes = "";
                    let cronEvery = state.minute.cronEvery;
                    switch (cronEvery.toString()) {
                        case "1":
                            minutes = "*";
                            break;
                        case "2":
                            minutes =
                                state.minute.incrementStart +
                                "/" +
                                state.minute.incrementIncrement;
                            break;
                        case "3":
                            state.minute.specificSpecific.map((val) => {
                                minutes += val + ",";
                            });
                            minutes = minutes.slice(0, -1);
                            break;
                        case "4":
                            minutes =
                                state.minute.rangeStart +
                                "-" +
                                state.minute.rangeEnd;
                            break;
                    }
                    return minutes;
                },
                set: (value) => {
                    if (value === "*") {
                        state.minute.cronEvery = "1";
                        return;
                    }
                    if (value.includes("/")) {
                        state.minute.cronEvery = "2";
                        const valueArr = value.split("/");
                        state.minute.incrementStart = Number(valueArr[0]);
                        state.minute.incrementIncrement = Number(valueArr[1]);
                        return;
                    }
                    if (
                        value.includes(",") ||
                        (value.length > 0 &&
                            !Number.isNaN(Number(value)) &&
                            Number(value) < 60 &&
                            Number(value) >= 0)
                    ) {
                        state.minute.cronEvery = "3";
                        const valueArr = value.split(",");
                        state.minute.specificSpecific = valueArr.map((item) =>
                            Number(item)
                        );
                        return;
                    }
                    if (value.includes("-")) {
                        state.minute.cronEvery = "4";
                        const valueArr = value.split("-");
                        state.minute.rangeStart = Number(valueArr[0]);
                        state.minute.rangeEnd = Number(valueArr[1]);
                        return;
                    }
                },
            }),
            hoursText: computed({
                get: () => {
                    let hours = "";
                    let cronEvery = state.hour.cronEvery;
                    switch (cronEvery.toString()) {
                        case "1":
                            hours = "*";
                            break;
                        case "2":
                            hours =
                                state.hour.incrementStart +
                                "/" +
                                state.hour.incrementIncrement;
                            break;
                        case "3":
                            state.hour.specificSpecific.map((val) => {
                                hours += val + ",";
                            });
                            hours = hours.slice(0, -1);
                            break;
                        case "4":
                            hours =
                                state.hour.rangeStart +
                                "-" +
                                state.hour.rangeEnd;
                            break;
                    }
                    return hours;
                },
                set: (value) => {
                    if (value === "*") {
                        state.hour.cronEvery = "1";
                        return;
                    }
                    if (value.includes("/")) {
                        state.hour.cronEvery = "2";
                        const valueArr = value.split("/");
                        state.hour.incrementStart = Number(valueArr[0]);
                        state.hour.incrementIncrement = Number(valueArr[1]);
                        return;
                    }
                    if (
                        value.includes(",") ||
                        (value.length > 0 &&
                            !Number.isNaN(Number(value)) &&
                            Number(value) < 24 &&
                            Number(value) >= 0)
                    ) {
                        state.hour.cronEvery = "3";
                        const valueArr = value.split(",");
                        state.hour.specificSpecific = valueArr.map((item) =>
                            Number(item)
                        );
                        return;
                    }
                    if (value.includes("-")) {
                        state.hour.cronEvery = "4";
                        const valueArr = value.split("-");
                        state.hour.rangeStart = Number(valueArr[0]);
                        state.hour.rangeEnd = Number(valueArr[1]);
                        return;
                    }
                },
            }),
            daysText: computed({
                get: () => {
                    let days = "";
                    let cronEvery = state.day.cronEvery;
                    switch (cronEvery.toString()) {
                        case "1":
                            break;
                        case "2":
                        case "4":
                        case "11":
                            days = "?";
                            break;
                        case "3":
                            days =
                                state.day.incrementStart +
                                "/" +
                                state.day.incrementIncrement;
                            break;
                        case "5":
                            state.day.specificSpecific.map((val) => {
                                days += val + ",";
                            });
                            days = days.slice(0, -1);
                            break;
                        case "6":
                            days = "L";
                            break;
                        case "7":
                            days = "LW";
                            break;
                        case "8":
                            days = state.day.cronLastSpecificDomDay + "L";
                            break;
                        case "9":
                            days = "L-" + state.day.cronDaysBeforeEomMinus;
                            break;
                        case "10":
                            days = state.day.cronDaysNearestWeekday + "W";
                            break;
                    }
                    return days;
                },
                set: (value) => {
                    // if(value === '*') {
                    //   state.day.cronEvery = '1'
                    // }
                    if (value.includes("/")) {
                        state.day.cronEvery = "3";
                        const valueArr = value.split("/");
                        state.day.incrementStart = Number(valueArr[0]);
                        state.day.incrementIncrement = Number(valueArr[1]);
                        return;
                    }
                    if (
                        value.includes(",") ||
                        (value.length > 0 &&
                            !Number.isNaN(Number(value)) &&
                            Number(value) <= 31 &&
                            Number(value) > 0)
                    ) {
                        state.day.cronEvery = "5";
                        const valueArr = value.split(",");
                        state.day.specificSpecific = valueArr.map((item) =>
                            Number(item)
                        );
                        return;
                    }
                    if (value === "L") {
                        state.day.cronEvery = "6";
                        return;
                    }
                    if (value === "LW") {
                        state.day.cronEvery = "7";
                        return;
                    }
                    if (/^[1,2,3,4,5,6,7]L$/.test(value)) {
                        state.day.cronEvery = "8";
                        state.day.cronLastSpecificDomDay = Number(value[0]);
                        return;
                    }
                    if (value.includes("L-")) {
                        state.day.cronEvery = "9";
                        state.day.cronDaysBeforeEomMinus = Number(
                            value.split("-")[1]
                        );
                        return;
                    }
                    if (/^\dW$/.test(value)) {
                        state.day.cronEvery = "10";
                        state.day.cronDaysNearestWeekday = Number(
                            value.slice(0, -1)
                        );
                        return;
                    }
                },
            }),
            weeksText: computed({
                get: () => {
                    let weeks = "";
                    let cronEvery = state.day.cronEvery;
                    switch (cronEvery.toString()) {
                        case "1":
                        case "3":
                        case "5":
                            weeks = "?";
                            break;
                        case "2":
                            weeks =
                                state.week.incrementStart +
                                "/" +
                                state.week.incrementIncrement;
                            break;
                        case "4":
                            state.week.specificSpecific.map((val) => {
                                weeks += val + ",";
                            });
                            weeks = weeks.slice(0, -1);
                            break;
                        case "6":
                        case "7":
                        case "8":
                        case "9":
                        case "10":
                            weeks = "?";
                            break;
                        case "11":
                            weeks =
                                state.week.cronNthDayDay +
                                "#" +
                                state.week.cronNthDayNth;
                            break;
                    }
                    return weeks;
                },
                set: (value) => {
                    if (value.includes("/")) {
                        state.day.cronEvery = "2";
                        const valueArr = value.split("/");
                        state.week.incrementStart = Number(valueArr[0]);
                        state.week.incrementIncrement = Number(valueArr[1]);
                        return;
                    }
                    if (
                        value.includes(",") ||
                        /(SUN)|(MON)|(TUE)|(WED)|(THU)|(FRI)|(SAT)/.test(value)
                    ) {
                        state.day.cronEvery = "4";
                        const valueArr = value.split(",");
                        state.week.specificSpecific = valueArr;
                        return;
                    }
                    if (value.includes("#")) {
                        const valueArr = value.split("#");
                        state.week.cronNthDayDay = Number(valueArr[0]);
                        state.week.cronNthDayNth = Number(valueArr[1]);
                        return;
                    }
                },
            }),
            monthsText: computed({
                get: () => {
                    let months = "";
                    let cronEvery = state.month.cronEvery;
                    switch (cronEvery.toString()) {
                        case "1":
                            months = "*";
                            break;
                        case "2":
                            months =
                                state.month.incrementStart +
                                "/" +
                                state.month.incrementIncrement;
                            break;
                        case "3":
                            state.month.specificSpecific.map((val) => {
                                months += val + ",";
                            });
                            months = months.slice(0, -1);
                            break;
                        case "4":
                            months =
                                state.month.rangeStart +
                                "-" +
                                state.month.rangeEnd;
                            break;
                    }
                    return months;
                },
                set: (value) => {
                    if (value === "*") {
                        state.month.cronEvery = "1";
                        return;
                    }
                    if (value.includes("/")) {
                        state.month.cronEvery = "2";
                        const valueArr = value.split("/");
                        state.month.incrementStart = Number(valueArr[0]);
                        state.month.incrementIncrement = Number(valueArr[1]);
                        return;
                    }
                    if (
                        value.includes(",") ||
                        (value.length > 0 &&
                            !Number.isNaN(Number(value)) &&
                            Number(value) <= 12 &&
                            Number(value) >= 1)
                    ) {
                        state.month.cronEvery = "3";
                        const valueArr = value.split(",");
                        state.month.specificSpecific = valueArr.map((item) =>
                            Number(item)
                        );
                        return;
                    }
                    if (value.includes("-")) {
                        state.month.cronEvery = "4";
                        const valueArr = value.split("-");
                        state.month.rangeStart = Number(valueArr[0]);
                        state.month.rangeEnd = Number(valueArr[1]);
                        return;
                    }
                },
            }),
            yearsText: computed({
                get: () => {
                    let years = "";
                    let cronEvery = state.year.cronEvery;
                    switch (cronEvery.toString()) {
                        case "1":
                            years = "*";
                            break;
                        case "2":
                            years =
                                state.year.incrementStart +
                                "/" +
                                state.year.incrementIncrement;
                            break;
                        case "3":
                            state.year.specificSpecific.map((val) => {
                                years += val + ",";
                            });
                            years = years.slice(0, -1);
                            break;
                        case "4":
                            years =
                                state.year.rangeStart +
                                "-" +
                                state.year.rangeEnd;
                            break;
                    }
                    return years;
                },
                set: (value) => {
                    if (value === "*") {
                        state.year.cronEvery = "1";
                        return;
                    }
                    if (value.includes("/")) {
                        state.year.cronEvery = "2";
                        const valueArr = value.split("/");
                        state.year.incrementStart = Number(valueArr[0]);
                        state.year.incrementIncrement = Number(valueArr[1]);
                        return;
                    }
                    if (
                        value.includes(",") ||
                        (value.length > 0 &&
                            !Number.isNaN(Number(value)) &&
                            Number(value) <= 2118 &&
                            Number(value) >= 2018)
                    ) {
                        state.year.cronEvery = "3";
                        const valueArr = value.split(",");
                        state.year.specificSpecific = valueArr.map((item) =>
                            Number(item)
                        );
                        return;
                    }
                    if (value.includes("-")) {
                        state.year.cronEvery = "4";
                        const valueArr = value.split("-");
                        state.year.rangeStart = Number(valueArr[0]);
                        state.year.rangeEnd = Number(valueArr[1]);
                        return;
                    }
                },
            }),
            cron: computed(() => {
                return `${state.secondsText || "*"} ${
                    state.minutesText || "*"
                } ${state.hoursText || "*"} ${state.daysText || "*"} ${
                    state.monthsText || "*"
                } ${state.weeksText || "?"} ${state.yearsText || "*"}`;
            }),

            // 日期时间字段补零.
            zerofill: (value) => {
                const prefix = value < 10 ? "0" : "";
                return `${prefix}${value}`;
            },
            // 最近 X 次运行时间
            previewLabel: computed(() => `最近${state.previewTime}次运行时间`),
            previews: computed(() => {
                let previews = [];

                try {
                    // 此解析无法解析 * * * * * ? *  第7个参数。拿到数据后先格式化
                    let intervalCron = state.cron.split(" ");
                    // 如果长度大于7，并且最后一个为*，去掉最后一个
                    if (intervalCron.length > 6 && intervalCron[6] == "*") {
                        intervalCron.splice(intervalCron.length - 1, 1);
                    }
                    // 最后赋值给解析表达式
                    const interval = cronParser.parseExpression(
                        intervalCron.join(" ")
                    );
                    for (let i = 0; i < state.previewTime; i += 1) {
                        const datetime = interval.next();
                        const year = state.zerofill(datetime.getFullYear());
                        const month = state.zerofill(datetime.getMonth() + 1);
                        const date = state.zerofill(datetime.getDate());
                        const hour = state.zerofill(datetime.getHours());
                        const minute = state.zerofill(datetime.getMinutes());
                        const second = state.zerofill(datetime.getSeconds());

                        previews.push(
                            `${year}-${month}-${date} ${hour}:${minute}:${second}`
                        );
                    }
                } catch (error) {
                    console.log(error, "error");
                    previews = ["此表达式暂时无法解析！"];
                }

                return previews;
            }),
        });
        const getValue = () => {
            return state.cron;
        };
        const close = () => {
            emit("close");
        };
        const onConfirm = () => {
            emit("onConfirm", state.cron);
        };
        // watch(
        //     () => state.cron,
        //     (newValue, oldValue) => {
        //         emit("change", state.cron);
        //     },
        //     { deep: false }
        // );
        const rest = (data) => {
            for (let i in data) {
                if (data[i] instanceof Object) {
                    this.rest(data[i]);
                } else {
                    switch (typeof data[i]) {
                        case "object":
                            data[i] = [];
                            break;
                        case "string":
                            data[i] = "";
                            break;
                    }
                }
            }
        };
        const setValue = (value) => {
            const cronArr = value.split(" ");
            state.secondsText = cronArr[0];
            state.minutesText = cronArr[1];
            state.hoursText = cronArr[2];
            state.daysText = cronArr[3];
            state.monthsText = cronArr[4];
            state.weeksText = cronArr[5];
            state.yearsText = cronArr[6];

            if (
                ["*", "?"].includes(cronArr[3]) &&
                ["*", "?"].includes(cronArr[5])
            ) {
                state.day.cronEvery = "1";
            }
        };
        const reset = () => {
            activeTab.value = "second";
            setValue("* * * * * ?");
        };

        return {
            activeTab,
            state,
            getValue,
            close,
            onConfirm,
            rest,
            setValue,
            reset,
        };
    },
});
</script>
