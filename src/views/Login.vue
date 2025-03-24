<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { login } from '../api/auth'

const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const formValue = ref({
	email: '',
	password: ''
})

const rules = {
	email: {
		required: true,
		message: '请输入邮箱',
		trigger: ['blur', 'input'],
		validator: (_rule: any, value: string) => {
			if (!value) return false
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			return emailRegex.test(value)
		}
	}
}

const handleLogin = async () => {
	try {
		const res = await login(formValue.value)
		console.log(res)
		localStorage.setItem('token', res.data.accessToken)
		localStorage.setItem('isAdmin', res.data.isAdmin.toString())
		message.success('登录成功')
		if (res.data.isAdmin) {
			router.push('/admin/dashboard')
		} else {
			router.push('/user/dashboard')
		}
	} catch (error) {
		message.error('登录失败：' + ((error as any).message || '未知错误'))
	}
}
</script>

<template>
	<div class="login-container">
		<div class="login-content">
			<div class="login-left">
				<NCard class="login-card" bordered>
					<div class="login-header">
						<h2 class="login-title">欢迎回来</h2>
						<p class="login-subtitle">请登录您的账号</p>
					</div>
					<NForm ref="formRef" :model="formValue" label-placement="left" label-width="0"
						require-mark-placement="right-hanging" :rules="rules">
						<NFormItem path="email">
							<NInput v-model:value="formValue.email" placeholder="邮箱" size="large"
								:input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
						</NFormItem>
						<NFormItem path="password">
							<NInput v-model:value="formValue.password" type="password" placeholder="密码" size="large"
								show-password-on="click"
								:input-el-style="{ textAlign: 'center', paddingRight: '32px' }" />
						</NFormItem>
						<div class="form-actions">
							<NButton type="primary" size="large" block @click="handleLogin">登录</NButton>
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