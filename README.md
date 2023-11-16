
<div align="center">

![logo](https://melecode.com/assets/img/brand/mlc_logo.png)

<p align="center">
	<a href="https://vitejs.dev/" target="_blank">
		<img src="https://img.shields.io/badge/Vite-4.x-green" alt="Vite">
	</a>
	<a href="https://v3.vuejs.org/" target="_blank">
		<img src="https://img.shields.io/badge/Vue.js-3.x-green" alt="Vue">
	</a>
	<a href="https://element-plus.gitee.io/#/zh-CN/component/changelog" target="_blank">
		<img src="https://img.shields.io/badge/element--plus-latest-blue" alt="element plus">
	</a>
</p>

<h1>MetaLowCode 企业级全栈低代码平台</h1>

</div>

## 介绍
美乐是一个低代码开发平台（快速开发框架），包含一个前端项目Meta LowCode和一个后端项目Meta Server，美乐致力于提升业务逻辑开发效率、减少软件开发中的非必要重复劳动。美乐为前端工程师提供强大的后端接口定制能力，美乐同样也为后端工程师提供开放、灵活的前端快速开发体验。

借助美乐低代码开发平台，<b>不需要设计数据库，几分钟之内即可完成提交表单和数据展示列表，完善的权限控制，可视化搭建的表单系统，自由定义的导航路由，简洁易懂的数据交互逻辑。</b>如果在半小时内完成了一个简单的客户/订单管理系统的搭建，请不要感到过分惊奇。

## 官网和演示

| 类型 | 链接 |
| -------- | -------- |
| 官网地址  | https://melecode.com/ |
| 演示地址  | http://117.50.194.75:8102/web/login  登录用户、密码：admin/admin|


## 亮点功能

- **元数据、表单设计** 通过需求分析，快速建立业务模型和逻辑关系，然后通过可视化拖拽方式完成表单设计。
- **审批流程设计** 建立可视化的审批流程，对企业各项单据进行流转处理，可以针对不同用户单独设置权限。
- **业务触发器** 针对业务模型（即实体）的各种触发事件，通过对触发器行为的精巧编排，即可实现比较复杂的业务逻辑。
- **报表设计引擎** 可视化报表设计，所见即所得，就像操作excel表格一样简单，可以实现高精度报表设计及打印需求。
- **数据导入** 从老的遗留业务系统导出数据，一键导入美乐低代码，支持字段映射，大幅节省系统迁移成本。


## 环境准备

| 环境                 | 名称版本                                                     | 备注                                                         |
| -------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| **开发工具**         | VSCode                                                       | [下载地址](https://code.visualstudio.com/Download)           |
| **运行环境**         | 1. Node 16 +       <br/> 2. npm 8.0 +                                             | [下载地址](http://nodejs.cn/download)                        |
| **VSCode插件(必装)** | 1. `Vue Language Features (Volar) ` <br/> 2. `Vetur`  | |



## 安装教程
``` sh
# 克隆项目
git clone https://gitee.com/meta_low_code/MetaLowCode.git

# 进入项目目录
cd MetaLowCode

# 安装依赖
npm i

# 启动项目(开发模式)
npm run dev

# 生产打包
npm run fast-build
```
启动完成后浏览器访问 http://localhost:8022
