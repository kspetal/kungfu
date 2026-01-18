<template>
	<view class="page">
		<scroll-view class="scroll-view" scroll-y @scrolltolower="onReachBottom" lower-threshold="100">
			<view class="card basic-card">
				<view class="top">
					<image class="avatar"
						:src="student.avatar_url || (student.gender == 'F' ? girlAvatar : boyAvatar)" />
					<view class="info">
						<view class="name-row">
							<text class="name">{{ student.name }}</text>
							<text class="status" :class="getStatusClass(student.status)">
								{{ student.status || '在学' }}
							</text>
						</view>
						<view class="sub">
							<text>{{ student.current_project || '-' }}</text>
							<text class="divider">|</text>
							<text>到期 {{ student.end_time || '-' }}</text>
						</view>
					</view>
				</view>
				<view class="row">
					<text class="label">出生日期</text>
					<text class="value">{{ formatDate(student.birth_date) || '-' }}</text>
				</view>
				<view class="row">
					<text class="label">性别</text>
					<text class="value">{{ student.gender === 'M' ? '男' : '女' }}</text>
				</view>
				<view class="row">
					<text class="label">学校</text>
					<text class="value">{{ student.school || '-' }}</text>
				</view>
				<view class="row">
					<text class="label">家长电话</text>
					<text class="value">{{ student.parent_phone || '-' }}</text>
				</view>
				<view class="row">
					<text class="label">家长微信</text>
					<text class="value">{{ student.parent_wx || '-' }}</text>
				</view>
				<view class="row">
					<text class="label">住址</text>
					<text class="value">{{ student.address || '-' }}</text>
				</view>
				<view class="row">
					<text class="label">来源渠道</text>
					<text class="value">{{ student.source ? student.source : '-' }}</text>
				</view>
			</view>

			<view class="card">
				<view class="section-title">付费信息</view>
				<view class="row">
					<text class="label">总课时</text>
					<text class="value">{{ student.total_study_date || 0 }}天</text>
				</view>
				<view class="row">
					<text class="label">总费用</text>
					<text class="value strong">¥{{ student.total_fee || 0 }}</text>
				</view>
			</view>

			<!-- 缴费记录列表 -->
			<view class="card">
				<view class="section-title-container">
					<text class="section-title">缴费记录</text>
					<view class="add-btn tappable" @tap="goAddPayment">
						<text class="add-btn-icon">+</text>
					</view>
				</view>

				<view v-if="records.length > 0">
					<view v-for="(record, index) in records" :key="record._id || index" class="record-item">
						<view class="record-header">
							<text class="record-title">{{ record.project_name }}</text>
							<text class="record-status" :class="getRecordStatusClass(record.status)">
								{{ getRecordStatusText(record.status) }}
							</text>
						</view>
						<view class="record-body">
							<view class="row">
								<text class="label">卡类型</text>
								<text class="value">{{ record.card_type || '-' }}</text>
							</view>
							<view class="row">
								<text class="label">开始时间</text>
								<text class="value">{{ formatDate(record.start_time) }}</text>
							</view>
							<view class="row">
								<text class="label">结束时间</text>
								<text class="value">{{ formatDate(record.end_time) }}</text>
							</view>
							<view class="row">
								<text class="label">总费用</text>
								<text class="value strong">¥{{ record.total_fee || 0 }}</text>
							</view>
							<view v-if="record.deposit && record.deposit > 0" class="row">
								<text class="label">定金</text>
								<text class="value">¥{{ record.deposit }}</text>
							</view>
						</view>
						<!-- 操作按钮 -->
						<view class="record-actions">
							<text class="action-btn edit-btn tappable" @tap="goEditPayment(record)">编辑</text>
							<text class="action-btn delete-btn tappable" @tap="handleRecordDelete(record)">删除</text>
						</view>
					</view>

					<!-- 加载更多提示 -->
					<view v-if="!noMore" class="load-more-container">
						<view class="loading-text" v-if="loading">正在加载更多...</view>
						<view class="no-more-text" v-else>上拉加载更多</view>
					</view>

					<view v-if="noMore" class="load-more-container">
						<view class="no-more-text">没有更多数据了</view>
					</view>
				</view>

				<!-- 无缴费记录提示 -->
				<view v-else class="empty-record-tip">
					<text class="empty-text">暂无缴费记录</text>
				</view>
			</view>
		</scroll-view>

		<view class="bottom-actions">
			<button class="btn secondary" @tap="goEdit">编辑</button>
			<button class="btn danger" @tap="handleDelete">删除</button>
		</view>
	</view>
