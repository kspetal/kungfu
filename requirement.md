学生管理微信小程序（uni-app）开发文档

## 1. 项目概述
- 目标：为武馆/培训机构提供移动端学员管理工具，涵盖学员信息、课程进度、缴费记录及统计看板，支持学员增删改。
- 技术：uni-app（Vue 3 ），编译为微信小程序
- 运行环境：HBuilderX/VSCode + uni-app CLI，微信开发者工具预览调试。

## 2. 功能需求

### 2.1 学员信息管理
- 列表展示：头像、姓名、项目标签（瑜伽/私教课等）、状态标签（进行中/已完成）、课程剩余节数、到期日、已缴费用、进度条。
- 搜索与筛选：顶部搜索框按姓名/项目模糊查询，状态与项目筛选 Chips（全部、瑜伽、私教课、瑜伽大班、拳击课、普拉提）。
- 详情页/侧滑操作：点击学员卡片进入详情，展示个人资料表单字段（姓名、性别、年龄、出生年月、学校、家长电话、家长微信、住址）。
- 课程信息：项目、卡种、开始/截止日期、剩余课时、课时进度条。
- 付费信息：会员费、支付定金、总计金额、备注字段（两个）。
- 渠道来源：单选 1-5（路过看到、早晚知道、朋友介绍、网络活动、其他方式）。
- 增删改：新增学员悬浮按钮（底部右+号），表单校验；支持编辑、删除（长按/右上菜单）。

### 2.2 统计信息
- 数据统计页：
  - 总收入模块：显示实收金额（例 ¥2.5w），内含图标、标题、副标题。
  - 在读学员数：当前活跃人数。
  - 项目营收排行：列表展示项目及对应金额。
  - 即将到期提醒：30 天内到期学员列表，显示姓名、项目、到期日期，带警示图标。
- 数据来源：后台接口 `/stats/summary`、`/stats/revenue-rank`、`/stats/expiring`.
- 支持下拉刷新、自动刷新（进入页面触发）。

### 2.3 课程缴费记录
- 在学员详情页提供“缴费记录”子卡片，展示每笔记录：时间、项目、支付方式、金额、经办人、备注。
- 新增缴费：按钮弹出表单（项目、金额、支付方式、定金/全款、备注，支持上传票据图片）。
- 数据接口：`GET /students/{id}/payments`, `POST /students/{id}/payments`.

### 2.4 学员增删改
- 新增：FAB 按钮进入表单，字段覆盖个人资料 + 项目信息 + 付费信息 + 来源渠道。
- 编辑：详情页右上“···” -> 编辑；或列表侧滑编辑。
- 删除：详情页菜单或列表侧滑，二次确认。
- 校验：必填（姓名、项目、联系方式、开始/截止日期、费用）；金额/课时数字校验。
- 数据接口：`POST /students`, `PUT /students/{id}`, `DELETE /students/{id}`, `GET /students`.

## 3. 信息结构与数据模型

### 3.1 数据模型
```
Student {
  "bsonType": "object",
  "description": "学员信息",
  "required": [
    "name"
  ],
  "properties": {
    "_id": {
      "description": "ID，系统自动生成"
    },
    "name": {
      "description": "姓名"
    },
    "birth_date": {
      "description": "出生日期"
    },
    "gender": {
      "description": "性别"
    },
    "school": {
      "description": "学校名称"
    },
    "parent_phone": {
      "description": "家长电话"
    },
    "parent_wx": {
      "description": "家长微信"
    },
    "address": {
      "description": "家庭住址"
    },
    "avatar_url": {
      "description": "图像"
    },
    "source": {
      "description": "从何处得知的信息来源"
    },
    "status": {
      "description": "状态: 在学、暂停、已退学"
    },
    "create_time": {
      "description": "创建时间, 格式: yyyy-MM-dd HH:mm:ss"
    },
    "start_time": {
      "description": "开始时间, 格式: yyyy-MM-dd HH:mm:ss"
    },
    "end_time": {
      "description": "结束时间, 格式: yyyy-MM-dd HH:mm:ss"
    },
    "course_date": {
      "description": "学时时长"
    },
    "first_time": {
      "description": "第一次就读时间, 格式: yyyy-MM-dd HH:mm:ss"
    },
    "last_time": {
      "description": "最后一次就读时间, 格式: yyyy-MM-dd HH:mm:ss"
    }
  }
}

Record {
  "bsonType": "object",
  "required": [],
  "description": "学员缴费课程记录",
  "properties": {
    "_id": {
      "description": "ID，系统自动生成"
    },
    "student_id": {
      "description": "学生ID"
    },
    "project_name": {
      "description": "项目名称"
    },
    "status": {
      "description": "状态: 0-已过期, 1-生效中, 2-暂停中"
    },
    "card_type": {
      "description": "卡类型"
    },
    "start_time": {
      "description": "开始时间, 格式: yyyy-MM-dd HH:mm:ss"
    },
    "end_time": {
      "description": "结束时间, 格式: yyyy-MM-dd HH:mm:ss"
    },
    "deposit": {
      "description": "定金"
    },
    "total_fee": {
      "description": "总费用"
    },
    "create_time": {
      "description": "创建时间, 格式: yyyy-MM-dd HH:mm:ss"
    }
  }
}

Project {
  "bsonType": "object",
  "description": "课程项目列表",
  "required": [],
  "permission": {
    "read": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "properties": {
    "_id": {
      "description": "ID，系统自动生成"
    },
    "project_name": {
      "description": "项目名称"
    },
    "card_type": {
      "description": "卡类型"
    },
    "card_date": {
      "description": "卡时间"
    },
    "start_time": {
      "description": "开始时间"
    },
    "end_time": {
      "description": "结束时间"
    },
    "deposit": {
      "description": "定金"
    },
    "total_fee": {
      "description": "总费用"
    },
    "create_time": {
      "description": "创建时间, 格式: yyyy-MM-dd HH:mm:ss"
    },
    "status": {
      "description": "状态：1-可用，0-不可用"
    }
  }
}
```

