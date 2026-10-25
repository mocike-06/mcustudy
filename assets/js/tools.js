/*!
 * McuStudy —— 在线工具集（全部为浏览器本地实时运算，无任何后端请求）
 * ------------------------------------------------------------------
 * 工具1  进制转换器      二进制 / 十进制 / 十六进制 双向实时联动
 * 工具2  51 延时计算器   按晶振 + 定时器工作方式反算 TH/TL 初值
 * 工具3  串口转换工具    ASCII 字符串 <-> HEX 十六进制
 * 工具4  CRC 校验工具    CRC8 / CRC8-MAXIM / CRC16 多种标准
 */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var toast = function (m, t) { if (window.McuToast) window.McuToast.show(m, t); };

  /* ================================================================
     通用小工具
     ================================================================ */

  function hex2(n) { return n.toString(16).toUpperCase().padStart(2, '0'); }
  function hex4(n) { return n.toString(16).toUpperCase().padStart(4, '0'); }

  /** 把时长按大小自动选择 µs / ms / s 单位，去掉多余的 0 */
  function fmtTime(us) {
    var v, u;
    if (us >= 1e6) { v = us / 1e6; u = 's'; }
    else if (us >= 1000) { v = us / 1000; u = 'ms'; }
    else { v = us; u = 'µs'; }
    var s = v.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return s + ' ' + u;
  }

  /** 在容器里重新渲染一个代码块（自动高亮 + 复制按钮） */
  function renderSnippet(container, code, title) {
    if (!container) return;
    container.innerHTML =
      '<div class="code-block" data-lang="c" data-title="' + title + '">' +
      '<pre><code></code></pre></div>';
    $('code', container).textContent = code;
    if (window.McuSite) window.McuSite.setupCodeBlock($('.code-block', container));
  }

  /* ================================================================
     工具 1：进制转换器
     ================================================================ */
  function initBaseConverter() {
    var elBin = $('#t1-bin');
    if (!elBin) return;

    var elDec = $('#t1-dec');
    var elHex = $('#t1-hex');
    var elErr = $('#t1-err');
    var elGroup4 = $('#t1-group4');
    var elGroup8 = $('#t1-group8');
    var elWidth = $('#t1-width');
    var elBytes = $('#t1-bytes');

    var MAX = (1n << 64n) - 1n;   // 按 64 位无符号处理，足以覆盖 51/STM32 全部场景
    var lock = false;             // 防止双向联动时无限递归

    function setErr(msg) {
      if (!elErr) return;
      elErr.textContent = msg || '';
      elErr.classList.toggle('hidden', !msg);
    }

    /** 去掉空格、下划线以及 0b / 0x / 0d 前缀 */
    function clean(str) {
      return str.trim().replace(/[\s_,]/g, '').replace(/^0[bBxXdD]/, '');
    }

    function parse(str, base) {
      var s = clean(str);
      if (!s) return { empty: true };

      var pattern = base === 2 ? /^[01]+$/ : base === 10 ? /^[0-9]+$/ : /^[0-9a-fA-F]+$/;
      if (!pattern.test(s)) {
        return {
          err: base === 2 ? '二进制只能包含 0 和 1'
            : base === 10 ? '十进制只能包含 0-9'
              : '十六进制只能包含 0-9 与 A-F',
        };
      }

      var prefix = base === 2 ? '0b' : base === 10 ? '' : '0x';
      var v = BigInt(prefix + s);

      if (v > MAX) return { err: '数值超出 64 位范围（最大 0xFFFFFFFFFFFFFFFF）' };
      return { v: v };
    }

    /** 按 group 位一组，从最高位开始补零分组 */
    function groupBits(binStr, group) {
      var pad = (group - (binStr.length % group)) % group;
      var s = new Array(pad + 1).join('0') + binStr;
      return s.match(new RegExp('.{1,' + group + '}', 'g')).join(' ');
    }

    function render(v, from) {
      var bin = v.toString(2);
      var dec = v.toString(10);
      var hex = v.toString(16).toUpperCase();

      if (from !== 'bin') elBin.value = bin;
      if (from !== 'dec') elDec.value = dec;
      if (from !== 'hex') elHex.value = hex;

      var bits = Math.max(8, Math.ceil(bin.length / 8) * 8);
      if (bits > 64) bits = 64;

      elGroup4.textContent = groupBits(bin, 4);
      elGroup8.textContent = groupBits(bin, 8);
      elWidth.textContent = bits + ' 位（' +
        (bits === 8 ? 'unsigned char / uint8_t'
          : bits === 16 ? 'unsigned int / uint16_t'
            : bits === 32 ? 'unsigned long / uint32_t'
              : 'unsigned long long / uint64_t') + '）';

      var byteCount = Math.ceil(bin.length / 8) || 1;
      var byteArr = [];
      for (var i = byteCount - 1; i >= 0; i--) {
        byteArr.push('0x' + hex2(Number((v >> BigInt(i * 8)) & 0xFFn)));
      }
      elBytes.textContent = byteArr.join('  ');
      setErr('');
    }

    function clearAll() {
      elBin.value = elDec.value = elHex.value = '';
      elGroup4.textContent = elGroup8.textContent = '—';
      elWidth.textContent = elBytes.textContent = '—';
      setErr('');
    }

    function handle(el, base, tag) {
      var r = parse(el.value, base);
      if (r.empty) return clearAll();
      if (r.err) { setErr(r.err); return; }
      render(r.v, tag);
    }

    elBin.addEventListener('input', function () { if (!lock) handle(elBin, 2, 'bin'); });
    elDec.addEventListener('input', function () { if (!lock) handle(elDec, 10, 'dec'); });
    elHex.addEventListener('input', function () { if (!lock) handle(elHex, 16, 'hex'); });

    // 粘贴 0x1F、1111 0000 这类带格式的内容时自动清理
    [elBin, elDec, elHex].forEach(function (el) {
      el.addEventListener('blur', function () {
        if (!el.value) return;
        lock = true;
        var base = el === elBin ? 2 : el === elDec ? 10 : 16;
        var r = parse(el.value, base);
        if (r.v !== undefined) el.value = base === 16 ? r.v.toString(16).toUpperCase() : r.v.toString(base);
        lock = false;
      });
    });

    $$('[data-t1-fill]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = btn.dataset.t1Fill;
        elHex.value = val;
        handle(elHex, 16, 'hex');
      });
    });

    $$('[data-t1-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        clearAll();
        elHex.focus();
      });
    });

    // 支持 ?v=0x1F 之类的分享链接预填
    var preset = new URLSearchParams(location.search).get('v');
    if (preset) { elHex.value = preset; handle(elHex, 16, 'hex'); }
  }

  /* ================================================================
     工具 2：51 单片机延时计算器
     ================================================================ */
  function initDelayCalc() {
    var elFosc = $('#t2-fosc');
    if (!elFosc) return;

    var elClock = $('#t2-clock');
    var elTimer = $('#t2-timer');
    var elMode = $('#t2-mode');
    var elValue = $('#t2-value');
    var elUnit = $('#t2-unit');
    var elOut = $('#t2-out');
    var elSnippet = $('#t2-snippet');

    // 三种工作方式的计数上限（单位：机器周期）
    var MODES = {
      0: { max: 8192, name: '方式0（13 位定时器）' },
      1: { max: 65536, name: '方式1（16 位定时器）' },
      2: { max: 256, name: '方式2（8 位自动重装）' },
    };
    var UNIT_US = { us: 1, ms: 1000, s: 1000000 };

    function calc() {
      var fosc = parseFloat(elFosc.value);          // MHz
      var divider = parseInt(elClock.value, 10);    // 12T 或 1T
      var timerNo = elTimer.value;                  // '0' / '1'
      var mode = parseInt(elMode.value, 10);
      var target = parseFloat(elValue.value);
      var unit = elUnit.value;

      var cfg = MODES[mode];

      // —— 机器周期：振荡周期 × 分频系数 ——
      var mcuUs = divider / fosc;                   // 单位 µs
      var maxOnceUs = cfg.max * mcuUs;              // 单次最大定时时长

      function fail(msg) {
        elOut.innerHTML =
          '<div class="callout callout-warn m-0"><div class="callout-title">无法计算</div>' +
          '<p>' + msg + '</p></div>';
        renderSnippet(elSnippet, '/* 请先输入合法的延时时间 */', 'delay.c');
      }

      if (!(fosc > 0) || !(target > 0)) return fail('请输入大于 0 的延时时间。');

      var targetUs = target * UNIT_US[unit];
      if (targetUs < mcuUs) {
        return fail('目标延时 ' + fmtTime(targetUs) + ' 小于一个机器周期（' +
          mcuUs.toFixed(4) + ' µs），硬件无法实现，请缩短延时或降低晶振频率。');
      }

      // —— 反算初值 ——
      var needCycles = Math.round(targetUs / mcuUs);         // 需要的总机器周期数
      var overflows = Math.max(1, Math.ceil(needCycles / cfg.max));
      var perOverflow = Math.round(needCycles / overflows);
      if (perOverflow > cfg.max) perOverflow = cfg.max;
      if (perOverflow < 1) perOverflow = 1;

      var init = cfg.max - perOverflow;
      var th, tl, initText;

      if (mode === 1) {
        th = (init >> 8) & 0xFF;
        tl = init & 0xFF;
        initText = 'TH' + timerNo + ' = 0x' + hex2(th) + ';  TL' + timerNo + ' = 0x' + hex2(tl) + ';';
      } else if (mode === 0) {
        th = (init >> 5) & 0xFF;   // 13 位：高 8 位在 TH，低 5 位在 TL
        tl = init & 0x1F;
        initText = 'TH' + timerNo + ' = 0x' + hex2(th) + ';  TL' + timerNo + ' = 0x' + hex2(tl) +
          ';   /* 低 5 位有效 */';
      } else {
        th = tl = init & 0xFF;     // 方式2 只需装 TH，TL 由硬件自动重装
        initText = 'TH' + timerNo + ' = 0x' + hex2(th) + ';  TL' + timerNo + ' = 0x' + hex2(th) + ';';
      }

      var actualUs = overflows * perOverflow * mcuUs;
      var errorUs = actualUs - targetUs;
      var errorPct = (errorUs / targetUs) * 100;
      var exact = Math.abs(errorUs) < 1e-9;

      // —— 结果面板 ——
      var rows = [
        ['一个机器周期', mcuUs.toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + ' µs' +
          '（' + divider + 'T，' + fosc + ' MHz）'],
        ['单次最大定时', fmtTime(maxOnceUs)],
        ['需要机器周期数', needCycles.toLocaleString('en-US') + ' 个'],
        ['定时器溢出次数', overflows + ' 次'],
        ['每次溢出计数', perOverflow.toLocaleString('en-US') + ' 个机器周期'],
        ['定时器初值', '0x' + (mode === 0 ? hex4(init) : mode === 1 ? hex4(init) : hex2(init)) +
          '（十进制 ' + init + '）'],
        ['实际延时', fmtTime(actualUs)],
      ];

      var html = '<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">';
      rows.forEach(function (r) {
        html += '<div class="stat"><div class="stat-k">' + r[0] + '</div>' +
          '<div class="stat-v text-[15px]">' + r[1] + '</div></div>';
      });
      html += '</div>';

      html += '<div class="callout ' + (exact ? 'callout-tip' : errorPct > 1 ? 'callout-warn' : 'callout-info') +
        ' mt-4"><div class="callout-title">' +
        (exact ? '✅ 可以精确实现' : Math.abs(errorPct) > 1 ? '⚠️ 误差偏大' : 'ℹ️ 存在固有误差') +
        '</div><p>' +
        (exact
          ? '所选晶振与延时时间刚好整除，实际延时与目标完全一致。'
          : '实际延时比目标' + (errorUs > 0 ? '多' : '少') + ' <strong>' + fmtTime(Math.abs(errorUs)) +
            '</strong>，相对误差 <strong>' + errorPct.toFixed(4) + '%</strong>。' +
            '这是机器周期取整造成的，属于正常现象；把延时时间改成机器周期的整数倍即可消除。') +
        '</p></div>';

      if (fosc === 11.0592) {
        html += '<p class="hint mt-3">提示：11.0592 MHz 的机器周期不是整数（' + mcuUs.toFixed(4) +
          ' µs），定时会有微小误差，但它能整除标准波特率，串口通信必须用它。</p>';
      } else {
        html += '<p class="hint mt-3">提示：12 MHz 机器周期刚好 1 µs，做定时最直观；' +
          '但如果同时要用串口，建议换 11.0592 MHz 以避免波特率误差。</p>';
      }

      elOut.innerHTML = html;

      // —— 生成可直接粘贴的 C 代码 ——
      var tmMask = timerNo === '0' ? '0xF0' : '0x0F';
      var tmVal = mode === 1
        ? (timerNo === '0' ? '0x01' : '0x10')
        : mode === 2
          ? (timerNo === '0' ? '0x02' : '0x20')
          : '0x00';
      var vector = timerNo === '0' ? 1 : 3;
      var autoReload = mode === 2;
      var tn = 'T' + timerNo;

      var code = [
        '/* ==========================================================',
        ' * 51 单片机定时器初始化（Keil C51 / STC89C52）',
        ' * 晶振     : ' + fosc.toFixed(4) + ' MHz   时钟模式: ' + divider + 'T',
        ' * 机器周期 : ' + mcuUs.toFixed(4) + ' µs',
        ' * 定时器   : ' + tn + '   ' + cfg.name,
        ' * 目标延时 : ' + fmtTime(targetUs) + '  →  溢出 ' + overflows + ' 次，每次 ' + perOverflow + ' 个机器周期',
        ' * 实际延时 : ' + fmtTime(actualUs) + (exact ? '（精确）' : '（误差 ' + fmtTime(Math.abs(errorUs)) + '）'),
        ' * ========================================================== */',
        '#include <reg52.h>',
        '',
        '#define OVERFLOW_TIMES   ' + overflows + 'U     /* 需要溢出的次数 */',
        '',
        'volatile unsigned int g_tick = 0;      /* 溢出计数器 */',
        '',
        'void ' + tn + '_Init(void)',
        '{',
        '    TMOD &= ' + tmMask + ';              /* 先清掉 ' + tn + ' 的配置位，不影响另一个定时器 */',
        '    TMOD |= ' + tmVal + ';              /* ' + tn + ' ' + cfg.name + ' */',
        '    ' + (mode === 0
          ? 'TH' + timerNo + ' = 0x' + hex2(th) + '; TL' + timerNo + ' = 0x' + hex2(tl) + ';   /* 13 位：TH 高 8 位，TL 低 5 位 */'
          : mode === 1
            ? 'TH' + timerNo + ' = 0x' + hex2(th) + ';              /* 初值高 8 位 */\n    TL' + timerNo + ' = 0x' + hex2(tl) + ';              /* 初值低 8 位 */'
            : 'TH' + timerNo + ' = 0x' + hex2(th) + '; TL' + timerNo + ' = 0x' + hex2(th) + ';   /* 方式2：TL 由硬件自动重装 */'),
        '    ET' + timerNo + ' = 1;                 /* 允许 ' + tn + ' 中断 */',
        '    EA  = 1;                 /* 打开总中断 */',
        '    TR' + timerNo + ' = 1;                 /* 启动定时器 */',
        '}',
        '',
        '/* ' + tn + ' 中断服务函数，中断号 ' + vector + ' */',
        'void ' + tn + '_ISR(void) interrupt ' + vector,
        '{',
      ];

      if (!autoReload) {
        code.push('    TH' + timerNo + ' = 0x' + hex2(th) + ';              /* 方式' + mode + ' 必须在中断里手动重装初值 */');
        code.push('    TL' + timerNo + ' = 0x' + hex2(tl) + ';');
        code.push('');
      } else {
        code.push('    /* 方式2 由硬件自动重装 TH' + timerNo + '，无需手动赋值 */');
        code.push('');
      }

      code.push('    if (++g_tick >= OVERFLOW_TIMES)');
      code.push('    {');
      code.push('        g_tick = 0;');
      code.push('        /* >>> 把每个 ' + fmtTime(targetUs) + ' 要执行的代码写在这里 <<< */');
      code.push('    }');
      code.push('}');

      renderSnippet(elSnippet, code.join('\n'), 'timer' + timerNo + '_' + fmtTime(targetUs).replace(/\s+/g, '') + '.c');
    }

    [elFosc, elClock, elTimer, elMode, elValue, elUnit].forEach(function (el) {
      el.addEventListener('input', calc);
      el.addEventListener('change', calc);
    });

    calc();
  }

  /* ================================================================
     工具 3：串口 ASCII <-> HEX 转换
     ================================================================ */
  function initSerialConv() {
    var elText = $('#t3-text');
    if (!elText) return;

    var elHex = $('#t3-hex');
    var elSep = $('#t3-sep');
    var elPrefix = $('#t3-prefix');
    var elUpper = $('#t3-upper');
    var elStat = $('#t3-stat');
    var elNote = $('#t3-note');

    var lock = false;

    function bytesToHex(bytes) {
      var sep = elSep.value;
      var prefix = elPrefix.checked ? '0x' : '';
      var arr = [];
      for (var i = 0; i < bytes.length; i++) {
        var h = bytes[i].toString(16).padStart(2, '0');
        arr.push(prefix + (elUpper.checked ? h.toUpperCase() : h));
      }
      return arr.join(sep);
    }

    function hexToBytes(str) {
      // 容忍 0x 前缀、空格、逗号、冒号、换行、连字符
      var s = str.replace(/0[xX]/g, '').replace(/[\s,:\-]/g, '');
      if (!s) return { bytes: new Uint8Array(0) };
      if (!/^[0-9a-fA-F]+$/.test(s)) {
        return { err: '含有非十六进制字符（只允许 0-9 A-F，可带 0x 前缀与分隔符）' };
      }
      if (s.length % 2 !== 0) {
        return { err: '十六进制位数是奇数（' + s.length + ' 位），无法组成完整字节' };
      }
      var out = new Uint8Array(s.length / 2);
      for (var i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
      return { bytes: out };
    }

    function updateStat(bytes, extra) {
      if (!bytes) { elStat.textContent = '—'; return; }
      var printable = 0;
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] >= 0x20 && bytes[i] <= 0x7E) printable++;
      }
      elStat.textContent = '共 ' + bytes.length + ' 字节（' + printable +
        ' 个可打印 ASCII 字符，' + (bytes.length - printable) + ' 个控制/非 ASCII 字节）' +
        (extra ? ' · ' + extra : '');
    }

    function textToHex() {
      var bytes = new TextEncoder().encode(elText.value);
      elHex.value = bytesToHex(bytes);
      updateStat(bytes);
      setNote('');
    }

    function hexToText() {
      var r = hexToBytes(elHex.value);
      if (r.err) { setNote(r.err, 'warn'); return; }
      var bytes = r.bytes;
      updateStat(bytes);

      var note = '';
      var text;
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch (e) {
        // 非法 UTF-8：退回非严格模式并提示（常见于直接抓 GBK 设备的数据）
        text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        note = '注意：该字节序列不是合法的 UTF-8（可能来自 GBK 编码的设备），其中无法识别的部分已用  代替。';
      }
      elText.value = text;
      setNote(note, 'info');
    }

    function setNote(msg, type) {
      if (!elNote) return;
      elNote.textContent = msg || '';
      elNote.classList.toggle('hidden', !msg);
      elNote.className = 'callout callout-' + (type || 'info') + ' mt-4' + (msg ? '' : ' hidden');
    }

    elText.addEventListener('input', function () {
      if (lock) return;
      lock = true; textToHex(); lock = false;
    });

    elHex.addEventListener('input', function () {
      if (lock) return;
      lock = true; hexToText(); lock = false;
    });

    [elSep, elPrefix, elUpper].forEach(function (el) {
      el.addEventListener('change', function () { textToHex(); });
    });

    var btnText2Hex = $('#t3-to-hex');
    if (btnText2Hex) btnText2Hex.addEventListener('click', textToHex);

    var btnHex2Text = $('#t3-to-text');
    if (btnHex2Text) btnHex2Text.addEventListener('click', hexToText);

    var btnSwap = $('#t3-swap');
    if (btnSwap) {
      btnSwap.addEventListener('click', function () {
        var t = elText.value;
        elText.value = elHex.value;
        elHex.value = t;
        textToHex();
      });
    }

    var btnClear = $('#t3-clear');
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        elText.value = elHex.value = '';
        updateStat(null);
        setNote('');
        elText.focus();
      });
    }

    $$('[data-t3-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        elText.value = btn.dataset.t3Demo;
        textToHex();
      });
    });
  }

  /* ================================================================
     工具 4：CRC 校验
     ================================================================ */
  function initCrc() {
    var elIn = $('#t4-in');
    if (!elIn) return;

    var elAlgo = $('#t4-algo');
    var elOut = $('#t4-out');
    var elSelf = $('#t4-self');

    /**
     * 通用 CRC 位运算实现（直接翻译自 CRC 参数模型）
     * width    校验宽度：8 / 16
     * poly     多项式（非反转形式）
     * init     初值
     * refin    输入是否按位反转（LSB first）
     * refout   输出是否反转
     * xorout   结果异或值
     * check    标准校验值：对 ASCII "123456789" 的运算结果
     */
    var ALGOS = {
      'crc8': {
        name: 'CRC-8', width: 8, poly: 0x07, init: 0x00,
        refin: false, refout: false, xorout: 0x00, check: 0xF4,
        desc: '最基础的 CRC-8（poly=0x07），常用于自定义通信协议的数据帧校验。',
      },
      'crc8-maxim': {
        name: 'CRC-8/MAXIM-DOW', width: 8, poly: 0x31, init: 0x00,
        refin: true, refout: true, xorout: 0x00, check: 0xA1,
        desc: 'DS18B20、MAXIM 系列 1-Wire 器件使用的 CRC-8，温度传感器读回数据后必须用它校验。',
      },
      'crc16-modbus': {
        name: 'CRC-16/MODBUS', width: 16, poly: 0x8005, init: 0xFFFF,
        refin: true, refout: true, xorout: 0x0000, check: 0x4B37,
        desc: '工业 Modbus RTU 协议标准校验，串口通信最常用；发送时低字节在前。',
      },
      'crc16-ccitt-false': {
        name: 'CRC-16/CCITT-FALSE', width: 16, poly: 0x1021, init: 0xFFFF,
        refin: false, refout: false, xorout: 0x0000, check: 0x29B1,
        desc: 'CCITT 标准，常见于 X.25、部分无线模块与蓝牙协议。',
      },
      'crc16-xmodem': {
        name: 'CRC-16/XMODEM', width: 16, poly: 0x1021, init: 0x0000,
        refin: false, refout: false, xorout: 0x0000, check: 0x31C3,
        desc: 'XMODEM 文件传输协议校验，也常用于自定义固件升级帧。',
      },
      'crc16-arc': {
        name: 'CRC-16/ARC (IBM)', width: 16, poly: 0x8005, init: 0x0000,
        refin: true, refout: true, xorout: 0x0000, check: 0xBB3D,
        desc: 'IBM 传统 CRC-16，早期磁盘与部分工业仪表使用。',
      },
    };

    function reflect(v, bits) {
      var r = 0;
      for (var i = 0; i < bits; i++) {
        if (v & (1 << i)) r |= 1 << (bits - 1 - i);
      }
      return r >>> 0;
    }

    function crcCompute(bytes, cfg) {
      var width = cfg.width;
      var mask = width === 8 ? 0xFF : 0xFFFF;
      var topBit = 1 << (width - 1);
      var polyUse = cfg.refin ? reflect(cfg.poly, width) : cfg.poly;
      var crc = cfg.init & mask;

      for (var i = 0; i < bytes.length; i++) {
        crc ^= cfg.refin ? bytes[i] : (bytes[i] << (width - 8));
        for (var b = 0; b < 8; b++) {
          if (cfg.refin) {
            crc = (crc & 1) ? ((crc >>> 1) ^ polyUse) : (crc >>> 1);
          } else {
            crc = (crc & topBit) ? ((crc << 1) ^ polyUse) : (crc << 1);
          }
          crc &= mask;
        }
      }

      if (cfg.refout !== cfg.refin) crc = reflect(crc, width);
      return (crc ^ cfg.xorout) & mask;
    }

    function parseHex(str) {
      var s = str.replace(/0[xX]/g, '').replace(/[\s,:\-]/g, '');
      if (!s) return { empty: true };
      if (!/^[0-9a-fA-F]+$/.test(s)) return { err: '含有非十六进制字符（只允许 0-9 A-F）' };
      if (s.length % 2 !== 0) return { err: '位数是奇数，无法组成完整字节' };
      var out = [];
      for (var i = 0; i < s.length; i += 2) out.push(parseInt(s.substr(i, 2), 16));
      return { bytes: out };
    }

    function calc() {
      var cfg = ALGOS[elAlgo.value];
      var r = parseHex(elIn.value);

      if (r.empty) {
        elOut.innerHTML = '<p class="hint">请输入十六进制数据，例如 <code class="icode">01 03 00 00 00 0A</code>。</p>';
        return;
      }
      if (r.err) {
        elOut.innerHTML = '<div class="callout callout-warn m-0"><div class="callout-title">输入有误</div><p>' +
          r.err + '</p></div>';
        return;
      }

      var bytes = r.bytes;
      var crc = crcCompute(bytes, cfg);
      var is16 = cfg.width === 16;
      var crcHex = is16 ? hex4(crc) : hex2(crc);
      var hi = is16 ? hex2((crc >> 8) & 0xFF) : crcHex;
      var lo = is16 ? hex2(crc & 0xFF) : crcHex;

      var html = '<div class="grid gap-3 sm:grid-cols-2">';
      html += '<div class="stat"><div class="stat-k">算法</div><div class="stat-v text-[15px]">' + cfg.name + '</div></div>';
      html += '<div class="stat"><div class="stat-k">校验值（HEX）</div><div class="stat-v text-brand-600 dark:text-brand-300">0x' + crcHex + '</div></div>';
      html += '<div class="stat"><div class="stat-k">校验值（十进制）</div><div class="stat-v text-[15px]">' + crc + '</div></div>';
      html += '<div class="stat"><div class="stat-k">数据长度</div><div class="stat-v text-[15px]">' + bytes.length + ' 字节</div></div>';
      html += '</div>';

      if (is16) {
        html += '<div class="mt-4 grid gap-3 sm:grid-cols-2">' +
          '<div class="out-box">低字节在前（Modbus 串口发送顺序）<br><span class="text-brand-600 dark:text-brand-300">0x' + lo + ' 0x' + hi + '</span></div>' +
          '<div class="out-box">高字节在前（部分协议 / 网络序）<br><span class="text-brand-600 dark:text-brand-300">0x' + hi + ' 0x' + lo + '</span></div>' +
          '</div>';
      }

      // 完整发送帧示例（C 语言数组），方便直接贴进代码
      var frameBytes = bytes.concat(is16 ? [crc & 0xFF, (crc >> 8) & 0xFF] : [crc & 0xFF]);
      var frameText = frameBytes.map(function (b) { return '0x' + hex2(b); }).join(', ');
      var wrapped = [];
      for (var i = 0; i < frameBytes.length; i += 8) {
        wrapped.push('    ' + frameBytes.slice(i, i + 8).map(function (b) { return '0x' + hex2(b); }).join(', '));
      }

      html += '<p class="mt-4 text-sm text-muted">' + cfg.desc + '</p>';
      elOut.innerHTML = html;

      var frameCode = [
        '/* ' + cfg.name + ' 校验结果：0x' + crcHex + ' */',
        '/* 前 ' + bytes.length + ' 字节为原始数据，末尾 ' + (is16 ? 2 : 1) + ' 字节为校验值（低字节在前） */',
        'const unsigned char frame[' + frameBytes.length + '] = {',
        wrapped.join(',\n'),
        '};',
      ].join('\n');

      var holder = $('#t4-frame');
      if (holder) renderSnippet(holder, frameCode, 'frame.c');
    }

    elIn.addEventListener('input', calc);
    elAlgo.addEventListener('change', calc);

    var btnClear = $('#t4-clear');
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        elIn.value = '';
        calc();
        elIn.focus();
      });
    }

    $$('[data-t4-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        elIn.value = btn.dataset.t4Demo;
        calc();
      });
    });

    // —— 标准自检：用权威校验值验证实现是否正确 ——
    if (elSelf) {
      var checkBytes = [].map.call('123456789', function (c) { return c.charCodeAt(0); });
      var bad = [];
      Object.keys(ALGOS).forEach(function (k) {
        if (crcCompute(checkBytes, ALGOS[k]) !== ALGOS[k].check) bad.push(ALGOS[k].name);
      });
      elSelf.innerHTML = bad.length
        ? '<span class="text-rose-600">✗ 自检未通过：' + bad.join('、') + '</span>'
        : '✓ 已通过 ' + Object.keys(ALGOS).length + ' 种算法的标准校验值自检（输入 ASCII "123456789" 对比权威结果）';
      elSelf.className = 'text-xs ' + (bad.length ? '' : 'text-emerald-600 dark:text-emerald-400');
    }

    calc();
  }

  /* ================================================================
     启动
     ================================================================ */
  function boot() {
    initBaseConverter();
    initDelayCalc();
    initSerialConv();
    initCrc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();