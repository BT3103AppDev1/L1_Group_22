<template>
    <ToolBarHomeowner/>
    <ChatFunction/>
</template>

<script>
    import ChatFunction from "@/components/ChatFunction.vue"
    import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
    import { useRouter } from "vue-router"
    const router = useRouter()
    export default {
        name:'chat',
        components:{
            ToolBarHomeowner,
            ChatFunction
        }
    }
</script>

<style scoped>

</style>