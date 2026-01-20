// 类型定义（用于文档和IDE提示）

/**
 * 语言类型
 * @typedef {'zh' | 'en' | 'fr' | 'ar'} Language
 */

/**
 * 订单状态
 * @typedef {'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'} OrderStatus
 */

/**
 * 账户类型
 * @typedef {'BANK' | 'CRYPTO' | 'THIRD_PARTY'} AccountType
 */

/**
 * 货币对象
 * @typedef {Object} Currency
 * @property {string} code - 货币代码
 * @property {Object<string, string>} name - 多语言名称
 * @property {string} symbol - 货币符号
 * @property {'CRYPTO' | 'FIAT'} type - 货币类型
 * @property {string} icon - 图标标识
 */

/**
 * 收款账户
 * @typedef {Object} ReceivingAccount
 * @property {string} id - 账户ID
 * @property {AccountType} type - 账户类型
 * @property {string} provider - 提供商
 * @property {string} accountName - 账户名称
 * @property {string} accountNumber - 账户号码
 * @property {string} currency - 货币代码
 * @property {string} [network] - 网络类型（加密货币）
 */

/**
 * 市场数据
 * @typedef {Object} MarketData
 * @property {string} symbol - 交易对符号
 * @property {number} price - 当前价格
 * @property {number} change24h - 24小时涨跌幅
 * @property {'CRYPTO' | 'FIAT'} type - 类型
 * @property {number[]} trend - 趋势数据
 * @property {string} volume - 交易量
 * @property {number} high24h - 24小时最高价
 * @property {number} low24h - 24小时最低价
 */

/**
 * 订单对象
 * @typedef {Object} Order
 * @property {string} id - 订单ID
 * @property {string} createdAt - 创建时间
 * @property {OrderStatus} status - 订单状态
 * @property {number} fromAmount - 支付金额
 * @property {string} fromCurrency - 支付货币
 * @property {number} toAmount - 获得金额
 * @property {string} toCurrency - 获得货币
 * @property {number} rate - 汇率
 */

/**
 * 消息对象
 * @typedef {Object} Message
 * @property {string} id - 消息ID
 * @property {string} title - 标题
 * @property {string} content - 内容
 * @property {string} time - 时间
 * @property {boolean} read - 是否已读
 */

/**
 * 充值记录
 * @typedef {Object} Deposit
 * @property {string} id - 充值ID
 * @property {string} createdAt - 创建时间
 * @property {'COMPLETED' | 'PROCESSING' | 'CANCELLED' | 'PENDING'} status - 状态
 * @property {number} amount - 金额
 * @property {string} currency - 货币代码
 * @property {number} usdAmount - 美元金额
 * @property {string} [paymentMethod] - 支付方式
 * @property {number} [rate] - 汇率
 * @property {string} [proofUrl] - 凭证图片URL
 */

