'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const studentRes = await db.collection('student').where({
			_id: id
		}).remove();
		console.log("remove stduent: " + JSON.stringify(studentRes))
		const recordRes = await db.collection('record').where({
			student_id: id
		}).remove();
		console.log("remove record: " + JSON.stringify(recordRes))
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
