# 演示视频 — 完整演讲稿（中文版）

**PROG2002 Assessment 2 — Charity Events（Common Ground Collective）**
**学生：** Zhiming Wei — 24832847
时间硬上限：**15 分钟**。目标：**13:30–14:00**，留出安全余量。
本文件是中文版，便于你理解和排练。正式录制时建议使用英文朗读——作业和评分标准都是英文，英文旁白更稳妥。以 `【屏幕】` 开头的行是舞台提示，不要朗读。

---

## 0. 开始录制前（约 10 分钟准备）

按以下顺序打开所有内容，然后完整排练一遍点击流程。

1. **MySQL** 已启动、数据库已导入。确认：`SELECT COUNT(*) FROM events;` → 12。
2. **API** 已启动：在 `api/` 目录运行 `npm start` → `Charity Events API listening on http://localhost:3000`。保持这个窗口打开。
3. **客户端** 已启动：在第二个窗口、项目根目录运行 `py -m http.server 5500`（或 `python -m http.server 5500`）。保持打开。
4. **浏览器标签页，按此顺序**，方便用 `Ctrl+Tab` 切换：
   1. `http://localhost:5500/index.html`
   2. `http://localhost:5500/search.html`
   3. `http://localhost:5500/event.html?id=3`
   4. `http://localhost:3000/api/events/search?scope=upcoming&sort=date_asc&page=1&limit=12`（原始 JSON）
5. **编辑器标签页：** `api/database/schema.sql`、`api/src/routes/events.js`、`api/src/utils/eventSql.js`、`clientside/js/api.js`、`clientside/js/search.js`。
6. 把浏览器缩放调到约 125%，编辑器字号调大，保证视频里文字清晰可读。
7. 静音通知，关闭聊天软件，关闭任何显示个人数据或 `.env` 密码的窗口。
8. 先录 10 秒测试麦克风音量，然后删掉这段测试。

---

## 1. 分段脚本

### 第 1 段 — 开场介绍（0:00 – 0:50）

`【屏幕】` 先在文件资源管理器中显示 `charity-events-submission` 文件夹，然后切到正在运行的主页。

朗读：

> “大家好，我叫 Zhiming Wei，学号 24832847。这是我 PROG2002 Assessment 2 的提交，对应 Charity Events 案例。网站名称是 Common Ground Collective。
>
> 整个方案分为三部分：一个名为 charityevents_db 的 MySQL 数据库；一个只提供只读 GET 接口的 NodeJS + ExpressJS REST API；以及一个用纯 HTML、CSS 和 JavaScript 编写、不使用任何框架的客户端。
>
> 接下来十四分钟，我会介绍数据库与 API 设计、API 与网站之间的数据流，然后现场演示主页、搜索页和活动详情页——包括筛选和表单验证。”

---

### 第 2 段 — 架构总览（0:50 – 2:00）

`【屏幕】` 滚动 README 的 “What is included” 表格，然后展示文件夹结构：`api/`、`clientside/`、`docs/`。

朗读：

> “这个项目是经典的三层架构。MySQL 数据库负责存储数据；Express API 读取数据并返回 JSON；浏览器客户端用 fetch() 调用 API，再把结果渲染到 DOM 中。
>
> api 文件夹包含服务器、数据库连接模块、SQL 脚本、路由处理器和自动化测试。clientside 文件夹包含三个页面——主页、搜索页和活动详情页——以及共用的 CSS 和 JavaScript。项目没有视图引擎、没有模板：Express 只返回 JSON，所有页面都由浏览器根据 JSON 自行构建。”
### 第 3 段 — 数据库设计（2:00 – 4:30）

`【屏幕】` 打开 `api/database/schema.sql`，然后打开 MySQL 命令行。

操作：
1. 滚动展示五条 `CREATE TABLE` 语句。
2. 运行 `USE charityevents_db; SHOW TABLES; DESCRIBE events;`。
3. 一边讲一边指向外键、CHECK 约束和索引。

朗读：

