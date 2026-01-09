const db = uniCloud.databaseForJQL()

async function updateStudentInfo(student_id) {
	try {
		const recordRes = await db.collection('record').where({
				student_id: student_id,
			})
			.orderBy('start_time', 'desc')
			.get();
		const studentRes = await db.collection('student').where({
			_id: student_id
		}).get();
		const student = studentRes.data[0];
		if (recordRes && recordRes.data) {
			const records = recordRes.data;
			const activeRecords = records.filter(item => item.status === 1);
			if (activeRecords.length > 0) {
				// 获取最早的 start（最小值）
				const earliestStart = activeRecords.reduce((min, item) =>
					item.start_time < min ? item.start_time : min,
					activeRecords[0]?.start_time || ""
				);
				// 获取最晚的 end（最大值）
				const latestEnd = activeRecords.reduce((max, item) =>
					item.end_time > max ? item.end_time : max,
					activeRecords[0]?.end_time || ""
				);
				student.current_project = activeRecords[0].project_name;
				student.current_total_course_date = getDaysBetween(earliestStart, latestEnd);
				student.start_time = earliestStart;
				student.end_time = latestEnd;
			}
			if (records.length > 0) {
				student.total_study_date = getTotalUniqueDays(records);
				let totalFee = 0;
				let firstDay = "3090-01-01";
				for (let i = 0; i < records.length; i++) {
					totalFee = Number(totalFee) + Number(records[i].total_fee);
					if (records[i].start_time < firstDay) {
						firstDay = records[i].start_time;
					}
				}
				student.first_time = firstDay;
				student.total_fee = totalFee;
			}
			const { _id, ...updateData } = student;
			await db.collection('student').where({
				_id: _id
			}).update(updateData);
		}
		console.log('后台任务完成');
	} catch (err) {
		console.error('后台任务出错:', err);
	}
}

function getDaysBetween(startDateStr, endDateStr) {
	const startDate = new Date(startDateStr);
	const endDate = new Date(endDateStr);
	const diffTime = Math.abs(endDate - startDate);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

function getTotalUniqueDays(periods) {
	if (!periods || periods.length === 0) return 0;

	// 工具函数：解析 yyyy-MM-dd 为 Date（本地时间）
	const parseDate = (str) => {
		const [y, m, d] = str.split('-').map(Number);
		return new Date(y, m - 1, d);
	};

	// 转为 { start: Date, end: Date } 并排序
	let intervals = periods.map(p => ({
		start: parseDate(p.start_time),
		end: parseDate(p.end_time)
	})).sort((a, b) => a.start - b.start);

	// 合并重叠区间
	const merged = [];
	let current = intervals[0];

	for (let i = 1; i < intervals.length; i++) {
		if (intervals[i].start <= new Date(current.end.getTime() + 24 * 60 * 60 * 1000)) {
			// 重叠或相邻（+1天判断是否连续）
			current.end = current.end > intervals[i].end ? current.end : intervals[i].end;
		} else {
			merged.push(current);
			current = intervals[i];
		}
	}
	merged.push(current);
	// 计算总天数（每个区间：end - start 的天数 + 1）
	let totalDays = 0;
	for (const interval of merged) {
		const diffTime = interval.end - interval.start;
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		// 包含起止日
		totalDays += diffDays + 1;
	}

	return totalDays;
}

module.exports = {
	updateStudentInfo
}