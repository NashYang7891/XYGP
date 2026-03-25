/** 首页指数卡片说明与相关公开标的（示例，非完整列表） */
export const INDICES = {
  N300: {
    name: 'Nikkei 300',
    code: 'N300',
    summary:
      '从东京证券交易所 Prime 市场选取约 300 只代表性股票，以流通市值加权，反映较宽基的日本大型股表现。',
    note: '指数点位与成分变更以指数编制机构及交易所披露为准。',
    relatedEtfs: [
      { symbol: '1306', name: 'NEXT FUNDS 日経300株価指数連動型上場投信' },
      { symbol: '1308', name: '上場インデックスファンド日経300' },
    ],
  },
  TOPY: {
    name: 'TOPIX',
    code: 'TOPY',
    summary:
      '东京证券交易所主要市场（现以 Prime 等分层为主）的市值加权指数，是日本市场最常用的宽基基准之一。',
    note: 'TOPIX 与旧市场板块划分调整历史较长，复盘时请核对对应日期的指数说明。',
    relatedEtfs: [{ symbol: '1305', name: 'NEXT FUNDS TOPIX連動型上場投信' }],
  },
  IPYNK400: {
    name: 'JPX-Nikkei Index 400',
    code: 'IPYNK400',
    summary:
      '由日本交易所集团与 Nikkei 共同编制，强调公司治理与资本效率等筛选条件的宽基指数之一。',
    note: '成分股定期审议，名称与代码以官方为准。',
    relatedEtfs: [],
  },
  INIW: {
    name: 'Nikkei Stock Average Volatility Index',
    code: 'INIW',
    summary:
      '反映日经平均指数期权隐含波动水平的指数，常作为市场恐慌与波动预期的参考指标之一。',
    note: '波动率指数与现货指数走势不必一致；衍生品交易风险极高。',
    relatedEtfs: [],
  },
}

export function getIndex(code) {
  if (!code) return null
  const upper = String(code).toUpperCase()
  return INDICES[upper] || {
    name: upper,
    code: upper,
    summary: '该代码暂无本地说明，可前往指数编制机构官网查询成分与编制方法。',
    note: '',
    relatedEtfs: [],
  }
}
