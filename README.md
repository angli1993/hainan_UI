# hainan_UI

面向医生的临床数据工作台前端样板。当前范围包括既有 Agent 工作台、量表字段映射、患者随访、字段字典和导入历史，以及神经影像与 EEG 的医生端流程设计。

这是独立的界面样板，不连接 `maintain_hainan` 后端，不读写真实数据库，也不代表尚未接入的 EEG 能力已经可用。

## 本地运行

要求 Node.js 20 或更高版本，无需安装第三方依赖。

```bash
npm run build
npm test
npm run serve
```

浏览器打开 `http://127.0.0.1:4173/`。

## 文件结构

```text
src/integrated-clinical-workbench.fragment.html  唯一可编辑页面源码
scripts/build.mjs                              生成独立 index.html
scripts/check.mjs                              静态契约检查
scripts/serve.mjs                              零依赖本地预览服务
index.html                                     生成后的可运行页面
docs/                                          架构、术语和变更记录
AGENTS.md                                      Agent 与开发者协作规则
CONTRIBUTING.md                                分支、提交和评审流程
```

不要直接修改 `index.html`。修改源码后运行 `npm test`，并将源码与重新生成的 `index.html` 一起提交。

## 当前产品原则

- 医生默认看到简洁流程，技术细节通过阶段按钮按需打开。
- 每个阶段只显示自己的内容，不允许在详情中跳到相邻阶段。
- 阶段状态同时显示患者数和检查次数，避免随访数据只按人数统计造成歧义。
- 预处理、后处理、结果提取和结果登记必须严格区分。
- 图谱和处理工具名称必须来自已批准的平台契约，不能用示例名称代替真实目录。
- 所有展示数据均为合成演示数据。

本仓库暂不附带开源许可证，仅用于获授权的内部协作。
