<template>
	<scroll-view class="page" scroll-y>
		<view class="section">
			<view class="section-header">
				<text>项目信息</text>
			</view>
			<view class="section-body">
				<view class="form-item">
					<text class="label">项目名称 *</text>
					<input class="input" v-model="form.project_name" placeholder="请输入项目名称" />
				</view>

				<view class="form-item">
					<text class="label">卡类型</text>
					<input class="input" v-model="form.card_type" placeholder="请输入卡类型" />
				</view>

				<view class="form-item">
					<text class="label">开始日期 *</text>
					<picker mode="date" @change="(e) => { form.start_time = e.detail.value + ' 00:00:00'; calculateDays(); }">
						<view class="picker">
							{{ formatDate(form.start_time) || '请选择日期' }}
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="label">截止日期 *</text>
					<picker mode="date" @change="(e) => { form.end_time = e.detail.value + ' 00:00:00'; calculateDays(); }">
						<view class="picker">
							{{ formatDate(form.end_time) || '请选择日期' }}
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="label">课时（天）</text>
					<input class="input disabled" disabled="true" v-model="form.card_date" placeholder="根据日期自动计算" />
				</view>

				<view class="form-item">
					<text class="label">总费用</text>
					<input class="input" type="number" v-model="form.total_fee" placeholder="请输入总费用" />
				</view>

				<view class="form-item">
					<text class="label">定金</text>
					<input class="input" type="number" v-model="form.deposit" placeholder="请输入定金" />
				</view>

				<view class="form-item">
					<text class="label">状态</text>
					<picker  :range="statusRange" @change="onStateChange">
						<view class="picker">
							{{ formatState(form.status) || '请选择' }}
						</view>
					</picker>
				</view>
			</view>
		</view>
		<view class="bottom-btn">
			<button type="primary" class="btn" @tap="submitForm">保存</button>
		</view>
	</scroll-view>

</template>

<script>
	export default {
		data() {
			return {
				id: '',
				form: {
					project_name: '',
					card_type: '',
					card_date: '',
					start_time: '',
					end_time: '',
					total_fee: '',
					deposit: '',
					status: 1 // 默认启用
				},
				statusRange: ['启用', '停用']
			}
		},
		onLoad(options) {
			if (options.id) {
				this.id = options.id
				this.loadProjectDetail()
			} else {
				// 初始化默认日期
				const today = new Date()
				const year = today.getFullYear()
				const month = String(today.getMonth() + 1).padStart(2, '0')
				const day = String(today.getDate()).padStart(2, '0')
				this.form.start_time = `${year}-${month}-${day} 00:00:00`
				
				const nextWeek = new Date(today)
				nextWeek.setDate(today.getDate() + 7)
				const nextYear = nextWeek.getFullYear()
				const nextMonth = String(nextWeek.getMonth() + 1).padStart(2, '0')
				const nextDay = String(nextWeek.getDate()).padStart(2, '0')
				this.form.end_time = `${nextYear}-${nextMonth}-${nextDay} 00:00:00`
				
				// 计算初始天数
				this.calculateDays()
			}
		},
		methods: {
			async loadProjectDetail() {
				uni.showLoading({
					title: '加载中...'
				})
				try {
					const res = await uniCloud.callFunction({
						name: 'getProjectDetail',
						data: {
							id: this.id
						}
					})
					if (res.result.code === 0) {
						this.form = {
							...this.form,
							...res.result.data
						}
						// 在获取到项目详情后重新计算天数
						this.calculateDays()
					} else {
						uni.showToast({
							title: res.result.msg || '加载失败',
							icon: 'none'
						})
					}
				} catch (err) {
					console.error('加载失败', err)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			onStartDateChange(e) {
				this.form.start_time = e.detail.value
			},
			onEndDateChange(e) {
				this.form.end_time = e.detail.value
			},
			calculateDays() {
				// 当开始日期或结束日期发生变化时，自动计算天数
				if (this.form.start_time && this.form.end_time) {
					const startDate = new Date(this.form.start_time.split(' ')[0]);
					const endDate = new Date(this.form.end_time.split(' ')[0]);
					
					// 计算两个日期之间的毫秒差
					const timeDiff = endDate.getTime() - startDate.getTime();
					
					// 转换为天数
					const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
					
					// 只有当结束日期大于等于开始日期时才更新天数
					if (daysDiff >= 0) {
						this.form.card_date = daysDiff + 1; // 包含起始日和结束日
					} else {
						this.form.card_date = ''; // 如果日期不合理，则清空天数
					}
				} else {
					this.form.card_date = ''; // 如果任一日期为空，则清空天数
				}
			},
			formatDate(dateStr) {
				if (!dateStr) return ''
				return dateStr.split(' ')[0]
			},
			formatState(state) {
				if(state === 0) {
					return "停用"
				}
				if(state === 1) {
					return "启用"
				}
				return ""
			},
			onStateChange(e) {
				const value = e.detail.value
				console.log(e.detail)
				this.form.status = value === 1 ? 0 : 1
				console.log(this.form.status)
			},
			async submitForm() {
				// 表单验证
				if (!this.form.project_name) {
					uni.showToast({
						title: '请输入项目名称',
						icon: 'none'
					})
					return
				}

				uni.showLoading({
					title: '保存中...'
				})

				try {
					let res
					if (this.id) {
						// 更新项目
						res = await uniCloud.callFunction({
							name: 'updateProject',
							data: {
								project: {
									_id: this.id,
									...this.form
								}
							}
						})
					} else {
						// 创建项目
						// 添加创建时间
						this.form.create_time = this.getCurrentTime()
						res = await uniCloud.callFunction({
							name: 'addProject',
							data: {
								project: this.form
							}
						})
					}

					if (res.result.code === 0) {
						uni.showToast({
							title: this.id ? '更新成功' : '创建成功',
							icon: 'success'
						})
						// 返回上一页
						setTimeout(() => {
							uni.navigateBack()
						}, 1000)
					} else {
						uni.showToast({
							title: res.result.msg || (this.id ? '更新失败' : '创建失败'),
							icon: 'none'
						})
					}
				} catch (err) {
					console.error('保存失败', err)
					uni.showToast({
						title: this.id ? '更新失败' : '创建失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			getCurrentTime() {
				const now = new Date()
				const year = now.getFullYear()
				const month = String(now.getMonth() + 1).padStart(2, '0')
				const day = String(now.getDate()).padStart(2, '0')
				const hours = String(now.getHours()).padStart(2, '0')
				const minutes = String(now.getMinutes()).padStart(2, '0')
				const seconds = String(now.getSeconds()).padStart(2, '0')
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
			}
		}
	}
</script>

<style scoped>
	.page {
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: #f5f6fa;
		box-sizing: border-box;
		height: 100vh;
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
	
	.input.disabled {
		background-color: #e0e0e0;
		color: #999;
	}
	
	.input-with-icon {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.input-with-icon .input {
		padding-right: 50rpx; /* 为锁图标留出空间 */
	}
	
	.lock-icon {
		position: absolute;
		right: 20rpx;
		color: #999;
		font-size: 24rpx;
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
		padding-bottom: calc(32rpx + env(safe-area-inset-bottom)); /* 确保按钮组在安全区域内 */
		background-color: #ffffff;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	
	.btn {
		border-radius: 999rpx;
		font-size: 30rpx;
	}
</style>