'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const project = event.project;
		await db.collection('project').add(project)
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