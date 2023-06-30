<template>
  <el-form-item :label="label" :label-width="labelWidth + 'px'" :class="[labelAlign]">
    <el-cascader :options="regionData" v-model="selectedOptions" :disabled="disabled"
                 @change="handleChange" style="width: 100%" popper-class="hide-x-scroll-bar">
    </el-cascader>
  </el-form-item>
</template>

<script>
  import { provinceAndCityData, regionData, CodeToText, TextToCode } from "./element-china-area-data";
  import FormState from "@/views/system/form-state-variables";
  import {isEmptyStr} from "@/utils/util";

  export default {
    name: "AreaCascadeSelect",
    props: {
      formModel: Object,
      formState: {
        type: Number,
        default: 0,
      },
      dataFields: {
        type: Array,
        default: () => [],
      },
      fieldPropsMap: {
        type: Object,
        default: null,
      },
      componentLabel: {
        type: String,
        default: null
      },
      labelWidth: {
        type: Number,
        default: 75
      },
      labelAlign: {
        type: String,
        default: 'label-left-align'
      },
    },
    data() {
      return {
        regionData,
        selectedOptions: [],
        dataFieldBindingFlag: false, /* 数据字段是否绑定正确 */
        provinceField: '',
        cityField: '',
        districtField: '',
      }
    },
    computed: {
      label() {
        return !!this.componentLabel ? this.componentLabel : '地区选择'
      },

      disabled() {
        if (!this.dataFieldBindingFlag) {
          return true
        }

        return (this.formState !== FormState.NEW) && (this.formState !== FormState.EDIT);
      }

    },
    mounted() {
      this.initComponent()
    },
    methods: {
      handleChange(value) {
        //console.log(value);
        //更新formModel
        if (!!value && Array.isArray(value) && (value.length === 3)) {
          let provinceCode = value[0]
          let cityCode = value[1]
          let districtCode = value[2]
          this.formModel[this.provinceField] = CodeToText[provinceCode]
          this.formModel[this.cityField] = CodeToText[cityCode]
          this.formModel[this.districtField] = CodeToText[districtCode]
        }
      },

      initComponent() {
        if (!this.dataFields || !Array.isArray(this.dataFields) || (this.dataFields.length !== 3)) {
          this.dataFieldBindingFlag = false
          this.$message.error('地区级联选择组件需要绑定三个文本字段，分别对应省/市/区')
          return
        }

        if ((this.formState === FormState.PREVIEW) || !this.formModel) {
          return
        }

        this.dataFieldBindingFlag = true
        this.provinceField = this.dataFields[0]
        this.cityField = this.dataFields[1]
        this.districtField = this.dataFields[2]
        let provinceCode = ''
        let provinceValue = this.formModel[this.provinceField]
        let cityValue = this.formModel[this.cityField]
        let districtValue = this.formModel[this.districtField]
        if (!isEmptyStr(provinceValue)) {
          provinceCode = TextToCode[provinceValue].code
        }
        let cityCode = ''
        if (!isEmptyStr(provinceValue) && !isEmptyStr(cityValue)) {
          cityCode = TextToCode[provinceValue][cityValue].code
        }
        let districtCode = ''
        if (!isEmptyStr(provinceValue) && !isEmptyStr(cityValue) && !isEmptyStr(districtValue)) {
          districtCode = TextToCode[provinceValue][cityValue][districtValue].code
        }
        this.selectedOptions = [provinceCode, cityCode, districtCode]
      },

    }
  }
</script>

<style lang="scss" scoped>
  .custom-component-label {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
  }

</style>

<style lang="scss">
  .hide-x-scroll-bar .el-cascader-menu__wrap { //此处不能用::v-deep
    overflow-x: hidden; /* IE浏览器隐藏水平滚动条！！ */
  }
</style>
