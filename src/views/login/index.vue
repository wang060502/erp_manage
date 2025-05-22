<template>
  <div class="login-bg">
    <!-- 左侧SVG装饰 -->
    <div class="login-left">
      <div class="svg-bg">
        <!-- 简洁仓储主题SVG装饰 -->
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect x="10" y="60" width="100" height="40" rx="8" fill="#2563eb" />
          <rect x="20" y="40" width="80" height="30" rx="6" fill="#3b82f6" />
          <rect x="35" y="20" width="50" height="20" rx="4" fill="#60a5fa" />
          <circle cx="60" cy="100" r="8" fill="#1e3a8a" />
        </svg>
      </div>
      <div class="brand-title">跨境仓储ERP</div>
      <div class="brand-slogan">让仓储进销存更高效</div>
    </div>
    <!-- 右侧登录/注册卡片 -->
    <div class="login-right">
      <!-- 背景装饰SVG -->
      <svg class="login-bg-svg" width="480" height="480" viewBox="0 0 480 480" fill="none">
        <ellipse cx="240" cy="400" rx="200" ry="60" fill="#e0e7ff" />
        <circle cx="400" cy="80" r="40" fill="#dbeafe" />
        <circle cx="60" cy="60" r="24" fill="#f1f5f9" />
      </svg>
      <div class="login-card">
        <!-- 可选：卡片顶部品牌SVG -->
        <div class="card-logo">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <rect x="8" y="20" width="24" height="12" rx="3" fill="#2563eb" />
            <rect x="12" y="12" width="16" height="8" rx="2" fill="#3b82f6" />
          </svg>
        </div>
        <div class="tab-switch">
          <span :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">登录</span>
          <span :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'"
            >注册</span
          >
        </div>
        <el-form
          v-if="activeTab === 'login'"
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <div class="login-title">登录</div>
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              prefix-icon="User"
              clearable
              :class="{ 'is-error': loginErrorField === 'username' }"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              clearable
              :class="{ 'is-error': loginErrorField === 'password' }"
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="full-btn" @click="handleLogin" :loading="loading"
              >登录</el-button
            >
          </el-form-item>
          <div class="login-footer">
            <el-link type="info" @click="handleForgot">忘记密码？</el-link>
          </div>
          <el-alert
            v-if="loginErrorMsg"
            :title="loginErrorMsg"
            type="error"
            show-icon
            class="login-error"
          />
        </el-form>
        <el-form
          v-else
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
          class="login-form"
          @keyup.enter="handleRegister"
        >
          <div class="login-title">注册</div>
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用户名"
              prefix-icon="User"
              clearable
              :class="{ 'is-error': registerErrorField === 'username' }"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              clearable
              :class="{ 'is-error': registerErrorField === 'password' }"
            />
          </el-form-item>
          <el-form-item prop="realName">
            <el-input
              v-model="registerForm.realName"
              placeholder="真实姓名"
              prefix-icon="Avatar"
              clearable
              :class="{ 'is-error': registerErrorField === 'realName' }"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="邮箱"
              prefix-icon="Message"
              clearable
              :class="{ 'is-error': registerErrorField === 'email' }"
            />
          </el-form-item>
          <el-form-item prop="mobile">
            <el-input
              v-model="registerForm.mobile"
              placeholder="手机号"
              prefix-icon="Iphone"
              clearable
              :class="{ 'is-error': registerErrorField === 'mobile' }"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="full-btn" @click="handleRegister" :loading="loading"
              >注册</el-button
            >
          </el-form-item>
          <el-alert
            v-if="registerErrorMsg"
            :title="registerErrorMsg"
            type="error"
            show-icon
            class="login-error"
          />
        </el-form>
        <div class="login-bottom-tip">欢迎使用跨境仓储ERP，助力企业高效管理库存</div>
        <div class="login-browser-tip">
          <span class="chrome-icon">
            <!-- 谷歌浏览器SVG图标 -->
            <svg
              class="google-icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2660"
              width="20"
              height="20"
            >
              <path
                d="M213.573746 512.08574a296.892457 296.892457 0 0 1 15.663636-94.698456L53.712514 286.089155a504.154105 504.154105 0 0 0 0 451.737229l175.422492-131.502883a296.022255 296.022255 0 0 1-15.356507-94.288949"
                fill="#FBBC05"
                p-id="2661"
              ></path>
              <path
                d="M521.881206 208.845928a305.696854 305.696854 0 0 1 192.007518 67.210309l151.773472-148.446228A527.547183 527.547183 0 0 0 53.763703 284.195186l175.422491 131.349318a306.771809 306.771809 0 0 1 292.541447-206.698576"
                fill="#EA4335"
                p-id="2662"
              ></path>
              <path
                d="M521.881206 815.325553a307.130128 307.130128 0 0 1-292.643824-206.698576l-175.524868 131.29813A521.148639 521.148639 0 0 0 521.881206 1023.969287a503.130338 503.130338 0 0 0 339.839486-127.100685l-166.771659-126.128105a327.861412 327.861412 0 0 1-173.221392 44.585056"
                fill="#34A853"
                p-id="2663"
              ></path>
              <path
                d="M1023.475893 513.774956a415.64944 415.64944 0 0 0-11.875698-92.70211h-486.289369v197.023977h279.744358a229.528582 229.528582 0 0 1-106.522966 152.43892l166.618094 126.128106a502.004194 502.004194 0 0 0 158.069639-382.888893"
                fill="#4285F4"
                p-id="2664"
              ></path>
            </svg>
          </span>
          推荐使用谷歌浏览器，以获得最佳体验
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 全部为简体中文
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginUser, registerUser } from '@/api/login/login'

