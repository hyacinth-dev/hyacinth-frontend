<script setup lang="ts">
import { NForm, NFormItem, NInput, NButton, NCard, NSpace, NAvatar, useMessage, FormRules, FormItemRule, FormInst } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo, updateProfile, changePassword, UpdateProfileParams, ChangePasswordParams } from '../../api/auth'

const message = useMessage()
const router = useRouter()

const userInfo = ref({
  email: '',
  username: '',
  avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
})

const profileFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)

const profileFormValue = ref({
  username: '',
  email: ''
})

const passwordFormValue = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      validator: (_rule: FormItemRule, value: string) => {
        if (!value) return false
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        return usernameRegex.test(value)
      },
      message: '请输入用户名（3-20位字母、数字或下划线）',
      trigger: 'blur'
    }
  ]
}

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: ['blur', 'input'] }
  ],
  newPassword: {
    required: true,
    message: '请输出合法的密码（8-20位，包含字母和数字）',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,20}$/
      return passwordRegex.test(value)
    }
  },
  confirmPassword: {
    required: true,
    message: '两次输入的密码不一致',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      return (value === passwordFormValue.value.newPassword)
    }
  },
}

const loading = ref(false)

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await getUserInfo()
    userInfo.value.email = response.data.email
    userInfo.value.username = response.data.username
    profileFormValue.value.username = response.data.username
    profileFormValue.value.email = response.data.email
  } catch (error) {
    message.error('获取用户信息失败')
    console.error('获取用户信息失败:', error)
  }
}

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    await profileFormRef.value?.validate()
    loading.value = true

    const params: UpdateProfileParams = {
      username: profileFormValue.value.username,
      email: profileFormValue.value.email
    }

    await updateProfile(params)
    message.success('个人信息更新成功')
    userInfo.value.username = profileFormValue.value.username
    userInfo.value.email = profileFormValue.value.email

    // 派发自定义事件通知其他组件更新用户信息
    window.dispatchEvent(new CustomEvent('userInfoUpdated', {
      detail: {
        username: profileFormValue.value.username,
        email: profileFormValue.value.email
      }
    }))
  } catch (error) {
    message.error('更新失败: ' + (error as any).response.data.message || '未知错误')
    console.error('更新个人信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()
    loading.value = true

    const params: ChangePasswordParams = {
      currentPassword: passwordFormValue.value.currentPassword,
      newPassword: passwordFormValue.value.newPassword
    }

    await changePassword(params)
    message.success('密码修改成功，即将退出登录')
    // 清空密码表单
    passwordFormValue.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    // 延迟1秒后退出登录并跳转到登录页面
    setTimeout(() => {
      localStorage.removeItem('token')
      router.push('/login')
    }, 1000)
  } catch (error) {
    message.error('密码修改失败: ' + (error as any).response.data.message || '未知错误')
    console.error('修改密码失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="profile">
    <h2>个人中心</h2>
    <div class="profile-content">
      <NSpace vertical size="large">
        <NCard title="基本信息">
          <div class="user-info">
            <NAvatar round :size="64" :src="userInfo.avatar" />
            <NForm ref="profileFormRef" :model="profileFormValue" :rules="profileRules" label-placement="left"
              label-width="100" class="form">
              <NFormItem label="用户名" path="username">
                <NInput v-model:value="profileFormValue.username" />
              </NFormItem>
              <NFormItem label="邮箱" path="email">
                <NInput v-model:value="profileFormValue.email" disabled />
              </NFormItem>
              <NFormItem>
                <NButton type="primary" :loading="loading" @click="handleUpdateProfile">
                  保存修改
                </NButton>
              </NFormItem>
            </NForm>
          </div>
        </NCard>

        <NCard title="修改密码">
          <NForm ref="passwordFormRef" :model="passwordFormValue" :rules="passwordRules" label-placement="left"
            label-width="100">
            <NFormItem label="当前密码" path="currentPassword">
              <NInput v-model:value="passwordFormValue.currentPassword" type="password" show-password-on="click" />
            </NFormItem>
            <NFormItem label="新密码" path="newPassword">
              <NInput v-model:value="passwordFormValue.newPassword" type="password" show-password-on="click" />
            </NFormItem>
            <NFormItem label="确认新密码" path="confirmPassword">
              <NInput v-model:value="passwordFormValue.confirmPassword" type="password" show-password-on="click" />
            </NFormItem>
            <NFormItem>
              <NButton type="primary" :loading="loading" @click="handleChangePassword">
                修改密码
              </NButton>
            </NFormItem>
          </NForm>
        </NCard>
      </NSpace>
    </div>
  </div>
</template>

<style scoped>
.profile {
  padding: 24px;
}

.profile h2 {
  margin-bottom: 24px;
  font-size: 20px;
}

.profile-content {
  max-width: 800px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.form {
  width: 100%;
  max-width: 400px;
  margin-top: 24px;
}
</style>