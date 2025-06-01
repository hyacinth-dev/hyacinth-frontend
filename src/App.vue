<script setup lang="ts">
import { NMessageProvider, NLayout, NConfigProvider } from 'naive-ui'
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-layout class="layout">
        <router-view />
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.layout {
  height: 100vh;
  width: 100%;
  /* display: flex; */
}
</style>
