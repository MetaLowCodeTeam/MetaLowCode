<template>
    <!--  -->
    <div class="tab-member-list" v-loading="loading">
        <div class="search-box mb-10" v-if="!isRole">
            <mlSearchInput
                style="width: 230px;"
                v-model="keyword"
                placeholder="查询成员名称及所属部门"
                @confirm="formatMembers"
            />
        </div>
        <div class="member-item-box">
            <el-scrollbar v-if="showMembers.length > 0">
                <div class="member-item" v-for="(item,inx) of showMembers" :key="inx">
                    <template v-if="isRole">
                        <div class="member-list__main role">
                            <div class="name yichu" :title="item.roleName.name">{{item.roleName}}</div>
                            <div
                                class="department yichu"
                                :title="item.description"
                            >{{item.description}}</div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="member-list__icon">
                            <el-avatar :size="40">
                                <mlAvatar :userId="item.userId"/>
                            </el-avatar>
                        </div>
                        <div class="member-list__main">
                            <div class="name yichu" :title="item.userName">{{item.userName}}</div>
                            <div
                                class="department yichu"
                                :title="item.departmentName"
                            >{{item.departmentName}}</div>
                        </div>
                    </template>
                    <span class="member-list__del" @click.stop="delMember(item)" v-if="!isDisabled">
                        <el-icon size="20">
                            <ElIconDeleteFilled />
                        </el-icon>
                    </span>
                </div>
            </el-scrollbar>
            <el-empty v-else description="没有数据" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { delTeamMembers } from "@/api/team";

const emits = defineEmits(["delMembers"]);
const props = defineProps({
    modelValue: null,
    id: { type: String, default: "" },
    isRole: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
});

let myMembers = ref([]);
let keyword = ref("");
let showMembers = ref([]);
let loading = ref(false);
watch(
    () => props.modelValue,
    () => {
        myMembers.value = props.modelValue;
        formatMembers();
    },
    { deep: true }
);

onMounted(() => {
    myMembers.value = props.modelValue;
    formatMembers();
});

const formatMembers = () => {
    // 搜索值为空
    if (!keyword.value) {
        showMembers.value = [...myMembers.value];
        return;
    }
    let newMembersList = [];
    myMembers.value.forEach((el) => {
        if (el.userName.indexOf(keyword.value) != -1) {
            newMembersList.push(el);
        }
        if (el.departmentName.indexOf(keyword.value) != -1) {
            newMembersList.push(el);
        }
    });
    showMembers.value = [...newMembersList];
};

// 删除成员
const delMember = (item) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            loading.value = true;
            let res;
            if(props.isRole){
                res = await delTeamMembers(item.roleId,props.id);
            }else {
                res = await delTeamMembers(props.id, item.userId);
            }
            if (res) {
                ElMessage.success("删除成功");
                emits("delMembers");
            }
            loading.value = false;
        })
        .catch(() => {});
};
</script>
<style lang='scss' scoped>
.tab-member-list {
    .member-item-box {
        max-height: 500px;
        .member-item {
            height: 50px;
            border-top: 1px solid #dee2e6;
            &:last-child {
                border-bottom: 0;
            }
            &:nth-child(odd) {
                background: #f5f5f5;
            }
            &:hover {
                background: #f0f0f0;
            }
            .member-list__icon {
                height: 40px;
                width: 40px;
                float: left;
                margin: 5px 10px;
            }
            .member-list__main {
                float: left;
                width: calc(100% - 100px);
                &.role {
                    padding-left: 20px;
                }
                .name {
                    height: 20px;
                    margin-top: 5px;
                }
                .department {
                    color: #999;
                }
            }
            .member-list__del {
                float: right;
                margin-top: 15px;
                margin-right: 15px;
                cursor: pointer;
                color: #a1a1a1;
                &:hover {
                    color: #ea4335;
                }
            }
        }
    }
}
</style>