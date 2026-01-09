'use strict';
exports.main = async (event, context) => {
	try {
		let student = event.student;
		delete student._id
		const studentRes = await db.collection('student').where({
			_id: student._id
		}).update(student);
		// console.log("update student: " + JSON.stringify(studentRes))
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
