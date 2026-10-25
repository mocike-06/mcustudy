/*!
 * McuStudy —— 全站公共交互脚本
 * ------------------------------------------------------------------
 * 包含 6 件事，全部为零依赖的原生实现：
 *   1. 顶部导航：移动端抽屉、滚动阴影、当前页高亮
 *   2. 代码块：自动装配标题栏 + 一键复制 + 轻量语法高亮
 *   3. 文章页侧边目录：滚动高亮（scroll-spy）
 *   4. 全局轻提示 Toast（替代原生 alert）
 *   5. 资料下载页的“静态演示”占位按钮
 *   6. 回到顶部
 *
 * 语法高亮刻意保持轻量：约 60 行、单条正则、无任何第三方依赖，
 * 只覆盖 C / bash / python 的常见 Token，够用且不会拖慢首屏。
 */
(function () {
  'use strict';

  /* ================================================================
     0. 小工具
     ================================================================ */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ================================================================
     1. 语法高亮
     ================================================================ */
  var LANGS = {
    c: {
      keywords: [
        'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
        'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
        'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
        'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
        'unsigned', 'void', 'volatile', 'while',
        /* Keil C51 扩展关键字 */
        'bit', 'sbit', 'sfr', 'sfr16', 'idata', 'xdata', 'code', 'data',
        'bdata', 'pdata', 'interrupt', 'using', 'naked', 'reentrant',
        /* STM32 / ESP32 常见宏 */
        'NULL', 'true', 'false',
      ],
      types: [
        'u8', 'u16', 'u32', 's8', 's16', 's32', 'uint', 'uchar', 'byte',
        'word', 'bool', 'size_t',
        'uint8_t', 'uint16_t', 'uint32_t', 'int8_t', 'int16_t', 'int32_t',
        'GPIO_TypeDef', 'TIM_TypeDef', 'USART_TypeDef', 'ADC_TypeDef',
        'I2C_TypeDef', 'SPI_TypeDef', 'DMA_TypeDef', 'HAL_StatusTypeDef',
        'UART_HandleTypeDef', 'I2C_HandleTypeDef', 'ADC_HandleTypeDef',
        'TIM_HandleTypeDef', 'TaskHandle_t', 'QueueHandle_t', 'String',
      ],
    },
    bash: {
      keywords: [
        'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done',
        'case', 'esac', 'function', 'return', 'in', 'export', 'source',
        'echo', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'sudo', 'apt',
        'npm', 'pnpm', 'git', 'python', 'node',
      ],
      types: [],
    },
    python: {
      keywords: [
        'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
        'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
        'global', 'if', 'import', 'in', 'is', 'lambda', 'not', 'or', 'pass',
        'raise', 'return', 'try', 'while', 'with', 'yield', 'None', 'True',
        'False', 'self',
      ],
      types: ['int', 'float', 'str', 'bytes', 'list', 'dict', 'tuple', 'set', 'bool'],
    },
  };

  var tokenCache = {};

  /** 为每种语言编译一条“一次扫描搞定”的正则，避免多次 replace 互相破坏 */
  function buildRegex(lang) {
    if (tokenCache[lang]) return tokenCache[lang];

    var cfg = LANGS[lang];
    if (!cfg) return null;

    var kw = cfg.keywords.join('|');
    var ty = cfg.types.length ? cfg.types.join('|') : null;

    var parts = [
      '(?<com>\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|(?:^|(?<=\\n))\\s*;{1}[^\\n]*)',
      '(?<pre>(?:^|(?<=\\n))[ \\t]*#[^\\n]*)',
      '(?<str>"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\')',
      '(?<num>\\b(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\\d+\\.?\\d*(?:[eE][+-]?\\d+)?)[uUlLfF]*\\b)',
      '(?<key>\\b(?:' + kw + ')\\b)',
    ];
    if (ty) parts.push('(?<type>\\b(?:' + ty + ')\\b)');
    parts.push('(?<fn>\\b[A-Za-z_]\\w*(?=\\s*\\())');

    var re = new RegExp(parts.join('|'), 'gm');
    tokenCache[lang] = re;
    return re;
  }

  var TOKEN_CLASS = {
    com: 'com', pre: 'pre', str: 'str', num: 'num',
    key: 'key', type: 'type', fn: 'fn',
  };

  function highlight(code, lang) {
    var re = buildRegex(lang);
    if (!re) return escapeHtml(code);

    // 先转义再高亮：转义只处理 & < >，不会破坏字符串里引号的匹配，
    // 也不会产生数字实体（因此不会干扰 num 分组）。
    return escapeHtml(code).replace(re, function () {
      var groups = arguments[arguments.length - 1];
      if (groups && typeof groups === 'object') {
        for (var k in groups) {
          if (groups[k] !== undefined && TOKEN_CLASS[k]) {
            return '<span class="tok-' + TOKEN_CLASS[k] + '">' + groups[k] + '</span>';
          }
        }
      }
      return arguments[0];
    });
  }

  /* ================================================================
     2. 代码块：标题栏 + 复制 + 高亮
     ================================================================ */
  function copyText(text) {
    // 优先用异步剪贴板 API（https / localhost 可用）
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // 回退方案：file:// 直接双击打开时仍能复制
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function setupCodeBlock(block) {
    if (block.dataset.codeReady === '1') return;
    block.dataset.codeReady = '1';

    var codeEl = $('pre code', block) || $('pre', block);
    if (!codeEl) return;

    var raw = codeEl.textContent.replace(/\s+$/, '');
    var lang = block.dataset.lang || 'c';
    var title = block.dataset.title || '';
    var showCopy = block.dataset.copy !== 'off';

    // 语法高亮
    if (lang !== 'text') {
      codeEl.innerHTML = highlight(raw, lang);
    }

    // 正文容器：把作者写的 <pre> 收进 .code-body
    // （内边距、字号、行高、文字颜色和横向滚动条都由 .code-body 的规则负责）
    var pre = $('pre', block);
    if (pre && !$('.code-body', block)) {
      var body = document.createElement('div');
      body.className = 'code-body';
      block.insertBefore(body, pre);
      body.appendChild(pre);
    }

    // 标题栏（作者只写 <div class="code-block" data-lang data-title>，其余自动生成）
    var head = $('.code-head', block);
    if (!head) {
      head = document.createElement('div');
      head.className = 'code-head';
      head.innerHTML =
        '<span class="code-title">' +
          (title ? '<span class="truncate">' + escapeHtml(title) + '</span>' : '<span>代码示例</span>') +
          '<span class="code-lang">' + escapeHtml(lang) + '</span>' +
        '</span>';
      block.insertBefore(head, block.firstChild);
    }

    if (!showCopy) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.setAttribute('aria-label', '复制这段代码');
    btn.innerHTML =
      '<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="9" y="9" width="11" height="11" rx="2"/>' +
      '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>' +
      '<span>复制</span>';

    var resetTimer = null;
    btn.addEventListener('click', function () {
      copyText(raw).then(function () {
        btn.classList.add('is-copied');
        btn.querySelector('span').textContent = '已复制';
        if (window.McuToast) McuToast.show('代码已复制到剪贴板');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.querySelector('span').textContent = '复制';
        }, 1800);
      }).catch(function () {
        if (window.McuToast) McuToast.show('复制失败，请手动选中代码复制', 'warn');
      });
    });

    head.appendChild(btn);
  }

  /* ================================================================
     3. 顶部导航
     ================================================================ */
  function setupNav() {
    // 3.1 当前页高亮（依据 <body data-page="xxx">）
    var current = document.body.dataset.page;
    if (current) {
      $$('[data-nav="' + current + '"]').forEach(function (a) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      });
    }

    // 3.2 滚动后给导航栏加投影
    var header = $('#siteHeader');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // 3.3 移动端抽屉
    var toggle = $('#navToggle');
    var panel = $('#navMobile');
    if (!toggle || !panel) return;

    var setOpen = function (open) {
      panel.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    };

    toggle.addEventListener('click', function () {
      setOpen(panel.classList.contains('hidden'));
    });

    // 点击菜单项后自动收起
    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // 尺寸变大回到桌面布局时收起抽屉
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) setOpen(false);
    });
  }

  /* ================================================================
     4. 侧边目录 scroll-spy（教程文章模板页）
     ================================================================ */
  function setupToc() {
    var links = $$('.toc-link[href^="#"]');
    if (!links.length) return;

    var items = links.map(function (a) {
      var id = decodeURIComponent(a.getAttribute('href').slice(1));
      var el = document.getElementById(id);
      return el ? { link: a, el: el } : null;
    }).filter(Boolean);

    if (!items.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var offset = (($('#siteHeader') || {}).offsetHeight || 64) + 24;
      var active = items[0];

      for (var i = 0; i < items.length; i++) {
        if (items[i].el.getBoundingClientRect().top - offset <= 0) active = items[i];
        else break;
      }

      // 已滚到底部时强制点亮最后一项，避免最后一节永远选不中
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        active = items[items.length - 1];
      }

      items.forEach(function (it) {
        var on = it === active;
        it.link.classList.toggle('is-active', on);
        if (on) it.link.setAttribute('aria-current', 'true');
        else it.link.removeAttribute('aria-current');
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ================================================================
     5. Toast 轻提示
     ================================================================ */
  var toastBox = null;
  var toastTimer = null;

  function ensureToastBox() {
    if (toastBox) return toastBox;
    toastBox = document.createElement('div');
    toastBox.id = 'mcuToast';
    toastBox.setAttribute('role', 'status');
    toastBox.setAttribute('aria-live', 'polite');
    toastBox.className =
      'pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4';
    document.body.appendChild(toastBox);
    return toastBox;
  }

  var McuToast = {
    show: function (msg, type) {
      var box = ensureToastBox();
      var color = type === 'warn'
        ? 'border-amber-500/60 text-amber-100'
        : type === 'error'
          ? 'border-rose-500/60 text-rose-100'
          : 'border-brand-500/60 text-white';

      box.innerHTML =
        '<div class="pointer-events-auto max-w-[92vw] rounded-xl border ' + color +
        ' bg-[#1B2231] px-4 py-2.5 text-sm shadow-pop">' + escapeHtml(msg) + '</div>';

      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { box.innerHTML = ''; }, 2600);
    },
  };
  window.McuToast = McuToast;

  /* ================================================================
     6. 占位下载按钮（资料下载页）
     ================================================================ */
  function setupDemoDownload() {
    $$('[data-demo-download]').forEach(function (btn) {
      btn.setAttribute('type', 'button');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        McuToast.show('这是静态演示，自行上传文件后替换链接', 'warn');
      });
    });
  }

  /* ================================================================
     7. 回到顶部
     ================================================================ */
  function setupBackTop() {
    var btn = $('#backTop');
    if (!btn) return;

    var onScroll = function () {
      btn.classList.toggle('hidden', window.scrollY < 480);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ================================================================
     8. 页脚年份
     ================================================================ */
  function setupYear() {
    var y = String(new Date().getFullYear());
    $$('[data-year]').forEach(function (el) { el.textContent = y; });
  }

  /* ================================================================
     启动
     ================================================================ */
  function boot() {
    setupNav();
    $$('.code-block').forEach(setupCodeBlock);
    setupToc();
    setupDemoDownload();
    setupBackTop();
    setupYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 供其它脚本动态插入代码块后重新装配
  window.McuSite = {
    highlight: highlight,
    setupCodeBlock: setupCodeBlock,
    refreshCodeBlocks: function () { $$('.code-block').forEach(setupCodeBlock); },
    escapeHtml: escapeHtml,
  };
})();