> “表结构被规范化为五张表。organisations 是举办活动的慈善机构；categories 用于分类；venues 保存实体地点；events 是核心表；event_highlights 保存详情页上显示的要点。
>
> events 有三个外键——分别指向 organisations、categories 和 venues——所以一条活动记录不可能引用不存在的机构、分类或场地。它还有 CHECK 约束：结束日期必须晚于开始日期，票价和已筹金额不能为负数，筹款目标必须大于零。这些规则由数据库本身强制执行，而不是只靠应用层，因此即使以后有别的程序写入数据库，也无法存进非法数据。
>
> status 列使用受控词表——draft、published、suspended 或 cancelled。正是这个字段让网站能够隐藏那条被暂停的示例活动。
>
> 在性能方面，我为 start_datetime 加上 status 建了索引，并为 category_id、organisation_id 和 venue_id 建了索引。这些正是主页和搜索查询用来筛选和连接的字段。
>
> 种子文件导入了 4 家机构、8 个分类、10 个场地、12 场活动以及 33 条要点，其中包含已结束、即将开始、免费、收费以及一场被暂停的活动，方便演示每一条规则。”

---

### 第 4 段 — REST API 设计（4:30 – 6:30）

`【屏幕】` 打开 `api/src/routes/events.js`，然后切到原始 JSON 标签页并发出一次真实请求。

操作：
1. 展示四个 GET 路由：`/upcoming`、`/search`、`/:eventId`，以及 categories/locations 接口。
2. 在浏览器中打开 `http://localhost:3000/api/events/search?scope=upcoming&sort=date_asc&page=1&limit=12`。
3. 指向 JSON 外层结构：`{ "data": [...], "meta": {...} }`。

朗读：

> “API 刻意做得小而只读。每一个路由都是 GET。代码中没有任何 POST、PUT、PATCH 或 DELETE，因为题目只要求网站展示数据，报名功能是刻意不实现的。
>
> 主接口是 GET /api/events/search。它接受日期、地点、一个或多个分类 slug、upcoming / past / all 的时间范围、排序字段，以及用于分页的 page 和 limit。此外还有主页用的 /api/events/upcoming、详情页用的 /api/events/:id，以及填充搜索筛选器的 /api/categories 和 /api/locations。
>
> 所有响应都使用同一个外层结构——一个 data 字段和一个 meta 字段——这样无论成功还是失败，客户端都知道该去哪里取数据。校验在查询之前执行：日期格式错误返回 HTTP 400；未发布或被暂停的活动返回 HTTP 404。只有状态为 published 的活动才会被返回。
>
> 所有 SQL 都使用参数化查询。查询构建器把筛选值收集到数组中，再传给 mysql2 的 execute()，用户输入永远不会被拼接进 SQL 字符串。这样就堵死了 SQL 注入的入口。”
---

### 第 5 段 — 从点击到屏幕的数据流（6:30 – 8:15）

`【屏幕】` 依次打开 `clientside/js/search.js`、`clientside/js/api.js`、`api/src/routes/events.js`、`api/src/utils/eventSql.js`。

朗读：

> “这是端到端的数据流。在搜索页上，用户填写筛选条件并提交表单。搜索控制器先读取表单值并在浏览器端校验。如果日期不完整，或者时间范围是 Upcoming 而日期却在过去，页面会在字段旁显示提示并停下——不会发出请求。
>
> 如果输入有效，控制器就调用共享的 API 封装。这个封装负责拼接查询字符串，并对 API 基础地址调用 fetch()——这是客户端里唯一可配置的值。
>
> 在服务器端，Express 匹配路由，校验层再次检查日期、时间范围、排序字段、分页和分类 slug——同样的规则要再查一遍，因为客户端永远不可信。随后查询构建器组装出参数化 SQL 语句，服务层通过 mysql2 执行，Express 把 JSON 外层结构发回。
>
> 响应到达后，客户端先检查错误，再用共享的卡片组件把每场活动渲染到 DOM 中，更新结果计数，并把筛选条件写进 URL，这样这次搜索可以被收藏或分享。服务器返回的内容不会用 innerHTML 直接渲染——浏览器自己构建元素，这既安全又不需要框架。”

---

### 第 6 段 — 现场演示（8:15 – 12:30）

`【屏幕】` 所有操作都在浏览器中完成。按下面的顺序进行。

#### 6.1 主页（8:15 – 9:05）— 标签页 1

