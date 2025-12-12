'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const record = event.record;
		const recordRes = await db.collection('record').where({
			_id: record._id
		}).update(record);
		console.log("update record: " + JSON.stringify(recordRes))
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
