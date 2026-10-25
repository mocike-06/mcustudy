/*!
 * McuStudy —— 全局主题管理
 * ------------------------------------------------------------------
 * 全站唯一的亮色 / 暗色切换逻辑，所有页面共用这一个文件。
 * 必须在 <head> 中以同步方式引入（不要加 defer），
 * 这样在首屏绘制前就把 .dark 类写到 <html> 上，避免闪白 / 闪黑。
 *
 * 主题值：'light' | 'dark' | 'auto'
 *   - 未设置过时默认 'auto'，跟随操作系统；
 *   - 用户点击按钮后写入 localStorage，之后不再跟随系统。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mcustudy-theme';
  var MODES = ['light', 'dark', 'auto'];

  var root = document.documentElement;

  /** 读取本地存储（隐私模式下 localStorage 可能抛异常，需容错） */
  function readMode() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return MODES.indexOf(v) >= 0 ? v : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function writeMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      /* 忽略：无法持久化时仅本次会话生效 */
    }
  }

  function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /** 把 mode 解析为实际生效的亮暗，并写入 DOM */
  function resolve(mode) {
    return mode === 'dark' || (mode === 'auto' && systemPrefersDark());
  }

  function apply(mode) {
    var isDark = resolve(mode);
    root.classList.toggle('dark', isDark);
    // 让浏览器原生控件（滚动条、表单、日期选择器）跟随主题
    root.style.colorScheme = isDark ? 'dark' : 'light';

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#0D1117' : '#F7F9FC');

    return isDark;
  }

  /* ---------- 对外 API ---------- */
  var McuTheme = {
    /** 当前保存的模式：light / dark / auto */
    get mode() {
      return readMode();
    },
    /** 当前实际是否暗色 */
    get isDark() {
      return root.classList.contains('dark');
    },
    /** 设置模式并持久化 */
    set: function (mode) {
      if (MODES.indexOf(mode) < 0) mode = 'auto';
      writeMode(mode);
      apply(mode);
      syncButtons(mode);
      return mode;
    },
    /** 在亮 / 暗之间一键切换（写死为显式模式，不再跟随系统） */
    toggle: function () {
      return McuTheme.set(root.classList.contains('dark') ? 'light' : 'dark');
    },
    /** 恢复跟随系统 */
    reset: function () {
      return McuTheme.set('auto');
    },
  };

  /* ---------- 首屏立即生效（关键：在任何绘制之前） ---------- */
  var initialMode = readMode();
  apply(initialMode);

  /* ---------- 按钮同步 ---------- */
  function syncButtons(mode) {
    var isDark = root.classList.contains('dark');
    var label = isDark ? '切换到亮色模式' : '切换到暗色模式';

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label + (mode === 'auto' ? '（当前跟随系统）' : ''));
      btn.setAttribute('aria-pressed', String(isDark));
    });
  }

  function bindButtons() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      if (btn.dataset.themeBound === '1') return;
      btn.dataset.themeBound = '1';

      btn.addEventListener('click', function () {
        McuTheme.toggle();
      });

      // 右键（或长按）恢复“跟随系统”，给高级用户一个后门
      btn.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        McuTheme.reset();
        if (window.McuToast) McuToast.show('主题已恢复为「跟随系统」');
      });
    });
    syncButtons(readMode());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindButtons);
  } else {
    bindButtons();
  }

  /* ---------- 跟随系统变化（仅 auto 模式） ---------- */
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSysChange = function () {
      if (readMode() === 'auto') apply('auto');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSysChange);
    else if (mq.addListener) mq.addListener(onSysChange);
  }

  // 同一浏览器多标签页之间同步主题
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      apply(readMode());
      syncButtons(readMode());
    }
  });

  window.McuTheme = McuTheme;
})();