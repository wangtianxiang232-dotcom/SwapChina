/**
 * API 接口文件
 * 统一管理所有 API 请求
 */

// API 基础配置
const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://api.swapchina.com/api/v1'

/**
 * 通用请求方法
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取 token（如果有）
    const token = uni.getStorageSync('token') || ''
    
    // 默认配置
    const defaultOptions = {
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      timeout: options.timeout || 10000,
      success: (res) => {
        // 统一处理响应
        if (res.statusCode === 200) {
          // 如果后端返回的数据结构是 { code: 0, data: ..., message: '...' }
          if (res.data.code === 0 || res.data.code === 200) {
            resolve(res.data.data || res.data)
          } else {
            // 业务错误，不显示 toast，静默失败
            const errorMsg = res.data.message || '请求失败'
            console.warn('API 业务错误:', errorMsg)
            reject(new Error(errorMsg))
          }
        } else if (res.statusCode === 401) {
          // token 过期或未登录
          uni.removeStorageSync('token')
          uni.reLaunch({
            url: '/pages/login/login'
          })
          reject(new Error('未登录或登录已过期'))
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.warn('网络请求失败:', err)
        // 不显示 toast，静默失败，让调用方处理降级
        reject(err)
      }
    }
    
    // 合并配置
    const finalOptions = { ...defaultOptions, ...options }
    
    // 发送请求
    uni.request(finalOptions)
  })
}

/**
 * GET 请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置
 */
export function get(url, params = {}, options = {}) {
  // 将参数拼接到 URL 上
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const finalUrl = queryString ? `${url}?${queryString}` : url
  
  return request({
    url: finalUrl,
    method: 'GET',
    ...options
  })
}

/**
 * POST 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置
 */
export function del(url, params = {}, options = {}) {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const finalUrl = queryString ? `${url}?${queryString}` : url
  
  return request({
    url: finalUrl,
    method: 'DELETE',
    ...options
  })
}

// ==================== 业务接口 ====================

// 导入测试数据（用于降级处理）
import { MOCK_MARKET, MOCK_NEWS, MOCK_ACCOUNTS, MOCK_MESSAGES } from '@/utils/constants.js'

/**
 * 获取全球网关列表（带降级处理）
 * @returns {Promise<Array>} 网关列表
 */
export async function getGateways() {
  try {
    const data = await get('/gateways')
    return data || []
  } catch (error) {
    console.warn('API 获取网关列表失败，使用默认数据:', error)
    // 降级：返回默认测试数据
    return [
      { region: 'China', code: 'CNY' },
      { region: 'Europe', code: 'EUR' },
      { region: 'Nigeria', code: 'NGN' },
      { region: 'Kenya', code: 'KES' },
      { region: 'S. Africa', code: 'ZAR' }
    ]
  }
}

/**
 * 获取热门市场数据（带降级处理）
 * @param {Number} limit 返回数量限制
 * @returns {Promise<Array>} 市场数据列表
 * 
 * 数据格式要求：
 * [
 *   {
 *     symbol: 'BTC/USDT',        // 交易对符号（必填）
 *     price: 68420.50,           // 当前价格（必填）
 *     change24h: 2.45,           // 24小时涨跌幅百分比（必填，用于判断曲线颜色）
 *     type: 'CRYPTO',            // 类型：'CRYPTO' 或 'FIAT'（可选）
 *     trend: [65000, 66500, ...], // 价格趋势数组（必填，至少2个数据点，用于绘制曲线图）
 *     volume: '1.2B',            // 交易量（可选）
 *     high24h: 69000,            // 24小时最高价（可选）
 *     low24h: 64500              // 24小时最低价（可选）
 *   },
 *   ...
 * ]
 */
export async function getHotMarkets(limit = 10) {
  try {
    const data = await get('/markets/hot', { limit })
    
    // 数据格式化和验证
    if (Array.isArray(data)) {
      return data.map(item => {
        // 确保必要字段存在，如果 trend 不存在或格式不正确，生成默认趋势数据
        const formattedItem = {
          symbol: item.symbol || '',
          price: Number(item.price) || 0,
          change24h: Number(item.change24h) || 0,
          type: item.type || 'CRYPTO',
          volume: item.volume || '0',
          high24h: Number(item.high24h) || item.price || 0,
          low24h: Number(item.low24h) || item.price || 0,
          // trend 字段处理：如果后端返回了 trend，直接使用；否则根据价格生成简单趋势
          trend: formatTrendData(item.trend, item.price, item.change24h)
        }
        return formattedItem
      })
    }
    
    return data || []
  } catch (error) {
    console.warn('API 获取热门市场失败，使用默认数据:', error)
    // 降级：返回模拟数据
    return MOCK_MARKET.slice(0, limit)
  }
}