</template>

<script>

	import {
		useGlobalStore
	} from '@/store'

	export default {
		data() {
			return {
				id: '',
				student: {},
				records: [],
				page: 1,
				pageSize: 5,
				loading: false,
				noMore: false,
				boyAvatar: '/static/boy.png',
				girlAvatar: '/static/girl.png',
				needRefresh: false
			}
		},
		onShow() {
			if(this.needRefresh) {
				this.loadRecords(true);
				this.loadStudent();
				this.needRefresh = false;
			}
		},
		onLoad(query) {
			this.id = query.id
			this.loadDetail()
			if (this.id) {
				this.loadRecords(true);
			}
		},
		methods: {
			loadDetail() {
				//简单从列表传参缓存中获取
				const {
					state
				} = useGlobalStore()
				const list = (state && state.students) || []
				const found = list.find((s) => String(s._id) === String(this.id))
				if (found) {
					this.student = found
				} else {
					this.loadStudent()
				}
				// this.loadStudent()
				this.loadRecords()
			},
			async loadStudent() {
				const res = await uniCloud.callFunction({
					name: 'getStudentDetail',
					data: {
						id: this.id
					}
				});
				this.student = res.result.code === 0 ? res.result.data : {}
			},
			async loadRecords(reset = true) {
				if (this.loading) return;

				if (reset) {
					this.page = 1;
					this.noMore = false;
				} else {
					// 如果已经没有更多数据，直接返回
					if (this.noMore) return;
					this.page++;
				}

				this.loading = true;
				try {
					const res = await uniCloud.callFunction({
						name: 'getRecordList',
						data: {
							page: this.page,
							pageSize: this.pageSize,
							student_id: this.id
						}
					});

					if (res.result.code === 0) {
						const newRecords = res.result.data || [];

						if (reset) {
							this.records = newRecords;
						} else {
							// 追加新数据到现有记录中
							this.records = [...this.records, ...newRecords];
						}

						// 使用云函数返回的hasMore字段判断是否还有更多数据
						this.noMore = !res.result.hasMore;
					}
				} catch (err) {
					console.error('加载缴费记录失败', err);
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});

					// 如果是加载更多时出错，回退页码
					if (!reset) {
						this.page--;
					}
				} finally {
					this.loading = false;
				}
			},
			getActiveRecord() {
				if (!this.records || this.records.length === 0) return null
				return this.records.find(r => r.status === 1) || this.records[0] || null
			},
			getTotalDeposit() {
				return this.records.reduce((sum, r) => sum + (Number(r.deposit) || 0), 0)
			},
			getTotalFee() {
				return this.records.reduce((sum, r) => sum + (Number(r.total_fee) || 0), 0)
			},
			formatDate(dateStr) {
				if (!dateStr) return ''
				return dateStr.split(' ')[0]
			},
			getStatusClass(status) {
				if (status === '在学') return 'status-ongoing'
				if (status === '已退学') return 'status-completed'
				return 'status-ongoing'
			},
			getRecordStatusText(status) {
				const map = {
					0: '已过期',
					1: '生效中',
					2: '暂停中'
				}
				return map[status] || '-'
			},
			getRecordStatusClass(status) {
				if (status === 0) return 'status-expired'
				if (status === 1) return 'status-active'
				if (status === 2) return 'status-paused'
				return ''
			},
			goEdit() {
				this.needRefresh = true
				uni.navigateTo({
					url: `/pages/student-form/index?id=${this.id}&recordId=${this.getActiveRecord()?._id || ''}`
				})
			},
			goAddPayment() {
				this.needRefresh = true
				uni.navigateTo({
					url: './payment-form?id=' + this.id + '&type=add'
				})
			},
			goEditPayment(record) {
				this.needRefresh = true
				uni.navigateTo({
					url: './payment-form?id=' + this.id + '&type=edit&recordId=' + record._id
				})
			},
			handleDelete() {
				uni.showModal({
					title: '删除确认',
					content: '确定要删除该学员及其相关记录吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								await this.deleteStudent(this.id)
								await this.deleteStudentRecord(this.id)
								uni.showToast({
									title: '已删除',
									icon: 'success'
								})
								setTimeout(() => {
									uni.navigateBack()
								}, 500)
							} catch (e) {
								console.error('delete error', e)
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			handleRecordDelete(record) {
				uni.showModal({
					title: '删除确认',
					content: '确定要删除该缴费记录吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								await this.deleteRecord(record._id, record.student_id)
								uni.showToast({
									title: '已删除',
									icon: 'success'
								})
								setTimeout(() => {
									this.loadRecords(true)
								}, 500)
							} catch (e) {
								console.error('delete error', e)
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			async deleteRecord(_id, student_id) {
				const res = await uniCloud.callFunction({
					name: 'removeRecord',
					data: {
						id: _id,
					}
				});
			},
			async deleteStudent(_id) {
				const res = await uniCloud.callFunction({
					name: 'removeStudent',
					data: {
						id: _id
					}
				});
			},
			async deleteStudentRecord(student_id) {
				const res = await uniCloud.callFunction({
					name: 'removeRecord',
					data: {
						student_id: student_id
					}
				});
			},
			// 滚动到底部时加载更多
			onReachBottom() {
				if (!this.noMore && !this.loading) {
					this.loadRecords(false);
				}
			}
		}
	}
</script>

<style scoped>
	page {
		background-color: #f5f5f5;
	}

	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.scroll-view {
		flex: 1;
		height: calc(100vh - 150rpx);
	}

	.card {
		background: white;
		border-radius: 16rpx;
		margin: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.basic-card {
		margin-top: 20rpx;
	}

	.top {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin-right: 30rpx;
	}

	.info {
		flex: 1;
	}

	.name-row {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.name {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-right: 20rpx;
	}

	.status {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
	}

	.sub {
		font-size: 28rpx;
		color: #666;
	}

	.divider {
		margin: 0 10rpx;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.row:last-child {
		border-bottom: none;
	}

	.label {
		font-size: 28rpx;
		color: #666;
	}

	.value {
		font-size: 28rpx;
		color: #333;
	}

	.strong {
		font-weight: bold;
		color: #ff6600;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.section-title-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.add-btn {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		background-color: #1890ff;
		color: white;
		font-size: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.record-item {
		border: 1rpx solid #e0e0e0;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}

	.record-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #f9f9f9;
		border-bottom: 1rpx solid #e0e0e0;
	}

	.record-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.record-status {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
	}

	.record-status.status-active {
		background-color: #52c41a;
		color: #fff;
	}

	.record-status.status-expired {
		background-color: #bfbfbf;
		color: #fff;
	}

	.record-status.status-paused {
		background-color: #f5222d;
		color: #fff;
	}

	.record-body {
		padding: 20rpx 30rpx;
	}

	.record-actions {
		display: flex;
		justify-content: flex-end;
		padding: 20rpx 30rpx;
		background-color: #fafafa;
		border-top: 1rpx solid #e0e0e0;
	}

	.action-btn {
		font-size: 26rpx;
		padding: 10rpx 24rpx;
		border-radius: 6rpx;
		margin-left: 20rpx;
	}

	.edit-btn {
		background-color: #e8f4ff;
		color: #1890ff;
	}

	.delete-btn {
		background-color: #fff1f0;
		color: #f5222d;
	}

	.load-more-container {
		text-align: center;
		padding: 30rpx 0;
	}

	.loading-text,
	.no-more-text {
		font-size: 26rpx;
		color: #999;
	}

	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-around;
		padding: 20rpx;
		background-color: white;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}

	.btn {
		flex: 1;
		margin: 0 10rpx;
		border-radius: 12rpx;
		font-size: 32rpx;
		height: 80rpx;
		line-height: 80rpx;
	}

	.secondary {
		background-color: #f0f0f0;
		color: #333;
	}

	.danger {
		background-color: #ff4d4f;
		color: white;
	}

	.tappable {
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.empty-record-tip {
		text-align: center;
		padding: 40rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>