<template>
  <view class="page">
    <!-- 搜索与筛选 -->
    <view class="search-bar">
      <input
        class="search-input"
        type="text"
        v-model="keyword"
        placeholder="搜索学员姓名或项目..."
        confirm-type="search"
        @confirm="handleSearch"
      />
    </view>


    <!-- 学员卡片列表 -->
    <scroll-view
      class="list-scroll"
      scroll-y
      :scroll-with-animation="true"
      @refresherrefresh="onPullDownRefresh"
    >
      <view v-if="students.length === 0" class="empty">
        暂无学员，点击右下角“＋”添加
      </view>
      <view
        v-for="item in students"
        :key="item.id"
        class="student-card"
        @tap="goDetail(item)"
      >
        <view class="card-top">
          <view class="left">
            <image class="avatar" :src="item.avatarUrl || defaultAvatar" />
            <view class="info">
              <view class="name-row">
                <text class="name">{{ item.name }}</text>
              </view>
              <view class="tags">
                <text class="tag tag-project">{{ item.project }}</text>
                <text
                  class="tag"
                  :class="item.status === 'ongoing' ? 'tag-status-ongoing' : 'tag-status-completed'"
                >
                  {{ item.status === 'ongoing' ? '进行中' : '已完成' }}
                </text>
              </view>
            </view>
          </view>
          <view class="right">
            <view class="amount">¥{{ item.tuition || 0 }}</view>
            <view class="date">到期 {{ item.endDate || '-' }}</view>
          </view>
        </view>
        <view class="card-bottom">
          <view class="progress-header">
            <text class="progress-label">课时进度</text>
            <text class="progress-text">
              剩余 {{ item.remainingLessons || 0 }} / {{ item.totalLessons || 0 }} 节
            </text>
          </view>
          <view class="progress-bar">
            <view
              class="progress-inner"
              :style="{ width: calcProgress(item) + '%', background: calcProgressColor(item) }"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 悬浮新增按钮 -->
    <button class="fab" type="primary" @tap="goCreate">
      +
    </button>
  </view>
</template>

<script>
import { fetchStudents } from '@/services/api.js'

export default {
  data() {
    return {
      keyword: '',
      project: '',
      status: '',
      page: 1,
      pageSize: 20,
      students: [],
      defaultAvatar: '/static/logo.png',
    }
  },
  onLoad() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.page = 1
    this.loadData(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadData(done) {
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          keyword: this.keyword,
          project: this.project,
          status: this.status
        }
        // 这里如果后端未准备好，可注释实际请求，使用本地 mock
        const data = await fetchStudents(params)
        this.students = (data && data.list) || []
      } catch (e) {
        console.error('fetch students error', e)
        // 简单兜底：本地 mock
        this.students = []
      } finally {
        if (typeof done === 'function') done()
      }
    },
    handleSearch() {
      this.page = 1
      this.loadData()
    },
    handleFilterChange(value) {
      this.project = value
      this.page = 1
      this.loadData()
    },
    calcProgress(item) {
      const total = item.totalLessons || 0
      const remaining = item.remainingLessons || 0
      if (!total) return 0
      const used = total - remaining
      return Math.min(100, Math.max(0, (used / total) * 100))
    },
    calcProgressColor(item) {
      const remaining = item.remainingLessons || 0
      const total = item.totalLessons || 0
      if (!total) return '#4CAF50'
      const ratio = remaining / total
      if (ratio <= 0.2) return '#FF4D4F'
      if (ratio <= 0.5) return '#1890FF'
      return '#4CAF50'
    },
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/student-detail/index?id=${item.id}`
      })
    },
    goCreate() {
      uni.navigateTo({
        url: '/pages/student-form/index'
      })
    }
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f6fa;
}

.search-bar {
  padding: 24rpx 32rpx 8rpx;
}

.search-input {
  background-color: #f3f4f7;
  border-radius: 40rpx;
  padding: 18rpx 28rpx;
  font-size: 28rpx;
}

.filter-scroll {
  white-space: nowrap;
  padding: 8rpx 24rpx 16rpx;
}

.chip {
  display: inline-flex;
  padding: 8rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e0e0e6;
  font-size: 24rpx;
  color: #666;
  background-color: #ffffff;
}

.chip-active {
  border-color: #2979ff;
  color: #2979ff;
  background-color: #e6f2ff;
}

.list-scroll {
  flex: 1;
  padding: 0 24rpx 120rpx;
}

.empty {
  text-align: center;
  padding-top: 160rpx;
  color: #999;
  font-size: 26rpx;
}

.student-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-top: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.03);
}

.card-top {
  display: flex;
  justify-content: space-between;
}

.left {
  display: flex;
  flex: 1;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.info {
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
  color: #333;
}

.tags {
  margin-top: 8rpx;
}

.tag {
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  margin-right: 12rpx;
}

.tag-project {
  background-color: #e6f2ff;
  color: #2979ff;
}

.tag-status-ongoing {
  background-color: #e6ffed;
  color: #3cb371;
}

.tag-status-completed {
  background-color: #f5f5f5;
  color: #999999;
}

.right {
  text-align: right;
}

.amount {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.date {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.card-bottom {
  margin-top: 24rpx;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.progress-label {
  font-size: 24rpx;
  color: #999;
}

.progress-text {
  font-size: 24rpx;
  color: #2979ff;
}

.progress-bar {
  width: 100%;
  height: 14rpx;
  border-radius: 999rpx;
  background-color: #f0f0f5;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  border-radius: 999rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  border-radius: 50%;
  text-align: center;
  padding: 0;
  font-size: 60rpx;
  background: linear-gradient(135deg, #2979ff, #4facfe);
  box-shadow: 0 12rpx 30rpx rgba(41, 121, 255, 0.4);
}
</style>