### 3.2 API 约定
- 认证：基于小程序登录态（session_key + token），请求头 `Authorization: Bearer <token>`.
- 分页：`GET /students?page=1&pageSize=20&keyword=&project=&status=`.
- 统计：`GET /stats/summary` 返回 `{totalRevenue, activeStudents}`, `GET /stats/revenue-rank` 返回数组，`GET /stats/expiring?days=30`.

## 4. 界面与交互说明

### 4.1 学员管理页
- 顶部搜索框 + 筛选 Chips（左右滑动）。
- 学员卡片：
  - 左侧头像、姓名；项目标签（圆角）；状态标签（绿色“进行中”，灰色“已完成”）。
  - 中间：金额、到期日。
  - 底部：`课时进度`标题，进度条（剩余/总计数）。
  - 右上“···”弹出操作：查看、编辑、删除。
- FAB（蓝色 +）固定右下角。
- 底部 Tab：`学员管理`、`数据统计`.

### 4.2 数据统计页
- 上部卡片网格：总收入（蓝色背景）、在读学员（白色卡片）。
- 项目营收排行：序号 + 名称 + 金额。
- 即将到期提醒：浅橙卡片，含头像、姓名、项目、到期日标签。

### 4.3 学员表单
- 按“个人资料”“项目信息”“付费资料”分段折叠。
- 来源渠道为单选组合；备注文本域。
- 支持附件上传（拍照/相册）保存到云存储。

### 4.4 缴费记录
- 列表支持时间轴样式；每条记录可点击查看详情/编辑/删除。
- 添加缴费弹出层（`<u-popup>`）或独立页面。


## 6. 交互流程

1. **进入学员管理页**：调用 `/students` 拉取列表 -> Pinia 存储 -> 渲染卡片。
2. **搜索/筛选**：更新查询参数 -> 重新请求。
3. **新增学员**：点击 FAB -> 跳转表单 -> 填写并提交 -> `POST /students` -> 返回列表刷新。
4. **编辑/删除**：在列表或详情触发 -> 打开表单或确认 -> `PUT/DELETE`.
5. **查看统计**：切换 Tab -> 并行调用统计接口 -> 渲染卡片、排行、提醒。
6. **缴费记录**：详情页加载 `GET /students/{id}/payments` -> 显示；新增记录 -> `POST`.

## 7. 权限与安全
- 小程序登录获取 `openid`，与后台账号绑定。
- 操作日志：新增/编辑/删除/缴费记录写入日志表便于审计。
- 数据校验：前端校验 + 后端兜底（金额正数、日期顺序、课时≥剩余）。

## 8. 测试计划
- 单元测试：对数据处理、进度计算函数进行 Jest 测试。
- 接口联调：确保 CRUD、统计、缴费接口状态码及返回结构一致。
- UI 测试：视觉检查卡片、进度条颜色、Tab 切换。
- 边界：无学员、筛选无结果、缴费记录为空、即将到期列表为空。
- 性能：列表分页加载、懒加载头像。

## 9. 部署与发布
- 使用 HBuilderX 打包微信小程序。
- 微信开发者工具上传、设置体验版测试，确认通过后提交审核上线。
- 后端部署需支持 HTTPS（微信小程序要求）。

## 10. 后续扩展
- 消息提醒：到期学员触发模板消息。
- 打卡签到、课时消耗自动更新。
- 统计页添加图表（ECharts）展示趋势。

完成以上文档后，即可按结构实现 uni-app 项目并联调后台接口。