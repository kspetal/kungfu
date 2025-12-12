'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const record = event.record;
		const recordRes = await db.collection('record').add(record)
		console("record add: " + JSON.stringify(recordRes))
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
