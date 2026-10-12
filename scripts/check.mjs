import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'src', 'integrated-clinical-workbench.fragment.html'), 'utf8');
const output = await readFile(resolve(root, 'index.html'), 'utf8');
const failures = [];

// 导航与页面（0011 信息架构）
const required = [
  'Agent 工作台', '交互式科研挖掘', '自动科研智能体',
  '数据管理', '数据上传', '数据总览', '样本随访', '字段字典', '导入历史',
  '神经影像', '影像数据总览', 'fMRI 功能像', 'DWI 弥散像', 'T1 结构像', '特征库', '图谱库',
  '神经电生理', '电生理数据总览', '静息态 EEG',
  '体检报告', '个体综合评估',
  '第三方模型', '私有模型', '发布给合作者', '研究方案设计', '新建研究方案', '检查研究数据可用性',
  // 模态流程页
  'BIDS 标准化', '预处理', '质控', '特征提取', '智能体先筛，医生确认', 'fMRIPrep', 'DeepPrep', 'QSIPrep', 'FreeSurfer', 'deepmriprep',
  // 特征库与图谱方案
  '开始计算', '计算前检查', '图谱方案', '功能方案', '脑网络组方案', '自定义方案', '皮层', '皮下', '小脑',
  '低频振幅', '局部一致性', '静息态功能连接', '功能梯度', '结构功能耦合', '扩散张量指标', '脑区形态', '体素形态学',
  // 自动科研智能体的边界与可靠性
  '添加任务', '一致性门槛', '只使用质控通过的数据', '不生成诊断结论', '结果需医生复核后采纳', '可采纳', '待复核',
  // 既有处理语义
  'BOLD 信号去噪', 'fMRI 特征提取', '复用节点', '无需补充处理', '队列推荐方案 v1.0', '自定义草案', '海南痴呆队列', '脑网络组图谱（BN 210）',
  '本方案需补充', '本次待计算', '暂不可分析', '扩散张量拟合', 'DTI 指标生成', 'FreeSurfer 结构像处理', '脑区形态结果生成', 'deepmriprep VBM 处理', 'VBM 结果发布', 'EEG 特征提取',
  // 模型与报告的解释边界
  '技术兼容不等同于临床有效', '外部参照模型', '内部已发布模型', '两项结果未进行数值融合', '海南痴呆多模态分类模型', '退回检查数据', '确认评估记录', '样本分组的嵌套 5 折交叉验证',
  // 数据管理
  '数据上传者', '分析者', '谁可以上传', '本地部署', '数据与模型均不出院',
  // 0012：电生理特征库、隐私路由、Agent 确认、特征问答、模型文献
  '特征库（电生理）', '模型服务与隐私路由', '隐私路由', 'Agent 确认', '问一问', '添加自定义方案', '脑龄预测模型（SFCN）', 'Accurate brain age prediction with lightweight deep neural networks', 'MedGemma', '亚组稳定性检查'
];
for (const label of required) {
  if (!source.includes(label)) failures.push(`Missing required label: ${label}`);
}

// 术语：医生端统一使用“样本”，不再使用“患者”
if (source.includes('患者')) failures.push('Use 样本 instead of 患者 in the doctor-facing prototype.');

// 阶段详情只解释所点阶段
if (source.includes('id="icw-settings-tabs"')) failures.push('Stage details must not expose navigation to adjacent stages.');
if (source.includes("['provenance','结果登记']")) failures.push('Automatic result registration must not be shown as a processing stage.');
if (source.includes('<h3>ReHo 与功能连接</h3>')) failures.push('ReHo and functional connectivity must have separate feature settings.');

// fMRI 去噪与缓存复用语义
if (source.includes('34 + 146') || source.includes('时间序列处理')) failures.push('fMRI must separate BOLD denoising from feature calculation and use the approved stage term.');
if (!source.includes("selected: ['reho']") || !source.includes('const fmriReuseCounts = { alff:74, reho:98, fc:112, gradients:61 }')) failures.push('The approved ReHo cache-reuse demonstration is missing.');
if (!source.includes('compatibleExamIds') || !source.includes('plans.every(({ plan }) => plan.compatibleExamIds.has(examId))')) failures.push('fMRI multi-feature readiness must aggregate compatible examination sets.');
if (!source.includes("'fmri:alff': [defaultFmriAtlas()]") || !source.includes("'fmri:reho': [defaultFmriAtlas()]") || !source.includes("'fmri:fc': [defaultFmriAtlas()]") || !source.includes("'fmri:gradients': [defaultFmriAtlas()]")) failures.push('Every fMRI feature must receive the compatible default Brainnetome atlas.');
if (source.includes('认知障碍随访队列') || source.includes('Math.min(...plans.map(({plan}) => plan.reusable))')) failures.push('Stale cohort naming or minimum-count readiness logic remains.');
if (!source.includes('fmriSharesGradientIntermediate')) failures.push('Functional connectivity and gradients must demonstrate compatible intermediate reuse.');

