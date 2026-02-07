// ========== 工具函数 ==========

// 获取当前标签页信息
async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

// 从URL提取域名
function getDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
}

// 获取URL origin
function getOrigin(url) {
    try {
        return new URL(url).origin;
    } catch {
        return '';
    }
}

function isUnsupportedPageUrl(url) {
    return /^(chrome|chrome-extension|edge|about|moz-extension):/i.test(url || '');
}

const THEME_STORAGE_KEY = 'popupTheme';
const ACTIVE_TAB_STORAGE_KEY = 'popupActiveTab';
const LANGUAGE_STORAGE_KEY = 'popupLanguage';
const CLEANUP_LOG_STORAGE_KEY = 'cleanupLogs';
const DEFAULT_TAB_ID = 'cleanupTab';
const TAB_IDS = ['cleanupTab', 'historyTab', 'permissionTab'];
const DEFAULT_LANGUAGE = 'zh';
let currentLanguage = DEFAULT_LANGUAGE;
let cleanupLogCache = [];
let cleanupLogFilter = 'all';

const I18N_TEXT = {
    zh: {
        'app.title': '缓存清理专家',
        'language.current': 'EN',
        'language.switchTitle': '切换语言',
        'theme.light': '浅色',
        'theme.dark': '深色',
        'theme.switchTitle': '切换主题',
        'theme.switchAria': '切换深浅主题',
        'domain.scanning': '正在扫描...',
        'domain.unavailable': '无法获取',
        'tabs.ariaLabel': '功能导航',
        'tab.cleanup': '清理',
        'tab.history': '记录',
        'tab.permission': '权限',
        'clearItem.title': '清除此项',
        'card.cookies': 'Cookie 缓存',
        'card.localStorage': '本地存储',
        'card.sessionStorage': '会话存储',
        'card.indexedDB': 'IndexedDB',
        'card.cacheStorage': '缓存存储',
        'card.serviceWorker': 'SW 服务',
        'card.serviceWorkerMeta': 'Worker 线程',
        'btn.refresh': '重新扫描',
        'btn.clearAll': '一键清理',
        'history.title': '浏览记录',
        'history.range.1h': '过去一小时',
        'history.range.24h': '过去 24 小时',
        'history.range.7d': '过去 7 天',
        'history.range.4w': '过去 4 周',
        'history.range.all': '所有时间',
        'btn.clear': '清除',
        'resources.title': '页面资源占用',
        'resources.image': '图片',
        'resources.script': '脚本',
        'resources.style': '样式',
        'resources.other': '其他',
        'permission.title': '当前站点授权',
        'permission.status.checking': '检测中',
        'permission.status.unavailable': '不可用',
        'permission.status.granted': '已授权',
        'permission.status.denied': '未授权',
        'permission.status.error': '错误',
        'permission.detail.loading': '正在读取站点权限状态...',
        'permission.detail.unsupportedPage': '该页面类型不支持站点授权管理，请在 http/https 网页操作。',
        'permission.detail.invalidOrigin': '当前站点无法转换为授权规则。',
        'permission.detail.readFailed': '读取站点授权状态失败。',
        'whitelist.title': '站点保护列表',
        'whitelist.status.checking': '检测中',
        'whitelist.status.protected': '已保护',
        'whitelist.status.unprotected': '未保护',
        'whitelist.status.unavailable': '不可用',
        'whitelist.status.error': '错误',
        'whitelist.detail.loading': '正在读取站点保护状态...',
        'whitelist.detail.unsupportedPage': '该页面类型不支持站点保护判断，请在 http/https 网页操作。',
        'whitelist.detail.protected': '命中保护规则：{domain} {scope}',
        'whitelist.detail.unprotected': '当前站点不在保护列表中，可正常执行清理。',
        'whitelist.detail.readFailed': '读取站点保护状态失败。',
        'whitelist.btn.add': '加入保护',
        'whitelist.btn.remove': '取消保护',
        'whitelist.list.summary': '已保护 {count} 个站点',
        'whitelist.list.empty': '暂无保护站点',
        'whitelist.scope.subdomains': '含子域名',
        'whitelist.scope.exact': '仅主域',
        'btn.grant': '授权',
        'btn.revoke': '撤销',
        'btn.remove': '移除',
        'option.includeSubdomains': '包含所有子域名数据',
        'option.autoRefresh': '清理后自动刷新页面',
        'cleanup.action.cookies': 'Cookie 清理',
        'cleanup.action.localStorage': '本地存储清理',
        'cleanup.action.sessionStorage': '会话存储清理',
        'cleanup.action.indexedDB': 'IndexedDB 清理',
        'cleanup.action.cacheStorage': '缓存存储清理',
        'cleanup.action.serviceWorker': 'Service Worker 清理',
        'cleanup.action.all': '一键清理',
        'cleanup.action.history': '浏览记录清理',
        'cleanup.action.unknown': '未知清理项',
        'cleanup.log.title': '清理历史日志',
        'cleanup.log.summary': '最近 {count} 条',
        'cleanup.log.empty': '暂无清理记录',
        'cleanup.log.filter.all': '全部',
        'cleanup.log.filter.success': '成功',
        'cleanup.log.filter.failed': '失败',
        'cleanup.log.filter.blocked': '拦截',
        'cleanup.log.clear': '清空',
        'cleanup.log.result.success': '成功',
        'cleanup.log.result.partial': '部分成功',
        'cleanup.log.result.failed': '失败',
        'cleanup.log.result.blocked': '已拦截',
        'cleanup.log.count': '数量 {count}',
        'cleanup.log.time': '{time}',
        'message.unsupportedPageStats': '无法在此页面检测缓存',
        'cookie.unauthorized': '未授权',
        'indexedDB.count': '{count} 个数据库',
        'cacheStorage.entries': '{count} 条记录',
        'history.count': '{count} 条',
        'history.error': '错误',
        'message.permissionRequiredCookieClear': '未授予当前站点权限，无法清除 Cookie',
        'message.cookiesCleared': '已清除 {count} 个 Cookie',
        'message.localStorageCleared': '已清除 本地存储',
        'message.sessionStorageCleared': '已清除 会话存储',
        'message.indexedDBCleared': '已清除 IndexedDB 数据库',
        'message.cacheStorageCleared': '已清除 缓存存储',
        'message.serviceWorkerCleared': '已注销 Service Worker',
        'message.clearFailed': '清除失败',
        'message.allCleared': '已清除所有缓存数据！',
        'message.allClearedWithoutCookie': '已清除除 Cookie 外的数据（当前站点未授权）',
        'message.pageNoPermissionSupport': '当前页面不支持站点授权',
        'message.siteGranted': '已授权当前站点',
        'message.siteDenied': '站点授权被拒绝',
        'message.siteRevoked': '已撤销当前站点授权',
        'message.siteRevokeFailed': '撤销失败或站点未授权',
        'message.historyUnsupportedPage': '请在普通网页中操作浏览记录清理',
        'message.historyCleared': '已清除 {count} 条浏览记录',
        'message.historyClearFailed': '清除浏览记录失败',
        'message.whitelistBlockedAction': '当前站点受保护，已阻止 {action}',
        'message.whitelistUnsupportedPage': '当前页面不支持站点保护操作',
        'message.whitelistAdded': '已加入站点保护列表',
        'message.whitelistAddFailed': '加入保护列表失败',
        'message.whitelistRemoved': '已从保护列表移除',
        'message.whitelistRemoveFailed': '移除保护失败',
        'message.cleanupLogCleared': '已清空清理日志',
        'message.cleanupLogClearFailed': '清空清理日志失败'
    },
    en: {
        'app.title': 'Cache Cleaner Pro',
        'language.current': '中',
        'language.switchTitle': 'Switch language',
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'theme.switchTitle': 'Switch theme',
        'theme.switchAria': 'Switch between light and dark themes',
        'domain.scanning': 'Scanning...',
        'domain.unavailable': 'Unavailable',
        'tabs.ariaLabel': 'Feature navigation',
        'tab.cleanup': 'Cleanup',
        'tab.history': 'History',
        'tab.permission': 'Permissions',
        'clearItem.title': 'Clear this item',
        'card.cookies': 'Cookie Cache',
        'card.localStorage': 'Local Storage',
        'card.sessionStorage': 'Session Storage',
        'card.indexedDB': 'IndexedDB',
        'card.cacheStorage': 'Cache Storage',
        'card.serviceWorker': 'Service Worker',
        'card.serviceWorkerMeta': 'Worker Threads',
        'btn.refresh': 'Rescan',
        'btn.clearAll': 'Clear All',
        'history.title': 'Browsing History',
        'history.range.1h': 'Past hour',
        'history.range.24h': 'Past 24 hours',
        'history.range.7d': 'Past 7 days',
        'history.range.4w': 'Past 4 weeks',
        'history.range.all': 'All time',
        'btn.clear': 'Clear',
        'resources.title': 'Page Resource Usage',
        'resources.image': 'Images',
        'resources.script': 'Scripts',
        'resources.style': 'Styles',
        'resources.other': 'Other',
        'permission.title': 'Current Site Permission',
        'permission.status.checking': 'Checking',
        'permission.status.unavailable': 'Unavailable',
        'permission.status.granted': 'Granted',
        'permission.status.denied': 'Not granted',
        'permission.status.error': 'Error',
        'permission.detail.loading': 'Loading site permission status...',
        'permission.detail.unsupportedPage': 'This page type does not support site permission management. Open an http/https webpage.',
        'permission.detail.invalidOrigin': 'The current site cannot be converted to a permission origin pattern.',
        'permission.detail.readFailed': 'Failed to read site permission status.',
        'whitelist.title': 'Site Protection List',
        'whitelist.status.checking': 'Checking',
        'whitelist.status.protected': 'Protected',
        'whitelist.status.unprotected': 'Unprotected',
        'whitelist.status.unavailable': 'Unavailable',
        'whitelist.status.error': 'Error',
        'whitelist.detail.loading': 'Loading site protection status...',
        'whitelist.detail.unsupportedPage': 'This page type does not support site protection checks. Open an http/https webpage.',
        'whitelist.detail.protected': 'Matched protected rule: {domain} {scope}',
        'whitelist.detail.unprotected': 'This site is not protected and can be cleaned.',
        'whitelist.detail.readFailed': 'Failed to read site protection status.',
        'whitelist.btn.add': 'Protect',
        'whitelist.btn.remove': 'Unprotect',
        'whitelist.list.summary': '{count} protected sites',
        'whitelist.list.empty': 'No protected sites yet',
        'whitelist.scope.subdomains': 'incl. subdomains',
        'whitelist.scope.exact': 'exact only',
        'btn.grant': 'Grant',
        'btn.revoke': 'Revoke',
        'btn.remove': 'Remove',
        'option.includeSubdomains': 'Include all subdomain data',
        'option.autoRefresh': 'Auto refresh page after cleanup',
        'cleanup.action.cookies': 'cookie cleanup',
        'cleanup.action.localStorage': 'local storage cleanup',
        'cleanup.action.sessionStorage': 'session storage cleanup',
        'cleanup.action.indexedDB': 'IndexedDB cleanup',
        'cleanup.action.cacheStorage': 'cache storage cleanup',
        'cleanup.action.serviceWorker': 'service worker cleanup',
        'cleanup.action.all': 'clear all',
        'cleanup.action.history': 'history cleanup',
        'cleanup.action.unknown': 'unknown cleanup action',
        'cleanup.log.title': 'Cleanup History',
        'cleanup.log.summary': 'Recent {count}',
        'cleanup.log.empty': 'No cleanup logs yet',
        'cleanup.log.filter.all': 'All',
        'cleanup.log.filter.success': 'Success',
        'cleanup.log.filter.failed': 'Failed',
        'cleanup.log.filter.blocked': 'Blocked',
        'cleanup.log.clear': 'Clear',
        'cleanup.log.result.success': 'Success',
        'cleanup.log.result.partial': 'Partial',
        'cleanup.log.result.failed': 'Failed',
        'cleanup.log.result.blocked': 'Blocked',
        'cleanup.log.count': 'Count {count}',
        'cleanup.log.time': '{time}',
        'message.unsupportedPageStats': 'Cannot inspect cache on this page',
        'cookie.unauthorized': 'Not granted',
        'indexedDB.count': '{count} databases',
        'cacheStorage.entries': '{count} entries',
        'history.count': '{count} items',
        'history.error': 'Error',
        'message.permissionRequiredCookieClear': 'Site permission is required to clear cookies',
        'message.cookiesCleared': 'Cleared {count} cookies',
        'message.localStorageCleared': 'Cleared local storage',
        'message.sessionStorageCleared': 'Cleared session storage',
        'message.indexedDBCleared': 'Cleared IndexedDB databases',
        'message.cacheStorageCleared': 'Cleared cache storage',
        'message.serviceWorkerCleared': 'Service workers unregistered',
        'message.clearFailed': 'Cleanup failed',
        'message.allCleared': 'All cache data has been cleared!',
        'message.allClearedWithoutCookie': 'Cleared everything except cookies (site not granted)',
        'message.pageNoPermissionSupport': 'This page does not support site permissions',
        'message.siteGranted': 'Site permission granted',
        'message.siteDenied': 'Site permission request denied',
        'message.siteRevoked': 'Site permission revoked',
        'message.siteRevokeFailed': 'Failed to revoke or site was not granted',
        'message.historyUnsupportedPage': 'Please clear history on a regular webpage',
        'message.historyCleared': 'Cleared {count} history entries',
        'message.historyClearFailed': 'Failed to clear browsing history',
        'message.whitelistBlockedAction': 'This site is protected. Blocked: {action}',
        'message.whitelistUnsupportedPage': 'This page does not support protection operations',
        'message.whitelistAdded': 'Added to protection list',
        'message.whitelistAddFailed': 'Failed to add protection',
        'message.whitelistRemoved': 'Removed from protection list',
        'message.whitelistRemoveFailed': 'Failed to remove protection',
        'message.cleanupLogCleared': 'Cleanup logs cleared',
        'message.cleanupLogClearFailed': 'Failed to clear cleanup logs'
    }
};

