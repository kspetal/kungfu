<template>
  <scroll-view class="page" scroll-y>
    <view class="card basic-card">
      <view class="top">
        <image class="avatar" :src="student.avatarUrl || defaultAvatar" />
        <view class="info">
          <view class="name-row">
            <text class="name">{{ student.name }}</text>
            <text
              class="status"
              :class="student.status === 'ongoing' ? 'status-ongoing' : 'status-completed'"
            >
              {{ student.status === 'ongoing' ? '进行中' : '已完成' }}
            </text>
          </view>
          <view class="sub">
            <text>{{ student.project }}</text>
            <text class="divider">|</text>
            <text>到期 {{ student.endDate }}</text>
          </view>
        </view>
      </view>
      <view class="row">
        <text class="label">家长电话</text>
        <text class="value">{{ student.parentPhone || '-' }}</text>
      </view>
      <view class="row">
        <text class="label">家长微信</text>
        <text class="value">{{ student.parentWechat || '-' }}</text>
      </view>
      <view class="row">
        <text class="label">住址</text>
        <text class="value">{{ student.address || '-' }}</text>
      </view>
    </view>

    <view class="card">
      <view class="section-title">课程信息</view>
      <view class="row">
        <text class="label">项目</text>
        <text class="value">{{ student.project }}</text>
      </view>
      <view class="row">
        <text class="label">卡种</text>
        <text class="value">{{ student.cardType || '-' }}</text>
      </view>
      <view class="row">
        <text class="label">起止日期</text>
        <text class="value">{{ student.startDate }} ~ {{ student.endDate }}</text>
      </view>
      <view class="row">
        <text class="label">课时</text>
        <text class="value">
          剩余 {{ student.remainingLessons || 0 }} / {{ student.totalLessons || 0 }} 节
        </text>
      </view>
    </view>

    <view class="card">
      <view class="section-title">付费信息</view>
      <view class="row">
        <text class="label">会员费</text>
        <text class="value">¥{{ student.tuition || 0 }}</text>
      </view>
      <view class="row">
        <text class="label">定金</text>
        <text class="value">¥{{ student.deposit || 0 }}</text>
      </view>
      <view class="row">
        <text class="label">总计</text>
        <text class="value strong">¥{{ student.totalPaid || 0 }}</text>
      </view>
      <view class="row">
        <text class="label">备注1</text>
        <text class="value">{{ student.remark1 || '-' }}</text>
      </view>
      <view class="row">
        <text class="label">备注2</text>
        <text class="value">{{ student.remark2 || '-' }}</text>
      </view>
    </view>

    <!-- 缴费记录入口 -->
    <view class="card tappable" @tap="goPayments">
      <view class="section-title">缴费记录</view>
      <view class="row">
        <text class="value">查看历史缴费记录及新增缴费</text>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="btn secondary" @tap="goEdit">编辑</button>
      <button class="btn danger" @tap="handleDelete">删除</button>
    </view>
  </scroll-view>
</template>

<script>
import { deleteStudent } from '@/services/api.js'

export default {
  data() {
    return {
      id: '',
      student: {},
      defaultAvatar: '/static/logo.png'
    }
  },
  onLoad(query) {
    this.id = query.id
    this.loadDetail()
  },
  methods: {
    loadDetail() {
      // 简单从列表传参缓存中获取
      const app = getApp()
      const list = (app && app.$store && app.$store.state.students) || []
      const found = list.find((s) => String(s.id) === String(this.id))
      if (found) {
        this.student = found
      }
    },
    goEdit() {
      uni.navigateTo({
        url: `/pages/student-form/index?id=${this.id}`
      })
    },
    goPayments() {
      uni.navigateTo({
        url: `/pages/student-form/index?id=${this.id}&tab=payments`
      })
    },
    handleDelete() {
      uni.showModal({
        title: '删除确认',
        content: '确定要删除该学员及其相关记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteStudent(this.id)
              uni.showToast({ title: '已删除', icon: 'success' })
              setTimeout(() => {
                uni.navigateBack()
              }, 500)
            } catch (e) {
              console.error('delete error', e)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  padding: 24rpx;
  background-color: #f5f6fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.basic-card {
  margin-top: 4rpx;
}

.top {
  display: flex;
  margin-bottom: 16rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name-row {
  display: flex;
  align-items: center;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  margin-right: 12rpx;
}

.status {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.status-ongoing {
  background-color: #e6ffed;
  color: #3cb371;
}

.status-completed {
  background-color: #f5f5f5;
  color: #999;
}

.sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #888;
}

.divider {
  margin: 0 6rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.label {
  font-size: 24rpx;
  color: #999;
}

.value {
  font-size: 24rpx;
  color: #333;
  text-align: right;
}

.strong {
  font-weight: 600;
  color: #ff7a45;
}

.tappable {
  margin-bottom: 100rpx;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12rpx 24rpx 32rpx;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn {
  flex: 1;
  margin: 0 8rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.secondary {
  background-color: #ffffff;
  color: #2979ff;
  border: 1rpx solid #2979ff;
}

.danger {
  background-color: #ff4d4f;
  color: #ffffff;
}
</style>


