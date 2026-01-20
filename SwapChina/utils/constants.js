// 常量文件 - 包含翻译、图标、模拟数据等

// 语言类型
export const LANGUAGES = {
  zh: 'zh',
  en: 'en',
  fr: 'fr',
  ar: 'ar'
};

// 翻译内容
export const TRANSLATIONS = {
  zh: {
    nav: { home: '首页', swap: '兑换', orders: '订单', assets: '账户', profile: '我的' },
    exchange: { 
      title: '余额兑换', 
      balance: '可用余额', 
      send: '支付 (USD)', 
      receive: '预计获得', 
      payout: '收款账户', 
      tip: '提示：由于合规要求，兑换可能需要1-3个工作日到账。' 
    },
    assets: { title: '收款账户', add: '新增', bank: '银行卡', wallet: '钱包', other: '其他' },
    auth: { 
      email: '邮箱', 
      phone: '手机', 
      code: '验证码', 
      sendCode: '获取验证码', 
      login: '登录', 
      register: '注册',
      welcomeBack: '欢迎回来',
      welcomeSubtitle: 'SwapChina 全球数字网关',
      areaCode: '区号',
      phoneNumber: '手机号码',
      password: '密码',
      account: '账号',
      inviteCode: '邀请码',
      inviteCodeOptional: '邀请码 (选填)',
      oneClickLogin: '本机号码一键登录',
      noAccount: '没有账户？',
      registerNow: '立即注册',
      alreadyHaveAccount: '已有账户？',
      loginNow: '立即登录',
      joinTraders: '加入数万名 SwapChina 交易者',
      startNow: '立即开启',
      phoneOrEmail: '手机号或邮箱',
      atLeast8Chars: '至少8位字符',
      enterPhone: '请输入手机号',
      enterEmail: '请输入邮箱',
      enterPassword: '请输入密码',
      enterCode: '请输入验证码',
      loginSuccess: '登录成功',
      registerSuccess: '注册成功',
      oneClickLoginSuccess: '本机号码认证成功',
      sendingCode: '验证码发送中...',
      codeSent: '验证码已发送',
      codeSendFailed: '验证码发送失败'
    },
    kyc: { 
      title: '实名认证',
      steps: {
        step1: '基础信息',
        step2: '身份证件',
        step3: '完成提交'
      },
      fullName: '真实姓名',
      fullNamePlaceholder: '请输入您的真实姓名',
      idType: '证件类型',
      idTypePlaceholder: '请选择证件类型',
      idNumber: '证件号码',
      idNumberPlaceholder: '请输入证件号码',
      uploadFront: '证件正面照片',
      uploadBack: '证件背面照片',
      uploadText: '点击上传或拍照',
      successTitle: '提交完成',
      successMessage: '我们将在24小时内审核您的申请。审核完成后，您将收到通知。',
      idTypes: {
        ID_CARD: '身份证',
        PASSPORT: '护照',
        DRIVER_LICENSE: '驾驶证'
      },
      continue: '继续',
      prevStep: '上一步',
      nextStep: '下一步',
      finish: '完成',
      submitting: '提交中...',
      validateFullName: '请输入真实姓名',
      validateIdType: '请选择证件类型',
      validateIdNumber: '请输入证件号码',
      validateIdNumberFormat: '证件号码格式不正确',
      validateFrontImage: '请上传证件正面照片',
      validateBackImage: '请上传证件背面照片',
      uploadSuccess: '上传成功',
      uploadFailed: '上传失败，请重试',
      submitSuccess: '认证信息已提交',
      submitFailed: '提交失败，请重试'
    },
    deposit: { 
      title: '充值', 
      fiat: '法币', 
      crypto: '加密货币', 
      thirdParty: '第三方', 
      amount: '充值金额', 
      selectBank: '选择银行', 
      tipFiat: '请按上述卡号汇款，并上传凭证', 
      tipCrypto: '仅支持对应网络，请勿转入其他资产', 
      proof: '支付凭证', 
      confirm: '确认充值', 
      usdNotice: '所有充值资产将按实时汇率结算为美元账户余额', 
      history: '充值记录' 
    }
  },
  en: {
    nav: { home: 'Home', swap: 'Swap', orders: 'Orders', assets: 'Accounts', profile: 'Profile' },
    exchange: { 
      title: 'Exchange', 
      balance: 'Balance', 
      send: 'Pay (USD)', 
      receive: 'Get', 
      payout: 'Payout Account', 
      tip: 'Tip: Due to compliance, exchanges may take 1-3 business days.' 
    },
    assets: { title: 'Accounts', add: 'Add', bank: 'Bank', wallet: 'Wallet', other: 'Other' },
    auth: { 
      email: 'Email', 
      phone: 'Phone', 
      code: 'Code', 
      sendCode: 'Get Code', 
      login: 'Login', 
      register: 'Register',
      welcomeBack: 'Welcome Back',
      welcomeSubtitle: 'SwapChina Global Digital Gateway',
      areaCode: 'Area Code',
      phoneNumber: 'Phone Number',
      password: 'Password',
      account: 'Account',
      inviteCode: 'Invite Code',
      inviteCodeOptional: 'Invite Code (Optional)',
      oneClickLogin: 'One-Click Login',
      noAccount: 'No account yet?',
      registerNow: 'Register Now',
      alreadyHaveAccount: 'Already have an account?',
      loginNow: 'Login Now',
      joinTraders: 'Join thousands of SwapChina traders',
      startNow: 'Get Started',
      phoneOrEmail: 'Phone or Email',
      atLeast8Chars: 'At least 8 characters',
      enterPhone: 'Enter phone number',
      enterEmail: 'Enter email',
      enterPassword: 'Enter password',
      enterCode: 'Enter verification code',
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful',
      oneClickLoginSuccess: 'One-click login successful',
      sendingCode: 'Sending code...',
      codeSent: 'Code sent',
      codeSendFailed: 'Failed to send code'
    },
    kyc: { 
      title: 'Identity Verification',
      steps: {
        step1: 'Basic Info',
        step2: 'Documents',
        step3: 'Complete'
      },
      fullName: 'Legal Full Name',
      fullNamePlaceholder: 'Enter your real name',
      idType: 'ID Type',
      idTypePlaceholder: 'Select ID type',
      idNumber: 'ID Number',
      idNumberPlaceholder: 'Enter ID number',
      uploadFront: 'Front of Document',
      uploadBack: 'Back of Document',
      uploadText: 'Tap to upload or take photo',
      successTitle: 'Submission Complete',
      successMessage: 'We will review your application within 24 hours. You will receive a notification once verified.',
      idTypes: {
        ID_CARD: 'Identity Card',
        PASSPORT: 'Passport',
        DRIVER_LICENSE: 'Driver License'
      },
      continue: 'Continue',
      prevStep: 'Previous',
      nextStep: 'Next Step',
      finish: 'Finish',
      submitting: 'Submitting...',
      validateFullName: 'Please enter your full name',
      validateIdType: 'Please select ID type',
      validateIdNumber: 'Please enter ID number',
      validateIdNumberFormat: 'Invalid ID number format',
      validateFrontImage: 'Please upload front of document',
      validateBackImage: 'Please upload back of document',
      uploadSuccess: 'Upload successful',
      uploadFailed: 'Upload failed, please try again',
      submitSuccess: 'Verification submitted',
      submitFailed: 'Submission failed, please try again'
    },
    deposit: { 
      title: 'Deposit', 
      fiat: 'Fiat', 
      crypto: 'Crypto', 
      thirdParty: 'Third Party', 
      amount: 'Amount', 
      selectBank: 'Select Bank', 
      tipFiat: 'Please transfer to the card above and upload proof', 
      tipCrypto: 'Only support specified network', 
      proof: 'Payment Proof', 
      confirm: 'Confirm', 
      usdNotice: 'All deposits are settled in USD', 
      history: 'Deposit History' 
    }
  },
  fr: {
    nav: { home: 'Accueil', swap: 'Échange', orders: 'Commandes', assets: 'Comptes', profile: 'Profil' },
    exchange: { 
      title: 'Échange', 
      balance: 'Solde', 
      send: 'Payer (USD)', 
      receive: 'Obtenir', 
      payout: 'Compte de paiement', 
      tip: 'Conseil: En raison de la conformité, les échanges peuvent prendre 1 à 3 jours ouvrables.' 
    },
    assets: { title: 'Comptes', add: 'Ajouter', bank: 'Banque', wallet: 'Portefeuille', other: 'Autre' },
    auth: { 
      email: 'Email', 
      phone: 'Téléphone', 
      code: 'Code', 
      sendCode: 'Obtenir le code', 
      login: 'Connexion', 
      register: 'S\'inscrire',
      welcomeBack: 'Bon retour',
      welcomeSubtitle: 'SwapChina Passerelle Numérique Mondiale',
      areaCode: 'Indicatif',
      phoneNumber: 'Numéro de téléphone',
      password: 'Mot de passe',
      account: 'Compte',
      inviteCode: 'Code d\'invitation',
      inviteCodeOptional: 'Code d\'invitation (Optionnel)',
      oneClickLogin: 'Connexion en un clic',
      noAccount: 'Pas encore de compte?',
      registerNow: 'S\'inscrire maintenant',
      alreadyHaveAccount: 'Vous avez déjà un compte?',
      loginNow: 'Se connecter maintenant',
      joinTraders: 'Rejoignez des milliers de traders SwapChina',
      startNow: 'Commencer',
      phoneOrEmail: 'Téléphone ou Email',
      atLeast8Chars: 'Au moins 8 caractères',
      enterPhone: 'Entrez le numéro de téléphone',
      enterEmail: 'Entrez l\'email',
      enterPassword: 'Entrez le mot de passe',
      enterCode: 'Entrez le code de vérification',
      loginSuccess: 'Connexion réussie',
      registerSuccess: 'Inscription réussie',
      oneClickLoginSuccess: 'Connexion en un clic réussie',
      sendingCode: 'Envoi du code...',
      codeSent: 'Code envoyé',
      codeSendFailed: 'Échec de l\'envoi du code'
    },
    kyc: { 
      title: 'Vérification d\'identité',
      steps: {
        step1: 'Informations de base',
        step2: 'Documents',
        step3: 'Terminer'
      },
      fullName: 'Nom complet légal',
      fullNamePlaceholder: 'Entrez votre vrai nom',
      idType: 'Type de pièce d\'identité',
      idTypePlaceholder: 'Sélectionnez le type',
      idNumber: 'Numéro de pièce d\'identité',
      idNumberPlaceholder: 'Entrez le numéro',
      uploadFront: 'Recto du document',
      uploadBack: 'Verso du document',
      uploadText: 'Appuyez pour télécharger ou prendre une photo',
      successTitle: 'Soumission terminée',
      successMessage: 'Nous examinerons votre demande dans les 24 heures. Vous recevrez une notification une fois vérifié.',
      idTypes: {
        ID_CARD: 'Carte d\'identité',
        PASSPORT: 'Passeport',
        DRIVER_LICENSE: 'Permis de conduire'
      },
      continue: 'Continuer',
      prevStep: 'Précédent',
      nextStep: 'Étape suivante',
      finish: 'Terminer',
      submitting: 'Envoi en cours...',
      validateFullName: 'Veuillez entrer votre nom complet',
      validateIdType: 'Veuillez sélectionner le type de pièce d\'identité',
      validateIdNumber: 'Veuillez entrer le numéro de pièce d\'identité',
      validateIdNumberFormat: 'Format de numéro de pièce d\'identité invalide',
      validateFrontImage: 'Veuillez télécharger le recto du document',
      validateBackImage: 'Veuillez télécharger le verso du document',
      uploadSuccess: 'Téléchargement réussi',
      uploadFailed: 'Échec du téléchargement, veuillez réessayer',
      submitSuccess: 'Vérification soumise',
      submitFailed: 'Échec de la soumission, veuillez réessayer'
    },
    deposit: { 
      title: 'Dépôt', 
      fiat: 'Fiat', 
      crypto: 'Crypto', 
      thirdParty: 'Tierce partie', 
      amount: 'Montant', 
      selectBank: 'Sélectionner la banque', 
      tipFiat: 'Veuillez transférer sur la carte ci-dessus et télécharger la preuve', 
      tipCrypto: 'Prend en charge uniquement le réseau spécifié', 
      proof: 'Preuve de paiement', 
      confirm: 'Confirmer', 
      usdNotice: 'Tous les dépôts sont réglés en USD', 
      history: 'Historique des dépôts' 
    }
  },
  ar: {
    nav: { home: 'الرئيسية', swap: 'تبادل', orders: 'الطلبات', assets: 'الحسابات', profile: 'الملف الشخصي' },
    exchange: { 
      title: 'تبادل', 
      balance: 'الرصيد', 
      send: 'دفع (USD)', 
      receive: 'استلام', 
      payout: 'حساب الدفع', 
      tip: 'نصيحة: بسبب الامتثال، قد تستغرق عمليات التبادل من 1 إلى 3 أيام عمل.' 
    },
    assets: { title: 'الحسابات', add: 'إضافة', bank: 'بنك', wallet: 'محفظة', other: 'آخر' },
    auth: { 
      email: 'البريد الإلكتروني', 
      phone: 'الهاتف', 
      code: 'الرمز', 
      sendCode: 'احصل على الرمز', 
      login: 'تسجيل الدخول', 
      register: 'تسجيل',
      welcomeBack: 'مرحباً بعودتك',
      welcomeSubtitle: 'SwapChina بوابة رقمية عالمية',
      areaCode: 'رمز المنطقة',
      phoneNumber: 'رقم الهاتف',
      password: 'كلمة المرور',
      account: 'الحساب',
      inviteCode: 'رمز الدعوة',
      inviteCodeOptional: 'رمز الدعوة (اختياري)',
      oneClickLogin: 'تسجيل الدخول بنقرة واحدة',
      noAccount: 'ليس لديك حساب؟',
      registerNow: 'سجل الآن',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      loginNow: 'تسجيل الدخول الآن',
      joinTraders: 'انضم إلى آلاف المتداولين في SwapChina',
      startNow: 'ابدأ الآن',
      phoneOrEmail: 'الهاتف أو البريد الإلكتروني',
      atLeast8Chars: '8 أحرف على الأقل',
      enterPhone: 'أدخل رقم الهاتف',
      enterEmail: 'أدخل البريد الإلكتروني',
      enterPassword: 'أدخل كلمة المرور',
      enterCode: 'أدخل رمز التحقق',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      registerSuccess: 'تم التسجيل بنجاح',
      oneClickLoginSuccess: 'تم التحقق من رقم الهاتف بنجاح',
      sendingCode: 'جاري إرسال الرمز...',
      codeSent: 'تم إرسال الرمز',
      codeSendFailed: 'فشل إرسال الرمز'
    },
    kyc: { 
      title: 'التحقق من الهوية',
      steps: {
        step1: 'المعلومات الأساسية',
        step2: 'الهوية',
        step3: 'إكمال'
      },
      fullName: 'الاسم الكامل القانوني',
      fullNamePlaceholder: 'أدخل اسمك الحقيقي',
      idType: 'نوع الهوية',
      idTypePlaceholder: 'اختر نوع الهوية',
      idNumber: 'رقم الهوية',
      idNumberPlaceholder: 'أدخل رقم الهوية',
      uploadFront: 'صورة الوجه الأمامي للوثيقة',
      uploadBack: 'صورة الوجه الخلفي للوثيقة',
      uploadText: 'اضغط للتحميل أو التقاط صورة',
      successTitle: 'اكتمل الإرسال',
      successMessage: 'سنراجع طلبك خلال 24 ساعة. ستتلقى إشعارًا بمجرد التحقق.',
      idTypes: {
        ID_CARD: 'بطاقة الهوية',
        PASSPORT: 'جواز السفر',
        DRIVER_LICENSE: 'رخصة القيادة'
      },
      continue: 'متابعة',
      prevStep: 'السابق',
      nextStep: 'الخطوة التالية',
      finish: 'إنهاء',
      submitting: 'جاري الإرسال...',
      validateFullName: 'يرجى إدخال الاسم الكامل',
      validateIdType: 'يرجى اختيار نوع الهوية',
      validateIdNumber: 'يرجى إدخال رقم الهوية',
      validateIdNumberFormat: 'تنسيق رقم الهوية غير صحيح',
      validateFrontImage: 'يرجى تحميل صورة الوجه الأمامي للوثيقة',
      validateBackImage: 'يرجى تحميل صورة الوجه الخلفي للوثيقة',
      uploadSuccess: 'تم التحميل بنجاح',
      uploadFailed: 'فشل التحميل، يرجى المحاولة مرة أخرى',
      submitSuccess: 'تم إرسال التحقق',
      submitFailed: 'فشل الإرسال، يرجى المحاولة مرة أخرى'
    },
    deposit: { 
      title: 'إيداع', 
      fiat: 'فيت', 
      crypto: 'كريبتو', 
      thirdParty: 'طرف ثالث', 
      amount: 'المبلغ', 
      selectBank: 'اختر البنك', 
      tipFiat: 'يرجى التحويل إلى البطاقة أعلاه وتحميل الإثبات', 
      tipCrypto: 'يدعم الشبكة المحددة فقط', 
      proof: 'إثبات الدفع', 
      confirm: 'تأكيد', 
      usdNotice: 'يتم تسوية جميع الودائع بالدولار الأمريكي', 
      history: 'سجل الإيداعات' 
    }
  }
};