function normalizeLanguage(language) {
    const safe = String(language || '').toLowerCase();
    if (safe.startsWith('en')) return 'en';
    if (safe.startsWith('zh')) return 'zh';
    return DEFAULT_LANGUAGE;
}

function detectPreferredLanguage() {
    try {
        const chromeLanguage = typeof chrome?.i18n?.getUILanguage === 'function'
            ? chrome.i18n.getUILanguage()
            : '';
        return normalizeLanguage(chromeLanguage || navigator.language || DEFAULT_LANGUAGE);
    } catch {
        return DEFAULT_LANGUAGE;
    }
}

function t(key, params = {}) {
    const langMessages = I18N_TEXT[currentLanguage] || I18N_TEXT[DEFAULT_LANGUAGE];
    const fallbackMessages = I18N_TEXT[DEFAULT_LANGUAGE];
    const template = langMessages?.[key] ?? fallbackMessages?.[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? `{${token}}`));
}

function setNodeText(id, text) {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
}

function applyStaticTexts() {
    setNodeText('appTitleText', t('app.title'));
    setNodeText('languageToggleText', t('language.current'));
    setNodeText('tabCleanupText', t('tab.cleanup'));
    setNodeText('tabHistoryText', t('tab.history'));
    setNodeText('tabPermissionText', t('tab.permission'));
    setNodeText('cardTitleCookies', t('card.cookies'));
    setNodeText('cardTitleLocalStorage', t('card.localStorage'));
    setNodeText('cardTitleSessionStorage', t('card.sessionStorage'));
    setNodeText('cardTitleIndexedDB', t('card.indexedDB'));
    setNodeText('cardTitleCacheStorage', t('card.cacheStorage'));
    setNodeText('cardTitleServiceWorker', t('card.serviceWorker'));
    setNodeText('serviceWorkerMetaText', t('card.serviceWorkerMeta'));
    setNodeText('refreshBtnText', t('btn.refresh'));
    setNodeText('clearAllBtnText', t('btn.clearAll'));
    setNodeText('historyTitleText', t('history.title'));
    setNodeText('historyRange1h', t('history.range.1h'));
    setNodeText('historyRange24h', t('history.range.24h'));
    setNodeText('historyRange7d', t('history.range.7d'));
    setNodeText('historyRange4w', t('history.range.4w'));
    setNodeText('historyRangeAll', t('history.range.all'));
    setNodeText('clearHistoryBtnText', t('btn.clear'));
    setNodeText('cleanupLogTitleText', t('cleanup.log.title'));
    setNodeText('cleanupLogFilterAllText', t('cleanup.log.filter.all'));
    setNodeText('cleanupLogFilterSuccessText', t('cleanup.log.filter.success'));
    setNodeText('cleanupLogFilterFailedText', t('cleanup.log.filter.failed'));
    setNodeText('cleanupLogFilterBlockedText', t('cleanup.log.filter.blocked'));
    setNodeText('clearCleanupLogBtnText', t('cleanup.log.clear'));
    setNodeText('cleanupLogSummaryText', t('cleanup.log.summary', { count: 0 }));
    setNodeText('resourcesTitleText', t('resources.title'));
    setNodeText('resourceImageText', t('resources.image'));
    setNodeText('resourceScriptText', t('resources.script'));
    setNodeText('resourceStyleText', t('resources.style'));
    setNodeText('resourceOtherText', t('resources.other'));
    setNodeText('permissionTitleText', t('permission.title'));
    setNodeText('sitePermissionStatus', t('permission.status.checking'));
    setNodeText('sitePermissionDetail', t('permission.detail.loading'));
    setNodeText('grantSitePermissionBtnText', t('btn.grant'));
    setNodeText('revokeSitePermissionBtnText', t('btn.revoke'));
    setNodeText('whitelistTitleText', t('whitelist.title'));
    setNodeText('whitelistStatus', t('whitelist.status.checking'));
    setNodeText('whitelistDetail', t('whitelist.detail.loading'));
    setNodeText('addWhitelistBtnText', t('whitelist.btn.add'));
    setNodeText('removeWhitelistBtnText', t('whitelist.btn.remove'));
    setNodeText('whitelistListSummary', t('whitelist.list.summary', { count: 0 }));
    setNodeText('includeSubdomainsText', t('option.includeSubdomains'));
    setNodeText('autoRefreshText', t('option.autoRefresh'));

    const tabsRoot = document.getElementById('tabsRoot');
    if (tabsRoot) {
        tabsRoot.setAttribute('aria-label', t('tabs.ariaLabel'));
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.title = t('theme.switchTitle');
        themeToggleBtn.setAttribute('aria-label', t('theme.switchAria'));
    }

    const languageToggleBtn = document.getElementById('languageToggleBtn');
    if (languageToggleBtn) {
        languageToggleBtn.title = t('language.switchTitle');
        languageToggleBtn.setAttribute('aria-label', t('language.switchTitle'));
    }

    document.querySelectorAll('.clear-icon').forEach(icon => {
        icon.setAttribute('title', t('clearItem.title'));
    });

    const domainNode = document.getElementById('currentDomain');
    if (domainNode) {
        const raw = (domainNode.textContent || '').trim();
        if (!raw || ['正在扫描...', 'Scanning...', '无法获取', 'Unavailable'].includes(raw)) {
            domainNode.textContent = t('domain.scanning');
        }
    }
}

