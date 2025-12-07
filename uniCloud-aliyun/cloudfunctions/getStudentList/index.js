'use strict';

const db = uniCloud.database()

exports.main = async (event, context) => {
	// 获取传入参数
	const {
		page = 1, pageSize = 10, keyword = ''
	} = event;
	// 安全校验
	const pageNum = Math.max(1, parseInt(page) || 1);
	// 最大50条/页
	const size = Math.min(50, Math.max(1, parseInt(pageSize) || 10));
	const skip = (pageNum - 1) * size;
	try {
		// 示例：查询 user 表（集合）中的数据
		const collection = db.collection('student'); // 'user' 是集合名（自动创建）
		let whereCondition = {};
		if (keyword) {
			// i 表示忽略大小写
			const regExp = new RegExp(keyword, 'i');
			whereCondition = {
				title: db.command.regex({
					regexp: regExp
				})
			};
		}

		// 1. 查询总数量（用于分页）
		const countRes = await collection.where(whereCondition).count();
		const total = countRes.total;

		// 2. 查询当前页数据（按时间倒序）
		const dataRes = await collection
			.where(whereCondition)
			.orderBy('end_time', 'desc')
			.skip(skip)
			.limit(size)
			.get();

		return {
			code: 0,
			msg: 'success',
			data: {
				list: dataRes.data,
				total,
				page: pageNum,
				pageSize: size,
				totalPage: Math.ceil(total / size)
			}
		};
		return {
			code: 0,
			msg: 'success',
			data: res.data
		};
	} catch (err) {
		return {
			code: -1,
			msg: err.message
		};
	}
};