// 加密货币配置（根据 /static/currencies 文件夹中的文件）
// 文件列表：BTC.svg, ETH.svg, USDT.svg
const CRYPTO_DISPLAY_CONFIG = {
  'BTC': { 
    name: { zh: '比特币', en: 'Bitcoin', fr: 'Bitcoin', ar: 'بيتكوين' }, 
    symbol: '₿' 
  },
  'ETH': { 
    name: { zh: '以太坊', en: 'Ethereum', fr: 'Ethereum', ar: 'إيثريوم' }, 
    symbol: 'Ξ' 
  },
  'USDT': { 
    name: { zh: '泰达币', en: 'Tether', fr: 'Tether', ar: 'تيثر' }, 
    symbol: '₮' 
  }
};

// 法币配置（根据 /static/flags 文件夹中的文件）
// 文件列表：cny.svg, eur.svg, ghs.svg, usd.svg, xaf.svg, xof.svg
const FIAT_CONFIG = {
  'CNY': { 
    name: { zh: '人民币', en: 'Chinese Yuan', fr: 'Yuan', ar: 'يوان' }, 
    symbol: '¥' 
  },
  'EUR': { 
    name: { zh: '欧元', en: 'Euro', fr: 'Euro', ar: 'يورو' }, 
    symbol: '€' 
  },
  'GHS': { 
    name: { zh: '加纳塞地', en: 'Ghanaian Cedi', fr: 'Cedi ghanéen', ar: 'سيدي غاني' }, 
    symbol: '₵' 
  },
  'USD': { 
    name: { zh: '美元', en: 'US Dollar', fr: 'Dollar américain', ar: 'دولار أمريكي' }, 
    symbol: '$' 
  },
  'XAF': { 
    name: { zh: '中非法郎', en: 'Central African CFA Franc', fr: 'Franc CFA', ar: 'فرنك أفريقي' }, 
    symbol: 'Fr' 
  },
  'XOF': { 
    name: { zh: '西非法郎', en: 'West African CFA Franc', fr: 'Franc CFA', ar: 'فرنك أفريقي' }, 
    symbol: 'Fr' 
  },
  'NGN': { 
    name: { zh: '奈拉', en: 'Naira', fr: 'Naira', ar: 'نايرا' }, 
    symbol: '₦' 
  }
};