function applyLanguage(language) {
    currentLanguage = normalizeLanguage(language);
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    applyStaticTexts();
    applyTheme(getCurrentTheme());
}

async function initLanguage() {
    const savedLanguage = await getStorageLocalValue(LANGUAGE_STORAGE_KEY);
    applyLanguage(savedLanguage || detectPreferredLanguage());
}

async function toggleLanguage() {
    const nextLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    applyLanguage(nextLanguage);
    await setStorageLocalValue({ [LANGUAGE_STORAGE_KEY]: nextLanguage });
}

function normalizeTheme(theme) {
    return theme === 'light' ? 'light' : 'dark';
}

function getCurrentTheme() {
    return normalizeTheme(document.documentElement.getAttribute('data-theme'));
}

function applyTheme(theme) {
    const safeTheme = normalizeTheme(theme);
    document.documentElement.setAttribute('data-theme', safeTheme);

    const icon = document.getElementById('themeToggleIcon');
    const text = document.getElementById('themeToggleText');
    if (icon) {
        icon.className = safeTheme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (text) {
        text.textContent = safeTheme === 'light' ? t('theme.light') : t('theme.dark');
    }
}

function getStorageLocalValue(key) {
    return new Promise(resolve => {
        try {
            chrome.storage.local.get([key], data => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    console.warn('读取主题配置失败:', err);
                    resolve(undefined);
                    return;
                }
                resolve(data?.[key]);
            });
        } catch (e) {
            console.warn('读取主题配置异常:', e);
            resolve(undefined);
        }
    });
}

function setStorageLocalValue(value) {
    return new Promise(resolve => {
        try {
            chrome.storage.local.set(value, () => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    console.warn('保存主题配置失败:', err);
                }
                resolve();
            });
        } catch (e) {
            console.warn('保存主题配置异常:', e);
            resolve();
        }
    });
}

function setStorageLocalValueStrict(value) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set(value, () => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function initTheme() {
    const savedTheme = await getStorageLocalValue(THEME_STORAGE_KEY);
    applyTheme(savedTheme);
}

async function toggleTheme() {
    const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    await setStorageLocalValue({ [THEME_STORAGE_KEY]: nextTheme });
}

function normalizeTabId(tabId) {
    return TAB_IDS.includes(tabId) ? tabId : DEFAULT_TAB_ID;
}

function getTabButtons() {
    return Array.from(document.querySelectorAll('.tab-btn'));
}

function getActiveTabIndex(buttons = getTabButtons()) {
    const index = buttons.findIndex(btn => btn.classList.contains('active'));
    return index >= 0 ? index : 0;
}

function setActiveTab(tabId) {
    const safeTabId = normalizeTabId(tabId);
    const buttons = getTabButtons();

    buttons.forEach(btn => {
        const active = btn.dataset.tab === safeTabId;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.setAttribute('tabindex', active ? '0' : '-1');
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
        const active = panel.id === safeTabId;
        panel.classList.toggle('active', active);
        panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    return safeTabId;
}

function switchTabByOffset(offset, shouldFocus = false) {
    const buttons = getTabButtons();
    if (buttons.length === 0) return DEFAULT_TAB_ID;

    const currentIndex = getActiveTabIndex(buttons);
    const nextIndex = (currentIndex + offset + buttons.length) % buttons.length;
    const nextButton = buttons[nextIndex];
    const tabId = setActiveTab(nextButton.dataset.tab);
    if (shouldFocus) {
        nextButton.focus();
    }
    return tabId;
}

function isEditableTarget(target) {
    if (!target) return false;
    const tagName = target.tagName?.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
    return !!target.isContentEditable;
}

async function initTabs() {
    const buttons = getTabButtons();
    if (buttons.length === 0) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const tabId = setActiveTab(btn.dataset.tab);
            await setStorageLocalValue({ [ACTIVE_TAB_STORAGE_KEY]: tabId });
        });
    });

    document.addEventListener('keydown', async (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (isEditableTarget(e.target)) return;

        e.preventDefault();
        const offset = e.key === 'ArrowRight' ? 1 : -1;
        const tabId = switchTabByOffset(offset, true);
        await setStorageLocalValue({ [ACTIVE_TAB_STORAGE_KEY]: tabId });
    });

    const savedTab = await getStorageLocalValue(ACTIVE_TAB_STORAGE_KEY);
    setActiveTab(savedTab);
}

function isPermissionApiAvailable() {
    return !!chrome.permissions && typeof chrome.permissions.contains === 'function';
}

function getSiteOriginPattern(url) {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) return '';
        return `${parsed.origin}/*`;
    } catch {
        return '';
    }
}

function permissionsContains(details) {
    return new Promise(resolve => {
        if (!isPermissionApiAvailable()) {
            resolve(false);
            return;
        }
        try {
            chrome.permissions.contains(details, result => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    console.warn('permissions.contains failed:', err);
                    resolve(false);
                    return;
                }
                resolve(!!result);
            });
        } catch (e) {
            console.warn('permissions.contains exception:', e);
            resolve(false);
        }
    });
}