操作：
1. 展示顶部横幅和实时的“即将开始活动”数量。
2. 滚动展示使命介绍部分，然后向下滚动到实时活动网格。
3. 指向 “Good intentions deserve good evidence” 部分，这里解释了进度条。

朗读：

> “这是主页。即将开始活动的数量和活动卡片都是从 GET /api/events/upcoming 实时加载的——不是写死的。每张卡片显示分类、日期、场地和价格，网站永远不会显示被暂停或取消的活动。使命部分介绍了这些活动支持的本地项目，再往下 ‘good evidence’ 部分解释了每个活动页面上目标与进度条是怎么工作的。”

#### 6.2 搜索页 — 筛选（9:05 – 10:35）— 标签页 2

操作：
1. 日期留空，选择一个地点（例如 Surry Hills），勾选两个分类，点击 Show matching events。
2. 指向结果数量和当前生效的筛选标签。
3. 更改排序方式，展示结果重新排序。
4. 点击 **Clear filters**。

朗读：

> “在搜索页上，我可以按日期、地点和多个分类筛选。分类之间是 OR 逻辑，只要活动属于任意一个选中分类就算匹配。结果就地更新，数量随之更新，所选筛选条件会写进 URL，所以这次搜索可以分享或收藏。
>
> 我还可以更改排序——例如按日期或按已筹金额。而 Clear filters 会把表单、结果和 URL 全部重置回初始状态。”

#### 6.3 搜索页 — 表单验证（10:35 – 11:15）— 标签页 2（题目要求）

操作：
1. 保持时间范围为 **Upcoming**。
2. 选择一个过去的 **日、月、年**（例如去年）。
3. 点击 **Show matching events**，指向日期字段旁的行内错误提示：
   `Choose today or a future date, or switch the time range to past events.`
4. 把时间范围切换到 **Past**，再次点击 Show matching events，展示同一个日期现在可以通过。

朗读：

> “校验在前后两端都会执行。这里时间范围是 Upcoming，但我选了一个过去的日期。页面会在日期字段旁显示错误，并且不发送请求。如果我把时间范围切换到 past events，同一个日期就变得有效，搜索正常执行。同样的规则会在服务器端再次检查，非法输入返回 HTTP 400，所以客户端永远无法绕过校验。”

#### 6.4 活动详情页（11:15 – 12:30）— 标签页 3

操作：
1. 从搜索结果中打开一个活动（或直接访问 `event.html?id=3`）。
2. 滚动完整记录：描述、时间安排、场地、要点、容量、价格，以及目标与进度对比条。
3. 打开一个 **免费** 活动，指向 “Free” 字样。
4. 点击 **Register**，展示弹窗文字。
5. 访问 `event.html?id=11`，展示未找到提示。

朗读：

> “点击活动卡片会打开它的详情页。页面从查询字符串中读取活动 ID——并带有 localStorage 兜底——然后获取这一场活动，所以这是真正的动态页面，不是静态页面。
>
> 这里是完整描述、时间安排、带地址的场地、要点列表、容量和价格。这个进度条把已筹金额与目标对比，进度一目了然。免费活动会显示 Free 而不是价格。
>
> 点击 Register 会弹出这个对话框，文字正是题目要求的内容：This feature is currently under construction. 什么都不会发送到服务器，因为 API 没有任何写入接口。
>
> 最后，编号 11 的活动就是那条被暂停的示例。API 会排除所有非 published 的活动，所以详情页正确地显示未找到提示。”
---

### 第 7 段 — 代码质量与收尾（12:30 – 13:45）

`【屏幕】` 在编辑器中展示一段 JSDoc 注释块，然后打开 GitHub 的提交历史页面。

朗读：

> “最后说说代码质量：每个文件都有 JSDoc 头注释，说明它的职责；不直观的逻辑——比如搜索查询构建器里的 OR 分组——都写了注释解释原因，而不只是把代码复述一遍。
>
> 自动化测试覆盖了校验规则和查询构建器：参数绑定的顺序、OR 分类分组、时间范围子句以及分页。
>
> 在 GitHub 上，工作是逐步提交的——先是脚手架，然后是表结构、种子数据、搜索接口、其余接口、页面、测试和文档——每条提交信息都说明了改了什么。
>
> 回顾这三个问题：数据库经过规范化，并用键和 CHECK 约束自我保证完整性；API 通过参数化、只读的 REST 接口提供数据，并带有校验和分页。数据从表单出发，经过客户端校验，进入 fetch 调用，再经过服务器校验和预处理语句，最后以 JSON 返回并渲染进 DOM。现场演示展示了主页、搜索页和详情页，包括筛选、校验、Clear filters 和 Register 弹窗。
>
> 感谢观看。”

