# Yes Markdown App

跨平台 Markdown 编辑器应用，使用 Tauri + Vue 3 构建。

## 技术栈

- **框架**: Tauri 2.x (跨平台桌面应用)
- **前端**: Vue 3 + Composition API + TypeScript
- **构建工具**: Vite
- **编辑器**: CodeMirror 6
- **Markdown 解析**: markdown-it + highlight.js + KaTeX + Mermaid
- **拖拽**: vuedraggable (基于 Sortable.js)
- **打包**: JSZip (用于导出功能)

## 项目结构

```
yes-markdown-app/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── App.vue                 # 主组件 (三栏布局)
│   ├── assets/
│   │   └── main.css            # 全局样式 + 主题变量
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.vue     # 左侧栏 (文件树)
│   │   │   ├── Editor.vue      # 中间编辑区 (CodeMirror)
│   │   │   └── Preview.vue     # 右侧预览区
│   │   └── notes/
│   │       ├── NoteTree.vue    # 文件树组件
│   │       ├── TagSidebar.vue  # 标签管理
│   │       └── TagManager.vue  # 标签选择器
│   ├── stores/
│   │   ├── notes.ts            # 笔记状态管理
│   │   ├── theme.ts            # 主题管理
│   │   └── i18n.ts             # 多语言支持
│   ├── utils/
│   │   ├── markdown.ts         # Markdown 渲染
│   │   └── export.ts           # 导出功能
│   └── types/
│       └── index.ts            # TypeScript 类型定义
└── src-tauri/
    └── tauri.conf.json         # Tauri 配置
```

## 已实现功能

### 核心功能
- 三栏布局 (活动栏 / 侧边栏 / 编辑器 / 预览)
- 笔记创建、编辑、删除
- 文件夹管理 (支持嵌套)
- 拖拽排序
- 实时 Markdown 预览

### 编辑器
- CodeMirror 6 集成
- Markdown 语法高亮
- 语言代码块高亮 (JavaScript, Python, HTML, CSS, JSON 等)
- 工具栏 (粗体、斜体、代码、标题、列表、引用、链接)
- 主题切换 (亮色/暗色)

### 预览
- 语法高亮 (highlight.js)
- KaTeX 数学公式
- Mermaid 图表
- 代码块带语言标签和复制按钮

### 标签系统
- 创建、编辑、删除标签
- 每个笔记一个标签
- 标签颜色自定义

### 多语言
- 中文 (🇨🇳)
- English (🇺🇸)
- Deutsch (🇩🇪)

### 设置 (Settings)
- 主题切换
- 语言选择

## 重要配置

### 窗口配置 (src-tauri/tauri.conf.json)
```json
{
  "app": {
    "windows": [{
      "title": "Yes Markdown",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600
    }]
  }
}
```

### CSS 变量
主题使用 CSS 变量，定义在 `src/assets/main.css` 中：
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--accent-color`, `--accent-light`
- `--border-color`

## 启动命令

```bash
# 开发模式
npm run tauri dev

# 生产构建
npm run tauri build
```

## 注意事项

- 导出功能 (右键菜单) 暂时禁用，存在 Tauri 环境下的兼容性问题
- 数据存储使用 localStorage，键名为 `yes-markdown-data`
- 主题存储键名为 `theme-mode`
- 语言设置存储键名为 `locale`
