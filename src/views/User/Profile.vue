<script setup lang="ts">
import { NForm, NFormItem, NInput, NButton, NCard, NSpace, NAvatar } from 'naive-ui'
import { ref } from 'vue'

const userInfo = ref({
  email: 'user@example.com',
  nickname: '用户123',
  avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
})

const formRef = ref(null)
const formValue = ref({
  nickname: userInfo.value.nickname,
  email: userInfo.value.email,
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleUpdateProfile = () => {
  // TODO: 实现更新个人信息的逻辑
}

const handleChangePassword = () => {
  // TODO: 实现修改密码的逻辑
}
</script>

<template>
  <div class="profile">
    <h2>个人中心</h2>
    <div class="profile-content">
      <NSpace vertical size="large">
        <NCard title="基本信息">
          <div class="user-info">
            <NAvatar
              round
              :size="64"
              :src="userInfo.avatar"
            />
            <NForm
              ref="formRef"
              :model="formValue"
              label-placement="left"
              label-width="100"
              class="form"
            >
              <NFormItem label="昵称" path="nickname">
                <NInput v-model:value="formValue.nickname" />
              </NFormItem>
              <NFormItem label="邮箱" path="email">
                <NInput v-model:value="formValue.email" disabled />
              </NFormItem>
              <NFormItem>
                <NButton type="primary" @click="handleUpdateProfile">保存修改</NButton>
              </NFormItem>
            </NForm>
          </div>
        </NCard>

        <NCard title="修改密码">
          <NForm
            ref="formRef"
            :model="formValue"
            label-placement="left"
            label-width="100"
          >
            <NFormItem label="当前密码" path="currentPassword">
              <NInput
                v-model:value="formValue.currentPassword"
                type="password"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem label="新密码" path="newPassword">
              <NInput
                v-model:value="formValue.newPassword"
                type="password"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem label="确认新密码" path="confirmPassword">
              <NInput
                v-model:value="formValue.confirmPassword"
                type="password"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem>
              <NButton type="primary" @click="handleChangePassword">修改密码</NButton>
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