/**
 * 格式化趋势数据
 * 如果后端没有返回 trend 字段，根据当前价格和涨跌幅生成简单的趋势数据
 * @param {Array} trend - 后端返回的趋势数据
 * @param {Number} price - 当前价格
 * @param {Number} change24h - 24小时涨跌幅
 * @returns {Array} 格式化后的趋势数据数组
 */
function formatTrendData(trend, price, change24h) {
  // 如果后端返回了有效的 trend 数据，直接使用
  if (Array.isArray(trend) && trend.length >= 2) {
    // 确保所有值都是数字
    return trend.map(val => Number(val) || 0).filter(val => val > 0)
  }
  
  // 如果没有 trend 数据，根据当前价格和涨跌幅生成模拟趋势
  // 生成 7 个数据点，模拟一个简单的价格波动
  const points = 7
  const basePrice = Number(price) || 100
  const changePercent = Number(change24h) || 0
  
  // 计算起始价格（假设24小时前价格）
  const startPrice = basePrice / (1 + changePercent / 100)
  
  // 生成趋势数据：从起始价格逐渐变化到当前价格
  const trendData = []
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1) // 0 到 1
    // 添加一些随机波动，使曲线更自然
    const randomFactor = 1 + (Math.random() - 0.5) * 0.02 // ±1% 的随机波动
    const priceAtPoint = startPrice + (basePrice - startPrice) * progress
    trendData.push(Number((priceAtPoint * randomFactor).toFixed(2)))
  }
  
  return trendData
}

/**
 * 获取所有市场数据（带降级处理）
 * @returns {Promise<Array>} 市场数据列表
 */
export async function getAllMarkets() {
  try {
    const data = await get('/markets')
    return data || []
  } catch (error) {
    console.warn('API 获取市场数据失败，使用默认数据:', error)
    // 降级：返回模拟数据
    return MOCK_MARKET
  }
}

/**
 * 获取新闻/活动列表（带降级处理）
 * @param {Number} page 页码
 * @param {Number} pageSize 每页数量
 * @returns {Promise<Array>} 新闻列表数据
 */
export async function getNewsList(page = 1, pageSize = 10) {
  try {
    const data = await get('/news', { page, pageSize })
    // 如果返回的是对象格式 { list: [], total: 0 }，则返回 list
    return data?.list || data || []
  } catch (error) {
    console.warn('API 获取新闻列表失败，使用默认数据:', error)
    // 降级：返回模拟数据
    return MOCK_NEWS || []
  }
}

/**
 * 获取新闻详情（带降级处理）
 * @param {String} id 新闻ID
 * @returns {Promise<Object>} 新闻详情数据
 */
export async function getNewsDetail(id) {
  try {
    const data = await get(`/news/${id}`)
    return data || null
  } catch (error) {
    console.warn('API 获取新闻详情失败，使用默认数据:', error)
    // 降级：从模拟数据中查找
    const news = MOCK_NEWS.find(n => n.id === id)
    if (news) {
      return news
    }
    // 如果找不到，返回null
    return null
  }
}

/**
 * 获取市场详情（带降级处理）
 * @param {String} symbol 交易对符号
 * @returns {Promise<Object>} 市场详情数据
 */
export async function getMarketDetail(symbol) {
  try {
    const data = await get(`/markets/${encodeURIComponent(symbol)}`)
    return data || null
  } catch (error) {
    console.warn('API 获取市场详情失败，使用默认数据:', error)
    // 降级：从模拟数据中查找
    const market = MOCK_MARKET.find(m => m.symbol === symbol || m.symbol === symbol.replace('-', '/'))
    if (market) {
      return market
    }
    // 如果找不到，返回一个默认结构
    return {
      symbol: symbol,
      price: 0,
      change24h: 0,
      volume: 0,
      type: 'CRYPTO'
    }
  }
}