function permissionsRequest(details) {
    return new Promise(resolve => {
        if (!isPermissionApiAvailable() || typeof chrome.permissions.request !== 'function') {
            resolve(false);
            return;
        }
        try {
            chrome.permissions.request(details, granted => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    console.warn('permissions.request failed:', err);
                    resolve(false);
                    return;
                }
                resolve(!!granted);
            });
        } catch (e) {
            console.warn('permissions.request exception:', e);
            resolve(false);
        }
    });
}

function permissionsRemove(details) {
    return new Promise(resolve => {
        if (!isPermissionApiAvailable() || typeof chrome.permissions.remove !== 'function') {
            resolve(false);
            return;
        }
        try {
            chrome.permissions.remove(details, removed => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    console.warn('permissions.remove failed:', err);
                    resolve(false);
                    return;
                }
                resolve(!!removed);
            });
        } catch (e) {
            console.warn('permissions.remove exception:', e);
            resolve(false);
        }
    });
}

async function hasSitePermission(url) {
    const originPattern = getSiteOriginPattern(url);
    if (!originPattern) return false;
    return permissionsContains({ origins: [originPattern] });
}

async function requestSitePermission(url) {
    const originPattern = getSiteOriginPattern(url);
    if (!originPattern) return false;
    return permissionsRequest({ origins: [originPattern] });
}

async function revokeSitePermission(url) {
    const originPattern = getSiteOriginPattern(url);
    if (!originPattern) return false;
    return permissionsRemove({ origins: [originPattern] });
}

function setPermissionStatusBadge(granted, text) {
    const statusNode = document.getElementById('sitePermissionStatus');
    if (!statusNode) return;
    statusNode.classList.remove('granted', 'denied', 'unknown');
    statusNode.classList.add(granted === null ? 'unknown' : granted ? 'granted' : 'denied');
    statusNode.textContent = text;
}

async function updateSitePermissionStatus() {
    const siteNode = document.getElementById('permissionSite');
    const detailNode = document.getElementById('sitePermissionDetail');
    const grantBtn = document.getElementById('grantSitePermissionBtn');
    const revokeBtn = document.getElementById('revokeSitePermissionBtn');

    if (!siteNode || !detailNode || !grantBtn || !revokeBtn) return;

    try {
        const tab = await getCurrentTab();
        const url = tab?.url || '';
        const domain = getDomain(url) || '-';
        siteNode.textContent = domain;

        if (!url || isUnsupportedPageUrl(url)) {
            setPermissionStatusBadge(null, t('permission.status.unavailable'));
            detailNode.textContent = t('permission.detail.unsupportedPage');
            grantBtn.disabled = true;
            revokeBtn.disabled = true;
            return;
        }

        const originPattern = getSiteOriginPattern(url);
        if (!originPattern) {
            setPermissionStatusBadge(null, t('permission.status.unavailable'));
            detailNode.textContent = t('permission.detail.invalidOrigin');
            grantBtn.disabled = true;
            revokeBtn.disabled = true;
            return;
        }

        const granted = await hasSitePermission(url);
        setPermissionStatusBadge(granted, granted ? t('permission.status.granted') : t('permission.status.denied'));
        detailNode.textContent = `${originPattern}`;
        grantBtn.disabled = granted;
        revokeBtn.disabled = !granted;
    } catch (e) {
        console.error('更新站点授权状态失败:', e);
        setPermissionStatusBadge(null, t('permission.status.error'));
        detailNode.textContent = t('permission.detail.readFailed');
    }
}

