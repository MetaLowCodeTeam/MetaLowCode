<!--
 * @Descripttion: 用户选择器组件
 * @version: 1.0
 * @Author: 邪七
 * @Date: 2023年6月28日11:30:05
 * @LastEditors: 邪七
 * @LastEditTime: 2023年6月28日11:30:56
-->
<template>
    <el-select
        ref="select"
        v-model="defaultValue"
        :size="size"
        :clearable="clearable"
        :multiple="multiple"
        :collapse-tags="collapseTags"
        :collapse-tags-tooltip="collapseTagsTooltip"
        :filterable="filterable"
        :placeholder="placeholder"
        :disabled="disabled"
        :filter-method="filterMethod"
        @remove-tag="removeTag"
        @visible-change="visibleChange"
        @clear="clear"
        :style="{'width': cardWidth}"
    >
        <template #empty>
            <div class="mlselect-user-content" v-loading="loading">
                <el-row :gutter="20" class="mb-10">
                    <el-col :span="19">
                        <el-input
                            placeholder="请输入关键词搜索"
                            v-model="keyword"
                            clearable
                            @clear="getData"
                            @keyup.enter="getData"
                        ></el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary" @click="getData">查询</el-button>
                    </el-col>
                </el-row>
                <div class="mb-10">
                    <el-tabs
                        type="border-card"
                        class="mlselect-user-tabs"
                        v-model="cutTabs"
                        @tab-change="getData"
                    >
                        <el-tab-pane
                            :name="tab.name"
                            :label="tab.label"
                            v-for="(tab,inx) of tabList"
                            :key="inx"
                        >
                            <div
                                class="tab-item-li"
                                v-for="(item,itemInx) of tabData"
                                :key="itemInx"
                                @click="selectUser(item,tab)"
                            >
                                {{ item[tab.itemName] }}
                                <div class="tab-item-icon fr" v-if="item.isActive">
                                    <el-icon class="tab-item-icon-el">
                                        <ElIconSelect />
                                    </el-icon>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </template>
    </el-select>
</template>

<script>
export default {
    props: {
        modelValue: null,
        cardWidth: { type: String, default: "100%" },
        size: { type: String, default: "default" },
        clearable: { type: Boolean, default: false },
        placeholder: { type: String, default: "请选择" },
        multiple: { type: Boolean, default: false },
        filterable: { type: Boolean, default: false },
        collapseTags: { type: Boolean, default: false },
        collapseTagsTooltip: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
    },
    watch: {
        modelValue: {
            handler() {
                this.defaultValue = this.modelValue;
                this.autoCurrentLabel();
            },
            deep: true,
        },
    },
    data() {
        return {
            loading: false,
            defaultValue: [],
            selectedUser: [],
            keyword: "",
            cutTabs: "Role",
            tabList: [
                {
                    label: "角色",
                    name: "Role",
                    itemId: "roleId",
                    itemName: "roleName",
                },
                {
                    label: "用户",
                    name: "User",
                    itemId: "userId",
                    itemName: "userName",
                },
                {
                    label: "部门",
                    name: "Department",
                    itemId: "departmentId",
                    itemName: "departmentName",
                },
            ],
            tabData: [],
        };
    },
    mounted() {
        this.defaultValue = this.modelValue;
        this.autoCurrentLabel();
    },
    methods: {
        // 获取数据
        async getData() {
            this.loading = true;
            // 查询参数
            let param = {
                search: this.keyword,
            };
            // 当前tab
            let cutTab = this.tabList.filter(el=> this.cutTabs == el.name)[0];
            // 当前默认选中的IDs
            let cutSelectedIds = this.defaultValue ? this.defaultValue.map(el=> el.id) : [];
            // 获取当前tab接口
            let res = await this.$API.approval.selectUser["get" + this.cutTabs](
                param
            );
            if (res.data.code == 200) {
                this.tabData = res.data.data.map((el) => {
                    el.isActive = false;
                    // 如果该ID已在选中集里，默认选中
                    if(cutSelectedIds.includes(el[cutTab.itemId])){
                        el.isActive = true;
                    }
                    return el;
                });
            } else {
                console.log(res.data.message);
                this.$message.error("获取数据失败，请尝试刷新页面后重试");
            }
            this.loading = false;
        },
        //自动模拟options赋值
        autoCurrentLabel() {
            this.$nextTick(() => {
                if (this.multiple) {
                    this.$refs.select.selected.forEach((item) => {
                        item.currentLabel = item.value.name;
                    });
                } else {
                    this.$refs.select.selectedLabel = this.defaultValue.name;
                }
            });
        },
        // 选择用户
        selectUser(item, tab) {
            if (!item.isActive) {
                item.isActive = true;
                this.defaultValue.push({
                    name: item[tab.itemName],
                    id: item[tab.itemId],
                });
            }else{
                item.isActive = false;
                this.defaultValue.forEach((el,inx)=>{
                    if(el.id === item[tab.itemId]){
                        this.defaultValue.splice(inx,1);
                    }
                })
            }
            this.autoCurrentLabel()
            this.$emit("update:modelValue", this.defaultValue);
            this.$emit('change', this.defaultValue);
        },
        //表格显示隐藏回调
        visibleChange(visible) {
            if (visible) {
                this.keyword = null;
                this.getData();
            } else {
                this.autoCurrentLabel();
            }
        },
        // tags删除后回调
        removeTag() {
            this.$emit("update:modelValue", this.defaultValue);
        },
        //清空后的回调
        clear() {
            this.$emit("update:modelValue", this.defaultValue);
        },
        // 自定义搜索方法
        filterMethod(keyword) {
            if (!keyword) {
                this.keyword = null;
                return false;
            }
            this.keyword = keyword;
            this.getData();
        },
    },
};
</script>

<style lang="scss" scoped>
.mlselect-user-content {
    padding: 20px;
    .tab-item-li {
        font-size: 14px;
        cursor: pointer;
        line-height: 40px;
        border-bottom: 1px solid #dcdfe6;
        padding: 0 20px;
        &:last-child {
            border-bottom: 0;
        }
        &:hover {
            background: #409eff;
            color: #fff;
        }
        .tab-item-icon {
            .tab-item-icon-el {
                position: relative;
                top: 2px;
            }
        }
    }
}
</style>