// 根据文件夹中的文件动态生成加密货币数据
export const CRYPTO_CURRENCIES = [
  'BTC',
  'ETH', 
  'USDT'
].map(code => {
  const config = CRYPTO_DISPLAY_CONFIG[code] || { 
    name: { zh: code, en: code, fr: code, ar: code }, 
    symbol: '💵' 
  };
  return {
    code,
    name: config.name,
    symbol: config.symbol,
    type: 'CRYPTO',
    icon: code,
    svgPath: `/static/currencies/${code}.svg`
  };
});

// 根据文件夹中的文件动态生成法币数据
// 注意：只包含 flags 文件夹中实际存在的文件
export const FIAT_CURRENCIES = [
  'CNY',   // cny.svg
  'EUR',   // eur.svg
  'GHS',   // ghs.svg
  'USD',   // usd.svg
  'XAF',   // xaf.svg
  'XOF'    // xof.svg
  // NGN 已移除，因为 flags 文件夹中没有 ngn.svg
].map(code => {
  const config = FIAT_CONFIG[code] || { 
    name: { zh: code, en: code, fr: code, ar: code }, 
    symbol: '💵' 
  };
  // 法币的 SVG 文件名是小写的
  const svgFileName = code.toLowerCase();
  return {
    code,
    name: config.name,
    symbol: config.symbol,
    type: 'FIAT',
    icon: code,
    svgPath: `/static/flags/${svgFileName}.svg`
  };
});

