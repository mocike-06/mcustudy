/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  /*
   * 必须把 tutorials/ 也纳入扫描，否则教程正文页里
   * 独有的类名会被当成未使用而摇树删掉（页面掉样式）。
   */
  content: ['./*.html', './tutorials/*.html', './assets/js/**/*.js'],
  /*
   * 语法高亮的 token 类名是在 site.js 里用字符串拼接生成的
   * （'<span class="tok-' + TOKEN_CLASS[k] + '">'），
   * Tailwind 扫描不到这种动态类名，会被摇树删掉导致代码块没有颜色。
   * 因此必须显式列入 safelist。
   */
  safelist: [
    'tok-com', 'tok-str', 'tok-num', 'tok-key', 'tok-type', 'tok-pre', 'tok-fn',
  ],
  theme: {
    extend: {
      colors: {
        /* 主色：工科科技蓝 */
        brand: {
          50: '#EEF4FF',
          100: '#DCE7FF',
          200: '#BCCFFF',
          300: '#8FAEFF',
          400: '#5B85FF',
          500: '#165DFF',
          600: '#0E42D2',
          700: '#0B34A6',
          800: '#0A2C87',
          900: '#0B266B',
        },
        /* 语义色：由 CSS 变量驱动，亮/暗主题自动切换，无需 dark: 前缀 */
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        ok: '#16A34A',
        warn: '#D97706',
        danger: '#DC2626',
        info: '#0E7490',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"',
          '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Source Han Sans SC"',
          'Roboto', 'Helvetica', 'Arial', 'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"', '"Cascadia Code"', 'Consolas', 'Menlo', 'Monaco',
          '"Courier New"', 'monospace',
        ],
      },
      maxWidth: { page: '1200px' },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 6px 20px -8px rgb(15 23 42 / 0.10)',
        pop: '0 10px 34px -12px rgb(15 23 42 / 0.28)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.1rem' }],
      },
    },
  },
  plugins: [],
};