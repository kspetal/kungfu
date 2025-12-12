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
			</view>
		</view>

		<view class="section">
			<view class="section-header" @tap="toggleFold('project')">
				<text>项目信息</text>
				<text class="arrow">{{ fold.project ? '▼' : '▲' }}</text>
			</view>
			<view v-if="fold.project" class="section-body">
				<view class="form-item">
					<text class="label">项目 *</text>
					<picker :range="projectRange" @change="onProjectChange">
						<view class="picker">
							{{ recordForm.project_name || '请选择项目' }}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">卡种</text>
					<input class="input" v-model="recordForm.card_type" placeholder="如 次卡 / 期卡" />
				</view>
				<view class="form-item">
					<text class="label">开始日期 *</text>
					<picker mode="date" @change="(e) => (recordForm.start_time = e.detail.value + ' 00:00:00')">
						<view class="picker">
							{{ formatDate(recordForm.start_time) || '请选择日期' }}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">截止日期 *</text>
					<picker mode="date" @change="(e) => (recordForm.end_time = e.detail.value + ' 00:00:00')">
						<view class="picker">
							{{ formatDate(recordForm.end_time) || '请选择日期' }}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">学时时长 *</text>
					<input class="input" type="number" v-model="recordForm.course_date" placeholder="请输入课时数" />
				</view>
			</view>
		</view>

		<view class="section">
			<view class="section-header" @tap="toggleFold('payment')">
				<text>付费资料</text>
				<text class="arrow">{{ fold.payment ? '▼' : '▲' }}</text>
			</view>
			<view v-if="fold.payment" class="section-body">
				<view class="form-item">
					<text class="label">定金</text>
					<input class="input" type="number" v-model="recordForm.deposit" placeholder="请输入定金" />
				</view>
				<view class="form-item">
					<text class="label">总费用 *</text>
					<input class="input" type="number" v-model="recordForm.total_fee" placeholder="请输入总金额" />
				</view>
				<view class="form-item">
					<text class="label">来源渠道</text>
					<picker :range="sourceRange" @change="onSourceChange">
						<view class="picker">
							{{ sourceRange[form.source - 1] || '请选择' }}
						</view>
					</picker>
				</view>
			</view>
		</view>

		<view class="bottom-btn">
			<button type="primary" class="btn" @tap="handleSubmit">保存</button>
		</view>
	</scroll-view>
</template>

<script>
	import {
		createStudent,
		updateStudent,
		createRecord,
		updateRecord
	} from '@/services/api.js'

	export default {
		data() {
			return {
				id: '',
				recordId: '',
				form: {
					name: '',
					gender: '',
					birth_date: '',
					school: '',
					parent_phone: '',
					parent_wx: '',
					address: '',
					source: 0,
					status: '在学'
				},
				recordForm: {
					project_name: '',
					card_type: '',
					start_time: '',
					end_time: '',
					course_date: '',
					deposit: '',
					total_fee: '',
					status: 1 // 1-生效中
				},
				fold: {
					profile: true,
					project: true,
					payment: true
				},
				genderRange: ['男', '女'],
				projectRange: ['瑜伽', '私教课', '瑜伽大班', '拳击课', '普拉提'],
				sourceRange: ['路过看到', '早晚知道', '朋友介绍', '网络活动', '其他方式']
			}
		},
		onLoad(query) {
			if (query.id) {
				this.id = query.id
				this.recordId = query.recordId || ''
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
			onProjectChange(e) {
				const index = Number(e.detail.value)
				this.recordForm.project_name = this.projectRange[index]
			},
			onSourceChange(e) {
				const index = Number(e.detail.value)
				this.form.source = index + 1
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
						source: found.source || 0,
						status: found.status || '在学'
					}
					// 填充课程记录信息（取第一个生效中的记录或第一个记录）
					const records = found.records || []
					const activeRecord = records.find(r => r.status === 1) || records[0] || {}
					if (this.recordId) {
						const targetRecord = records.find(r => String(r._id) === String(this.recordId))
						if (targetRecord) {
							Object.assign(this.recordForm, {
								project_name: targetRecord.project_name || '',
								card_type: targetRecord.card_type || '',
								start_time: targetRecord.start_time || '',
								end_time: targetRecord.end_time || '',
								course_date: targetRecord.course_date || '',
								deposit: targetRecord.deposit || '',
								total_fee: targetRecord.total_fee || '',
								status: targetRecord.status || 1
							})
						}
					} else if (activeRecord._id) {
						Object.assign(this.recordForm, {
							project_name: activeRecord.project_name || '',
							card_type: activeRecord.card_type || '',
							start_time: activeRecord.start_time || '',
							end_time: activeRecord.end_time || '',
							course_date: activeRecord.course_date || '',
							deposit: activeRecord.deposit || '',
							total_fee: activeRecord.total_fee || '',
							status: activeRecord.status || 1
						})
					}
				}
			},
			validate() {
				if (!this.form.name) return '请输入姓名'
				if (!this.recordForm.project_name) return '请选择项目'
				if (!this.form.parent_phone) return '请输入家长电话'
				if (!this.recordForm.start_time || !this.recordForm.end_time) return '请选择起止日期'
				if (!this.recordForm.course_date) return '请输入学时时长'
				if (!this.recordForm.total_fee) return '请输入总费用'
				return ''
			},
			async handleSubmit() {
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
						await updateStudent(studentId, this.form)
					} else {
						const studentRes = await createStudent(this.form)
						studentId = studentRes._id || studentRes.id
					}

					// 再保存/更新课程记录
					const recordPayload = {
						...this.recordForm,
						student_id: studentId
					}
					if (this.recordId) {
						await updateRecord(this.recordId, recordPayload)
					} else {
						await createRecord(recordPayload)
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
</style>