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
					<text class="label">出生日期</text>
					<picker mode="date" @change="(e) => (form.birth_date = e.detail.value)">
						<view class="picker">
							{{ form.birth_date || '请选择日期' }}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">学校</text>
					<input class="input" v-model="form.school" placeholder="请输入学校" />
				</view>
				<view class="form-item">
					<text class="label">家长电话 *</text>
					<input class="input" v-model="form.parent_phone" placeholder="请输入手机号" />
				</view>
				<view class="form-item">
					<text class="label">家长微信</text>
					<input class="input" v-model="form.parent_wx" placeholder="请输入微信号" />
				</view>
				<view class="form-item">
					<text class="label">住址</text>
					<input class="input" v-model="form.address" placeholder="请输入住址" />
				</view>
				<view class="form-item">
					<text class="label">来源渠道</text>
					<picker :range="sourceRange" @change="onSourceChange">
						<view class="picker">
							{{ sourceRange[form.source - 1] || '请选择' }}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">状态</text>
					<picker :range="statusRange" @change="onStatusChange">
						<view class="picker">
							{{ form.status || '在学' }}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">头像</text>
					<view class="avatar-upload">
						<uni-file-picker v-model="imageValue" fileMediatype="image" mode="grid" :limit="1"
							@select="select" @progress="progress" @success="success" @fail="fail" />
					</view>
				</view>
			</view>
		</view>

		<view class="bottom-btn">
			<button type="primary" class="btn" @tap="handleSubmit">保存</button>
		</view>
	</scroll-view>
</template>

<script>
	// import {
	// 	createStudent,
	// 	updateStudent,
	// } from '@/services/api.js'

	export default {
		data() {
			return {
				id: '',
				form: {
					name: '',
					gender: '',
					birth_date: '',
					school: '',
					parent_phone: '',
					parent_wx: '',
					address: '',
					avatar_url: '',
					source: 0,
					status: '在学'
				},
				imageValue: [],
				fold: {
					profile: true,
				},
				genderRange: ['男', '女'],
				sourceRange: ['路过看到', '早晚知道', '朋友介绍', '网络活动', '其他方式'],
				statusRange: ['在学', '暂停', '已休学']
			}
		},
		onLoad(query) {
			if (query.id) {
				this.id = query.id
				this.loadFromStore()
			}
		},
		methods: {
			formatDate(dateStr) {
				if (!dateStr) return ''
				return dateStr.split(' ')[0]
			},
			toggleFold(key) {
				this.fold[key] = !this.fold[key]
			},
			onGenderChange(e) {
				const index = Number(e.detail.value)
				this.form.gender = index === 0 ? 'M' : 'F'
			},
			onSourceChange(e) {
				const index = Number(e.detail.value)
				this.form.source = index + 1
			},
			onStatusChange(e) {
				const index = Number(e.detail.value)
				this.form.status = this.statusRange[index]
			},
			loadFromStore() {
				const app = getApp()
				const list = (app && app.$store && app.$store.state.students) || []
				const found = list.find((s) => String(s._id) === String(this.id))
				if (found) {
					// 填充学员基本信息
					this.form = {
						name: found.name || '',
						gender: found.gender || '',
						birth_date: found.birth_date || '',
						school: found.school || '',
						parent_phone: found.parent_phone || '',
						parent_wx: found.parent_wx || '',
						address: found.address || '',
						avatar_url: found.avatar_url || '',
						source: found.source || 0,
						status: found.status || '在学'
					}

				} else {
					this.loadStudent()
				}
			},
			validate() {
				if (!this.form.name) return '请输入姓名'
				if (!this.form.parent_phone) return '请输入家长电话'
				return ''
			},
			async loadStudent() {
				const res = await uniCloud.callFunction({
					name: 'getStudentDetail',
					data: {
						id: this.id
					}
				});
				this.form = res.result.code === 0 ? res.result.data : {}
			},
			async addStudent() {
				console.log(this.imageValue)
				this.form.avatar_url = this.imageValue ? this.imageValue[0].url : this.form.avatar_url
				await uniCloud.callFunction({
					name: 'addStudent',
					data: {
						student: this.form
					}
				});
			},
			async updateStudent() {
				console.log(this.imageValue)
				this.form.avatar_url = this.imageValue ? this.imageValue[0].url : this.form.avatar_url
				await uniCloud.callFunction({
					name: 'updateStudent',
					data: {
						student: {
							_id: this.id,
							...this.form
						}
					}
				});
			},
			select(e) {
				console.log('选择文件：', e)
			},
			progress(e) {
				console.log('上传进度：', e)
			},
			success(e) {
				console.log('上传成功')
			},
			fail(e) {
				console.log('上传失败：', e)
			},
			handleSubmit() {
				const msg = this.validate()
				if (msg) {
					uni.showToast({
						title: msg,
						icon: 'none'
					})
					return
				}
				try {
					// 先保存/更新学员信息
					let studentId = this.id
					if (studentId) {
						this.updateStudent()
					} else {
						this.addStudent()
					}
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 600)
				} catch (e) {
					console.error('save student error', e)
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					})
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

	/* 头像上传样式 */
	.avatar-upload {
		margin-top: 8rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.avatar-preview {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 2rpx solid #eee;
	}

	.avatar-placeholder {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 2rpx dashed #ccc;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.plus-icon {
		font-size: 60rpx;
		color: #ccc;
		line-height: 1;
	}

	.upload-text {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.avatar-actions {
		display: flex;
		margin-top: 20rpx;
	}

	.action-btn {
		font-size: 24rpx;
		padding: 10rpx 20rpx;
		margin: 0 10rpx;
		background-color: #007AFF;
		color: white;
		border-radius: 6rpx;
	}

	.remove-btn {
		background-color: #FF3B30;
	}
</style>