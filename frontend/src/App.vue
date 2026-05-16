<template>
  <RouterView />
  <!-- Global toast notifications -->
  <ToastContainer />
</template>

<script setup>
import { RouterView } from 'vue-router'
import ToastContainer from '../src/components/common/ToastContainer.vue'
</script>