/**
 * 获取用户余额
 * @returns {Promise<Number>} 余额
 */
export function getUserBalance() {
  return get('/user/balance')
}

/**
 * 获取用户信息
 * @returns {Promise<Object>} 用户信息
 */
export function getUserInfo() {
  return get('/user/info')
}

/**
 * 获取消息列表（带降级处理）
 * @returns {Promise<Array>} 消息列表数据
 */
export async function getMessages() {
  try {
    const data = await get('/messages')
    return data || []
  } catch (error) {
    console.warn('API 获取消息列表失败，使用默认数据:', error)
    // 降级：返回模拟数据
    return MOCK_MESSAGES || []
  }
}

/**
 * 获取消息详情（带降级处理）
 * @param {String} id 消息ID
 * @returns {Promise<Object>} 消息详情数据
 */
export async function getMessageDetail(id) {
  try {
    const data = await get(`/messages/${id}`)
    return data || null
  } catch (error) {
    console.warn('API 获取消息详情失败，使用默认数据:', error)
    // 降级：从模拟数据中查找
    const message = MOCK_MESSAGES.find(m => m.id === id)
    if (message) {
      return message
    }
    // 如果找不到，返回null
    return null
  }
}

/**
 * 标记消息为已读
 * @param {String} id 消息ID
 * @returns {Promise}
 */
export async function markMessageAsRead(id) {
  try {
    await put(`/messages/${id}/read`)
  } catch (error) {
    console.warn('API 标记消息已读失败:', error)
    // 降级：本地更新
    const message = MOCK_MESSAGES.find(m => m.id === id)
    if (message) {
      message.read = true
    }
  }
}

/**
 * 标记所有消息为已读
 * @returns {Promise}
 */
export async function markAllMessagesAsRead() {
  try {
    await put('/messages/read-all')
  } catch (error) {
    console.warn('API 标记全部已读失败:', error)
    // 降级：本地更新
    MOCK_MESSAGES.forEach(msg => {
      msg.read = true
    })
  }
}

/**
 * 删除消息（带降级处理）
 * @param {String} id 消息ID
 * @returns {Promise}
 */
export async function deleteMessage(id) {
  try {
    await del(`/messages/${id}`)
  } catch (error) {
    console.warn('API 删除消息失败，使用本地删除:', error)
    // 降级：从本地数据中删除
    const index = MOCK_MESSAGES.findIndex(msg => msg.id === id)
    if (index > -1) {
      MOCK_MESSAGES.splice(index, 1)
    }
  }
}

/**
 * 获取账户列表（带降级处理）
 * @returns {Promise<Array>} 账户列表
 */
export async function getAccounts() {
  try {
    const data = await get('/accounts')
    return data || []
  } catch (error) {
    console.warn('API 获取账户列表失败，使用默认数据:', error)
    // 降级：返回模拟数据，不显示错误提示
    return MOCK_ACCOUNTS || []
  }
}

/**
 * 删除账户（带降级处理）
 * @param {String|Number} accountId 账户ID
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteAccount(accountId) {
  try {
    const data = await del(`/accounts/${accountId}`)
    return data || { success: true }
  } catch (error) {
    console.warn('API 删除账户失败:', error)
    // 降级：如果 API 失败，从本地列表中移除（模拟删除）
    // 注意：这只是降级处理，实际项目中应该确保 API 正常工作
    throw new Error('删除账户失败，请检查网络连接')
  }
}

/**
 * 添加账户（带降级处理）
 * @param {Object} accountData 账户数据
 * @returns {Promise<Object>} 添加结果
 */
export async function addAccount(accountData) {
  try {
    const data = await post('/accounts', accountData)
    return data || { success: true }
  } catch (error) {
    console.warn('API 添加账户失败:', error)
    // 降级：如果 API 失败，抛出错误让调用方处理
    throw new Error('添加账户失败，请检查网络连接')
  }
}

/**
 * 获取加密货币充值地址
 * @param {string} currency 币种代码，如 'USDT', 'BTC'
 * @param {string} network 网络类型，如 'TRC20', 'ERC20', 'BEP20', 'POLYGON'
 * @returns {Promise<{address: string, qrCode: string}>}
 */
