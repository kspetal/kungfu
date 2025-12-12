'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	try {
		const project = event.project;
		const projectRes = await db.collection('project').where({
			_id: project._id
		}).update(project);
		console.log("update project: " + JSON.stringify(projectRes))
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