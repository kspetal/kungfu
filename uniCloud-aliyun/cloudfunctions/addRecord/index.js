'use strict';

const {
	updateStudentInfo
} = require('util-common')

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		let record = event.record;
		delete record._id
		const recordRes = await db.collection('record').add(record)
		setTimeout(() => {
			updateStudentInfo(record.student_id);
		}, 0);
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