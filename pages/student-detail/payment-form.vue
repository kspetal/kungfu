<template>
	<scroll-view class="page" scroll-y>

		<view class="section">
			<view class="section-header">
				<text>缴费信息</text>
			</view>
			<view class="section-body">
				<!-- 项目名称 -->
				<view class="form-item">
					<text class="label">项目名称</text>
					<picker @change="onProjectChange" :value="currentProjectIndex" :range="projectOptions"
						:range-key="'project_name'" class="picker">
						<view class="picker-content">{{ projectOptions[currentProjectIndex].project_name }}</view>
					</picker>
				</view>

				<!-- 卡类型 -->
				<view class="form-item">
					<text class="label">卡类型</text>
					<input type="text" class="input" v-model="formData.card_type" placeholder="请输入卡类型" />
				</view>

				<!-- 状态 -->
				<view class="form-item">
					<text class="label">状态</text>
					<picker :range="statusOptions" :range-key="'name'" @change="onStatusChange" class="picker">
						<view class="picker-content">{{ statusOptions[formData.status].name }}</view>
					</picker>
				</view>

				<!-- 开始时间 -->
				<view class="form-item">
					<text class="label">开始时间</text>
					<picker mode="date" :value="startDate" start="2020-01-01" end="2030-12-31"
						@change="onStartDateChange" class="picker">
						<view class="picker-content">{{ startDate }}</view>
					</picker>
				</view>

				<!-- 结束时间 -->
				<view class="form-item">
					<text class="label">结束时间</text>
					<picker mode="date" :value="endDate" start="2020-01-01" end="2030-12-31" @change="onEndDateChange"
						class="picker">
						<view class="picker-content">{{ endDate }}</view>
					</picker>
				</view>

				<!-- 总费用 -->
				<view class="form-item">
					<text class="label">总费用</text>
					<view class="price-input">
						<text class="price-symbol">¥</text>
						<input type="number" class="input" v-model="formData.total_fee" placeholder="请输入数字" />
					</view>
				</view>

				<!-- 定金 -->
				<view class="form-item">
					<text class="label">定金</text>
					<view class="price-input">
						<text class="price-symbol">¥</text>
						<input type="number" class="input" v-model="formData.deposit" placeholder="请输入数字" />
					</view>
				</view>
			</view>
		</view>

		<view class="bottom-btn">
			<button type="primary" class="btn" @tap="submitForm">{{ isEdit ? '保存修改' : '提交' }}</button>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				id: '', // 学生ID
				type: 'add', // add 或 edit
				recordId: '', // 记录ID（编辑时使用）
				isEdit: false,
				formData: {
					project_name: '常规项目',
					card_type: '',
					status: 1, // 默认生效中
					total_fee: '',
					deposit: 0,
					start_time: '',
					end_time: ''
				},
				currentProjectIndex: 0,
				projectOptions: [{
					_id: 'custom',
					project_name: '常规项目',
					card_type: '',
					card_date: '',
					start_time: '',
					end_time: '',
					deposit: 0,
					total_fee: '',
					create_time: '',
					status: 1
				}],
				startDate: '',
				endDate: '',
				statusOptions: [{
						value: 0,
						name: '已过期'
					},
					{
						value: 1,
						name: '生效中'
					},
					{
						value: 2,
						name: '暂停中'
					}
				]
			}
		},
		onLoad(options) {
			this.id = options.id
			this.type = options.type || 'add'
			this.isEdit = this.type === 'edit'
			this.formData.student_id = this.id
			if (this.isEdit) {
				this.recordId = options.recordId
				this.loadRecordDetail()
			} else {
				// 新增时设置默认时间
				const now = new Date()
				this.startDate = this.formatDate(now)
				// 默认结束时间为一年后
				const end = new Date(now.setFullYear(now.getFullYear() + 1))
				this.endDate = this.formatDate(end)

				this.formData.start_time = this.startDate
				this.formData.end_time = this.endDate
			}
			// 加载项目列表
			this.loadProjectList();
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			async loadProjectList() {
				try {
					const res = await uniCloud.callFunction({
						name: 'getProjectList',
						data: {
							page: 1,
							pageSize: 100 // 获取所有项目
						}
					});

					if (res.result && res.result.code === 0) {
						// 将API返回的项目列表添加到选项中，保留"常规项目"作为第一个选项
						const activeProject = res.result.data.filter(item => item.status === 1)
						const apiProjects = activeProject || [];
						this.projectOptions = [{
								_id: 'custom',
								project_name: '常规项目',
								card_type: '',
								card_date: '',
								start_time: '',
								end_time: '',
								deposit: 0,
								total_fee: '',
								create_time: '',
								status: 1
							},
							...apiProjects
						];
					} else {
						console.error('获取项目列表失败:', res.result?.msg || '未知错误');
					}
				} catch (error) {
					console.error('获取项目列表异常:', error);
					uni.showToast({
						title: '获取项目列表失败',
						icon: 'none'
					});
				}
			},
			onProjectChange(e) {
				const index = e.detail.value;
				this.currentProjectIndex = index;
				const selectedProject = this.projectOptions[index];

				// 如果选择的是"常规项目"，不填充数据
				if (selectedProject._id === 'custom') {
					// 保持现有数据不变或重置为默认值
					return;
				}

				// 填充项目数据
				this.formData.card_type = selectedProject.card_type || '';
				this.formData.total_fee = selectedProject.total_fee || '';
				this.formData.deposit = selectedProject.deposit || '';

				// 设置开始和结束时间
				if (selectedProject.start_time) {
					this.startDate = selectedProject.start_time;
					this.formData.start_time = selectedProject.start_time;
				}
				if (selectedProject.end_time) {
					this.endDate = selectedProject.end_time;
					this.formData.end_time = selectedProject.end_time;
				}

				// 设置状态
				this.formData.status = 1;
			},
			onStatusChange(e) {
				this.formData.status = e.detail.value;
			},
			formatDate(date) {
				const year = date.getFullYear()
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const day = date.getDate().toString().padStart(2, '0')
				return `${year}-${month}-${day}`
			},
			onStartDateChange(e) {
				this.startDate = e.detail.value
				this.formData.start_time = this.startDate
			},
			onEndDateChange(e) {
				this.endDate = e.detail.value
				this.formData.end_time = this.endDate
			},
			loadRecordDetail() {
				// 这里需要调用API获取缴费记录详情
				uni.showLoading({
					title: '加载中...'
				})
				this.getRecordDetail()
				uni.hideLoading()
			},
			async getRecordDetail() {
				const res = await uniCloud.callFunction({
					name: "getRecordDetail",
					data: {
						id: this.recordId
					}
				})
				if (res.result.code === 0) {
					const data = res.result.data
					this.formData = data
					this.startDate = data.start_time
					this.endDate = data.end_time
				}
			},
			async addRecord() {
				const res = await uniCloud.callFunction({
					name: "addRecord",
					data: {
						record: {
							...this.formData,
							deposit: this.formData.deposit ? Number(this.formData.deposit) : 0,
							total_fee: this.formData.total_fee ? Number(this.formData.total_fee) : 0
						}
					}
				})
				return res.result.code === 0;
			},
			async updateRecord() {
				this.formData._id = this.recordId
				const res = await uniCloud.callFunction({
					name: "updateRecord",
					data: {
						record: {
							...this.formData,
							deposit: this.formData.deposit ? Number(this.formData.deposit) : 0,
							total_fee: this.formData.total_fee ? Number(this.formData.total_fee) : 0
						}
					}
				})
				return res.result.code === 0;
			},
			submitForm() {
				// 表单验证
				if (new Date(this.startDate) >= new Date(this.endDate)) {
					uni.showToast({
						title: '截止时间需大于开始时间',
						icon: 'none'
					})
					return
				}

				if (!this.formData.total_fee) {
					uni.showToast({
						title: '请输入总费用',
						icon: 'none'
					})
					return
				}
				if (!this.formData.project_name) {
					this.formData.project_name = "常规项目"
				}
				uni.showLoading({
					title: '提交中...'
				})
				const res = this.isEdit ? this.updateRecord() : this.addRecord()
				if (res) {
					uni.showToast({
						title: this.isEdit ? '修改成功' : '新增成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: this.isEdit ? '修改失败' : '新增失败',
						icon: 'error'
					})
				}
				uni.hideLoading()
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

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: white;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.header-left {
		display: flex;
		align-items: center;
	}

	.back-icon {
		font-size: 32rpx;
		color: #333;
		margin-right: 8rpx;
	}

	.back-text {
		font-size: 28rpx;
		color: #333;
	}

	.header-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.header-right {
		width: 100rpx;
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

	.price-input {
		display: flex;
		align-items: center;
	}

	.price-symbol {
		font-size: 26rpx;
		color: #333;
		margin-right: 10rpx;
	}

	.bottom-btn {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16rpx 24rpx 32rpx;
		padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.btn {
		border-radius: 999rpx;
		font-size: 30rpx;
	}
</style>