<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage, NSpace } from 'naive-ui'
import { register } from '../api/auth'

const router = useRouter()
// 消息提示实例，用于显示注册过程中的反馈信息
const message = useMessage()
// 表单引用，用于表单验证
const formRef = ref(null)
// 表单数据对象，包含用户注册所需信息
const formValue = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  // verifyCode: ''
})

// 表单验证状态变量
let usernameValid = false // 用户名格式是否有效
let emailValid = false // 邮箱格式是否有效
let passwordValid = false // 密码是否符合强度要求
let confirmPasswordValid = false // 两次密码是否一致

/**
 * 表单验证规则
 * 包含对邮箱、密码格式的验证，以及确认密码的一致性检查
 */
const rules = {
  username: { // 用户名验证规则（当前未启用）
    required: true,
    message: '请输入用户名',
    trigger: ['blur', 'input']
  },
  email: {
    required: true,
    message: '请输入正确的邮箱地址',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      if (!value) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailValid = emailRegex.test(value) // 同时更新状态变量
    }
  },
  password: {
    required: true,
    message: '请输出合法的密码（至少8位，包含字母和数字）',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
      return passwordValid = passwordRegex.test(value)
    }
  },
  confirmPassword: {
    required: true,
    message: '两次输入的密码不一致',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      return confirmPasswordValid = (value === formValue.value.password)
    }
  },
  // verifyCode: { // 验证码验证规则（当前未启用）
  //   required: true,
  //   message: '请输入验证码',
  //   trigger: ['blur', 'input'],
  //   validator: (_rule: any, value: string) => {
  //     return value.length === 6
  //   }
  // }
}

// 发送验证码相关状态变量（当前验证码功能未启用）
const sendingCode = ref(false) // 是否正在发送验证码
const countdown = ref(0) // 验证码倒计时

/**
 * 处理发送验证码
 * 向用户邮箱发送验证码并启动倒计时
 * 注：当前功能未启用
 */
const handleSendCode = async () => {
  if (sendingCode.value || countdown.value > 0) return
  try {
    sendingCode.value = true
    // TODO: 实现发送验证码的API调用
    // await sendVerifyCode(formValue.value.email)
    message.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--
      } else {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    message.error('发送验证码失败：' + ((error as any).message || '未知错误'))
  } finally {
    sendingCode.value = false
  }
}

/**
 * 处理用户注册
 * 验证用户输入并向后端发送注册请求
 */
const handleRegister = async () => {
  // 最终验证，确保所有字段都符合要求
  if (!emailValid || !passwordValid || !confirmPasswordValid) {
    message.error('请检查输入的邮箱和密码是否符合要求')
    return
  }
  try {
    // 调用注册API
    await register({
      username: formValue.value.username,
      email: formValue.value.email,
      password: formValue.value.password
    })
    message.success('注册成功')
    router.push('/login')
  } catch (error) {
    console.log(error)
    // 显示注册失败消息，包含后端返回的具体错误原因
    message.error('注册失败：' + ((error as any).response.data.message || '未知错误'))
  }
}
</script>

<template>
  <!-- 注册页面容器 -->
  <div class="login-container">
    <!-- 注册内容区域，包含左侧表单和右侧品牌介绍 -->
    <div class="login-content">
      <!-- 左侧注册表单区域 -->
      <div class="login-left">
        <NCard class="login-card" bordered>
          <!-- 注册表单头部 -->
          <div class="login-header">
            <h2 class="login-title">创建账号</h2>
            <p class="login-subtitle">请填写以下信息完成注册</p>
          </div>
          <!-- 注册表单 -->
          <NForm ref="formRef" :model="formValue" label-placement="left" label-width="0"
            require-mark-placement="right-hanging" :rules="rules">
            <!-- 用户名输入项（当前未启用） -->
            <NFormItem path="username">
              <NInput v-model:value="formValue.username" placeholder="用户名" size="large"
                :input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
            </NFormItem>
            <!-- 邮箱输入项 -->
            <NFormItem path="email">
              <NInput v-model:value="formValue.email" placeholder="邮箱" size="large"
                :input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
            </NFormItem>
            <!-- 密码输入项 -->
            <NFormItem path="password">
              <NInput v-model:value="formValue.password" type="password" placeholder="密码" size="large"
                show-password-on="click" :input-el-style="{ textAlign: 'center', paddingRight: '32px' }" />
            </NFormItem>
            <!-- 确认密码输入项 -->
            <NFormItem path="confirmPassword">
              <NInput v-model:value="formValue.confirmPassword" type="password" placeholder="确认密码" size="large"
                show-password-on="click" :input-el-style="{ textAlign: 'center', paddingRight: '32px' }" />
            </NFormItem>
            <!-- 验证码输入项（当前未启用） -->
            <!-- <NFormItem path="verifyCode">
							<NSpace :wrap="false">
								<NInput v-model:value="formValue.verifyCode" placeholder="验证码" size="large"
									:input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
								<NButton :disabled="sendingCode || countdown > 0" @click="handleSendCode" size="large">
									{{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
								</NButton>
							</NSpace>
						</NFormItem> -->
            <!-- 注册按钮区域 -->
            <div class="form-actions">
              <NButton type="primary" size="large" block @click="handleRegister">注册</NButton>
            </div>
            <!-- 跳转链接区域 -->
            <div class="form-links">
              <p class="link-text">已有账号？<router-link to="/login" class="link">立即登录</router-link></p>
            </div>
          </NForm>
        </NCard>
      </div>
      <!-- 右侧品牌介绍区域 -->
      <div class="login-right">
        <div class="brand-content">
          <h1 class="brand-title">Hyacinth</h1>
          <p class="brand-description">构建您的专属网络，连接无限可能</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 注册页面容器样式，设置全屏高度和背景图 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('@/assets/login-background.jpg') center/cover no-repeat;
}

/* 注册内容区域样式，包含左右两个部分 */
.login-content {
  display: flex;
  width: 1000px;
  height: 600px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧注册表单区域样式 */
.login-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

/* 注册卡片样式 */
.login-card {
  width: 100%;
  max-width: 400px;
  background: transparent;
  border: none;
}

/* 注册表单头部样式 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

/* 注册标题样式 */
.login-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px;
}

/* 注册副标题样式 */
.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 表单按钮区域样式 */
.form-actions {
  margin-top: 32px;
}

/* 跳转链接区域样式 */
.form-links {
  margin-top: 20px;
  text-align: center;
}

.link-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* 右侧品牌介绍区域样式，使用渐变背景 */
.login-right {
  flex: 1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: white;
  text-align: center;
}

/* 品牌标题样式 */
.brand-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 16px;
}

/* 品牌描述样式 */
.brand-description {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
}
</style>