// 所有货币数据（合并，用于向后兼容）
export const CURRENCIES = [...CRYPTO_CURRENCIES, ...FIAT_CURRENCIES];

// 根据货币代码获取货币信息
export function getCurrencyByCode(code) {
  return CURRENCIES.find(currency => currency.code === code) || null
}

// 根据货币类型获取货币列表
export function getCurrenciesByType(type) {
  if (type === 'CRYPTO') {
    return CRYPTO_CURRENCIES
  } else if (type === 'FIAT') {
    return FIAT_CURRENCIES
  }
  return CURRENCIES
}

// 模拟市场数据
export const MOCK_MARKET = [
  { 
    symbol: 'BTC/USDT', 
    price: 68420.50, 
    change24h: 2.45, 
    type: 'CRYPTO', 
    trend: [65000, 66500, 65800, 67200, 68420, 67900, 68420], 
    volume: '1.2B', 
    high24h: 69000, 
    low24h: 64500 
  },
  { 
    symbol: 'ETH/USDT', 
    price: 3450.20, 
    change24h: -1.15, 
    type: 'CRYPTO', 
    trend: [3600, 3550, 3580, 3500, 3420, 3450], 
    volume: '800M', 
    high24h: 3620, 
    low24h: 3380 
  },
  { 
    symbol: 'USDT/CNY', 
    price: 7.24, 
    change24h: 0.15, 
    type: 'FIAT', 
    trend: [7.22, 7.23, 7.23, 7.24, 7.24], 
    volume: '800M', 
    high24h: 7.26, 
    low24h: 7.22 
  },
  { 
    symbol: 'USDT/EUR', 
    price: 0.92, 
    change24h: -0.05, 
    type: 'FIAT', 
    trend: [0.93, 0.92, 0.92, 0.92, 0.92], 
    volume: '500M', 
    high24h: 0.93, 
    low24h: 0.91 
  },
  { 
    symbol: 'USDT/NGN', 
    price: 1540.0, 
    change24h: 3.20, 
    type: 'FIAT', 
    trend: [1480, 1500, 1520, 1530, 1540], 
    volume: '200M', 
    high24h: 1560, 
    low24h: 1450 
  }
];