const router = useRouter()
const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)
const rememberMe = ref(false)

// 登录表单与状态
const loginForm = reactive({ username: '', password: '' })
const loginErrorMsg = ref('')
const loginErrorField = ref('')
const loginFormRef = ref()
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 注册表单与状态
const registerForm = reactive({ username: '', password: '', realName: '', email: '', mobile: '' })
const registerErrorMsg = ref('')
const registerErrorField = ref('')
const registerFormRef = ref()
const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ required: false }, { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  mobile: [
    { required: false },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
}

// 记住密码自动填充
onMounted(() => {
  const saved = localStorage.getItem('erp_remember')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      loginForm.username = data.username || ''
      loginForm.password = data.password || ''
      rememberMe.value = true
    } catch {}
  }
})

// 登录逻辑
const handleLogin = () => {
  loginErrorMsg.value = ''
  loginErrorField.value = ''
  if (!loginFormRef.value) return
  loginFormRef.value.validate(async (valid: boolean, fields: any) => {
    if (!valid) {
      if (fields.username) loginErrorField.value = 'username'
      else if (fields.password) loginErrorField.value = 'password'
      loginErrorMsg.value = fields.username?.[0]?.message || fields.password?.[0]?.message || ''
      return
    }
    loading.value = true
    try {
      const res = await loginUser({
        username: loginForm.username,
        password: loginForm.password,
      })
      const data = res.data || res
      if (data.code === 200 && data.token) {
        localStorage.setItem('token', data.token)
        if (rememberMe.value) {
          localStorage.setItem(
            'erp_remember',
            JSON.stringify({ username: loginForm.username, password: loginForm.password }),
          )
        } else {
          localStorage.removeItem('erp_remember')
        }
        ElMessage.success('登录成功')
        router.push('/')
      } else {
        loginErrorMsg.value = data.message || '登录失败'
      }
    } catch (e: any) {
      loginErrorMsg.value = e?.message || '登录失败'
    } finally {
      loading.value = false
    }
  })
}

// 注册逻辑
const handleRegister = () => {
  registerErrorMsg.value = ''
  registerErrorField.value = ''
  if (!registerFormRef.value) return
  registerFormRef.value.validate(async (valid: boolean, fields: any) => {
    if (!valid) {
      if (fields.username) registerErrorField.value = 'username'
      else if (fields.password) registerErrorField.value = 'password'
      else if (fields.realName) registerErrorField.value = 'realName'
      else if (fields.email) registerErrorField.value = 'email'
      else if (fields.mobile) registerErrorField.value = 'mobile'
      registerErrorMsg.value =
        fields.username?.[0]?.message ||
        fields.password?.[0]?.message ||
        fields.realName?.[0]?.message ||
        fields.email?.[0]?.message ||
        fields.mobile?.[0]?.message ||
        ''
      return
    }
    loading.value = true
    try {
      const res = await registerUser({
        username: registerForm.username,
        password: registerForm.password,
        realName: registerForm.realName,
        email: registerForm.email,
        mobile: registerForm.mobile,
      })
      const data = res.data || res
      if (data.code === 201 || data.code === 200) {
        ElMessage.success('注册成功，请登录')
        activeTab.value = 'login'
      } else {
        registerErrorMsg.value = data.message || '注册失败'
      }
    } catch (e: any) {
      registerErrorMsg.value = e?.message || '注册失败'
    } finally {
      loading.value = false
    }
  })
}

// 忘记密码
const handleForgot = () => {
  ElMessage.info('请联系管理员重置密码')
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: #f8fafc;
}
.login-left {
  flex: 1.2;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.svg-bg {
  margin-bottom: 32px;
}
.brand-title {
  font-size: 2.2rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 12px;
}
.brand-slogan {
  font-size: 1.1rem;
  opacity: 0.85;
  letter-spacing: 1px;
}
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #f8fafc;
  overflow: hidden;
}
.login-bg-svg {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}
.login-card {
  position: relative;
  z-index: 1;
  width: 340px;
  border-radius: 12px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.08);
  padding: 36px 32px 24px 32px;
  background: #fff;
}
.card-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.tab-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.tab-switch span {
  padding: 8px 32px;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.tab-switch .active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
  font-weight: bold;
}
.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #22223b;
  margin-bottom: 24px;
  text-align: center;
}
.login-form {
  width: 100%;
}
.full-btn {
  width: 100%;
  font-size: 1.1rem;
  letter-spacing: 2px;
}
.login-footer {
  margin-top: 8px;
  text-align: right;
}
.login-error {
  margin-top: 12px;
}
.is-error .el-input__wrapper {
  border-color: #f56c6c !important;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.08);
}
.login-progress {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 10;
}
.login-bottom-tip {
  margin-top: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
  letter-spacing: 1px;
}
.login-browser-tip {
  margin-top: 8px;
  text-align: center;
  color: #b0b6be;
  font-size: 0.88rem;
  letter-spacing: 1px;
}
.chrome-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