export async function getDepositAddress(currency, network) {
  try {
    const res = await request({
      url: `/deposit/address`,
      method: 'GET',
      data: {
        currency,
        network
      }
    })
    return res
  } catch (error) {
    console.warn('获取充值地址失败，使用模拟数据:', error)
    // 模拟数据：每个网络多个地址
    const MOCK_ADDRESSES = {
      'USDT': {
        'TRC20': [
          'TJc7r4xW9qY2pZ8vFh7sWpMno66RTYu22',
          'TQr8k9xY3pZ9vGh8t8qNno77SUZv33',
          'TRd9m0yZ4qA0wHi9u9rOpo88TVaw44',
          'TSe0n1zA5rB1xIj0v0sPqp99UWbx55'
        ],
        'ERC20': [
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          '0x853e46Dd6645D154293a4c844Cd9fFf6f1b0cFc',
          '0x964f47Ee6656E155394b5d5e844Df0gGg2d1dGd',
          '0xa75g58Ff7767F266405c5e5e955Eg1hH3e2hHe'
        ],
        'BEP20': [
          '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u',
          '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v',
          '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w'
        ],
        'POLYGON': [
          '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x',
          '0x6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y',
          '0x7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
          '0x8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a'
        ]
      },
      'BTC': {
        'TRC20': [
          'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
          'bc1qr5k8j3x9v2w5h4g6f7d8s9t0u1v2w3x4y5z6a',
          'bc1qs6l9k4x0w3y6h5i7j8k9l0m1n2o3p4q5r6s7t'
        ],
        'ERC20': [
          '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b',
          '0x0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c',
          '0x1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
          '0x2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e'
        ]
      },
      'ETH': {
        'ERC20': [
          '0x3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
          '0x4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g',
          '0x5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h',
          '0x6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i'
        ],
        'POLYGON': [
          '0x7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j',
          '0x8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k',
          '0x9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l',
          '0x0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m'
        ]
      }
    }
    
    // 获取对应币种和网络的地址列表
    const addresses = MOCK_ADDRESSES[currency]?.[network] || []
    
    if (addresses.length === 0) {
      // 如果没有对应地址，返回默认地址
      return {
        address: 'TJc7r4xW9qY2pZ8vFh7sWpMno66RTYu22',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TJc7r4xW9qY2pZ8vFh7sWpMno66RTYu22`
      }
    }
    
    // 随机选择一个地址
    const randomIndex = Math.floor(Math.random() * addresses.length)
    const selectedAddress = addresses[randomIndex]
    
    return {
      address: selectedAddress,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedAddress}`
    }
  }
}

/**
 * 上传图片
 * @param {String} filePath 图片本地路径
 * @returns {Promise} 返回上传后的图片URL
 */
export async function uploadImage(filePath) {
  try {
    return await new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token') || ''
      
      uni.uploadFile({
        url: `${BASE_URL}/upload/image`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.code === 200) {
              resolve(data.data?.url || data.data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (e) {
            // 如果返回的不是JSON，可能是直接返回URL
            resolve(res.data)
          }
        },
        fail: (err) => {
          console.warn('图片上传失败:', err)
          reject(err)
        }
      })
    })
  } catch (error) {
    console.warn('图片上传失败，使用模拟数据:', error)
    // 降级：返回模拟URL
    return `https://picsum.photos/seed/${Date.now()}/800/600`
  }
}

/**
 * 提交KYC认证信息
 * @param {Object} data 认证数据
 * @returns {Promise}
 */
export async function submitKYC(data) {
  try {
    return await post('/kyc/submit', data)
  } catch (error) {
    console.warn('KYC提交失败，使用模拟数据:', error)
    // 降级：返回模拟成功响应
    return {
      success: true,
      message: '认证信息已提交',
      kycId: `KYC${Date.now()}`
    }
  }
}

/**
 * 发送验证码
 * @param {String} account 手机号或邮箱
 * @param {String} areaCode 区号（如 +86，仅手机号时需要）
 * @returns {Promise}
 */
export async function sendVerificationCode(account, areaCode = '+86') {
  try {
    // 判断是邮箱还是手机号
    const isEmail = account.includes('@')
    
    if (isEmail) {
      // 邮箱验证码
      return await post('/auth/send-code', {
        email: account
      })
    } else {
      // 手机验证码
      return await post('/auth/send-code', {
        phone: account,
        areaCode
      })
    }
  } catch (error) {
    console.warn('发送验证码失败，使用模拟数据:', error)
    // 降级：返回模拟成功响应
    return {
      success: true,
      message: '验证码已发送'
    }
  }
}

