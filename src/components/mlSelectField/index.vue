<template>
    <mlDialog :title="title" append-to-body width="37%" v-model="dialogIsShow">
        <div class="mlfield-box">
            <el-row :gutter="10">
                <el-col :span="6" v-for="(field,inx) of fieldList" :key="inx">
                    <div class="mlfield-item">
                        <div class="mlfield-check-box fl">
                            <el-checkbox v-model="field.isSelected" />
                        </div>
                        <div
                            class="mlfield-label fr"
                            @click="field.isSelected = !field.isSelected"
                        >{{ field.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </div>
        <template #footer>
            <el-button type="primary" @click="confirm">确认</el-button>
            <el-button @click="dialogIsShow = false">取消</el-button>
        </template>
    </mlDialog>
</template>

<script>
export default {
    props: {
        modelValue: { type: Object, default: () => {} },
        title: { type: String, defalut: "123" },
    },
    watch: {
        modelValue() {
            this.selectedFields = this.modelValue;
        },
    },
    data() {
        return {
            dialogIsShow: false,
            loading: false,
            fieldList: [],
            selectedFields: [],
        };
    },
    mounted() {
        this.selectedFields = this.modelValue;
    },
    methods: {
        // 打开弹框
        openDialg() {
            this.dialogIsShow = true;
            this.getAllFields();
        },
        // 获取所有字符
        async getAllFields() {
            this.loading = true;
            // 获取条件字段接口
            let param = {
                entity: "DemoCompany",
            };
            let hasFields = this.selectedFields.map((el) => el.name);
            let res = await this.$API.approval.setConditions.getFieldSet(param);
            if (res.data.code == 200) {
                this.fieldList = res.data.data.map((el) => {
                    el.isSelected = false;
                    el.required = false;
                    if (hasFields.includes(el.name)) {
                        el.isSelected = true;
                    }
                    return el;
                });
            } else {
                console.log(res.data.message);
                this.$message.error("获取数据失败，请尝试刷新页面后重试");
            }
            this.loading = false;
        },
        confirm() {
            this.selectedFields = this.fieldList.filter((el) => el.isSelected);
            this.$emit("update:modelValue", this.selectedFields);
            this.dialogIsShow = false;
        },
    },
};
</script>

<style lang="scss" scoped>
.mlfield-box {
    .mlfield-item {
        cursor: pointer;
        .mlfield-label {
            display: inline-block;
            width: calc(100% - 20px);
            margin-top: -1px;
        }
    }
}
</style>