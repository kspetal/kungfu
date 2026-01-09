'use strict';

const {
	updateStudentInfo
} = require('util-common')

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const recordRes = await db.collection('record').where({
			_id: event.id
		}).remove();
		console.log("id: " + event.id)
		console.log(recordRes)
		setTimeout(() => {
			updateStudentInfo(event.student_id);
		}, 0);
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
