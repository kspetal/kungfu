<template>
  <scroll-view class="page" scroll-y>
    <view class="section">
      <view class="section-header" @tap="toggleFold('profile')">
        <text>个人资料</text>
        <text class="arrow">{{ fold.profile ? '▼' : '▲' }}</text>
      </view>
      <view v-if="fold.profile" class="section-body">
        <view class="form-item">
          <text class="label">姓名 *</text>
          <input class="input" v-model="form.name" placeholder="请输入姓名" />
        </view>
        <view class="form-item">
          <text class="label">性别</text>
          <picker :range="genderRange" @change="onGenderChange">
            <view class="picker">
              {{ form.gender ? (form.gender === 'M' ? '男' : '女') : '请选择' }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">年龄</text>
          <input
            class="input"
            type="number"
            v-model="form.age"
            placeholder="请输入年龄"
          />
        </view>
        <view class="form-item">
          <text class="label">学校</text>
          <input class="input" v-model="form.school" placeholder="请输入学校" />
        </view>
        <view class="form-item">
          <text class="label">家长电话 *</text>
          <input
            class="input"
            v-model="form.parentPhone"
            placeholder="请输入手机号"
          />
        </view>
        <view class="form-item">
          <text class="label">家长微信</text>
          <input
            class="input"
            v-model="form.parentWechat"
            placeholder="请输入微信号"
          />
        </view>
        <view class="form-item">
          <text class="label">住址</text>
          <input class="input" v-model="form.address" placeholder="请输入住址" />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header" @tap="toggleFold('project')">
        <text>项目信息</text>
        <text class="arrow">{{ fold.project ? '▼' : '▲' }}</text>
      </view>
      <view v-if="fold.project" class="section-body">
        <view class="form-item">
          <text class="label">项目 *</text>
          <picker :range="projectRange" @change="onProjectChange">
            <view class="picker">
              {{ form.project || '请选择项目' }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">卡种</text>
          <input
            class="input"
            v-model="form.cardType"
            placeholder="如 次卡 / 期卡"
          />
        </view>
        <view class="form-item">
          <text class="label">开始日期 *</text>
          <picker mode="date" @change="(e) => (form.startDate = e.detail.value)">
            <view class="picker">
              {{ form.startDate || '请选择日期' }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">截止日期 *</text>
          <picker mode="date" @change="(e) => (form.endDate = e.detail.value)">
            <view class="picker">
              {{ form.endDate || '请选择日期' }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">总课时 *</text>
          <input
            class="input"
            type="number"
            v-model="form.totalLessons"
            placeholder="请输入总课时"
          />
        </view>
        <view class="form-item">
          <text class="label">剩余课时 *</text>
          <input
            class="input"
            type="number"
            v-model="form.remainingLessons"
            placeholder="请输入剩余课时"
          />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header" @tap="toggleFold('payment')">
        <text>付费资料</text>
        <text class="arrow">{{ fold.payment ? '▼' : '▲' }}</text>
      </view>
      <view v-if="fold.payment" class="section-body">
        <view class="form-item">
          <text class="label">会员费 *</text>
          <input
            class="input"
            type="number"
            v-model="form.tuition"
            placeholder="请输入金额"
          />
        </view>
        <view class="form-item">
          <text class="label">定金</text>
          <input
            class="input"
            type="number"
            v-model="form.deposit"
            placeholder="请输入定金"
          />
        </view>
        <view class="form-item">
          <text class="label">总计金额 *</text>
          <input
            class="input"
            type="number"
            v-model="form.totalPaid"
            placeholder="请输入总金额"
          />
        </view>
        <view class="form-item">
          <text class="label">备注1</text>
          <textarea
            class="textarea"
            v-model="form.remark1"
            placeholder="备注信息"
          />
        </view>
        <view class="form-item">
          <text class="label">备注2</text>
          <textarea
            class="textarea"
            v-model="form.remark2"
            placeholder="备注信息"
          />
        </view>
        <view class="form-item">
          <text class="label">来源渠道</text>
          <picker :range="sourceRange" @change="onSourceChange">
            <view class="picker">
              {{ sourceRange[form.sourceChannel - 1] || '请选择' }}
            </view>
          </picker>
        </view>
      </view>
    </view>

    <view class="bottom-btn">
      <button type="primary" class="btn" @tap="handleSubmit">保存</button>
    </view>
  </scroll-view>
</template>

<script>
import { createStudent, updateStudent } from '@/services/api.js'

export default {
  data() {
    return {
      id: '',
      form: {
        name: '',
        gender: '',
        age: '',
        school: '',
        parentPhone: '',
        parentWechat: '',
        address: '',
        project: '',
        cardType: '',
        startDate: '',
        endDate: '',
        totalLessons: '',
        remainingLessons: '',
        tuition: '',
        deposit: '',
        totalPaid: '',
        remark1: '',
        remark2: '',
        sourceChannel: 0
      },
      fold: {
        profile: true,
        project: true,
        payment: true
      },
      genderRange: ['男', '女'],
      projectRange: ['瑜伽', '私教课', '瑜伽大班', '拳击课', '普拉提'],
      sourceRange: ['路过看到', '早晚知道', '朋友介绍', '网络活动', '其他方式']
    }
  },
  onLoad(query) {
    if (query.id) {
      this.id = query.id
      this.loadFromStore()
    }
  },
  methods: {
    toggleFold(key) {
      this.fold[key] = !this.fold[key]
    },
    onGenderChange(e) {
      const index = Number(e.detail.value)
      this.form.gender = index === 0 ? 'M' : 'F'
    },
    onProjectChange(e) {
      const index = Number(e.detail.value)
      this.form.project = this.projectRange[index]
    },
    onSourceChange(e) {
      const index = Number(e.detail.value)
      this.form.sourceChannel = index + 1
    },
    loadFromStore() {
      const app = getApp()
      const list = (app && app.$store && app.$store.state.students) || []
      const found = list.find((s) => String(s.id) === String(this.id))
      if (found) {
        this.form = { ...this.form, ...found }
      }
    },
    validate() {
      if (!this.form.name) return '请输入姓名'
      if (!this.form.project) return '请选择项目'
      if (!this.form.parentPhone) return '请输入家长电话'
      if (!this.form.startDate || !this.form.endDate) return '请选择起止日期'
      if (!this.form.totalLessons || !this.form.remainingLessons)
        return '请输入课时信息'
      if (!this.form.tuition || !this.form.totalPaid) return '请输入金额信息'
      if (
        Number(this.form.totalLessons) <
        Number(this.form.remainingLessons)
      ) {
        return '剩余课时不能大于总课时'
      }
      return ''
    },
    async handleSubmit() {
      const msg = this.validate()
      if (msg) {
        uni.showToast({ title: msg, icon: 'none' })
        return
      }
      try {
        const payload = { ...this.form }
        if (this.id) {
          await updateStudent(this.id, payload)
        } else {
          await createStudent(payload)
        }
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 600)
      } catch (e) {
        console.error('save student error', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.page {
  padding: 16rpx 24rpx 120rpx;
  background-color: #f5f6fa;
  box-sizing: border-box;
}

.section {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.section-header {
  padding: 20rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  font-weight: 600;
}

.arrow {
  font-size: 24rpx;
  color: #999;
}

.section-body {
  padding: 0 24rpx 20rpx;
}

.form-item {
  margin-top: 12rpx;
}

.label {
  font-size: 24rpx;
  color: #666;
}

.input,
.picker,
.textarea {
  margin-top: 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  background-color: #f5f6fa;
  font-size: 26rpx;
}

.picker {
  color: #333;
}

.textarea {
  min-height: 120rpx;
}

.bottom-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx 32rpx;
  background-color: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn {
  border-radius: 999rpx;
  font-size: 30rpx;
}
</style>


