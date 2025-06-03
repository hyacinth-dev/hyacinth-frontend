<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { login } from '../api/auth'

const router = useRouter()
// 消息提示实例，用于显示登录成功/失败的反馈
const message = useMessage()
// 表单引用，用于表单验证
const formRef = ref(null)
// 表单数据对象，包含用户输入的邮箱和密码
const formValue = ref({
	usernameOrEmail: '',
	password: ''
})

/**
 * 表单验证规则
 * 包含对邮箱格式的验证
 */
const rules = {
	usernameOrEmail: {
		required: true,
		message: '请输入合法的用户名或邮箱',
		trigger: ['blur', 'input'],
		validator: (_rule: any, value: string) => {
			if (!value) return false
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (emailRegex.test(value)) return true
			const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
			if (usernameRegex.test(value)) return true
			return false
		}
	}
}

/**
 * 处理用户登录
 * 向后端发送登录请求，并根据响应进行相应处理
 */
const handleLogin = async () => {
	try {
		// 调用登录API
		const res = await login(formValue.value)
		console.log(res)
		// 保存认证信息到本地存储
		localStorage.setItem('token', res.data.accessToken)
		// 显示登录成功消息
		message.success('登录成功')
		// 跳转到用户仪表盘页面
		router.push('/user/dashboard')
	} catch (error) {
		message.error('用户名或密码错误')
	}
}
</script>

<template>
	<!-- 登录页面容器 -->
	<div class="login-container">
		<!-- 登录内容区域，包含左侧表单和右侧品牌介绍 -->
		<div class="login-content">
			<!-- 左侧登录表单区域 -->
			<div class="login-left">
				<NCard class="login-card" bordered>
					<!-- 登录表单头部 -->
					<div class="login-header">
						<h2 class="login-title">欢迎回来</h2>
						<p class="login-subtitle">请登录您的账号</p>
					</div>
					<!-- 登录表单 -->
					<NForm ref="formRef" :model="formValue" label-placement="left" label-width="0"
						require-mark-placement="right-hanging" :rules="rules">
						<!-- 邮箱输入项 -->
						<NFormItem path="usernameOrEmail">
							<NInput v-model:value="formValue.usernameOrEmail" placeholder="用户名或邮箱" size="large"
								:input-el-style="{ textAlign: 'center', paddingRight: '12px' }" />
						</NFormItem>
						<!-- 密码输入项 -->
						<NFormItem path="password">
							<NInput v-model:value="formValue.password" type="password" placeholder="密码" size="large"
								show-password-on="click"
								:input-el-style="{ textAlign: 'center', paddingRight: '32px' }" />
						</NFormItem>
						<!-- 登录按钮区域 -->
						<div class="form-actions">
							<NButton type="primary" size="large" block @click="handleLogin">登录</NButton>
						</div>
						<!-- 跳转链接区域 -->
						<div class="form-links">
							<p class="link-text">还没有账号？<router-link to="/register" class="link">立即注册</router-link></p>
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
/* 登录页面容器样式，设置全屏高度和背景图 */
.login-container {
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background: url('@/assets/login-background.jpg') center/cover no-repeat;
}

/* 登录内容区域样式，包含左右两个部分 */
.login-content {
	display: flex;
	width: 1000px;
	height: 600px;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 16px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

/* 左侧登录表单区域样式 */
.login-left {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 40px;
}

/* 登录卡片样式 */
.login-card {
	width: 100%;
	max-width: 400px;
	background: transparent;
	border: none;
}

/* 登录表单头部样式 */
.login-header {
	text-align: center;
	margin-bottom: 32px;
}

/* 登录标题样式 */
.login-title {
	font-size: 24px;
	color: #333;
	margin: 0 0 8px;
}

/* 登录副标题样式 */
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