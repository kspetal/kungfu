'use strict';

const db = uniCloud.databaseForJQL()
const dbCmd = db.command

exports.main = async (event, context) => {
	const expirationDate = getElevenDaysAgo();
	const studentList = await db.collection('student').where({
		end_time: dbCmd.lt(expirationDate),
		status: '在学'
	}).get();
	console.log(studentList)
	return {
		code: 0,
		msg: 'success',
		data: studentList.data
	};
};

function getElevenDaysAgo() {
	const date = new Date();
	date.setDate(date.getDate() + 11);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}