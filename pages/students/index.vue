<template>
	<view class="page">
		<view class="header-sticky">
			<!-- 搜索与筛选 -->
			<view class="search-bar">
				<input class="search-input" type="text" v-model="keyword" placeholder="搜索学员姓名..." confirm-type="search"
					@confirm="handleSearch" />
				<button class="search-btn" type="default" @tap="handleSearch">搜索</button>
			</view>

			<!-- 筛选 Chips -->
			<view class="filter-scroll">
				<view class="chip" :class="{ 'chip-active':  state === '' }" @tap="handleFilterChange('')">
					<text>所有状态</text>
				</view>
				<view class="chip" :class="{ 'chip-active': state === '在学' }" @tap="handleFilterChange('在学')">
					<text>在学</text>
				</view>
				<view class="chip" :class="{ 'chip-active': state === '暂停' }" @tap="handleFilterChange('暂停')">
					<text>暂停</text>
				</view>
				<view class="chip" :class="{ 'chip-active': state === '已休学' }" @tap="handleFilterChange('已休学')">
					<text>已休学</text>
				</view>
			</view>
		</view>

		<!-- 学员卡片列表 -->
		<scroll-view class="list-scroll" scroll-y :style="{ height: listHeight + 'px' }" @scrolltolower="onReachBottom"
			@refresherrefresh="onPullDownRefresh">
			<view class="list-container">
				<view v-if="students.length === 0" class="empty">
					暂无学员，点击右下角“＋”添加
				</view>
				<view v-for="item in students" :key="item._id" class="student-card" @tap="goDetail(item)">
					<view class="card-top">
						<view class="left">
							<image class="avatar"
								:src="item.avatar_url || (item.gender == 'F' ? girlAvatar : boyAvatar)" />
							<view class="info">
								<view class="name-row">
									<text class="name">{{ item.name }}</text>
									<text v-if="item.birth_date" class="age-tag">{{ calculateAge(item.birth_date) }}岁</text>
								</view>
								<view class="tags">
									<text class="tag tag-project">{{ item.current_project || '-' }}</text>
									<text class="tag" :class="getStatusClass(item.status)">
										{{ item.status || '在学' }}
									</text>
								</view>
							</view>
						</view>
						<view class="right">
							<view class="amount">¥{{ item.total_fee || 0 }}</view>
							<view class="date">{{ item.end_time || '-' }}到期 </view>
						</view>
					</view>
					<view class="card-bottom">
						<view class="progress-header">
							<text class="progress-label">课时进度: {{ item.progressValue }}%</text>
							<text class="progress-text">
								剩余 {{ item.remainDate || 0 }} /
								{{ item.current_total_course_date || 0 }} 节
							</text>
						</view>
						<view class="progress-bar">
							<view class="progress-inner"
								:style="{ width: item.progressValue + '%', background: item.progressColor }" />
						</view>
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
	import {
		useGlobalStore
	} from '@/store'

	export default {
		data() {
			return {
				keyword: '',
				state: '',
				page: 1,
				pageSize: 10,
				students: [],
				listHeight: 0,
				boyAvatar: '/static/boy.png',
				girlAvatar: '/static/girl.png',
				loading: false,
				noMore: false,
				needRefresh: false
			}
		},
		onLoad() {
			this.loadData()
		},
		onReady() {
			const sys = uni.getSystemInfoSync();
			// 粗略估算顶部高度：搜索栏(120rpx≈60px) + 筛选栏(80rpx≈40px) + 安全区 ≈ 120px
			const topBarHeight = 120; // 单位 px
			this.listHeight = sys.windowHeight - topBarHeight;
		},
		onShow() {
			if (this.needRefresh) {
				this.loadData()
				this.needRefresh = false
			}
		},
		methods: {
			async loadData(reset = true) {
				if (this.loading) return;
				if (reset) {
					this.page = 1;
					this.noMore = false;
				} else {
					this.page++;
				}
				this.loading = true;
				try {
					const res = await uniCloud.callFunction({
						name: 'getStudentList',
						data: {
							page: this.page,
							state: this.state,
							pageSize: this.pageSize,
							keyword: this.keyword.trim()
						}
					});
					if (res.result.code !== 0) {
						uni.showToast({
							title: res.result.msg || '加载失败',
							icon: 'none'
						});
						return;
					}
					const {
						list,
						total
					} = res.result.data;
					const processed = list.map(item => ({
						...item,
						remainDate: this.getDaysDifference(item.start_time, item.end_time, item.current_total_course_date),
						progressValue: this.calcProgress(item),
						progressColor: this.calcProgressColor(item)
					}));
					if (reset) {
						this.students = processed;
					} else {
						this.students = [...this.students, ...processed];
					}
					const {
						setStudents
					} = useGlobalStore()
					setStudents(this.students)
					// 判断是否还有更多
					this.noMore = this.students.length >= total;
				} catch (err) {
					console.error('加载失败', err);
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					});
				} finally {
					this.loading = false;
					// 停止下拉刷新动画（如果是由下拉触发）
					uni.stopPullDownRefresh();
				}

			},
			onPullDownRefresh() {
				this.loadData(true);
			},
			onReachBottom() {
				if (!this.noMore && !this.loading) {
					this.loadData(false);
				}
			},
			handleSearch() {
				this.loadData(true);
			},
			handleFilterChange(stat) {
				this.state = stat;
				this.loadData(true);
			},
			getStatusClass(status) {
				if (status === '在学') return 'tag-status-ongoing'
				if (status === '暂停') return 'tag-status-onPause'
				if (status === '已休学') return 'tag-status-completed'
				return 'tag-status-ongoing'
			},
			calcProgress(item) {
				const total = item.current_total_course_date
				const remaining = this.getDaysDifference(item.start_time, item.end_time, total)
				if (!total) return 0
				const used = total - remaining
				return Math.round(Math.min(100, Math.max(0, (used / total) * 100)))
			},
			calcProgressColor(item) {
				const total = item.current_total_course_date
				const remaining = this.getDaysDifference(item.start_time, item.end_time, total)
				if (!total) return '#4CAF50'
				const ratio = remaining / total
				if (ratio <= 0.2) return '#FF4D4F'
				if (ratio <= 0.4) return '#E6A23C'
				return '#4CAF50'
			},
			calculateAge(birthDate) {
				const today = new Date();
				const birth = new Date(birthDate);
				let age = today.getFullYear() - birth.getFullYear();
				const monthDiff = today.getMonth() - birth.getMonth();
				
				if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
					age--;
				}
				
				return age;
			},
			getDaysDifference(start, end, totalDate) {
				const startDate = new Date(start);
				const today = new Date();
				if (startDate.getTime() > today.getTime()) {
					return totalDate;
				}
				const inputDate = new Date(end);
				today.setHours(0, 0, 0, 0);
				inputDate.setHours(0, 0, 0, 0);
				const diffInMs = inputDate - today;
				const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
				return diffInDays;
			},
			goDetail(item) {
				this.needRefresh = true
				uni.navigateTo({
					url: `/pages/student-detail/index?id=${item._id}`
				})
			},
			goCreate() {
				this.needRefresh = true
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

	.header-sticky {
		position: sticky;
		top: 0;
		z-index: 5;
		background-color: #f5f6fa;
		padding-bottom: 8rpx;
	}

	.search-bar {
		padding: 24rpx 32rpx 8rpx;
		display: flex;
		align-items: center;
	}

	.search-input {
		background-color: #ecedef;
		border-radius: 40rpx;
		padding: 18rpx 28rpx;
		font-size: 28rpx;
		flex: 1;
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
		padding: 0 24rpx;
	}

	.list-container {
		padding-bottom: 50rpx;
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
		margin-right: 45rpx;
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

	.age {
		font-size: 24rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.age-tag {
		font-size: 21rpx;
		padding: 6rpx 13rpx;
		border-radius: 999rpx;
		margin-left: 12rpx;
		background-color: #f5f5f5;
		color: #999999;
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

	.tag-status-onPause {
		background-color: #ffdede;
		color: #FF4D4F;
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
		position: relative;
	}

	.progress-inner {
		height: 100%;
		border-radius: 999rpx;
	}

	/* 
	.progress-percent {
		position: absolute;
		right: 16rpx;
		top: -38rpx;
		font-size: 22rpx;
		color: #666;
	} */

	.search-btn {
		margin-left: 16rpx;
		height: 72rpx;
		line-height: 72rpx;
		border-radius: 36rpx;
		padding: 0 28rpx;
		font-size: 28rpx;
		background: linear-gradient(135deg, #2979ff, #4facfe);
		color: #fff;
		border: none;
		box-shadow: 0 8rpx 16rpx rgba(41, 121, 255, 0.2);
	}

	.fab {
		position: fixed;
		right: 32rpx;
		bottom: 108rpx;
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 50%;
		text-align: center;
		padding: 0;
		font-size: 60rpx;
		background: linear-gradient(135deg, #2979ff, #4facfe);
		box-shadow: 0 10rpx 26rpx rgba(41, 121, 255, 0.35);
	}
</style>