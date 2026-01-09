'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const projectRes = await db.collection('project').where({
			_id: event.id
		}).remove();
		console.log("remove project: " + JSON.stringify(projectRes))
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