// 模拟订单数据
export const MOCK_ORDERS = [
  { 
    id: 'ORD001', 
    createdAt: '2024-10-25 14:20:00', 
    status: 'COMPLETED', 
    fromAmount: 1000, 
    fromCurrency: 'USD', 
    toAmount: 7240, 
    toCurrency: 'CNY', 
    rate: 7.24 
  },
  { 
    id: 'ORD002', 
    createdAt: '2024-10-25 15:30:00', 
    status: 'PROCESSING', 
    fromAmount: 500, 
    fromCurrency: 'USD', 
    toAmount: 460, 
    toCurrency: 'EUR', 
    rate: 0.92 
  }
];

// 模拟充值记录
export const MOCK_DEPOSITS = [
  { 
    id: 'DEP001', 
    createdAt: '2024-10-25 09:00:00', 
    status: 'COMPLETED', 
    amount: 5000, 
    currency: 'CNY', 
    usdAmount: 690.61,
    paymentMethod: '招商银行 (**** 9901)',
    rate: 7.24,
    proofUrl: 'https://picsum.photos/seed/proof1/400/600'
  },
  { 
    id: 'DEP002', 
    createdAt: '2024-10-24 18:30:00', 
    status: 'PROCESSING', 
    amount: 200, 
    currency: 'USDT', 
    usdAmount: 200,
    paymentMethod: 'USDT-TRC20 钱包',
    rate: 1.0,
    proofUrl: 'https://picsum.photos/seed/proof2/400/600'
  }
];

