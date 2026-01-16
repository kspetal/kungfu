'use strict';

const db = uniCloud.databaseForJQL();
const dbCmd = db.command

exports.main = async (event, context) => {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);

	const totalFeeRes = await db.collection('record').where({
			start_time: dbCmd.gte(yearStart)
		})
		.field('sum(total_fee) as totalFee')
		.get();

	const countRes = await db.collection('student').where({
		status: '在学'
	}).count();

	const sourceRes = await db.collection('student').groupBy('source as name').groupField('count(*) as value').get()
	return {
		code: 0,
		msg: 'success',
		data: {
			totalFee: totalFeeRes.data.reduce((acc, item) => acc + (item.totalFee || 0), 0),
			studentCount: countRes.total || 0,
			source: sourceRes.data
		}
	};
};