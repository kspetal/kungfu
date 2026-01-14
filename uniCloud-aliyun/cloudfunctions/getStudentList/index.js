'use strict';

const db = uniCloud.databaseForJQL()

exports.main = async (event, context) => {
	// 获取传入参数
	const {
		page = 1, pageSize = 10, keyword = '', state = ''
	} = event;
	// 安全校验
	const pageNum = Math.max(1, parseInt(page) || 1);
	// 最大30条/页
	const size = Math.min(30, Math.max(1, parseInt(pageSize) || 10));
	const skip = (pageNum - 1) * size;
	try {
		// 查询student表中的数据
		const collection = db.collection('student');
		const cmd = db.command;
		// 组合查询条件
		const conditions = [];
		if (state) {
			conditions.push({
				status: state
			});
		}
		if (keyword && keyword.trim()) {
			const reg = new RegExp(keyword.trim(), 'i'); // 忽略大小写
			conditions.push(cmd.or([{
					name: reg
				},
				{
					current_project: reg
				}
			]));
		}

		const whereCondition = conditions.length ? cmd.and(conditions) : {};
		// 1. 查询总数量（用于分页）
		const countRes = await collection.where(whereCondition).count();
		const total = countRes.total;

		// 2. 查询当前页数据（按时间倒序）
		const dataRes = await collection
			.where(whereCondition)
			.orderBy('first_time', 'asc')
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
	} catch (err) {
		return {
			code: -1,
			msg: err.message
		};
	}
};