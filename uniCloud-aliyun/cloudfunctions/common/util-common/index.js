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
			const {
				_id,
				...updateData
			} = student;
			await db.collection('student').where({
				_id: _id
			}).update(updateData);
		}
		if(recordRes.data.length === 0) {
			student.current_project = "";
			student.current_total_course_date = 0;
			student.start_time = "";
			student.end_time = "";
			student.total_fee = 0;
			const {
				_id,
				...updateData
			} = student;
			await db.collection('student').where({
				_id: _id
			}).update(updateData);
		}
		console.log('后台任务完成');
	} catch (err) {
		console.error('后台任务出错:', err);
	}
}

function parseDateAsUTC(dateStr) {
	const [y, m, d] = dateStr.split('-').map(Number);
	return Date.UTC(y, m - 1, d); // UTC 时间戳，避免本地时区偏移
}

function getDaysBetween(startDateStr, endDateStr) {
	const start = parseDateAsUTC(startDateStr);
	const end = parseDateAsUTC(endDateStr);
	if (end < start) return 0; // 或交换，根据需求
	const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
	return diffDays;
}

// 同时建议 getTotalUniqueDays 也使用 UTC 方式解析，保持一致
function getTotalUniqueDays(periods) {
	if (!periods || periods.length === 0) return 0;

	const parseDateAsUTC = (str) => {
		const [y, m, d] = str.split('-').map(Number);
		return new Date(Date.UTC(y, m - 1, d));
	};

	let intervals = periods.map(p => ({
		start: parseDateAsUTC(p.start_time),
		end: parseDateAsUTC(p.end_time)
	})).sort((a, b) => a.start - b.start);

	const merged = [intervals[0]];

	for (let i = 1; i < intervals.length; i++) {
		const current = merged[merged.length - 1];
		const next = intervals[i];

		// 判断是否重叠或连续（当前结束 >= 下一个开始 - 1天）
		if (current.end >= new Date(next.start.getTime() - 24 * 60 * 60 * 1000)) {
			current.end = current.end > next.end ? current.end : next.end;
		} else {
			merged.push(next);
		}
	}

	let total = 0;
	const msPerDay = 1000 * 60 * 60 * 24;
	for (const { start, end } of merged) {
		const days = Math.floor((end - start) / msPerDay) + 1;
		total += days;
	}
	return total;
}

module.exports = {
	updateStudentInfo
}