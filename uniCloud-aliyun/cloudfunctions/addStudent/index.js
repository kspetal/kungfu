'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const student = event.student
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		student.first_time = `${year}-${month}-${day}`
		const studentRes = await db.collection('student').add(student)
		// console("student add: " + JSON.stringify(studentRes))
		return {
			code: 0,
			msg: 'success'
		};
	} catch (err) {
		return {
			code: -1,
			msg: err.message
		};
	}
};