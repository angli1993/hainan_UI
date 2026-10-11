import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'src', 'integrated-clinical-workbench.fragment.html'), 'utf8');
const output = await readFile(resolve(root, 'index.html'), 'utf8');
const failures = [];

const required = [
  'Agent 工作台',
  '患者随访',
  '字段字典',
  '导入历史',
  '静息态 fMRI',
  'DWI / DTI',
  'T1 加权结构像',
  '静息态 EEG',
  '平台图谱库',
  'BIDS 数据',
  'BOLD 信号去噪',
  'fMRI 特征提取',
  '功能梯度',
  '复用节点',
  '查看处理路径',
  '调整参数',
  '推荐方案',
  '可复用去噪 BOLD',
  '队列推荐方案 v1.0',
  '自定义草案',
  '可直接计算',
  '需补充 BOLD 去噪',
  '暂不可分析',
  '分析前检查',
  '检查数据并继续',
  'DTI 特征提取',
  'FreeSurfer 结构像处理',
  'deepmriprep VBM 处理',
  'EEG 特征提取'
];

for (const label of required) {
  if (!source.includes(label)) failures.push(`Missing required label: ${label}`);
}

if (source.includes('id="icw-settings-tabs"')) {
  failures.push('Stage details must not expose navigation to adjacent stages.');
}
if (source.includes("['provenance','结果登记']")) {
  failures.push('Automatic result registration must not be shown as a processing stage.');
}
if (source.includes('<h3>ReHo 与功能连接</h3>')) {
  failures.push('ReHo and functional connectivity must have separate feature settings.');
}
if (source.includes('<span>运行原则</span>') || source.includes("state.units[target].length} 个平台图谱")) {
  failures.push('The plan must show a concrete calculation start and actual atlas names.');
}
if (source.includes("if (key === 'fmri') return '从已完成的静息态 fMRI 去噪结果开始'")) {
  failures.push('fMRI must determine the deepest compatible artifact instead of assuming one global denoised input.');
}
if (source.includes('34 + 146') || source.includes('时间序列处理')) {
  failures.push('fMRI must separate BOLD denoising from feature calculation and use the approved stage term.');
}
if (!source.includes("selected: ['reho']") || !source.includes('reusable = { alff:74, reho:98, fc:112, gradients:61 }')) {
  failures.push('The approved ReHo cache-reuse demonstration is missing.');
}
if (!source.includes('fmriSharesGradientIntermediate')) {
  failures.push('Functional connectivity and gradients must demonstrate compatible intermediate reuse.');
}
if (!source.includes("flowKind:'branched'")) {
  failures.push('T1 must retain separate FreeSurfer and deepmriprep branches.');
}
if (!source.includes('位患者 · ${step[3]} 次检查')) {
  failures.push('Pipeline stages must show both patient and examination counts.');
}
if (!output.includes(source)) {
  failures.push('index.html is stale; run npm run build.');
}
if ((await stat(resolve(root, 'index.html'))).size > 1_000_000) {
  failures.push('index.html exceeds the 1 MB prototype limit.');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Static checks passed.');
}
