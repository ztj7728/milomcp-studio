<template>
  <div class="common-layout">
    <app-navbar />
    <el-container class="main-container">
      <el-main class="content-main">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import AppNavbar from '../components/AppNavbar.vue'
</script>

<style scoped>
.common-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-container {
  padding-top: 64px; /* Match navbar height */
  height: 100%;
  overflow-y: auto;
  background: var(--app-bg-color);
}

.content-main {
  padding: 0;
  background: transparent;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }
}
</style>
