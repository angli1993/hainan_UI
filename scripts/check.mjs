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
  '数据接入',
  '结果提取'
];

for (const label of required) {
  if (!source.includes(label)) failures.push(`Missing required label: ${label}`);
}

if (source.includes('id="icw-settings-tabs"')) {
  failures.push('Stage details must not expose navigation to adjacent stages.');
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
