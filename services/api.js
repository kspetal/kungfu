// // 简单封装 uni.request，方便后续替换为真实后端地址
// const BASE_URL = 'https://example.com' // TODO: 替换为真实后端域名

// function request(options) {
//   const { url, method = 'GET', data = {} } = options
//   return new Promise((resolve, reject) => {
//     uni.request({
//       url: BASE_URL + url,
//       method,
//       data,
//       header: {
//         'Content-Type': 'application/json',
//         // Authorization: `Bearer ${token}` // 可从本地存储或登录态中获取
//       },
//       success(res) {
//         if (res.statusCode >= 200 && res.statusCode < 300) {
//           resolve(res.data)
//         } else {
//           reject(res)
//         }
//       },
//       fail(err) {
//         reject(err)
//       }
//     })
//   })
// }

// export function fetchStudents(params) {
//   return request({
//     url: '/students',
//     method: 'GET',
//     data: params
//   })
// }

// export function fetchStatsSummary() {
//   return request({
//     url: '/stats/summary',
//     method: 'GET'
//   })
// }

// export function fetchRevenueRank() {
//   return request({
//     url: '/stats/revenue-rank',
//     method: 'GET'
//   })
// }

// export function fetchExpiringStudents(days = 30) {
//   return request({
//     url: '/stats/expiring',
//     method: 'GET',
//     data: { days }
//   })
// }

// export function fetchStudentPayments(id) {
//   return request({
//     url: `/students/${id}/payments`,
//     method: 'GET'
//   })
// }

// export function createStudent(data) {
//   return request({
//     url: '/students',
//     method: 'POST',
//     data
//   })
// }

// export function updateStudent(id, data) {
//   return request({
//     url: `/students/${id}`,
//     method: 'PUT',
//     data
//   })
// }

// export function deleteStudent(id) {
//   return request({
//     url: `/students/${id}`,
//     method: 'DELETE'
//   })
// }

// export function createPayment(id, data) {
//   return request({
//     url: `/students/${id}/payments`,
//     method: 'POST',
//     data
//   })
// }

// // 课程记录相关接口
// export function fetchStudentRecords(studentId) {
//   return request({
//     url: `/students/${studentId}/records`,
//     method: 'GET'
//   })
// }

// export function createRecord(data) {
//   return request({
//     url: '/records',
//     method: 'POST',
//     data
//   })
// }

// export function updateRecord(id, data) {
//   return request({
//     url: `/records/${id}`,
//     method: 'PUT',
//     data
//   })
// }