function extensionRequest(type, payload = {}) {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage({ type, ...payload }, response => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    reject(err);
                    return;
                }
                if (!response || !response.ok) {
                    reject(new Error(response?.error || `${type} failed`));
                    return;
                }
                resolve(response);
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function listWhitelistRules() {
    const response = await extensionRequest('whitelist_list');
    return Array.isArray(response.rules) ? response.rules : [];
}

async function addWhitelistRule(domain, includeSubdomains) {
    const response = await extensionRequest('whitelist_add', { domain, includeSubdomains });
    return { rule: response.rule || null, rules: Array.isArray(response.rules) ? response.rules : [] };
}

async function removeWhitelistRule(domain) {
    const response = await extensionRequest('whitelist_remove', { domain });
    return { removed: !!response.removed, rules: Array.isArray(response.rules) ? response.rules : [] };
}

async function checkWhitelistDomain(domain) {
    const response = await extensionRequest('whitelist_check', { domain });
    return { protected: !!response.protected, rule: response.rule || null };
}

async function appendCleanupLogEntry(entry) {
    await extensionRequest('cleanup_log_add', { entry });
}

async function listCleanupLogs() {
    const response = await extensionRequest('cleanup_log_list');
    return Array.isArray(response.logs) ? response.logs : [];
}

async function clearCleanupLogs() {
    try {
        await extensionRequest('cleanup_log_clear');
    } catch (err) {
        console.warn('cleanup_log_clear failed, fallback to local storage clear:', err);
        await setStorageLocalValueStrict({ [CLEANUP_LOG_STORAGE_KEY]: [] });
    }
}

function setWhitelistStatusBadge(protectedState, text) {
    const statusNode = document.getElementById('whitelistStatus');
    if (!statusNode) return;
    statusNode.classList.remove('granted', 'denied', 'unknown');
    statusNode.classList.add(protectedState === null ? 'unknown' : protectedState ? 'granted' : 'denied');
    statusNode.textContent = text;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatLogTime(timestamp) {
    const safeTs = Number(timestamp);
    if (!Number.isFinite(safeTs) || safeTs <= 0) return '-';
    try {
        const formatter = new Intl.DateTimeFormat(currentLanguage === 'zh' ? 'zh-CN' : 'en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        return formatter.format(new Date(safeTs));
    } catch {
        return new Date(safeTs).toLocaleString();
    }
}

function getCleanupResultText(result) {
    const safe = String(result || '').toLowerCase();
    if (safe === 'success') return t('cleanup.log.result.success');
    if (safe === 'partial') return t('cleanup.log.result.partial');
    if (safe === 'blocked') return t('cleanup.log.result.blocked');
    return t('cleanup.log.result.failed');
}

function getCleanupResultClass(result) {
    const safe = String(result || '').toLowerCase();
    if (safe === 'success') return 'success';
    if (safe === 'partial') return 'partial';
    if (safe === 'blocked') return 'blocked';
    return 'failed';
}

function normalizeCleanupLogFilter(filter) {
    const safe = String(filter || '').toLowerCase();
    if (['all', 'success', 'failed', 'blocked'].includes(safe)) return safe;
    return 'all';
}

function matchesCleanupLogFilter(log, filter) {
    const safeFilter = normalizeCleanupLogFilter(filter);
    if (safeFilter === 'all') return true;
    const result = String(log?.result || '').toLowerCase();
    if (safeFilter === 'failed') return result === 'failed' || result === 'partial';
    return result === safeFilter;
}

function updateCleanupLogFilterUI() {
    document.querySelectorAll('#cleanupLogFilterGroup .cleanup-log-filter-btn').forEach(btn => {
        const active = btn.dataset.filter === cleanupLogFilter;
        btn.classList.toggle('active', active);
    });
}

function setCleanupLogFilter(filter) {
    cleanupLogFilter = normalizeCleanupLogFilter(filter);
    updateCleanupLogFilterUI();
    renderCleanupLogs(cleanupLogCache);
}

function renderCleanupLogs(logs) {
    const listNode = document.getElementById('cleanupLogList');
    const summaryNode = document.getElementById('cleanupLogSummaryText');
    if (!listNode || !summaryNode) return;

    const safeLogs = (Array.isArray(logs) ? logs : [])
        .filter(log => matchesCleanupLogFilter(log, cleanupLogFilter))
        .slice(0, 30);
    summaryNode.textContent = t('cleanup.log.summary', { count: safeLogs.length });

    if (safeLogs.length === 0) {
        listNode.innerHTML = `<div class="cleanup-log-empty">${escapeHtml(t('cleanup.log.empty'))}</div>`;
        return;
    }

    listNode.innerHTML = safeLogs.map(log => {
        const domain = escapeHtml(log?.domain || '-');
        const actionText = escapeHtml(getCleanupActionText(log?.action || 'unknown'));
        const timeText = escapeHtml(t('cleanup.log.time', { time: formatLogTime(log?.timestamp) }));
        const resultClass = getCleanupResultClass(log?.result);
        const resultText = escapeHtml(getCleanupResultText(log?.result));
        const countText = Number.isFinite(Number(log?.count))
            ? `<span>${escapeHtml(t('cleanup.log.count', { count: Number(log.count) }))}</span>`
            : '';

        return `
        <div class="cleanup-log-item">
          <div class="cleanup-log-top">
            <div class="cleanup-log-domain">${domain}</div>
            <span class="cleanup-log-status ${resultClass}">${resultText}</span>
          </div>
          <div class="cleanup-log-meta">
            <span>${actionText}</span>
            ${countText}
            <span>${timeText}</span>
          </div>
        </div>
      `;
    }).join('');
}

async function updateCleanupLogList() {
    try {
        cleanupLogCache = await listCleanupLogs();
        updateCleanupLogFilterUI();
        renderCleanupLogs(cleanupLogCache);
    } catch (e) {
        console.error('读取清理日志失败:', e);
        cleanupLogCache = [];
        updateCleanupLogFilterUI();
        renderCleanupLogs([]);
    }
}

function renderWhitelistRules(rules) {
    const listNode = document.getElementById('whitelistList');
    const summaryNode = document.getElementById('whitelistListSummary');
    if (!listNode || !summaryNode) return;

    const safeRules = Array.isArray(rules) ? rules : [];
    summaryNode.textContent = t('whitelist.list.summary', { count: safeRules.length });

    if (safeRules.length === 0) {
        listNode.innerHTML = `<div class="whitelist-empty">${escapeHtml(t('whitelist.list.empty'))}</div>`;
        return;
    }

    listNode.innerHTML = safeRules.map(rule => {
        const scopeText = rule.includeSubdomains ? t('whitelist.scope.subdomains') : t('whitelist.scope.exact');
        const domain = escapeHtml(rule.domain);
        return `
        <div class="whitelist-item">
          <div class="whitelist-item-main">
            <span class="whitelist-domain">${domain}</span>
            <span class="whitelist-scope">${escapeHtml(scopeText)}</span>
          </div>
          <button class="whitelist-remove" type="button" data-remove-domain="${domain}">${escapeHtml(t('btn.remove'))}</button>
        </div>
      `;
    }).join('');
}

async function updateWhitelistStatus() {
    const siteNode = document.getElementById('whitelistCurrentSite');
    const statusNode = document.getElementById('whitelistStatus');
    const detailNode = document.getElementById('whitelistDetail');
    const addBtn = document.getElementById('addWhitelistBtn');
    const removeBtn = document.getElementById('removeWhitelistBtn');
    if (!siteNode || !statusNode || !detailNode || !addBtn || !removeBtn) return;

    let rules = [];
    try {
        rules = await listWhitelistRules();
    } catch (e) {
        console.error('读取白名单失败:', e);
    }
    renderWhitelistRules(rules);

    try {
        const tab = await getCurrentTab();
        const url = tab?.url || '';
        const domain = getDomain(url) || '-';
        siteNode.textContent = domain;

        if (!url || isUnsupportedPageUrl(url) || !getDomain(url)) {
            setWhitelistStatusBadge(null, t('whitelist.status.unavailable'));
            detailNode.textContent = t('whitelist.detail.unsupportedPage');
            addBtn.disabled = true;
            removeBtn.disabled = true;
            return;
        }

        const status = await checkWhitelistDomain(domain);
        if (status.protected) {
            const scope = status.rule?.includeSubdomains ? t('whitelist.scope.subdomains') : t('whitelist.scope.exact');
            setWhitelistStatusBadge(true, t('whitelist.status.protected'));
            detailNode.textContent = t('whitelist.detail.protected', { domain: status.rule?.domain || domain, scope });
            addBtn.disabled = true;
            removeBtn.disabled = false;
            return;
        }

        setWhitelistStatusBadge(false, t('whitelist.status.unprotected'));
        detailNode.textContent = t('whitelist.detail.unprotected');
        addBtn.disabled = false;
        removeBtn.disabled = true;
    } catch (e) {
        console.error('更新白名单状态失败:', e);
        setWhitelistStatusBadge(null, t('whitelist.status.error'));
        detailNode.textContent = t('whitelist.detail.readFailed');
        addBtn.disabled = true;
        removeBtn.disabled = true;
    }
}

const CLEANUP_ACTION_TEXT_KEYS = {
    cookies: 'cleanup.action.cookies',
    localStorage: 'cleanup.action.localStorage',
    sessionStorage: 'cleanup.action.sessionStorage',
    indexedDB: 'cleanup.action.indexedDB',
    cacheStorage: 'cleanup.action.cacheStorage',
    serviceWorker: 'cleanup.action.serviceWorker',
    all: 'cleanup.action.all',
    history: 'cleanup.action.history',
    unknown: 'cleanup.action.unknown'
};

function getCleanupActionText(actionType) {
    const key = CLEANUP_ACTION_TEXT_KEYS[actionType] || CLEANUP_ACTION_TEXT_KEYS.unknown;
    return t(key);
}

async function recordCleanupLog({ domain, action, result, count = null, detail = '' }) {
    const safeDomain = normalizeDomain(domain);
    if (!safeDomain || !action) return;
    try {
        await appendCleanupLogEntry({
            timestamp: Date.now(),
            domain: safeDomain,
            action,
            result,
            count: Number.isFinite(Number(count)) ? Number(count) : null,
            detail: String(detail || '').slice(0, 300)
        });
        await updateCleanupLogList();
    } catch (e) {
        console.warn('记录清理日志失败:', e);
    }
}

async function assertWhitelistAllowed(domain, actionType) {
    const safeDomain = normalizeDomain(domain);
    if (!safeDomain) return true;
    try {
        const status = await checkWhitelistDomain(safeDomain);
        if (!status.protected) return true;
        showMessage(t('message.whitelistBlockedAction', { action: getCleanupActionText(actionType) }), 'error');
        await recordCleanupLog({
            domain: safeDomain,
            action: actionType,
            result: 'blocked',
            detail: 'blocked_by_whitelist'
        });
        return false;
    } catch (e) {
        console.warn('白名单拦截检查失败，继续执行清理:', e);
        return true;
    }
}

// 格式化字节大小
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 显示消息
function showMessage(text, type = 'success') {
    const msg = document.getElementById('message');
    const icon = msg.querySelector('i');
    const span = msg.querySelector('span');
    const style = getComputedStyle(document.documentElement);
    const successColor = style.getPropertyValue('--success').trim() || '#00ff88';
    const dangerColor = style.getPropertyValue('--danger').trim() || '#ff6b6b';

    // 设置图标和文本
    if (type === 'success') {
        icon.className = 'fa-solid fa-circle-check';
        msg.style.borderLeft = `4px solid ${successColor}`;
    } else {
        icon.className = 'fa-solid fa-circle-exclamation';
        msg.style.borderLeft = `4px solid ${dangerColor}`;
    }

    span.textContent = text;
    msg.className = `toast show ${type}`;

    // 3秒后隐藏
    setTimeout(() => {
        msg.className = 'toast';
    }, 3000);
}

// ========== Cookie 相关 ==========

async function getCookies(domain, includeSubdomains) {
    try {
        const cookies = await chrome.cookies.getAll({});
        return cookies.filter(cookie => {
            if (includeSubdomains) {
                return cookie.domain === domain ||
                    cookie.domain === '.' + domain ||
                    cookie.domain.endsWith('.' + domain) ||
                    domain.endsWith(cookie.domain.replace(/^\./, ''));
            } else {
                return cookie.domain === domain || cookie.domain === '.' + domain;
            }
        });
    } catch (e) {
        console.warn('读取 Cookie 失败，可能未授予站点权限:', e);
        return [];
    }
}

async function deleteCookie(cookie) {
    const protocol = cookie.secure ? 'https:' : 'http:';
    const url = `${protocol}//${cookie.domain.replace(/^\./, '')}${cookie.path}`;
    return chrome.cookies.remove({ url, name: cookie.name });
}

async function clearCookies(domain, includeSubdomains) {
    const cookies = await getCookies(domain, includeSubdomains);
    await Promise.all(cookies.map(deleteCookie));
    return cookies.length;
}

// ========== 页面存储检测（通过注入脚本获取） ==========

async function getStorageStats(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const stats = {
                    localStorage: { count: 0, size: 0 },
                    sessionStorage: { count: 0, size: 0 },
                    indexedDB: { databases: [] },
                    cacheStorage: { caches: [] },
                    serviceWorker: { count: 0 },
                    resources: { images: 0, scripts: 0, styles: 0, others: 0 }
                };

                // LocalStorage
                try {
                    stats.localStorage.count = localStorage.length;
                    let lsSize = 0;
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        lsSize += key.length + (localStorage.getItem(key) || '').length;
                    }
                    stats.localStorage.size = lsSize * 2; // UTF-16
                } catch (e) { }

                // SessionStorage
                try {
                    stats.sessionStorage.count = sessionStorage.length;
                    let ssSize = 0;
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        ssSize += key.length + (sessionStorage.getItem(key) || '').length;
                    }
                    stats.sessionStorage.size = ssSize * 2;
                } catch (e) { }

                // 资源缓存统计（通过 Performance API）
                try {
                    const entries = performance.getEntriesByType('resource');
                    entries.forEach(entry => {
                        const type = entry.initiatorType;
                        if (type === 'img' || entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i)) {
                            stats.resources.images++;
                        } else if (type === 'script' || entry.name.match(/\.js(\?|$)/i)) {
                            stats.resources.scripts++;
                        } else if (type === 'link' || type === 'css' || entry.name.match(/\.css(\?|$)/i)) {
                            stats.resources.styles++;
                        } else {
                            stats.resources.others++;
                        }
                    });
                } catch (e) { }

                return stats;
            }
        });
        return results[0]?.result || null;
    } catch (e) {
        console.error('获取存储统计失败:', e);
        return null;
    }
}

