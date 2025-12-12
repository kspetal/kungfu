<template>
	<scroll-view class="page scroll-view" scroll-y @scrolltolower="onReachBottom" lower-threshold="100">
		<view class="card basic-card">
			<view class="top">
				<image class="avatar" :src="student.avatar_url || (student.gender == '女' ? girlAvatar : boyAvatar)" />
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
				<text class="value">{{ student.gender }}</text>
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
				<text class="value">{{ student.source || '-' }}</text>
			</view>
		</view>

		<!-- 课程记录列表 -->
		<!-- 		<view v-for="(record, idx) in records" :key="record._id || idx" class="card">
			<view class="section-title">课程信息 {{ records.length > 1 ? `(${idx + 1})` : '' }}</view>
			<view class="row">
				<text class="label">项目</text>
				<text class="value">{{ record.project_name || '-' }}</text>
			</view>
			<view class="row">
				<text class="label">卡种</text>
				<text class="value">{{ record.card_type || '-' }}</text>
			</view>
			<view class="row">
				<text class="label">状态</text>
				<text class="value">{{ getRecordStatusText(record.status) }}</text>
			</view>
			<view class="row">
				<text class="label">起止日期</text>
				<text class="value">{{ formatDate(record.start_time) }} ~ {{ formatDate(record.end_time) }}</text>
			</view>
			<view class="row">
				<text class="label">课时</text>
				<text class="value">{{ record.course_date || 0 }} 节</text>
			</view>
		</view> -->

		<view class="card">
			<view class="section-title">付费信息</view>
			<view class="row">
				<text class="label">总课时</text>
				<text class="value">{{ student.total_studey_date || 0 }}天</text>
			</view>
			<view class="row">
				<text class="label">总费用</text>
				<text class="value strong">¥{{ student.total_fee || 0 }}</text>
			</view>
		</view>

		<!-- 缴费记录列表 -->
		<view v-if="records.length > 0" class="card">
			<view class="section-title-container">
				<text class="section-title">缴费记录</text>
				<view class="add-btn tappable" @tap="goAddPayment">
					<text class="add-btn-icon">+</text>
				</view>
			</view>
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
			<view v-if="records.length > 0 && !noMore" class="load-more-container">
				<view class="loading-text" v-if="loading">正在加载更多...</view>
				<view class="no-more-text" v-else>上拉加载更多</view>
			</view>
			
			<view v-if="records.length > 0 && noMore" class="load-more-container">
				<view class="no-more-text">没有更多数据了</view>
			</view>
		</view>

		<view class="bottom-actions">
			<button class="btn secondary" @tap="goEdit">编辑</button>
			<button class="btn danger" @tap="handleDelete">删除</button>
		</view>
	</scroll-view>
</template>

<script>
	// import {
	// 	deleteStudent,
	// 	fetchStudentRecords
	// } from '@/services/api.js'
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
				// 简单从列表传参缓存中获取
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
				this.loadRecords()
			},
			async loadStudent() {
				const res = await uniCloud.callFunction({
					name: 'getStudentDetail',
					data: {
						id: this.id
					}
				});
				this.students = res.result.code === 0 ? res.result.data : {}
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
			getSourceText(source) {
				const map = {
					1: '路过看到',
					2: '早晚知道',
					3: '朋友介绍',
					4: '网络活动',
					5: '其他方式'
				}
				return map[source] || '-'
			},
			goEdit() {
				uni.navigateTo({
					url: `/pages/student-form/index?id=${this.id}&recordId=${this.getActiveRecord()?._id || ''}`
				})
			},
			goAddPayment() {
				uni.navigateTo({
					url: './payment-form?id=' + this.id + '&type=add'
				})
			},
			goEditPayment(record) {
				uni.navigateTo({
					url: './payment-form?id=' + this.id + '&type=edit&recordId=' + record._id
				})
			},
			confirmDelete() {
				// 这里需要调用删除缴费记录的API
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
				// 从本地列表中移除
				const index = this.records.findIndex(item => item._id === this.currentDeleteRecord._id)
				if (index > -1) {
					this.records.splice(index, 1)
				}
				this.hideDeleteDialog()
			},
			
			handleDelete() {
				uni.showModal({
					title: '删除确认',
					content: '确定要删除该学员及其相关记录吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								await deleteStudent(this.id)
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
								await deleteRecord(record._id)
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
			async deleteRecord(_id) {
				const res = await uniCloud.callFunction({
					name: 'removeRecord',
					data: {
						id: _id
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
	.page {
		padding: 24rpx;
		background-color: #f5f6fa;
		min-height: 100vh;
		height: auto;
		box-sizing: border-box;
	}

	.card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx; /* 统一卡片间距 */
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.scroll-view {
		height: calc(100vh - 120rpx); /* 减去底部操作栏的高度 */
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
		color: #333;
		margin-bottom: 20rpx;
	}

	.section-title-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		height: 60rpx;
	}

	.add-btn {
		background-color: #2979ff;
		color: white;
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.add-btn-icon {
		font-size: 36rpx;
		font-weight: bold;
		line-height: 40rpx;
	}

	.record-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 12rpx;
		padding-top: 12rpx;
		border-top: 1rpx solid #eee;
		padding-bottom: 4rpx;
		height: 50rpx;
	}

	.action-btn {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		margin-left: 16rpx;
		height: 33rpx;
	}

	.edit-btn {
		background-color: #e6f2ff;
		color: #2979ff;
	}

	.delete-btn {
		background-color: #fff1f0;
		color: #ff4d4f;
	}

	/* 删除确认对话框样式 */
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}

	.dialog-container {
		background-color: white;
		border-radius: 16rpx;
		padding: 40rpx;
		width: 80%;
		max-width: 500rpx;
	}

	.dialog-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
		text-align: center;
	}

	.dialog-content {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 32rpx;
		text-align: center;
	}

	.dialog-actions {
		display: flex;
		justify-content: center;
		height: 60rpx;
	}

	.dialog-btn {
		padding: 12rpx 32rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		font-weight: 500;
		margin: 0 16rpx;
		height: 33rpx;
	}

	.cancel-btn {
		background-color: #f5f5f5;
		color: #333;
	}

	.confirm-btn {
		background-color: #ff4d4f;
		color: white;
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
		/* margin-bottom: 100rpx; 移除固定底部边距，避免影响其他元素布局 */
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
		z-index: 999; /* 确保按钮在最上层 */
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

	/* 缴费记录样式 */
	.record-item {
		background-color: #f9f9f9;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 16rpx;
		padding-bottom: 16rpx;
		/* 减少底部内边距 */
	}

	.record-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.record-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #333;
	}

	.record-status {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 999rpx;
	}

	.status-expired {
		background-color: #fef0f0;
		color: #ff4d4f;
	}

	.status-active {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.status-paused {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.record-body {
		padding: 12rpx 0;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
		font-size: 24rpx;
	}

	.row:last-child {
		margin-bottom: 0;
	}

	.label {
		color: #666;
	}

	.value {
		color: #333;
	}

	.value.strong {
		font-weight: 600;
		color: #ff4d4f;
	}
	
	/* 加载更多提示样式 */
	.load-more-container {
		text-align: center;
		padding: 20rpx 0;
		margin-bottom: 100rpx; /* 增加底部边距，避免与底部操作按钮重叠 */
	}
	
	.loading-text, .no-more-text {
		font-size: 24rpx;
		color: #999;
	}
	
	.loading-text {
		color: #2979ff;
	}
</style>