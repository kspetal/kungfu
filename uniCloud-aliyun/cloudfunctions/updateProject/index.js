'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		let project = event.project;
		const id = project._id
		delete project._id
		const projectRes = await db.collection('project').where({
			_id: id
		}).update(project);
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