// 平台收款卡
export const PLATFORM_RECEIPT_CARDS = [
  { 
    id: 'P1', 
    bankName: '招商银行', 
    lastName: '平台', 
    firstName: '收款 (中国)', 
    accountNumber: '6214 0000 1111 2222' 
  },
  { 
    id: 'P2', 
    bankName: 'Standard Chartered', 
    lastName: 'Global', 
    firstName: 'Escrow (HK)', 
    accountNumber: '5562 1001 2233 4455' 
  },
  { 
    id: 'P3', 
    bankName: 'Access Bank', 
    lastName: 'Swift', 
    firstName: 'Trade (Nigeria)', 
    accountNumber: '0123 4567 89' 
  },
  { 
    id: 'P4', 
    bankName: 'Société Générale', 
    lastName: 'Swap', 
    firstName: 'Euro (France)', 
    accountNumber: 'FR76 3000 6000 0112 3456' 
  }
];

// 模拟收款账户
export const MOCK_ACCOUNTS = [
  { 
    id: 'A1', 
    type: 'BANK', 
    provider: '招商银行', 
    accountName: '王小明', 
    accountNumber: '6214 **** **** 9901', 
    currency: 'CNY' 
  },
  { 
    id: 'A2', 
    type: 'BANK', 
    provider: 'Société Générale', 
    accountName: 'John Doe', 
    accountNumber: 'FR76 3000 6000 0112 3456', 
    currency: 'EUR' 
  },
  { 
    id: 'A3', 
    type: 'CRYPTO', 
    provider: 'Binance Wallet', 
    accountName: '我的USDT', 
    accountNumber: 'TJc7r4x...VfH7sWp', 
    currency: 'USDT', 
    network: 'TRC20' 
  },
  { 
    id: 'A4', 
    type: 'CRYPTO', 
    provider: 'MetaMask', 
    accountName: '以太钱包', 
    accountNumber: '0x71C...4E92', 
    currency: 'BTC', 
    network: 'BTC-Native' 
  },
  { 
    id: 'A5', 
    type: 'BANK', 
    provider: 'Access Bank', 
    accountName: 'Chidi Obi', 
    accountNumber: '0123456789', 
    currency: 'NGN' 
  }
];