// 获取 IndexedDB 数据库列表
async function getIndexedDBStats(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                try {
                    const databases = await indexedDB.databases();
                    return { count: databases.length, databases: databases.map(db => db.name) };
                } catch {
                    return { count: 0, databases: [] };
                }
            }
        });
        return results[0]?.result || { count: 0, databases: [] };
    } catch {
        return { count: 0, databases: [] };
    }
}

// 获取 Cache Storage 统计
async function getCacheStorageStats(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                try {
                    const cacheNames = await caches.keys();
                    let totalSize = 0;
                    for (const name of cacheNames) {
                        const cache = await caches.open(name);
                        const requests = await cache.keys();
                        totalSize += requests.length;
                    }
                    return { count: cacheNames.length, entries: totalSize };
                } catch {
                    return { count: 0, entries: 0 };
                }
            }
        });
        return results[0]?.result || { count: 0, entries: 0 };
    } catch {
        return { count: 0, entries: 0 };
    }
}

// 获取 Service Worker 统计
async function getServiceWorkerStats(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    return { count: registrations.length };
                } catch {
                    return { count: 0 };
                }
            }
        });
        return results[0]?.result || { count: 0 };
    } catch {
        return { count: 0 };
    }
}

// ========== 清除功能 ==========

async function clearLocalStorage(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => localStorage.clear()
        });
        return true;
    } catch {
        return false;
    }
}

async function clearSessionStorage(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => sessionStorage.clear()
        });
        return true;
    } catch {
        return false;
    }
}

async function clearIndexedDB(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                try {
                    const databases = await indexedDB.databases();
                    for (const db of databases) {
                        if (db.name) indexedDB.deleteDatabase(db.name);
                    }
                } catch { }
            }
        });
        return true;
    } catch {
        return false;
    }
}

async function clearCacheStorage(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                } catch { }
            }
        });
        return true;
    } catch {
        return false;
    }
}

async function clearServiceWorkers(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: async () => {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(registrations.map(reg => reg.unregister()));
                } catch { }
            }
        });
        return true;
    } catch {
        return false;
    }
}

// 使用 browsingData API 清除缓存
async function clearBrowsingCache(origin) {
    try {
        await chrome.browsingData.removeCache({
            origins: [origin]
        });
        return true;
    } catch {
        return false;
    }
}

// ========== 统计更新 ==========

async function updateAllStats() {
    const tab = await getCurrentTab();
    const domain = getDomain(tab.url);
    const includeSubdomains = document.getElementById('includeSubdomains').checked;

    document.getElementById('currentDomain').textContent = domain || t('domain.unavailable');

    if (!domain || isUnsupportedPageUrl(tab.url)) {
        showMessage(t('message.unsupportedPageStats'), 'error');
        return;
    }

    const sitePermissionGranted = await hasSitePermission(tab.url);

    // Cookie 统计（依赖站点授权）
    if (sitePermissionGranted) {
        const cookies = await getCookies(domain, includeSubdomains);
        document.getElementById('cookieCount').textContent = cookies.length;
        const cookieSize = cookies.reduce((sum, c) => sum + c.name.length + c.value.length, 0);
        document.getElementById('cookieSize').textContent = cookieSize > 0 ? formatBytes(cookieSize) : '';
    } else {
        document.getElementById('cookieCount').textContent = '-';
        document.getElementById('cookieSize').textContent = t('cookie.unauthorized');
    }

    // 页面存储统计
    const storageStats = await getStorageStats(tab.id);
    if (storageStats) {
        document.getElementById('localStorageCount').textContent = storageStats.localStorage.count;
        document.getElementById('localStorageSize').textContent =
            storageStats.localStorage.size > 0 ? formatBytes(storageStats.localStorage.size) : '';

        document.getElementById('sessionStorageCount').textContent = storageStats.sessionStorage.count;
        document.getElementById('sessionStorageSize').textContent =
            storageStats.sessionStorage.size > 0 ? formatBytes(storageStats.sessionStorage.size) : '';

        // 资源统计
        document.getElementById('imageCount').textContent = storageStats.resources.images;
        document.getElementById('scriptCount').textContent = storageStats.resources.scripts;
        document.getElementById('styleCount').textContent = storageStats.resources.styles;
        document.getElementById('otherCount').textContent = storageStats.resources.others;
    }

    // IndexedDB 统计
    const idbStats = await getIndexedDBStats(tab.id);
    document.getElementById('indexedDBCount').textContent = idbStats.count;
    if (idbStats.count > 0) {
        document.getElementById('indexedDBSize').textContent = t('indexedDB.count', { count: idbStats.count });
    } else {
        document.getElementById('indexedDBSize').textContent = '';
    }

    // Cache Storage 统计
    const cacheStats = await getCacheStorageStats(tab.id);
    document.getElementById('cacheStorageCount').textContent = cacheStats.count;
    if (cacheStats.entries > 0) {
        document.getElementById('cacheStorageSize').textContent = t('cacheStorage.entries', { count: cacheStats.entries });
    } else {
        document.getElementById('cacheStorageSize').textContent = '';
    }

    // Service Worker 统计
    const swStats = await getServiceWorkerStats(tab.id);
    document.getElementById('serviceWorkerCount').textContent = swStats.count;
}

// ========== 分类清除处理 ==========