// DTI 与 T1 分支缓存
if (!source.includes("flowKind:'branched'")) failures.push('T1 must retain separate FreeSurfer and deepmriprep branches.');
if (!source.includes('function dtiReadiness(chosen=[])') || !source.includes('dtiDefaultFinalExamIds') || !source.includes('fromPreprocessedExamIds')) failures.push('DTI must model reusable QSIPrep, tensor, and final-result artifact sets.');
if (!source.includes('const tensorChanged = s.maxBValue !== defaults.maxBValue') || !source.includes('preprocessChanged && !tensorChanged')) failures.push('DTI tensor settings must preserve compatible QSIPrep results.');
if (!source.includes('function t1Readiness(chosen=[])') || !source.includes('t1DefaultMorphometryExamIds') || !source.includes('t1DefaultVbmFinalExamIds')) failures.push('T1 must model FreeSurfer and VBM caches as separate branches.');
if (!source.includes('state.settings.t1.fsLongitudinal !== defaultSettings.t1.fsLongitudinal') || source.includes('state.settings.t1.device !== defaultSettings.t1.device')) failures.push('FreeSurfer mode must affect scientific cache identity while CPU/GPU must not.');

// 流程页与特征库
if (!source.includes('data-open-settings="${key}"') || !source.includes('function renderReadinessModal(key)')) failures.push('Modality pages must open stage details and keep modality-specific readiness bodies.');
if (!source.includes("stageOpen: { fmri:'preprocess'") || !source.includes('function stagePanel(key, cohort, stage)')) failures.push('Modality pages must render one stage panel at a time.');
if (!source.includes('function featureDrawerHtml(item)') || !source.includes('function runModalHtml()') || !source.includes('defaultOn:true')) failures.push('The feature gallery must provide detail drawers, a pre-run check and default fast features.');
if (!source.includes("id:'functional'") || !source.includes("id:'brainnetome'") || !source.includes('Schaefer200_MNI152NLin2009cAsym_2mm') || !source.includes('Tianye_MNI152NLin2009cAsym_2mm') || !source.includes('SUIT_MNI152NLin2009cAsym_2mm')) failures.push('Atlas schemes must be composed from platform catalog entries.');
if (!source.includes("schemesOn: new Set(['brainnetome','functional'])") || !source.includes('const enabledSchemes') || !source.includes('data-scheme-add')) failures.push('Atlas schemes must be multi-select with unlimited custom schemes.');
if (!source.includes('function agentQuestionsHtml(key, stage)') || !source.includes('function featureAnswer(item, kind, cohort)')) failures.push('Stage panels must offer Agent confirmation and the feature gallery must offer feature Q&A.');
if (!source.includes('`${step[4]} 位样本 · ${step[3]} 次检查`') || !source.includes('`${readiness.supplementPatients} 位样本 · ${readiness.supplement} 次检查`')) failures.push('Pipeline stages must show both sample and examination counts.');

// 自动科研智能体与模型
if (!source.includes('consistency:') || !source.includes('批评者智能体')) failures.push('Auto research agent reports must carry consistency scores and critic review.');
if (!source.includes('同一样本所有随访进入同一数据折') || !source.includes('插补仅在训练折拟合')) failures.push('The model builder must make sample-level splitting and leakage prevention explicit.');
if (!source.includes('外部脑龄与内部分类模型回答不同问题') || source.includes('综合风险分</b>')) failures.push('External and internal model outputs must remain separate unless a validated fusion model exists.');
if (source.includes('12 个月认知变化预测模型') || source.includes('海南认知障碍多模态分类模型') || source.includes('提交医生审核')) failures.push('The prototype must use the dementia program name, omit the fictional 12-month model, and keep confirmation in the doctor perspective.');

if (!output.includes(source)) failures.push('index.html is stale; run npm run build.');
if ((await stat(resolve(root, 'index.html'))).size > 1_000_000) failures.push('index.html exceeds the 1 MB prototype limit.');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Static checks passed.');
}
