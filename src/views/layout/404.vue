<template>
  <div class="error-page-container">
    <div class="stars-bg"></div>
    <div class="content-wrapper">
      <div class="illustration-wrapper">
        <svg
          class="error-svg"
          width="200"
          height="200"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g class="rocket-group">
            <path
              d="M65 80 A15 15 0 0 0 35 80 H65 Z"
              fill="#E0E8F0"
              stroke="#A3BFFA"
              stroke-width="1.5"
            />
            <path d="M50 20 L65 80 H35 L50 20 Z" fill="#4F80E8" />
            <circle cx="50" cy="50" r="8" fill="#fff" stroke="#2C5282" stroke-width="1.5" />
            <path
              class="flame"
              d="M40 80 Q50 100 60 80"
              fill="none"
              stroke="#FBBF24"
              stroke-width="3"
              stroke-linecap="round"
            />
          </g>
        </svg>
      </div>
      <div class="text-content">
        <h1 class="error-code">404</h1>
        <p class="error-title">页面似乎迷路了</p>
        <p class="error-description">您要找的页面不存在或已被移动。</p>
        <button class="home-button" @click="goHome">返回首页 ({{ countdown }}s)</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({ name: 'Error404Page' });

const router = useRouter();
const countdown = ref(5);
let timer: ReturnType<typeof setInterval> | null = null;

const goHome = () => {
  if (timer) clearInterval(timer);
  router.push('/');
};

onMounted(() => {
  timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      goHome();
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.error-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #0f172a;
  background-image: radial-gradient(circle, #1e293b 0%, #0f172a 100%);
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    '微软雅黑', Arial, sans-serif;
  overflow: hidden;
  position: relative;
}

.stars-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23A3BFFA"/></pattern></defs><rect width="100%" height="100%" fill="none" stroke="%23A3BFFA" stroke-width="0"/><rect width="100%" height="100%" fill="url(%23p)"/></svg>');
  animation: twinkle 20s linear infinite;
}

.content-wrapper {
  text-align: center;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.illustration-wrapper {
  margin-bottom: 30px;
}

.error-svg .rocket-group {
  animation: float-rocket 6s ease-in-out infinite;
}

.error-svg .flame {
  animation: flame-flicker 0.5s ease-in-out infinite alternate;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: #a3bffa;
  margin: 0;
  text-shadow: 0 0 10px #4f80e8, 0 0 20px #4f80e8;
}

.error-title {
  font-size: 1.75rem;
  color: #e0e8f0;
  font-weight: 600;
  margin: 20px 0 10px;
}

.error-description {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 30px;
}

.home-button {
  padding: 12px 30px;
  font-size: 1rem;
  color: #fff;
  background-color: #4f80e8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(79, 128, 232, 0.3);
}

.home-button:hover {
  transform: translateY(-3px);
  background-color: #2c5282;
  box-shadow: 0 7px 20px rgba(44, 82, 130, 0.4);
}

@keyframes float-rocket {
  0%,
  100% {
    transform: translateY(0) rotate(5deg);
  }
  50% {
    transform: translateY(-20px) rotate(-5deg);
  }
}

@keyframes flame-flicker {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.2);
    stroke: #fcd34d;
  }
}

@keyframes twinkle {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100px);
  }
}
</style>