async function clearByType(type) {
    const tab = await getCurrentTab();
    const domain = getDomain(tab.url);
    const includeSubdomains = document.getElementById('includeSubdomains').checked;
    const autoRefresh = document.getElementById('autoRefresh').checked;

    const allowed = await assertWhitelistAllowed(domain, type);
    if (!allowed) return;

    let success = false;
    let message = '';
    let cleanedCount = null;

    switch (type) {
        case 'cookies': {
            let sitePermissionGranted = await hasSitePermission(tab.url);
            if (!sitePermissionGranted) {
                sitePermissionGranted = await requestSitePermission(tab.url);
                await updateSitePermissionStatus();
            }

            if (!sitePermissionGranted) {
                success = false;
                message = t('message.permissionRequiredCookieClear');
                break;
            }

            const count = await clearCookies(domain, includeSubdomains);
            success = true;
            cleanedCount = count;
            message = t('message.cookiesCleared', { count });
            break;
        }
        case 'localStorage':
            success = await clearLocalStorage(tab.id);
            message = success ? t('message.localStorageCleared') : t('message.clearFailed');
            break;
        case 'sessionStorage':
            success = await clearSessionStorage(tab.id);
            message = success ? t('message.sessionStorageCleared') : t('message.clearFailed');
            break;
        case 'indexedDB':
            success = await clearIndexedDB(tab.id);
            message = success ? t('message.indexedDBCleared') : t('message.clearFailed');
            break;
        case 'cacheStorage':
            success = await clearCacheStorage(tab.id);
            message = success ? t('message.cacheStorageCleared') : t('message.clearFailed');
            break;
        case 'serviceWorker':
            success = await clearServiceWorkers(tab.id);
            message = success ? t('message.serviceWorkerCleared') : t('message.clearFailed');
            break;
    }

    showMessage(message, success ? 'success' : 'error');
    await recordCleanupLog({
        domain,
        action: type,
        result: success ? 'success' : 'failed',
        count: cleanedCount,
        detail: success ? '' : message
    });

    if (success) {
        await updateAllStats();
        await updateSitePermissionStatus();
        await updateWhitelistStatus();
        if (autoRefresh) {
            setTimeout(() => {
                chrome.tabs.reload(tab.id);
                window.close();
            }, 500);
        }
    }
}

// 清除全部
async function clearAll() {
    const tab = await getCurrentTab();
    const domain = getDomain(tab.url);
    const origin = getOrigin(tab.url);
    const includeSubdomains = document.getElementById('includeSubdomains').checked;
    const autoRefresh = document.getElementById('autoRefresh').checked;

    const allowed = await assertWhitelistAllowed(domain, 'all');
    if (!allowed) return;

    let cookiePermissionGranted = await hasSitePermission(tab.url);
    if (!cookiePermissionGranted) {
        cookiePermissionGranted = await requestSitePermission(tab.url);
    }

    const cookieTask = cookiePermissionGranted
        ? clearCookies(domain, includeSubdomains)
        : Promise.resolve(0);

    await Promise.all([
        cookieTask,
        clearLocalStorage(tab.id),
        clearSessionStorage(tab.id),
        clearIndexedDB(tab.id),
        clearCacheStorage(tab.id),
        clearServiceWorkers(tab.id),
        clearBrowsingCache(origin)
    ]);

    if (cookiePermissionGranted) {
        showMessage(t('message.allCleared'), 'success');
    } else {
        showMessage(t('message.allClearedWithoutCookie'), 'error');
    }
    await recordCleanupLog({
        domain,
        action: 'all',
        result: cookiePermissionGranted ? 'success' : 'partial',
        detail: cookiePermissionGranted ? '' : 'cookie_permission_missing'
    });

    await updateAllStats();
    await updateSitePermissionStatus();
    await updateWhitelistStatus();

    if (autoRefresh) {
        setTimeout(() => {
            chrome.tabs.reload(tab.id);
            window.close();
        }, 500);
    }
}

// ========== 浏览记录功能 ==========

function normalizeDomain(domain) {
    return (domain || '').replace(/^www\./, '').toLowerCase();
}

function getDomainCandidates(domain) {
    const normalized = normalizeDomain(domain);
    if (!normalized) return [];
    const parts = normalized.split('.');
    const candidates = new Set();
    candidates.add(normalized);
    if (parts[0] === 'www' && parts.length > 1) {
        candidates.add(parts.slice(1).join('.'));
    }
    if (parts.length > 2) {
        candidates.add(parts.slice(-2).join('.'));
    }
    if (parts.length > 3) {
        candidates.add(parts.slice(-3).join('.'));
    }
    return Array.from(candidates).filter(Boolean);
}

