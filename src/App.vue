<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const userStore = useUserStore()

// 判断当前路由是否需要布局
const needLayout = computed(() => {
  // 登录、注册等页面不需要布局
  return !['login', 'admin', 'register'].includes(route.name as string) && userStore.isLoggedIn
})
</script>

<template>
  <AppLayout v-if="needLayout">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>

<style>
</style>
