<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y>
      <view class="top-row">
        <view class="card total-card">
          <view class="card-icon">$</view>
          <view class="card-body">
            <view class="card-title">总收入</view>
            <view class="card-amount">¥{{ formatAmount(summary.totalRevenue) }}</view>
            <view class="card-sub">实收金额</view>
          </view>
        </view>
        <view class="card active-card">
          <view class="card-icon user-icon">👤</view>
          <view class="card-body">
            <view class="card-title">在读学员</view>
            <view class="card-amount">{{ summary.activeStudents || 0 }}</view>
            <view class="card-sub">当前活跃</view>
          </view>
        </view>
      </view>

      <!-- 项目营收排行 -->
      <view class="section">
        <view class="section-title">项目营收排行</view>
        <view
          v-for="(item, index) in revenueRank"
          :key="item.project || index"
          class="rank-row"
        >
          <view class="rank-left">
            <view class="rank-index" :class="'rank-index-' + (index + 1)">
              {{ index + 1 }}
            </view>
            <text class="rank-name">{{ item.project }}</text>
          </view>
          <text class="rank-amount">¥{{ formatAmount(item.amount) }}</text>
        </view>
        <view v-if="revenueRank.length === 0" class="empty">暂无数据</view>
      </view>

      <!-- 即将到期 -->
      <view class="section">
        <view class="section-title with-icon">
          <text class="warn-icon">!</text>
          <text>即将到期（30天内）</text>
        </view>
        <view
          v-for="item in expiringStudents"
          :key="item.id"
          class="expire-card"
        >
          <view class="expire-left">
            <image class="avatar" :src="item.avatarUrl || defaultAvatar" />
            <view>
              <view class="expire-name">{{ item.name }}</view>
              <view class="expire-project">{{ item.project }}</view>
            </view>
          </view>
          <view class="expire-date-tag">
            {{ item.endDate }}
          </view>
        </view>
        <view v-if="expiringStudents.length === 0" class="empty">
          30 天内暂无到期学员
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import {
  fetchStatsSummary,
  fetchRevenueRank,
  fetchExpiringStudents
} from '@/services/api.js'

export default {
  data() {
    return {
      summary: {
        totalRevenue: 0,
        activeStudents: 0
      },
      revenueRank: [],
      expiringStudents: [],
      defaultAvatar: '/static/logo.png'
    }
  },
  onShow() {
    this.loadAll()
  },
  onPullDownRefresh() {
    this.loadAll(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadAll(done) {
      try {
        const [summary, rank, expiring] = await Promise.all([
          fetchStatsSummary(),
          fetchRevenueRank(),
          fetchExpiringStudents(30)
        ])
        this.summary = summary || this.summary
        this.revenueRank = rank || []
        this.expiringStudents = expiring || []
      } catch (e) {
        console.error('load stats error', e)
      } finally {
        if (typeof done === 'function') done()
      }
    },
    formatAmount(num) {
      if (!num) return '0'
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      return Number(num).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.scroll {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.top-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.card {
  border-radius: 24rpx;
  padding: 24rpx;
  flex: 1;
  display: flex;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card + .card {
  margin-left: 20rpx;
}

.total-card {
  background: linear-gradient(135deg, #2979ff, #4facfe);
  color: #ffffff;
}

.active-card {
  background-color: #ffffff;
}

.card-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
}

.active-card .card-icon {
  background-color: #e6f2ff;
  color: #2979ff;
}

.card-body {
  flex: 1;
}

.card-title {
  font-size: 26rpx;
  opacity: 0.9;
}

.card-amount {
  margin-top: 12rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.card-sub {
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.8;
}

.section {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.with-icon {
  display: flex;
  align-items: center;
}

.warn-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background-color: #ffefe0;
  color: #ff8a00;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
  font-weight: 700;
}

.rank-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.rank-left {
  display: flex;
  align-items: center;
}

.rank-index {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  text-align: center;
  line-height: 40rpx;
  font-size: 24rpx;
  margin-right: 16rpx;
  background-color: #f3f4f7;
  color: #666;
}

.rank-index-1 {
  background-color: #ffe8cc;
  color: #ff8a00;
}

.rank-index-2 {
  background-color: #e6f2ff;
  color: #2979ff;
}

.rank-index-3 {
  background-color: #ffe6e6;
  color: #ff4d4f;
}

.rank-name {
  font-size: 26rpx;
  color: #333;
}

.rank-amount {
  font-size: 26rpx;
  color: #333;
}

.empty {
  text-align: center;
  padding: 20rpx 0 4rpx;
  font-size: 24rpx;
  color: #999;
}

.expire-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff7f0;
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}

.expire-left {
  display: flex;
  align-items: center;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.expire-name {
  font-size: 28rpx;
  color: #333;
}

.expire-project {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #ff8a00;
}

.expire-date-tag {
  font-size: 24rpx;
  color: #ff8a00;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background-color: #ffe8cc;
}
</style>


