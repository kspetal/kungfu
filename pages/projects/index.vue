<template>
	<view class="page">
		<view class="header-sticky">
			<!-- 搜索与筛选 -->
			<view class="search-bar">
				<input class="search-input" type="text" v-model="keyword" placeholder="搜索项目名称..." confirm-type="search"
					@confirm="handleSearch" />
				<button class="search-btn" type="default" @tap="handleSearch">搜索</button>
			</view>
		</view>

		<!-- 项目卡片列表 -->
		<scroll-view class="list-scroll" scroll-y :style="{ height: listHeight + 'px' }" @scrolltolower="onReachBottom"
			@refresherrefresh="onPullDownRefresh">
			<view class="list-container">
				<view v-if="projects.length === 0" class="empty">
					暂无项目，点击右下角“＋”添加
				</view>
				<view v-for="item in projects" :key="item._id" class="project-card">
					<view class="card-top">
						<view class="info">
							<view class="name-row">
								<text class="name">{{ item.project_name }}</text>
							</view>
							<view class="tags">
								<text class="tag tag-type">{{ item.card_type }}</text>
								<text class="tag" :class="getStatusClass(item.status)">
									{{ item.status == 1 ? '启用' : '停用' }}
								</text>
							</view>
						</view>
						<view class="right">
							<view class="amount">
								<view class="date">费用</view>¥{{ item.total_fee || 0 }}
							</view>
							<view class="date">课时: {{ item.card_date || '-' }}天</view>
						</view>
					</view>
					<view class="card-bottom">
						<view class="time-info">
							<text class="time-label">有效期：</text>
							<text class="time-text">{{ formatDate(item.start_time) }} 至
								{{ formatDate(item.end_time) }}</text>
						</view>
						<view class="action-buttons">
							<button class="action-btn edit-btn" @tap="editProject(item)">编辑</button>
							<button class="action-btn delete-btn" @tap="deleteProject(item)">删除</button>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 悬浮新增按钮 -->
		<button class="fab" type="primary" @tap="addProject">
			+
		</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				page: 1,
				pageSize: 20,
				projects: [],
				listHeight: 0,
				loading: false,
				noMore: false
			}
		},
		onLoad() {
			this.loadData(true)
			console.log("onload")
		},
		onReady() {
			const sys = uni.getSystemInfoSync();
			// 粗略估算顶部高度：搜索栏(120rpx≈60px) + 安全区 ≈ 80px
			const topBarHeight = 80; // 单位 px
			this.listHeight = sys.windowHeight - topBarHeight;
		},
		methods: {
			async loadData(reset = true) {
				if (this.loading) return;
				console.log("reset: " + reset + ", nomore: " + this.noMore)
				if (reset) {
					this.page = 1;
					this.noMore = false;
				} else {
					if (this.noMore) {
						return
					}
					this.page++;
				}
				this.loading = true;
				try {
					const res = await uniCloud.callFunction({
						name: 'getProjectList',
						data: {
							page: this.page,
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
						data,
						total
					} = res.result;
					if (reset) {
						this.projects = data;
					} else {
						this.projects = [...this.projects, ...data];
					}
					// 判断是否还有更多
					this.noMore = this.projects.length >= total;
					console.log(this.noMore)
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
				this.loadData(false);
			},
			onReachBottom() {
				if (!this.noMore && !this.loading) {
					this.loadData(false);
				}
			},
			handleSearch() {
				this.loadData(true);
			},
			formatDate(dateStr) {
				if (!dateStr) return ''
				// 如果是 yyyy-MM-dd HH:mm:ss 格式，只取日期部分
				return dateStr.split(' ')[0]
			},
			getStatusClass(status) {
				return status == 1 ? 'tag-status-enabled' : 'tag-status-disabled'
			},
			addProject() {
				uni.navigateTo({
					url: '/pages/projects/form'
				})
			},
			editProject(item) {
				uni.navigateTo({
					url: `/pages/projects/form?id=${item._id}`
				})
			},
			deleteProject(item) {
				uni.showModal({
					title: '确认删除',
					content: `确定要删除项目 "${item.project_name}" 吗？此操作不可恢复。`,
					success: (res) => {
						if (res.confirm) {
							this.doDeleteProject(item._id)
						}
					}
				})
			},
			async doDeleteProject(id) {
				uni.showLoading({
					title: '删除中...'
				})
				try {
					const res = await uniCloud.callFunction({
						name: 'removeProject',
						data: {
							id: id
						}
					})
					if (res.result.code === 0) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 重新加载数据
						this.loadData(true)
					} else {
						uni.showToast({
							title: res.result.msg || '删除失败',
							icon: 'none'
						})
					}
				} catch (err) {
					console.error('删除失败', err)
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
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

	.list-scroll {
		flex: 1;
		padding: 0 24rpx;
	}

	.list-container {
		padding-bottom: 50rpx;
		margin-right: 52rpx;
	}

	.empty {
		text-align: center;
		padding-top: 160rpx;
		color: #999;
		font-size: 26rpx;
	}

	.project-card {
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

	.tag-type {
		background-color: #e6f2ff;
		color: #2979ff;
	}

	.tag-status-enabled {
		background-color: #e6ffed;
		color: #3cb371;
	}

	.tag-status-disabled {
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
		padding-top: 24rpx;
		/* 		border-bottom: 1rpx solid #f0f0f5; */
	}

	.time-info {
		margin-bottom: 20rpx;
	}

	.time-label {
		font-size: 24rpx;
		color: #999;
	}

	.time-text {
		font-size: 24rpx;
		color: #333;
	}

	.action-buttons {
		display: flex;
		justify-content: flex-end;
		/* 靠右 */
		align-items: center;
		border-top: 1rpx solid #eee;
		padding-top: 22rpx;
		padding-bottom: 4rpx;
		height: 60rpx;
	}

	.action-btn {
		font-size: 22rpx;
		border-radius: 8rpx;
		height: 53rpx;
		padding: 0 20rpx;
	}

	.action-buttons .action-btn+.action-btn {
		margin-left: 262rpx;
	}

	.edit-btn {
		color: #2979ff;
		background-color: #ffffff;
	}
	

	.delete-btn {
		color: #ff4d4f;
		background-color: #ffffff;
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