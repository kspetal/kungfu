'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const student = event.student;
		const studentRes = await db.collection('student').add(student)
		console("student add: " + JSON.stringify(studentRes))
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
