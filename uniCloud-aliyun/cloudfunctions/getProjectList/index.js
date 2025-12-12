'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	const {
		page = 1, pageSize = 10, keyword = ''
	} = event;
	// 安全校验
	const pageNum = Math.max(1, parseInt(page) || 1);
	const size = Math.min(10, Math.max(1, parseInt(pageSize) || 10));
	const skip = (pageNum - 1) * size;
	try {
		const conditions = [];
		const cmd = db.command;
		if (keyword && keyword.trim()) {
			const reg = new RegExp(keyword.trim(), 'i'); // 忽略大小写
			conditions.push({
				name: reg
			});
		}
		const whereCondition = conditions.length ? cmd.and(conditions) : {};
		// 先查询总数
		const countRes = await db.collection('project')
			.where(whereCondition)
			.count();

		const total = countRes.total;

		// 再查询当前页数据
		const projectRes = await db.collection('project')
			.where(whereCondition)
			.orderBy('start_time', 'desc')
			.skip(skip)
			.limit(size)
			.get();

		return {
			code: 0,
			msg: 'success',
			data: projectRes.code === 0 ? projectRes.data : [],
			total: total,
			page: pageNum,
			pageSize: size,
			hasMore: skip + size < total
		};
	} catch (err) {
		return {
			code: -1,
			msg: err.message
		};
	}
};