// 模拟新闻
export const MOCK_NEWS = [
  {
    id: '1',
    title: { zh: '全球兑换活动开启', en: 'Global Exchange Event', fr: 'Événement Global', ar: 'حدث التبادل العالمي' },
    summary: { zh: '参与兑换活动，赢取手续费返现。', en: 'Join swap event for cashback.', fr: 'Rejoignez l\'événement pour du cashback.', ar: 'انضم لحدث التبادل لاسترداد النقود.' },
    content: { zh: 'SwapChina 现已开启全球限时兑换活动，所有跨境汇率锁定...', en: 'SwapChina global event is live with locked rates...', fr: 'L\'événement global SwapChina est lancé...', ar: 'حدث SwapChina العالمي متاح الآن...' },
    imageUrl: 'https://picsum.photos/seed/news1/600/400',
    date: '2024-10-25',
    category: 'PROMOTION'
  },
  {
    id: '2',
    title: { zh: '新用户注册送100元', en: 'New User Bonus $100', fr: 'Bonus Nouvel Utilisateur 100€', ar: 'مكافأة المستخدم الجديد 100$' },
    summary: { zh: '首次注册并完成实名认证即可获得100元奖励。', en: 'Get $100 bonus after registration and KYC.', fr: 'Obtenez 100€ après inscription et KYC.', ar: 'احصل على 100$ بعد التسجيل والتحقق.' },
    content: { zh: '新用户注册并完成实名认证，即可获得100元现金奖励...', en: 'New users can get $100 cash bonus after registration...', fr: 'Les nouveaux utilisateurs peuvent obtenir 100€...', ar: 'يمكن للمستخدمين الجدد الحصول على 100$...' },
    imageUrl: 'https://picsum.photos/seed/news2/600/400',
    date: '2024-10-24',
    category: 'PROMOTION'
  },
  {
    id: '3',
    title: { zh: '跨境支付手续费全免', en: 'Zero Fee Cross-Border Payment', fr: 'Paiement Transfrontalier Sans Frais', ar: 'دفع عبر الحدود بدون رسوم' },
    summary: { zh: '本月所有跨境支付交易手续费全免。', en: 'All cross-border payments are fee-free this month.', fr: 'Tous les paiements transfrontaliers sont gratuits ce mois-ci.', ar: 'جميع المدفوعات عبر الحدود مجانية هذا الشهر.' },
    content: { zh: '为庆祝平台上线，本月所有跨境支付交易手续费全免...', en: 'To celebrate platform launch, all cross-border payments are fee-free...', fr: 'Pour célébrer le lancement, tous les paiements sont gratuits...', ar: 'للاحتفال بالإطلاق، جميع المدفوعات مجانية...' },
    imageUrl: 'https://picsum.photos/seed/news3/600/400',
    date: '2024-10-23',
    category: 'PROMOTION'
  }
];