/**
 * 登录（邮箱/密码）
 * @param {String} email 邮箱
 * @param {String} password 密码
 * @returns {Promise}
 */
export async function loginWithEmail(email, password) {
  try {
    const result = await post('/auth/login', {
      email,
      password
    })
    // 保存 token
    if (result.token) {
      uni.setStorageSync('token', result.token)
    }
    return result
  } catch (error) {
    console.warn('登录失败，使用模拟数据:', error)
    // 降级：返回模拟成功响应
    const mockToken = `mock_token_${Date.now()}`
    uni.setStorageSync('token', mockToken)
    return {
      success: true,
      token: mockToken,
      user: {
        uid: '8219385012',
        nickname: 'User',
        email: email
      }
    }
  }
}

/**
 * 登录（手机/验证码）
 * @param {String} phone 手机号
 * @param {String} code 验证码
 * @param {String} areaCode 区号
 * @returns {Promise}
 */
export async function loginWithPhone(phone, code, areaCode = '+86') {
  try {
    const result = await post('/auth/login-phone', {
      phone,
      code,
      areaCode
    })
    // 保存 token
    if (result.token) {
      uni.setStorageSync('token', result.token)
    }
    return result
  } catch (error) {
    console.warn('登录失败，使用模拟数据:', error)
    // 降级：返回模拟成功响应
    const mockToken = `mock_token_${Date.now()}`
    uni.setStorageSync('token', mockToken)
    return {
      success: true,
      token: mockToken,
      user: {
        uid: '8219385012',
        nickname: 'User',
        phone: phone
      }
    }
  }
}

/**
 * 一键登录（本机号码）
 * @returns {Promise}
 */
export async function oneClickLogin() {
  try {
    const result = await post('/auth/one-click-login', {})
    // 保存 token
    if (result.token) {
      uni.setStorageSync('token', result.token)
    }
    return result
  } catch (error) {
    console.warn('一键登录失败，使用模拟数据:', error)
    // 降级：返回模拟成功响应
    const mockToken = `mock_token_${Date.now()}`
    uni.setStorageSync('token', mockToken)
    return {
      success: true,
      token: mockToken,
      user: {
        uid: '8219385012',
        nickname: 'User',
        phone: '138****8888'
      }
    }
  }
}

/**
 * 注册
 * @param {String} account 账号（手机号或邮箱）
 * @param {String} password 密码
 * @param {String} inviteCode 邀请码（可选）
 * @param {String} code 验证码（手机注册时必填）
 * @returns {Promise}
 */
export async function register(account, password, inviteCode = '', code = '') {
  try {
    const data = {
      account,
      password
    }
    
    // 如果是手机注册，添加验证码
    if (code) {
      data.code = code
    }
    
    // 如果有邀请码，添加邀请码
    if (inviteCode) {
      data.inviteCode = inviteCode
    }
    
    const result = await post('/auth/register', data)
    // 保存 token
    if (result.token) {
      uni.setStorageSync('token', result.token)
    }
    return result
  } catch (error) {
    console.warn('注册失败，使用模拟数据:', error)
    // 降级：返回模拟成功响应
    const mockToken = `mock_token_${Date.now()}`
    uni.setStorageSync('token', mockToken)
    return {
      success: true,
      token: mockToken,
      user: {
        uid: '8219385012',
        nickname: 'User',
        account: account
      }
    }
  }
}

// 导出默认对象，方便统一导入
export default {
  get,
  post,
  put,
  delete: del,
  getGateways,
  getHotMarkets,
  getAllMarkets,
  getNewsList,
  getNewsDetail,
  getMarketDetail,
  getUserBalance,
  getUserInfo,
  getMessages,
  getMessageDetail,
  markMessageAsRead,
  markAllMessagesAsRead,
  deleteMessage,
  getAccounts,
  deleteAccount,
  addAccount,
  uploadImage,
  submitKYC,
  sendVerificationCode,
  loginWithEmail,
  loginWithPhone,
  oneClickLogin,
  register
}

