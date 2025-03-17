<script setup lang="ts">
import { NMessageProvider, NLayout } from 'naive-ui'
</script>

<template>
  <n-message-provider>
    <n-layout class="layout">
      <router-view />
    </n-layout>
  </n-message-provider>
</template>

<style scoped>
.layout {
  height: 100vh;
  width: 100%;
  /* display: flex; */
}
</style>
