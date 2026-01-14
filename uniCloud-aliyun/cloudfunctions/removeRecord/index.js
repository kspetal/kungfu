'use strict';

const {
	updateStudentInfo
} = require('util-common')

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		let student_id = event.student_id;
		let id = event.id;
		if(student_id && !id) {
			const recordRes = await db.collection('record').where({
				student_id: student_id
			}).remove();
		} else {
			const recordRes = await db.collection('record').where({
				_id: event.id
			}).remove();
			setTimeout(() => {
				updateStudentInfo(event.student_id);
			}, 0);
		}
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
