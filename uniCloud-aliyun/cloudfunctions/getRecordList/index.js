'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	const {
		page = 1, pageSize = 5, student_id = ''
	} = event;
	// 安全校验
	const pageNum = Math.max(1, parseInt(page) || 1);
	const size = Math.min(10, Math.max(1, parseInt(pageSize) || 10));
	const skip = (pageNum - 1) * size;
	if (student_id) {
		try {
			// 先查询总数
			const countRes = await db.collection('record')
				.where({
					student_id: student_id
				})
				.count();
			
			const total = countRes.total;
			
			// 再查询当前页数据
			const recordRes = await db.collection('record')
				.where({
					student_id: student_id
				})
				.orderBy('start_time', 'desc')
				.skip(skip)
				.limit(size)
				.get();
				
			return {
				code: 0,
				msg: 'success',
				data: recordRes.code === 0 ? recordRes.data : [],
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
	}
	return {
		code: -1,
		msg: 'id不能为空'
	};
};