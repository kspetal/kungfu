'use strict';

const {
	updateStudentInfo
} = require('util-common')

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const record = event.record;
		const id = record._id
		delete record._id
		await db.collection('record').where({
			_id: id
		}).update(record);
		setTimeout(() => {
			updateStudentInfo(record.student_id);
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
