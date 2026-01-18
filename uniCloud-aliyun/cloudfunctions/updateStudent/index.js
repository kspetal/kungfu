'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		let student = event.student;
		const id = student._id;
		delete student._id
		const studentRes = await db.collection('student').where({
			_id: id
		}).update(student);
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
