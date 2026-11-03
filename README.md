# 全局人格 · DSH Global Persona

给 [DeepSeek Harness](https://github.com/deepseek-ai) 当前 profile 的**所有会话**注入同一段 AI 人格设定。安装后可以直接在插件页里编辑人格，保存后从下一轮对话开始生效。

> 纯本地运行：不联网、不上传人格内容、不收集任何数据。

## 功能

- **全局生效**：所有会话、所有 Agent 共享同一段人格，不需要逐个配置。
- **可视化编辑**：插件管理器 → 全局人格 → 编辑 → 保存，不用改配置文件。
- **即时生效**：保存后下一轮对话就会读取新人格，无需重启 DSH。
- **随时停用**：关闭「启用全局人格」即可临时停用，已写内容不会丢失。
- **空内容不注入**：人格留空时完全保持 DSH 默认行为。
- **中英双语界面**。

## 安装

需要 DSH 0.2.x；在 0.2.1-rc.4（Windows）上测试通过。

### 方式一：下载 ZIP（推荐给同学）

1. 在本仓库点 **Code → Download ZIP**。
2. 解压到任意目录，确保解压后能直接看到 `package.json`。
3. 打开 DSH → **插件** → **已安装** → 右上角 **添加插件** → 选择本地文件夹。
4. 选中解压后的目录，按提示启用。

### 方式二：git clone

```bash
git clone https://github.com/Patrick126090380/dsh-plugin-global-persona.git
```

然后在 DSH 的「添加插件」里选择这个文件夹。

### 方式三：npm（如已发布）

```bash
npm install -g dsh-plugin-global-persona
```

> 目前以 GitHub 分发为主，未发布到 npm 时可忽略这一节。

## 使用

1. 打开 DSH → **插件** → **已安装** → **全局人格**。
2. 在「人格设定」里写你想要的人格。
3. 点「保存」，看到「已保存。」即可。
4. 从下一轮对话开始生效。

人格越具体越稳定。可以写身份、称呼、语气、情绪表达方式、边界和禁忌。例如：

```text
你是一位可靠、务实、真诚的 AI 助手。

沟通风格：
- 始终使用与用户相同的语言；用户未指定语言时默认使用简体中文。
- 先给出结论或可直接使用的结果，再补充必要的理由和步骤。
- 不写空话、套话和过度铺垫。
- 对不确定的事情明确说明不确定性，绝不编造事实。
- 代码、命令、路径、数字保持精确。

无论面对简单问题还是复杂任务，都保持耐心、专业和对用户目标的关注。
```

## 配置

插件的 Config 只有两个字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | 是否注入人格 |
| `persona` | string | 内置示例 | 人格正文，支持多行 |

保存后会写入当前 profile 的 `cordis.patch.yml`：

```yaml
- id: global-persona
  name: dsh-plugin-global-persona
  config:
    enabled: true
    persona: |
      ...
```

想手动备份或迁移到另一台机器时，复制这一段即可。

## 隐私

- Host 半只调用 `ctx.systemPrompt.section()` 注册一个系统提示段。
- Client 半只使用 `configForms`、`slots`、`locale` 服务。
- 没有任何网络请求、遥测或第三方脚本。
- 人格文本只保存在本机的 profile 中，不会上传。

## 实现

- Host：`ctx.systemPrompt.section({ name: 'global-persona', order: 1, ... })`。
  order `1` 位于 `personaPrefix`（order `0`）之后、内置行为指引之前，所有会话共享。
- `enabled` 与 `persona` 是 schemastery `volatile` 字段。保存时 Loader 只把新值提交到运行中的引用，不重载插件；系统提示组装时读取最新值。
- Client：在 `plugins.bundle.config`（key 为包名 `dsh-plugin-global-persona`）注册自定义页面，通过 `ctx.configForms.get('global-persona')` 读写，保存走 Host settings 服务并持久化到当前 profile 的 Cordis patch。
- 依赖：内置 vendored 的 `@deepseek-ai/schemastery` 3.18.5 与 `@deepseek-ai/cosmokit`（均为 MIT）。部分 DSH profile 自带的 schemastery 3.18.2 没有 `.volatile()`，因此不能依赖外部解析。

## 目录结构

```text
dsh-plugin-global-persona/
├── package.json
├── cordis.patch.yml      # 插入 global-persona 条目
├── index.js              # Host 半：注册系统提示段
├── client.js             # Client 半：插件页编辑界面
├── locale/
│   ├── zh.json
│   └── en.json
├── icon.svg
├── vendor/               # schemastery + cosmokit（MIT）
└── README.md
```

## 开发与验证

```bash
node --check index.js
node --check client.js
```

本地修改后，在 DSH 插件管理器里重新选择本目录即可；修改 `client.js` 后需要重启 DSH 才会加载新界面。

## License

MIT。第三方许可见 `vendor/*.LICENSE`。

## English

**Global Persona for DeepSeek Harness** injects one editable persona into every conversation of the current profile. Edit it on the plugin page; it takes effect from the next turn, with no restart. Everything is local — no network requests, no telemetry, no data collection.

Install: download/clone this repository, then in DSH open **Plugins → Add plugin → select this folder**. Tested on DSH 0.2.1-rc.4 (Windows).