---

## 2. 时间分配总表

| 段落 | 时间窗 | 时长 | 内容 |
| --- | --- | --- | --- |
| 1. 开场介绍 | 0:00 – 0:50 | 0:50 | 整体定位 |
| 2. 架构总览 | 0:50 – 2:00 | 1:10 | 项目结构 |
| 3. 数据库设计 | 2:00 – 4:30 | 2:30 | 问题 1（数据库） |
| 4. REST API 设计 | 4:30 – 6:30 | 2:00 | 问题 1（API） |
| 5. 数据流 | 6:30 – 8:15 | 1:45 | 问题 2 |
| 6. 现场演示 | 8:15 – 12:30 | 4:15 | 问题 3 |
| 7. 代码质量与收尾 | 12:30 – 13:45 | 1:15 | 总结 |
| **合计** | | **13:45** | 覆盖三个问题 |

### 如果时间超出

1. 第 4 段：删掉 categories/locations 那一句（约 −20 秒）。
2. 第 5 段：把服务器端步骤压缩成一句话（约 −30 秒）。
3. 第 6.4 段：跳过免费活动那一步（约 −20 秒）。

**绝对不能删** 搜索校验演示（6.3）和 Register 弹窗（6.4）——这两项是明确要求的。

---

## 3. 必须在屏幕上展示的内容（检查清单）

**数据库（第 3 段）**
- [ ] `schema.sql` 中的五条 `CREATE TABLE` 语句
- [ ] `events` 表中的外键、CHECK 约束和索引
- [ ] MySQL 命令行中的 `SHOW TABLES;` 和 `DESCRIBE events;`
- [ ] 种子数据数量：12 场活动、8 个分类

**API（第 4 段）**
- [ ] `api/src/routes/events.js`，展示只有 GET 路由
- [ ] 浏览器中的实时 JSON 响应（`/api/events/search?...`）
- [ ] `{ data, meta }` 外层结构
- [ ] `eventSql.js` 中的参数化查询

**数据流（第 5 段）**
- [ ] `clientside/js/search.js`（客户端校验 + fetch）
- [ ] `clientside/js/api.js`（fetch 封装）
- [ ] `api/src/routes/events.js` 和 `eventSql.js`（服务器校验 + SQL）

**现场演示（第 6 段）**
- [ ] 主页从 API 加载活动
- [ ] 搜索按日期、地点和多个分类筛选
- [ ] 排序和 **Clear filters**
- [ ] **校验错误**：时间范围为 Upcoming 时选择过去的日期 ← 要求项
- [ ] 活动详情页：描述、时间安排、场地、要点、价格、进度条
- [ ] 免费活动显示 “Free” 字样
- [ ] **Register 弹窗**：`This feature is currently under construction.` ← 要求项
- [ ] 被暂停的活动（`event.html?id=11`）返回未找到

**收尾（第 7 段）**
- [ ] 一段 JSDoc 头注释，以及 GitHub 提交历史

**不要展示** `node_modules/`、你的 `.env` 文件或密码，以及任何个人信息。

---

## 4. 上传与分享视频

1. 导出为 **MP4**、H.264、1080p、时长不超过 15 分钟。
2. 上传到你的 SCU OneDrive（`PROG2002/Assessment 2`）。
3. 右键 → **Share** → **Anyone with the link can view**。把编辑权限关掉。
4. 用无痕/隐私窗口打开链接，确认无需登录即可播放。
5. 把链接粘贴到报告封面页的 `[Paste the SCU OneDrive share link before submission]` 处，以及提交表单中。

### 如果老师无法播放

- 确认权限是 **Anyone with the link**，而不是 “People in your organisation”。
- 确认上传已经完成——不完整的文件能显示但无法流式播放。
- 在一台未登录任何 Microsoft 账号的设备上再测试一次。
