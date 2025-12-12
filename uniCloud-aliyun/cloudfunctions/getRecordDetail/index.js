'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	const {
		id = ''
	} = event;
	if (id) {
		try {
			const recordRes = await db.collection('record').where({
				_id: id
			}).get();
			return {
				code: 0,
				msg: 'success',
				data: recordRes.code === 0 ? recordRes.data[0] : {},
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