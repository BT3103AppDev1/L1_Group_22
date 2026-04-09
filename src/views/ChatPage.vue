<template>
    <ToolBarHomeowner v-if="userType === 'homeowner'" />
    <ToolBarContractor v-else-if="userType === 'contractor'" />
    <ChatFunction/>
</template>

<script>
    import ChatFunction from "@/components/ChatFunction.vue"
    import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
    import ToolBarContractor from "@/components/ToolBarContractor.vue"
    import { useRouter } from "vue-router"
    const router = useRouter()
    export default {
        name:'chat',
        components:{
            ToolBarHomeowner,
            ToolBarContractor,
            ChatFunction
        }
    }
</script>

<style scoped>

</style>