// 获取证件类型列表（根据当前语言）
export const getIdTypes = (lang = 'zh') => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.zh
  return [
    { value: 'ID_CARD', label: t.kyc.idTypes.ID_CARD },
    { value: 'PASSPORT', label: t.kyc.idTypes.PASSPORT },
    { value: 'DRIVER_LICENSE', label: t.kyc.idTypes.DRIVER_LICENSE }
  ]
}

// 加密货币网络列表
export const CRYPTO_NETWORKS = [
  { code: 'TRC20', name: 'TRC20 (Tron)' },
  { code: 'ERC20', name: 'ERC20 (Ethereum)' },
  { code: 'BEP20', name: 'BEP20 (BSC)' },
  { code: 'POLYGON', name: 'Polygon' },
  { code: 'BTC-Native', name: 'BTC Native' },
  { code: 'SegWit', name: 'SegWit' }
];

// 加密货币配置
export const CRYPTO_CONFIG = [
  { 
    code: 'USDT', 
    networks: ['TRC20', 'ERC20', 'BEP20', 'POLYGON'], 
    address: 'TJc7r4xW9qY2pZ8vFh7sWpMno66RTYu22', 
    rate: 1.0 
  },
  { 
    code: 'BTC', 
    networks: ['BTC-Native', 'SegWit'], 
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 
    rate: 68420.50 
  }
];

// 第三方通道
export const THIRD_PARTY_CHANNELS = [
  { id: 'alipay', name: '支付宝 (Alipay)', icon: '💳', currencies: ['CNY'] },
  { id: 'wechat', name: '微信支付 (WeChat)', icon: '💬', currencies: ['CNY'] },
  { id: 'wise', name: 'Wise 汇款', icon: '🦉', currencies: ['USD', 'EUR', 'GBP'] }
];

// 模拟消息数据
export const MOCK_MESSAGES = [
  { 
    id: '1', 
    title: '系统通知', 
    content: '您的实名认证已通过。', 
    time: '10:00', 
    read: false,
    fullContent: '恭喜您！您的实名认证申请已通过审核。现在您可以享受更高的交易限额和更多服务。如有任何问题，请联系客服。'
  },
  { 
    id: '2', 
    title: '到账提醒', 
    content: '您的一笔 1000 USD 兑换订单已完成。', 
    time: '昨天', 
    read: true,
    fullContent: '您的兑换订单 #ORD001 已完成。1000 USD 已成功兑换为 7240 CNY，资金已到达您的收款账户。'
  },
  { 
    id: '3', 
    title: '活动通知', 
    content: '新用户专享：首次兑换免手续费！', 
    time: '2天前', 
    read: false,
    fullContent: '欢迎加入 SwapChina！作为新用户，您首次兑换可享受免手续费优惠。活动有效期至本月底，快来体验吧！'
  }
];

