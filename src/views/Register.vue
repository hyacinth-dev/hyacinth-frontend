<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage, NSpace } from 'naive-ui'
import { register } from '../api/auth'

const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const formValue = ref({
	// username: '',
	email: '',
	password: '',
	confirmPassword: '',
	verifyCode: ''
})

const rules = {
	// username: {
	// 	required: true,
	// 	message: '请输入用户名',
	// 	trigger: ['blur', 'input']
	// },
	email: {
		required: true,
		message: '请输入邮箱',
		trigger: ['blur', 'input'],
		validator: (_rule: any, value: string) => {
			if (!value) return false
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			return emailRegex.test(value)
		}
	},
	password: {
		required: true,
		message: '请输入密码',
		trigger: ['blur', 'input'],
		validator: (_rule: any, value: string) => {
			return value.length >= 6
		}
	},
	confirmPassword: {
		required: true,
		message: '请确认密码',
		trigger: ['blur', 'input'],
		validator: (_rule: any, value: string) => {
			return value === formValue.value.password
		}
	},
	verifyCode: {
		required: true,
		message: '请输入验证码',
		trigger: ['blur', 'input'],
		validator: (_rule: any, value: string) => {
			return value.length === 6
		}
	}
}

const sendingCode = ref(false)
const countdown = ref(0)

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

const handleRegister = async () => {
	try {
		await register({
			email: formValue.value.email,
			password: formValue.value.password
		})
		message.success('注册成功')
		router.push('/login')
	} catch (error) {
		console.log(error)
		message.error('注册失败：' + ((error as any).response.data.message || '未知错误'))
	}
}
</script>

<template>
	<div class="login-container">
		<div class="login-content">
			<div class="login-left">
				<NCard class="login-card" bordered>
					<div class="login-header">
						<h2 class="login-title">创建账号</h2>
						<p class="login-subtitle">请填写以下信息完成注册</p>
					</div>
					<NForm ref="formRef" :model="formValue" label-placement="left" label-width="0"
						require-mark-placement="right-hanging" :rules="rules">
						<!-- <NFormItem path="username">
							<NInput v-model:value="formValue.username" placeholder="用户名" size="large"
								:input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
						</NFormItem> -->
						<NFormItem path="email">
							<NInput v-model:value="formValue.email" placeholder="邮箱" size="large"
								:input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
						</NFormItem>
						<NFormItem path="password">
							<NInput v-model:value="formValue.password" type="password" placeholder="密码" size="large"
								show-password-on="click"
								:input-el-style="{ textAlign: 'center', paddingRight: '32px' }" />
						</NFormItem>
						<NFormItem path="confirmPassword">
							<NInput v-model:value="formValue.confirmPassword" type="password" placeholder="确认密码"
								size="large" show-password-on="click"
								:input-el-style="{ textAlign: 'center', paddingRight: '32px' }" />
						</NFormItem>
						<!-- <NFormItem path="verifyCode">
							<NSpace :wrap="false">
								<NInput v-model:value="formValue.verifyCode" placeholder="验证码" size="large"
									:input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
								<NButton :disabled="sendingCode || countdown > 0" @click="handleSendCode" size="large">
									{{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
								</NButton>
							</NSpace>
						</NFormItem> -->
						<div class="form-actions">
							<NButton type="primary" size="large" block @click="handleRegister">注册</NButton>
						</div>
					</NForm>
				</NCard>
			</div>
			<div class="login-right">
				<div class="brand-content">
					<h1 class="brand-title">Hyacinth</h1>
					<p class="brand-description">您的智能助手，为您提供更好的服务体验</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.login-container {
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background: url('@/assets/login-background.jpg') center/cover no-repeat;
}

.login-content {
	display: flex;
	width: 1000px;
	height: 600px;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 16px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.login-left {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 40px;
}

.login-card {
	width: 100%;
	max-width: 400px;
	background: transparent;
	border: none;
}

.login-header {
	text-align: center;
	margin-bottom: 32px;
}

.login-title {
	font-size: 24px;
	color: #333;
	margin: 0 0 8px;
}

.login-subtitle {
	font-size: 14px;
	color: #666;
	margin: 0;
}

.form-actions {
	margin-top: 32px;
}

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

.brand-title {
	font-size: 48px;
	font-weight: bold;
	margin: 0 0 16px;
}

.brand-description {
	font-size: 18px;
	margin: 0;
	opacity: 0.9;
}
</style>