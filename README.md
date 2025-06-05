# Hyacinth Frontend

一个基于 Vue 3 + TypeScript + Farm 构建的现代化前端应用，为 Hyacinth 项目提供用户界面。

## 🚀 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Farm
- **UI 框架**: Naive UI
- **路由**: Vue Router 4
- **图表**: ECharts + Vue-ECharts
- **HTTP 客户端**: Axios
- **测试**: Vitest + JSDOM
- **包管理**: Bun

## 📦 项目结构

```
src/
├── api/           # API 接口定义
├── assets/        # 静态资源
├── components/    # 公共组件
├── router/        # 路由配置
├── views/         # 页面视图
├── test/          # 测试文件
├── App.vue        # 根组件
└── index.ts       # 应用入口
```

## 🛠️ 开发环境设置

### 前置要求

- Node.js >= 16
- Bun >= 1.0

### 安装依赖

```bash
bun install
```

## 🚀 快速开始

### 启动开发服务器

```bash
bun run dev
```

服务器将在 `http://localhost:9000` 启动

### 生产构建

```bash
bun run build
```

### 预览生产构建

```bash
bun run preview
```

### 清理缓存

```bash
bun run clean
```

## 🧪 测试

### 运行测试

```bash
bun run test
```

### 生成测试覆盖率报告

```bash
bun run coverage
```

## 📱 功能特性

- 🔐 用户认证 (登录/注册)
- 📊 流量监控仪表板
- 👤 用户管理面板
- 📈 实时数据图表
- 📱 响应式设计
- 🌙 现代化 UI 界面

## 🔧 配置

项目配置文件位于根目录：

- `farm.config.ts` - Farm 构建配置
- `tsconfig.json` - TypeScript 配置
- `vitest.config.ts` - 测试配置

## 🤝 开发指南

### API 集成

API 接口定义在 `src/api/` 目录下：

- `auth.ts` - 认证相关接口
- `service.ts` - 服务管理接口
- `vnet.ts` - 虚拟网络接口
- `request.ts` - HTTP 请求封装

### 组件开发

- 公共组件放在 `src/components/`
- 页面组件放在 `src/views/`
- 使用 Naive UI 组件库
- 遵循 Vue 3 Composition API 风格

### 样式规范

- 使用 Scoped CSS
- 支持 TypeScript 类型检查
- 遵循响应式设计原则

## 📄 许可证

本项目采用 MIT 许可证。

## 🔗 相关链接

- [Farm 文档](https://farmfe.org/)
- [Vue 3 文档](https://vuejs.org/)
- [Naive UI 文档](https://naiveui.com/)
- [Hyacinth Backend](https://github.com/hyacinth-dev/hyacinth-backend)
