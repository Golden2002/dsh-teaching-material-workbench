/**
 * Standards register: the external bases the workbench cites.
 *
 * `status` is honest: `verified` means the cited page or abstract was read;
 * `partial` means only the abstract or metadata was available; `not-obtained`
 * means the text could not be obtained and the item must not be cited as a
 * confirmed clause.
 */

export const STANDARDS = [
  {
    id: 'WCAG22',
    title: 'Web Content Accessibility Guidelines (WCAG) 2.2',
    publisher: 'W3C',
    date: '2024-12-12',
    clauses: ['1.1.1 Non-text Content', '1.4.1 Use of Color', '1.4.3 Contrast (Minimum): 4.5:1, large text 3:1', '1.4.4 Resize Text: 200%', '3.1.5 Reading Level'],
    use: '可及性门禁：替代文本、对比度、不以颜色单独传意、文本可缩放、阅读难度。',
    status: 'verified',
    url: 'https://www.w3.org/TR/WCAG22/',
  },
  {
    id: 'UDL3',
    title: 'CAST Universal Design for Learning Guidelines 3.0',
    publisher: 'CAST',
    date: '2024-07-30',
    clauses: ['Engagement', 'Representation', 'Action & Expression', '9 guidelines'],
    use: '学习设计检查：多种表征、参与方式、行动与表达；适用于任何学科与场景。',
    status: 'verified',
    url: 'https://udlguidelines.cast.org/',
  },
  {
    id: 'QM-HE',
    title: 'Quality Matters Higher Education Rubric, Seventh Edition',
    publisher: 'Quality Matters',
    date: '2023',
    clauses: ['8 General Standards', '44 Specific Review Standards', 'Essential Standards', '85% overall score for certification'],
    use: '同行评审量表：课程概览、学习目标、评估、材料、活动、技术、学习者支持、可及性；对齐是关键概念。',
    status: 'verified',
    url: 'https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric',
  },
  {
    id: 'OSCQR',
    title: 'OSCQR — SUNY Online Course Quality Review Rubric',
    publisher: 'SUNY Online',
    date: '2026',
    clauses: ['50 standards', 'CC BY 4.0'],
    use: '可复用的形成性评审框架；覆盖概览、技术、版面、内容、互动、评估。',
    status: 'verified',
    url: 'https://oscqr.suny.edu/',
  },
  {
    id: 'ISO-24495-1',
    title: 'ISO 24495-1:2023 Plain language — Part 1: Governing principles and guidelines',
    publisher: 'ISO',
    date: '2023-06',
    clauses: ['Governing principles and guidelines for plain-language documents'],
    use: '明快语言检查；正文未购买时只能引用摘要，不得引具体条款。',
    status: 'partial',
    url: 'https://online.standard.no/en/iso-24495-1-2023-3',
  },
  {
    id: 'GB-T-15834',
    title: 'GB/T 15834—2011 标点符号用法',
    publisher: '国家质检总局、国家标准委',
    date: '2011-12-30',
    clauses: ['现代汉语书面语标点用法'],
    use: '中文标点检查；标准页显示现行，官方平台提供在线预览。',
    status: 'verified',
    url: 'https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=22EA6D162E4110E752259661E1A0D0A8',
  },
  {
    id: 'GB-T-15835',
    title: 'GB/T 15835—2011 出版物上数字用法',
    publisher: '国家质检总局、国家标准委',
    date: '2011-07-29',
    clauses: ['出版物上数字用法'],
    use: '数字写法检查；正文尚未逐条取证。',
    status: 'not-obtained',
    url: 'https://openstd.samr.gov.cn/',
  },
  {
    id: 'PDF-UA',
    title: 'ISO 14289-1 (PDF/UA-1) 与 Matterhorn Protocol',
    publisher: 'ISO / PDF Association',
    date: '2014 / 2021',
    clauses: ['PDF/UA-1 可访问 PDF 要求', 'Matterhorn Protocol 检查点'],
    use: 'PDF 可及性验证；本轮未能取得正文，验证工具不可用时写“未执行”。',
    status: 'not-obtained',
    url: 'https://www.pdfa.org/resource/the-matterhorn-protocol/',
  },
  {
    id: 'Tomlinson-2012',
    title: 'Materials development for language learning and teaching',
    publisher: 'Language Teaching 45(2), 143–179',
    date: '2012',
    clauses: ['materials evaluation, adaptation, production and exploitation', 'research gaps'],
    use: '材料开发流程依据：评价、改编、生产、使用、研究。',
    status: 'verified',
    doi: '10.1017/S0261444811000528',
  },
  {
    id: 'Nation-2006',
    title: 'How large a vocabulary is needed for reading and listening?',
    publisher: 'Canadian Modern Language Review 63(1), 59–82',
    date: '2006',
    clauses: ['98% coverage: 8,000–9,000 word families (written), 6,000–7,000 (spoken)'],
    use: '文本难度分级：按词表覆盖率与词族数量定级。',
    status: 'verified',
    doi: '10.3138/cmlr.63.1.59',
  },
  {
    id: 'Haladyna-2002',
    title: 'A review of multiple-choice item-writing guidelines for classroom assessment',
    publisher: 'Applied Measurement in Education 15(3), 309–333',
    date: '2002',
    clauses: ['item-writing guidelines'],
    use: '题目质量检查：题干、选项、干扰项与评分点。',
    status: 'verified',
    doi: '10.1207/S15324818AME1503_5',
  },
  {
    id: 'Mayer-2009',
    title: 'Multimedia Learning (2nd ed.)',
    publisher: 'Cambridge University Press',
    date: '2009',
    clauses: ['multimedia principles: coherence, signaling, redundancy, contiguity, segmenting'],
    use: '页面设计：减少外在认知负荷。',
    status: 'verified',
    doi: '10.1017/CBO9780511811678',
  },
  {
    id: 'Merrill-2002',
    title: 'First principles of instruction',
    publisher: 'Educational Technology Research and Development 50(3), 43–59',
    date: '2002',
    clauses: ['problem-centred, activation, demonstration, application, integration'],
    use: '活动设计检查：任务是否围绕真实问题、是否有示范与练习。',
    status: 'verified',
    doi: '10.1007/BF02505024',
  },
  {
    id: 'Cohen-1960',
    title: 'A coefficient of agreement for nominal scales',
    publisher: 'Educational and Psychological Measurement 20(1), 37–46',
    date: '1960',
    clauses: ['Cohen’s kappa'],
    use: '双人评分一致性；kappa ≥ 0.7 作为可接受线。',
    status: 'verified',
    doi: '10.1177/001316446002000104',
  },
]

/**
 * List the standards register, optionally filtered by a text query.
 * @param {string} [topic] - case-insensitive filter over id, title and use.
 * @returns {typeof STANDARDS} filtered entries.
 */
export function listStandards(topic) {
  if (!topic) return STANDARDS
  const query = String(topic).toLowerCase()
  return STANDARDS.filter((entry) => `${entry.id} ${entry.title} ${entry.use}`.toLowerCase().includes(query))
}