function matchesDomain(itemDomain, baseDomain, includeSubdomains) {
    if (!itemDomain || !baseDomain) return false;
    if (includeSubdomains) {
        return itemDomain === baseDomain || itemDomain.endsWith('.' + baseDomain);
    }
    return itemDomain === baseDomain;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function urlMatchesCandidates(url, candidates, includeSubdomains) {
    const safeUrl = (url || '').toLowerCase();
    return candidates.some(candidate => {
        if (!candidate) return false;
        if (!includeSubdomains) {
            const exactHost = new RegExp('://'+ escapeRegExp(candidate) + '([/:]|$)', 'i');
            return exactHost.test(safeUrl);
        }
        const hostRegex = new RegExp('://([a-z0-9-]+\\.)*' + escapeRegExp(candidate) + '([/:]|$)', 'i');
        return hostRegex.test(safeUrl);
    });
}

function matchesCandidates(itemDomain, candidates, includeSubdomains) {
    return candidates.some(candidate => matchesDomain(itemDomain, candidate, includeSubdomains));
}

const HISTORY_MAX_RESULTS = 5000;

function historySearch(query) {
    return new Promise((resolve, reject) => {
        try {
            chrome.history.search(query, results => {
                const err = chrome.runtime?.lastError;
                if (err) {
                    console.error('history.search failed:', err);
                    resolve([]);
                    return;
                }
                resolve(results || []);
            });
        } catch (e) {
            console.error('history.search exception:', e);
            resolve([]);
        }
    });
}

function isHistoryApiAvailable() {
    return !!chrome.history && typeof chrome.history.search === 'function';
}

function toSafeTimeRangeMs(timeRangeMs) {
    const parsed = Number(timeRangeMs);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return parsed;
}

function filterHistoryItems(items, candidates, includeSubdomains) {
    return (items || []).filter(item => {
        try {
            const itemDomain = normalizeDomain(new URL(item.url).hostname);
            return matchesCandidates(itemDomain, candidates, includeSubdomains);
        } catch {
            return urlMatchesCandidates(item.url, candidates, includeSubdomains);
        }
    });
}

async function getHistoryItemsFromPopup(domain, timeRangeMs, includeSubdomains) {
    const safeTimeRangeMs = toSafeTimeRangeMs(timeRangeMs);
    const startTime = safeTimeRangeMs > 0 ? Date.now() - safeTimeRangeMs : 0;
    const candidates = getDomainCandidates(domain);
    if (candidates.length === 0) return [];

    const queryTexts = Array.from(new Set([candidates[0], ...candidates, ''])).filter(text => text !== undefined);
    const queryResults = await Promise.all(
        queryTexts.map(async text => {
            try {
                return await historySearch({
                    text,
                    startTime,
                    maxResults: HISTORY_MAX_RESULTS
                });
            } catch (err) {
                console.error('history.search failed:', err);
                return [];
            }
        })
    );

    const mergedByUrl = new Map();
    for (const results of queryResults) {
        const filtered = filterHistoryItems(results, candidates, includeSubdomains);
        for (const item of filtered) {
            if (!item?.url || mergedByUrl.has(item.url)) continue;
            mergedByUrl.set(item.url, item);
        }
    }

    return Array.from(mergedByUrl.values());
}

function historyRequest(type, payload) {
    return extensionRequest(type, payload);
}

// 获取与域名相关的浏览记录统计
async function getHistoryStats(domain, timeRangeMs, includeSubdomains) {
    const safeTimeRangeMs = toSafeTimeRangeMs(timeRangeMs);

    try {
        const response = await historyRequest('history_get', { domain, timeRangeMs: safeTimeRangeMs, includeSubdomains });
        return response.count;
    } catch (e) {
        console.warn('history_get via background failed, fallback to popup context:', e);
    }

    try {
        if (!isHistoryApiAvailable()) return 0;
        const items = await getHistoryItemsFromPopup(domain, safeTimeRangeMs, includeSubdomains);
        return items.length;
    } catch (e) {
        console.error('搜索历史记录失败:', e);
        return 0;
    }
}

// 清除与域名相关的浏览记录
async function clearHistory(domain, timeRangeMs, includeSubdomains) {
    const safeTimeRangeMs = toSafeTimeRangeMs(timeRangeMs);

    try {
        const response = await historyRequest('history_clear', { domain, timeRangeMs: safeTimeRangeMs, includeSubdomains });
        return response.count;
    } catch (e) {
        console.warn('history_clear via background failed, fallback to popup context:', e);
    }

    if (!isHistoryApiAvailable()) {
        return 0;
    }

    const items = await getHistoryItemsFromPopup(domain, safeTimeRangeMs, includeSubdomains);
    for (const item of items) {
        await chrome.history.deleteUrl({ url: item.url });
    }
    return items.length;
}

// 更新浏览记录统计
async function updateHistoryStats() {
    try {
        const tab = await getCurrentTab();
        if (!tab || !tab.url) {
            document.getElementById('historyCount').textContent = '-';
            return;
        }

        const domain = getDomain(tab.url);
        const timeRangeMs = toSafeTimeRangeMs(document.getElementById('historyTimeRange').value);
        const includeSubdomains = document.getElementById('includeSubdomains').checked;

        if (!domain || isUnsupportedPageUrl(tab.url)) {
            document.getElementById('historyCount').textContent = '-';
            return;
        }

        const count = await getHistoryStats(domain, timeRangeMs, includeSubdomains);
        document.getElementById('historyCount').textContent = t('history.count', { count });
    } catch (e) {
        console.error('获取浏览记录统计失败:', e);
        document.getElementById('historyCount').textContent = t('history.error');
    }
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', async () => {
    await initLanguage();
    await initTheme();
    await initTabs();

    const languageToggleBtn = document.getElementById('languageToggleBtn');
    if (languageToggleBtn) {
        languageToggleBtn.addEventListener('click', async () => {
            await toggleLanguage();
            await updateAllStats();
            await updateHistoryStats();
            await updateSitePermissionStatus();
            await updateWhitelistStatus();
            await updateCleanupLogList();
        });
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', async () => {
            await toggleTheme();
        });
    }

    await updateAllStats();
    await updateHistoryStats();
    await updateSitePermissionStatus();
    await updateWhitelistStatus();
    await updateCleanupLogList();

    // 子域名选项变化时更新统计
    document.getElementById('includeSubdomains').addEventListener('change', async () => {
        await updateAllStats();
        await updateHistoryStats();
        await updateWhitelistStatus();
    });

    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', async () => {
        await updateAllStats();
        await updateHistoryStats();
        await updateSitePermissionStatus();
        await updateWhitelistStatus();
        await updateCleanupLogList();
    });

    // 清除全部按钮
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);

    // 缓存卡片上的清除图标点击事件
    document.querySelectorAll('.cache-card .clear-icon').forEach(icon => {
        icon.addEventListener('click', async (e) => {
            e.stopPropagation();
            const type = e.target.closest('.cache-card').dataset.type;
            await clearByType(type);
        });
    });

    // 缓存卡片点击事件（可选：显示详情或选中）
    document.querySelectorAll('.cache-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('clear-icon')) return;
            card.classList.toggle('active');
        });
    });

    // 浏览记录时间范围变化时更新统计
    document.getElementById('historyTimeRange').addEventListener('change', updateHistoryStats);

    // 站点授权按钮
    document.getElementById('grantSitePermissionBtn').addEventListener('click', async () => {
        const tab = await getCurrentTab();
        if (!tab?.url || isUnsupportedPageUrl(tab.url)) {
            showMessage(t('message.pageNoPermissionSupport'), 'error');
            return;
        }
        const granted = await requestSitePermission(tab.url);
        showMessage(granted ? t('message.siteGranted') : t('message.siteDenied'), granted ? 'success' : 'error');
        await updateSitePermissionStatus();
        await updateAllStats();
        await updateWhitelistStatus();
    });

    document.getElementById('revokeSitePermissionBtn').addEventListener('click', async () => {
        const tab = await getCurrentTab();
        if (!tab?.url || isUnsupportedPageUrl(tab.url)) {
            showMessage(t('message.pageNoPermissionSupport'), 'error');
            return;
        }
        const removed = await revokeSitePermission(tab.url);
        showMessage(removed ? t('message.siteRevoked') : t('message.siteRevokeFailed'), removed ? 'success' : 'error');
        await updateSitePermissionStatus();
        await updateAllStats();
        await updateWhitelistStatus();
    });

    // 白名单管理按钮
    document.getElementById('addWhitelistBtn').addEventListener('click', async () => {
        try {
            const tab = await getCurrentTab();
            if (!tab?.url || isUnsupportedPageUrl(tab.url)) {
                showMessage(t('message.whitelistUnsupportedPage'), 'error');
                return;
            }
            const domain = normalizeDomain(getDomain(tab.url));
            if (!domain) {
                showMessage(t('message.whitelistUnsupportedPage'), 'error');
                return;
            }
            const includeSubdomains = document.getElementById('includeSubdomains').checked;
            await addWhitelistRule(domain, includeSubdomains);
            showMessage(t('message.whitelistAdded'), 'success');
            await updateWhitelistStatus();
        } catch (e) {
            console.error('加入白名单失败:', e);
            showMessage(t('message.whitelistAddFailed'), 'error');
        }
    });

    document.getElementById('removeWhitelistBtn').addEventListener('click', async () => {
        try {
            const tab = await getCurrentTab();
            if (!tab?.url || isUnsupportedPageUrl(tab.url)) {
                showMessage(t('message.whitelistUnsupportedPage'), 'error');
                return;
            }
            const domain = normalizeDomain(getDomain(tab.url));
            if (!domain) {
                showMessage(t('message.whitelistUnsupportedPage'), 'error');
                return;
            }
            await removeWhitelistRule(domain);
            showMessage(t('message.whitelistRemoved'), 'success');
            await updateWhitelistStatus();
        } catch (e) {
            console.error('移除白名单失败:', e);
            showMessage(t('message.whitelistRemoveFailed'), 'error');
        }
    });

    document.getElementById('whitelistList').addEventListener('click', async e => {
        const removeButton = e.target.closest('[data-remove-domain]');
        if (!removeButton) return;
        try {
            const domain = normalizeDomain(removeButton.dataset.removeDomain || '');
            if (!domain) return;
            await removeWhitelistRule(domain);
            showMessage(t('message.whitelistRemoved'), 'success');
            await updateWhitelistStatus();
        } catch (err) {
            console.error('移除白名单条目失败:', err);
            showMessage(t('message.whitelistRemoveFailed'), 'error');
        }
    });

    // 清理日志筛选与清空
    document.getElementById('cleanupLogFilterGroup').addEventListener('click', e => {
        const button = e.target.closest('[data-filter]');
        if (!button) return;
        setCleanupLogFilter(button.dataset.filter || 'all');
    });

    document.getElementById('clearCleanupLogBtn').addEventListener('click', async () => {
        try {
            await clearCleanupLogs();
            cleanupLogCache = [];
            renderCleanupLogs([]);
            updateCleanupLogFilterUI();
            showMessage(t('message.cleanupLogCleared'), 'success');
        } catch (e) {
            console.error('清空清理日志失败:', e);
            showMessage(t('message.cleanupLogClearFailed'), 'error');
        }
    });

    // 清除浏览记录按钮
    document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
        try {
            const tab = await getCurrentTab();
            if (!tab?.url || isUnsupportedPageUrl(tab.url)) {
                showMessage(t('message.historyUnsupportedPage'), 'error');
                return;
            }
            const domain = getDomain(tab.url);
            const allowed = await assertWhitelistAllowed(domain, 'history');
            if (!allowed) return;
            const timeRangeMs = toSafeTimeRangeMs(document.getElementById('historyTimeRange').value);
            const includeSubdomains = document.getElementById('includeSubdomains').checked;

            const count = await clearHistory(domain, timeRangeMs, includeSubdomains);
            showMessage(t('message.historyCleared', { count }), 'success');
            await recordCleanupLog({
                domain,
                action: 'history',
                result: 'success',
                count,
                detail: ''
            });
            await updateHistoryStats();
        } catch (e) {
            console.error('清除浏览记录失败:', e);
            showMessage(t('message.historyClearFailed'), 'error');
            let failedDomain = '';
            try {
                const tab = await getCurrentTab();
                failedDomain = getDomain(tab?.url || '');
            } catch { }
            await recordCleanupLog({
                domain: failedDomain,
                action: 'history',
                result: 'failed',
                detail: String(e?.message || e || '')
            });
        }
    });
});
