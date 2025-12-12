'use strict';

const db = uniCloud.database()

exports.main = async (event, context) => {
	try {
		const projectRes = await db.collection('project').where({
			_id: event.id
		}).get();
		
		if(projectRes.data && projectRes.data.length > 0) {
			return {
				code: 0,
				msg: 'success',
				data: projectRes.data[0]
			};
		} else {
			return {
				code: -1,
				msg: '项目不存在'
			};
		}
	} catch (err) {
		return {
			code: -1,
			msg: err.message
		};
	}
};