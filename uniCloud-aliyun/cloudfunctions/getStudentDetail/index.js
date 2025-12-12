'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	const {
		id = ''
	} = event;
	if (id) {
		try {
			const studentRes = await db.collection('student').where({
				_id: id
			}).get();
			// const recordRes = await db.collection('record').where({
			// 	student_id: id
			// }).get();
			return {
				code: 0,
				msg: 'success',
				data: studentRes.code === 0 ? studentRes.data[0] : {},
			};
		} catch (err) {
			return {
				code: -1,
				msg: err.message
			};
		}
	}
	return {
		code: -1,
		msg: 'id不能为空'
	};
};