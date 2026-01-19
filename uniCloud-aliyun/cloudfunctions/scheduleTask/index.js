'use strict';

const db = uniCloud.databaseForJQL()
const dbCmd = db.command

exports.main = async (event, context) => {
	try {
		// 定时更新付费记录状态
		const totalStr = getTodayStr();
		const activeRecords = await db.collection('record').where({
			status: 1
		}).get();
		activeRecords.data.forEach((record) => {
			const endTime = record.end_time;
			if (endTime < totalStr) {
				console.log('记录已过期: ' + record._id)
				const id = record._id;
				record.status = 0;
				delete record._id
				await db.collection('record').where({
					_id: id
				}).update(record);
			}
		});
		// 定时更新暂停学生记录结束时间
		const pauseStudents = await db.collection('student').where({
			status: '暂停',
			start_time: dbCmd.lt(totalStr)
		}).get();
		pauseStudents.data.forEach((student) => {
			console.log('学生延期: ' + student.name)
			student.end_time = addOneDay(student.end_time);
			student.current_total_course_date = student.current_total_course_date + 1;
			const id = student._id
			delete student._id
			await db.collection('student').where({
				_id: id
			}).update(student);
		});
		return {
			code: 0,
			msg: 'success',
		};
	} catch (err) {
		return {
			code: -1,
			msg: err.message
		};
	}
};

function addOneDay(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);

  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');

  return `${newYear}-${newMonth}-${newDay}`;
}

function getTodayStr() {
	const today = new Date();
	const y = today.getFullYear();
	const m = String(today.getMonth() + 1).padStart(2, '0');
	const d = String(today.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}