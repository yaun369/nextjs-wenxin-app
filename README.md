# 🔮 AI 性格分析师

一个基于文心 5.0 多模态大模型的 AI 性格分析 Web 应用，通过分析用户的头像和昵称来解读性格特征和喜好。

## ✨ 功能特性

- 📷 **头像上传** - 支持 JPG、PNG、GIF、WebP 格式，最大 5MB
- ✏️ **昵称输入** - 支持最多 20 个字符的昵称
- 🤖 **AI 分析** - 使用文心 5.0 多模态大模型进行性格分析
- 🌊 **流式输出** - 实时显示 AI 分析结果，体验更流畅
- 🎨 **精美 UI** - 响应式设计，支持深色模式

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入你的文心大模型 API Key：

```env
WENXIN_API_KEY=bce-v3/ALTAK-xxxxxxxxxx/xxxxxxxxxxxxxxxx
```

#### 获取 API Key

1. 登录 [百度智能云千帆平台](https://qianfan.cloud.baidu.com/)
2. 进入「模型服务」→「应用接入」→「创建应用」
3. 创建后获取 API Key（Bearer Token 格式）

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI 模型**: 百度文心 5.0 多模态大模型 (ernie-4.5-8k-preview)

## 📁 项目结构

```
app/
├── page.tsx          # 主页面组件
├── layout.tsx        # 根布局
├── globals.css       # 全局样式
└── api/
    └── analyze/
        └── route.ts  # 文心大模型 API 路由
```

## 📝 API 说明

### POST /api/analyze

分析用户头像和昵称的性格特征。

**请求体**:
```json
{
  "nickname": "用户昵称",
  "imageBase64": "图片的 Base64 编码"
}
```

**响应**: Server-Sent Events (SSE) 流式响应

## 🎯 分析维度

AI 将从以下维度进行性格分析：

1. **头像分析** - 风格、色彩、构图特点
2. **昵称解读** - 语言风格、深层含义
3. **综合性格画像** - 性格类型、核心特征
4. **兴趣喜好推测** - 爱好、审美偏好
5. **社交特点** - 社交风格、人际关系
6. **温馨小建议** - 个性化生活建议

## ⚠️ 注意事项

- 分析结果仅供娱乐参考，请勿当真
- 请确保上传的图片内容合规
- API 调用可能产生费用，请关注用量

## 📄 许可证

MIT License
