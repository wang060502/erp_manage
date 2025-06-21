<template>
  <div class="error-page-container">
    <div class="content-wrapper">
      <div class="illustration-wrapper">
        <svg
          class="error-svg"
          width="200"
          height="200"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#4F80E8" />
              <stop offset="100%" stop-color="#2C5282" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g class="shield-group">
            <path
              d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z"
              fill="url(#shieldGradient)"
              stroke="#A3BFFA"
              stroke-width="1.5"
            />
            <path
              class="lock-body"
              d="M42 45 H58 V60 H42 Z"
              fill="#fff"
              stroke="#2C5282"
              stroke-width="1"
            />
            <path
              class="lock-handle"
              d="M45 45 V38 A5 5 0 0 1 55 38 V45"
              fill="none"
              stroke="#fff"
              stroke-width="4"
            />
          </g>
        </svg>
      </div>
      <div class="text-content">
        <h1 class="error-code">403</h1>
        <p class="error-title">禁止访问</p>
        <p class="error-description">抱歉，您的权限不足，无法访问此页面。</p>
        <button class="home-button" @click="goHome">返回首页 ({{ countdown }}s)</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({ name: 'Error403Page' });

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
  /* min-height: 80vh; */
  /* background: linear-gradient(135deg, #f5f7fa 0%, #e0e8f0 100%); */
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    '微软雅黑', Arial, sans-serif;
  overflow: hidden;
}

.content-wrapper {
  text-align: center;
  padding: 40px;
}

.illustration-wrapper {
  margin-bottom: 30px;
}

.error-svg .shield-group {
  animation: float 4s ease-in-out infinite;
  filter: url(#glow);
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: #2c5282;
  margin: 0;
  animation: text-flicker 3s ease-in-out infinite alternate;
  text-shadow: 0 0 5px #a3bffa, 0 0 10px #a3bffa;
}

.error-title {
  font-size: 1.75rem;
  color: #2d3748;
  font-weight: 600;
  margin: 20px 0 10px;
}

.error-description {
  font-size: 1rem;
  color: #718096;
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

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes text-flicker {
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 5px #a3bffa, 0 0 10px #a3bffa;
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 8px #a3bffa, 0 0 15px #a3bffa;
  }
}
</style>
