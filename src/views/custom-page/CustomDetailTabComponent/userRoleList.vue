<template>
    <div v-loading="loading">
        <TabMemberList
            v-model="memberList"
            @delMembers="getMemberList"
            :id="recordId"
            isRole
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TabMemberList from "@/views/user/components/TabMemberList.vue";
// API
import { getUserRole } from "@/api/user";

defineOptions({
	name: "userRoleList",
});

const props = defineProps({
    recordId: {
        type: String,
        default: ""
    }
});

const memberList = ref([]);
const loading = ref(false);

onMounted(() => {
    getMemberList();
});

const getMemberList = async () => {
    loading.value = true;
    const res = await getUserRole(props.recordId);
    if(res){
        memberList.value = res.data.data || [];
    }
    loading.value = false;
}

defineExpose({
    refresh: getMemberList,
});

</script>

<style></style>
