# McuStudy · 单片机嵌入式学习站

> 从零开始学习单片机嵌入式，包含 51 / STM32 / ESP32 教程、在线计算工具、项目案例。
>
> 纯静态站点 · 零运行时依赖 · 免登录 · 可直接部署到 Vercel / GitHub Pages

---

## 一、项目介绍

McuStudy 是一套面向 **机电、自动化、电子信息、机电一体化** 专业学生和 **嵌入式零基础新手** 的单片机学习网站。
它把「看教程 → 算参数 → 抄代码 → 做项目」这条链路放在同一个站里，避免新手在十几个网站之间来回跳。

**三条学习主线：**

| 主线 | 芯片 | 开发方式 | 适合阶段 |
| --- | --- | --- | --- |
| 51 单片机 | STC89C52RC | Keil C51 + STC-ISP | 入门第一块板子 |
| STM32 | STM32F103 | Keil MDK + HAL 库 | 进阶、课设、竞赛 |
| ESP32 | ESP32-WROOM-32 | Arduino IDE | 物联网、毕设 |

中间穿插 **Proteus 仿真**（没买硬件也能练）与 **通用基础**（电学、元件、数制与位运算、数字电路、C 语言），形成 5 个阶段的学习路线。

**站点包含：**

- **10 个独立页面** —— 首页、学习路线、**知识体系**、三大芯片教程目录、在线工具、资料下载、实训毕设、教程文章模板
- **4 个在线工具** —— 进制转换器、51 延时计算器、串口 ASCII/HEX 转换、CRC 校验，全部用 JavaScript 在浏览器本地实时运算，**不联网、不上传数据**
- **85 篇教程正文**，分两条线：
  - **方向教程 40 篇** = **17 篇基础篇**（51 七篇 + STM32 五篇 + ESP32 五篇）+ **23 个教程专题**（51 八篇 + STM32 八篇 + ESP32 七篇）
  - **知识体系 45 篇** = 按高校热门教材的骨架搭的三层地图（`knowledge.html`）：**学科基础 23 篇**（电路理论 7 + 模拟电子 5 + 数字电子 7 + 数据转换与接口 4）+ **嵌入式核心 10 篇** + **专业方向 12 篇**（STM32 深入 6 + ESP32 与工程实践 6）
- 另有 **4 个完整实战案例**（含硬件清单与核心代码）
- **亮色 / 暗色主题**一键切换，电脑 / 平板 / 手机全响应式

> **为什么基础篇放在各方向内部，而不是单开一个栏目**
>
> 电学与 5V 电平配 51 讲最合适，时钟树配 STM32 讲最合适，网络与协议栈配 ESP32 讲最合适——
> 基础知识和它服务的芯片绑在一起，读者才看得出「学这个到底为什么」。
> 所以基础篇正文统一放在 `tutorials/<方向>-basic-*.html`，入口是各自栏目页顶部的
> **「基础篇」区块**（`mcu51.html#b-electricity` / `stm32.html#b-arm` / `esp32.html#b-compare`），
> 顶部导航仍保持固定 8 项不变。三组基础篇之间有重叠，读者只需读自己那个方向的一组。

> **知识体系那 45 篇是按高校教材的骨架搭的，不是凭空选题**
>
> 三层结构分别对照常用的几类教材——学科基础层取自邱关源《电路》（第 5 版）、童诗白 / 华成英《模拟电子技术基础》（第 5 版）、
> 阎石 / 王红《数字电子技术基础》（第 6 版）、周荷琴《微型计算机原理与接口技术》；嵌入式核心层取自张毅刚《单片机原理及应用》（第 4 版）、
> 吴银琴 / 梁晶《嵌入式系统原理及应用》（第 2 版）、刘火良《STM32 库开发实战指南》（第 2 版）与刘火良《FreeRTOS 内核实现与应用开发实战指南》；
> 专业方向层取自刘火良《STM32 库开发实战指南》（第 2 版）、吴银琴 / 梁晶《嵌入式系统原理及应用》（第 2 版）、
> 康玮剑《从零开始学 ESP32 物联网应用开发》与刘火良《FreeRTOS 内核实现与应用开发实战指南》。
> 另有郭天祥《新概念 51 单片机 C 语言教程》（第 2 版）作为「51 单片机」方向的课外对照，不在那 45 篇的直接引用之列。
> `knowledge.html` 每张卡片右下角都标注了它对应哪本书的哪一章，方便对照纸质教材复习；
> 页底的**「教材对照表」**逐本列出「作者 · 出版社 / 本书用到的部分 / 支撑的知识块编号」，一眼能看出每本书贡献了哪几篇。
> 同样地，顶部导航仍保持固定 8 项——知识体系页从首页、学习路线页与页脚链入。

---

## 二、功能特性

| 特性 | 说明 |
| --- | --- |
| 🎨 亮暗主题 | 一键切换，选择记在 `localStorage`，支持跟随系统（默认 `auto`），跨标签页同步 |
| 📱 全响应式 | 手机单列 → 平板两列 → 桌面三列；导航在 `lg` 断点以下自动收进抽屉 |
| 💻 代码高亮 | 轻量自研高亮（`site.js` 内约 80 行正则），覆盖 C / Keil C51 扩展 / bash / python，**不引入任何高亮插件** |
| 📋 一键复制 | 代码块自动生成标题栏 + 语言标签 + 复制按钮，复制的是**原始代码**而不是高亮后的 HTML |
| 🧮 本地计算 | 4 个工具全部本地运算，CRC 校验内置自检（对 `"123456789"` 比对权威 check 值） |
| 📑 文章目录 | 教程页左侧固定锚点目录，滚动自动高亮当前小节 |
| ⚡ 零运行时依赖 | 没有框架、没有 CDN、没有外链字体，断网也能完整打开 |

---

## 三、页面一览

| 文件 | 页面 | 主要内容 |
| --- | --- | --- |
| `index.html` | 首页 | Hero、5 阶段路线预览、**17 篇基础篇入口**、**知识体系入口**、6 个热门教程、4 个工具入口、学习顺序建议 |
| `route.html` | 学习路线 | 纵向时间线，5 个阶段（通用基础 → 51 入门 → Proteus → STM32 → ESP32），每阶段含重点、练习、避坑 |
| `knowledge.html` | **知识体系** | 按高校教材骨架搭的三层知识地图：**学科基础 23 篇 + 嵌入式核心 10 篇 + 专业方向 12 篇**，含教材对照表与阅读顺序建议 |
| `mcu51.html` | 51 单片机 | **基础篇 7 篇**（电学 / 元件 / 数制 / 数字电路 / C 语言 / 寄存器 / 编译烧录）+ 8 个教程卡片 + 寄存器速查表 |
| `stm32.html` | STM32 | **基础篇 5 篇**（ARM 架构 / 时钟系统 / 寄存器与 HAL / C 语言进阶 / 3.3V 电平）+ 8 个教程卡片 + HAL 函数速查表 |
| `esp32.html` | ESP32 | **基础篇 5 篇**（芯片对比 / 供电与 GPIO / Arduino 框架 / C++ API / 网络基础）+ 7 个教程卡片 + 引脚速查表 |
| `tools.html` | 在线工具 | 进制转换、51 延时计算器、串口转换、CRC 校验（6 种算法） |
| `resource.html` | 资料下载 | 5 大类共 20 份资源卡片（数据手册 / Proteus 元件库 / Keil 资源 / PDF 教程 / 原理图包） |
| `project.html` | 实训毕设 | 4 个完整案例（51 智能小车 / 51 温湿度采集 / STM32 电压表 / ESP32 远程控制），含硬件清单与核心代码 |
| `article-template.html` | 教程模板 | 左侧锚点目录 + 右侧正文，标准结构：原理介绍 → 硬件接线 → 完整代码 → 现象演示 → 报错排查 |
| `tutorials/*.html` | **教程正文（85 篇）** | **方向教程 40 篇**：基础篇 17 篇（`*-basic-*.html`）+ 专题 23 篇（51 八篇、STM32 八篇、ESP32 七篇）。**知识体系 45 篇**：`ee-*.html`（学科基础 23）+ `core-*.html`（嵌入式核心 10）+ `adv-*.html`（专业方向 12）。两者结构同模板，页尾都有上一篇 / 下一篇 |

---

## 四、目录结构

```
McuStudy/
├── index.html                  # 首页
├── route.html                  # 学习路线（5 阶段时间线）
├── knowledge.html              # ★ 知识体系地图（45 篇：学科基础 23 + 嵌入式核心 10 + 专业方向 12）
├── mcu51.html                  # 51 单片机教程目录（基础篇 7 + 教程卡片 8）
├── stm32.html                  # STM32 教程目录（基础篇 5 + 教程卡片 8）
├── esp32.html                  # ESP32 教程目录（基础篇 5 + 教程卡片 7）
├── tools.html                  # 在线工具（4 个）
├── resource.html               # 资料下载（5 类 20 张卡片）
├── project.html                # 实训毕设案例（4 个）
├── article-template.html       # 教程文章模板（复制它来新增教程）
│
├── tutorials/                  # ★ 教程正文 85 篇 = 方向教程 40（基础篇 17 + 专题 23）+ 知识体系 45
│   │
│   │   ── 知识体系层：学科基础 23 篇（入口 knowledge.html）──
│   │
│   ├── ee-*.html               #  电路理论 7（laws / equivalent / theorems / dynamic / ac / power-supply / emc）
│   │                           #  模拟电子 5（semiconductor / amplifier / opamp / filter-comparator / feedback）
│   │                           #  数字电子 7（number-code / logic-algebra / logic-gate / combinational / sequential / fsm / pulse）
│   │                           #  数据转换与接口 4（adc-dac / sampling / memory / bus-interface）
│   ├── core-*.html             #  嵌入式核心 10（intro / cpu / memory-map / interrupt / timer / serial / dma / embedded-c / architecture / debug）
│   ├── adv-*.html              #  专业方向 12（stm32-* 6 + esp32-* 5 + project-engineering）
│   │
│   │   ── 基础篇：51 单片机 7 篇（入口 mcu51.html#b-electricity）──
│   │
│   ├── mcu51-basic-electricity.html  #  基础：电压、电流与电阻（欧姆定律）
│   ├── mcu51-basic-components.html   #  基础：色环电阻、电容、LED、三极管
│   ├── mcu51-basic-number.html       #  基础：数制与位运算
│   ├── mcu51-basic-digital.html      #  基础：数字电路与电平（TTL/CMOS/3.3V-5V）
│   ├── mcu51-basic-c.html            #  基础：C 语言基础
│   ├── mcu51-basic-register.html     #  基础：单片机内部结构、SFR 与位寻址
│   ├── mcu51-basic-toolchain.html    #  基础：从源码到芯片（编译 / HEX / 烧录）
│   │
│   │   ── 基础篇：STM32 5 篇（入口 stm32.html#b-arm）─────────────
│   │
│   ├── stm32-basic-arm.html          #  基础：ARM 架构与存储器映射
│   ├── stm32-basic-clock.html        #  基础：时钟系统与 PLL
│   ├── stm32-basic-hal.html          #  基础：寄存器、标准库与 HAL
│   ├── stm32-basic-c.html            #  基础：C 语言进阶（指针 / 结构体 / 回调）
│   ├── stm32-basic-level.html        #  基础：3.3V 电平与硬件安全
│   │
│   │   ── 基础篇：ESP32 5 篇（入口 esp32.html#b-compare）─────────
│   │
│   ├── esp32-basic-compare.html      #  基础：从 51 / STM32 到 ESP32
│   ├── esp32-basic-level.html        #  基础：3.3V 供电与 GPIO 安全
│   ├── esp32-basic-arduino.html      #  基础：Arduino 框架与 ESP-IDF
│   ├── esp32-basic-cpp.html          #  基础：C++ 与 Arduino API
│   ├── esp32-basic-network.html      #  基础：网络基础（IP / TCP / MQTT）
│   │
│   │   ── 教程专题：与三个栏目页的卡片一一对应 ─────────────────
│   │
│   ├── mcu51-env.html          #    51：开发环境搭建 Keil C51
│   ├── mcu51-min-system.html   #    51：最小系统电路原理
│   ├── mcu51-led.html          #    51：IO 口输出 LED 流水灯
│   ├── mcu51-timer.html        #    51：定时器原理与定时
│   ├── mcu51-exti.html         #    51：外部中断触发
│   ├── mcu51-uart.html         #    51：UART 串口通信
│   ├── mcu51-lcd1602.html      #    51：LCD1602 液晶驱动
│   ├── mcu51-dht11.html        #    51：综合项目 温湿度采集
│   ├── stm32-env.html          #    STM32：Keil MDK 环境与芯片包
│   ├── stm32-gpio.html         #    STM32：GPIO 输入输出
│   ├── stm32-usart.html        #    STM32：USART 串口通信
│   ├── stm32-timer-pwm.html    #    STM32：定时器与 PWM
│   ├── stm32-adc.html          #    STM32：ADC 模拟采集
│   ├── stm32-i2c-oled.html     #    STM32：I2C 通信与 OLED
│   ├── stm32-exti.html         #    STM32：外部中断
│   ├── stm32-voltmeter.html    #    STM32：综合项目 数字电压表
│   ├── esp32-env.html          #    ESP32：Arduino IDE 环境搭建
│   ├── esp32-gpio.html         #    ESP32：GPIO 控制
│   ├── esp32-wifi.html         #    ESP32：WiFi 连接 STA 模式
│   ├── esp32-bt.html           #    ESP32：蓝牙串口通信
│   ├── esp32-mqtt.html         #    ESP32：MQTT 接入物联网
│   ├── esp32-sensor.html       #    ESP32：DHT11 / DS18B20 读取
│   └── esp32-remote.html       #    ESP32：综合项目 蓝牙遥控器
│
├── assets/
│   ├── css/
│   │   └── app.css             # ★ Tailwind 构建产物，所有页面共用
│   ├── js/
│   │   ├── theme.js            # 亮暗主题（必须同步加载）
│   │   ├── site.js             # 导航 / 代码高亮与复制 / 目录高亮 / 提示条
│   │   └── tools.js            # 四个在线工具的全部逻辑（仅 tools.html 引入）
│   └── img/
│       └── favicon.svg         # 站点图标
│
├── src/
│   └── input.css               # ★ 样式源码：CSS 变量 + 组件类定义
│
├── tailwind.config.js          # Tailwind 配置（语义色、字体、阴影）
├── package.json                # 构建脚本
└── README.md
```

> `assets/css/app.css` 是**构建产物**，不要直接改它——改 `src/input.css` 后重新构建。

---

## 五、快速开始

### 方式 1：直接打开（最快，零配置）

双击 `index.html` 即可。所有页面都是独立 HTML，样式与脚本都是相对路径，`file://` 协议下能正常浏览。
（复制按钮在 `file://` 下会自动回退到 `execCommand`，功能不受影响。）

### 方式 2：本地服务器（推荐，行为与线上一致）

```bash
# 任选一种
npx serve .
python -m http.server 8080
```

然后访问 `http://localhost:3000`（或 `:8080`）。

### 方式 3：项目内脚本

```bash
pnpm install     # 只装 tailwindcss 一个开发依赖
pnpm run serve
```

> **Windows 提示**：如果 PowerShell 提示「因为在此系统上禁止运行脚本」，
> 把 `pnpm` 换成 `pnpm.cmd`，或改用 `npm run serve`。

---

## 六、样式构建（改样式前必读）

站点用的是 **真正的 Tailwind CSS v3 预构建**，不是 Play CDN。
好处是离线可用、样式顺序可控、页面零运行时依赖；代价是**改样式后要重新构建**。

```bash
pnpm install        # 首次：装 tailwindcss 3.4.17
pnpm run dev        # 开发：监听文件变化，自动重新构建
pnpm run build      # 发布：压缩输出到 assets/css/app.css
```

### ⚠️ 两个必须知道的坑

**1. Tailwind 会「摇树」删掉没用到的组件类**

`src/input.css` 里用 `@layer components` 定义的类（如 `.table-mcu`、`.badge-plain`），
只有在 `content` 扫描到的文件里**真正出现过**，才会被写进 `app.css`。

`tailwind.config.js` 的扫描范围是：

```js
content: ['./*.html', './tutorials/*.html', './assets/js/**/*.js']
```

> `./tutorials/*.html` **不能漏**：教程正文页里独有的类名如果扫描不到，
> 会被整体摇掉，那些页面直接掉样式。

所以：

- **新增页面后一定要跑一次 `pnpm run build`**，否则新页面用到的新类不会生效；
- 如果某个类是在 JS 里动态拼出来的，要保证完整类名出现在被扫描的文件中。

**2. 透明度修饰符只支持 5 的倍数**

Tailwind v3 默认 opacity 刻度是 `0,5,10,…,100`。
`bg-emerald-500/35` 合法，`bg-emerald-500/12` **会直接让构建报错**。
需要任意值时用方括号语法：`bg-emerald-500/[0.12]`。

---

## 七、部署

### Vercel（推荐）

**A. 网页导入（最省事）**

1. 把项目推到 GitHub / GitLab / Gitee 仓库；
2. 打开 [vercel.com/new](https://vercel.com/new)，选择该仓库；
3. Framework Preset 选 **Other**；
4. Build Command 与 Output Directory **都留空**（纯静态，无需构建；
   若你希望在 Vercel 上构建 CSS，则 Build Command 填 `pnpm run build`，Output Directory 填 `.`）；
5. 点 **Deploy**，几十秒后拿到 `https://你的项目.vercel.app`。

**B. 命令行**

```bash
npm i -g vercel
vercel          # 首次会引导登录，一路回车即可
vercel --prod   # 发布到生产环境
```

**C. 拖拽（不需要 Git）**

打开 [vercel.com/new](https://vercel.com/new)，把整个 `McuStudy` 文件夹拖进去即可。

> 如果不想在 Vercel 上装依赖，**记得先把 `assets/css/app.css` 构建好再提交**，
> 这样平台只做静态分发，不需要 Node 环境。

### GitHub Pages

1. 推到 GitHub 仓库；
2. 仓库 **Settings → Pages**；
3. Source 选 `Deploy from a branch`，Branch 选 `main`，目录选 `/ (root)`；
4. 保存后访问 `https://用户名.github.io/仓库名/`。

> 页面之间全部用相对路径（`mcu51.html`、`assets/...`），
> 所以放在子目录（`/仓库名/`）下也能正常跳转，不需要改任何链接。

### 其他静态托管

Netlify、Cloudflare Pages、对象存储（OSS / COS）、宝塔、Nginx……
直接把整个目录丢上去即可，**不需要 Node、不需要数据库、不需要任何服务端配置**。

---

## 八、新增一篇教程（最常用）

站点采用「**目录卡片 → 教程正文**」两段式：`mcu51.html` / `stm32.html` / `esp32.html`
是三个方向目录页，共 **40 张卡片**（17 篇基础篇 + 23 篇教程专题）；
`knowledge.html` 是知识体系地图，共 **45 张卡片**（学科基础 23 + 嵌入式核心 10 + 专业方向 12）。
两边合计 **85 张卡片**，每张都指向 `tutorials/` 下的一篇完整正文。

新增一篇教程，就是「复制模板 → 写正文 → 在目录页加一张卡片指向它」三件事。
方向教程走第 1~6 步；知识体系教程除了这 6 步，还要多做第 8 步的教材对照登记。

### 第 1 步：复制模板

```bash
cp article-template.html tutorials/mcu51-led-water.html
```

> 放进 `tutorials/` 是约定：这些页面的资源路径都带 `../`，
> 放到根目录反而会全部失效。

### 第 2 步：改头部与标题

打开新文件，改这 3 处：

```html
<title>你的教程标题 | McuStudy</title>
<meta name="description" content="一句话说明这篇教程解决什么问题">
```

以及正文里的 H1 和摘要：

```html
<h1>【替换为教程主题】</h1>   <!-- ← 换成真实标题 -->
```

### 第 3 步：按模板结构填内容

模板固定 5 段结构，建议不要改顺序（读者的预期已经形成了）：

1. **原理介绍** —— 讲清楚「为什么能 work」，别只贴代码；
2. **硬件接线说明** —— 元件接线表 + 接线示意图，写到「闭着眼睛也能接对」；
3. **完整代码** —— 可直接编译的完整版本，不要给片段；
4. **现象演示说明** —— 做对了应该看到什么，做错了对应查什么；
5. **常见报错排查方案** —— 按「报错原文 → 原因 → 解决」写，方便直接搜索。

正文上方另有一个**「前置知识」区块**（模板里已经写好，文字标着【替换】）：
它列出这篇依赖的基础篇和对应链接，全站每一篇教程都有，读者靠它往回补基础。
**新增教程时不要删掉这个区块**，把它换成这篇真正依赖的内容即可。

### 第 4 步：让目录高亮生效

左侧目录靠 `id` 配对：目录里 `<a class="toc-link" href="#sec-intro">`
必须对应正文里 `<h2 id="sec-intro">`。

- 改了标题文字，**也要同步改目录里的文字**；
- 删掉某一节，**目录里那一行也要删掉**，否则会留下点了没反应的死链。

### 第 5 步：在目录页加一张卡片指向它

回到对应的目录页（例如 `mcu51.html`），照着已有卡片复制一张，改 `id` 和 `href`：

```html
<a id="c-led-water" href="tutorials/mcu51-led-water.html"
   class="card card-pad card-hover group scroll-mt-24">
```

卡片里的「查看教程 →」要用 `<span>` 而不是 `<a>`——**整张卡片本身就是链接**，
HTML 不允许 `<a>` 嵌套 `<a>`。

> 现有 85 张卡片（方向 40 + 知识体系 45）的 `id` 和 `href` 是**分开的**：
> `id="c-led"` 只用于页内定位，`href` 才指向 `tutorials/` 下的正文页。
> 改了文件名，记得同时更新 `href` 和正文页尾的上一篇/下一篇互链。
>
> 三个栏目页的卡片分成两个区块：**「基础篇」区块**用 `b-` 前缀的 id
> （`b-electricity`、`b-arm`、`b-compare` …），**教程专题区块**用 `c-` 前缀的 id
> （`c-env`、`c-gpio` …）。两套 id 不要混用——`index.html` 和 `route.html` 里的深链
> 同时依赖它们（例如 `mcu51.html#b-register` 与 `mcu51.html#c-timer`）。

### 第 6 步：重新构建并检查

```bash
pnpm run build
```

然后点一遍：首页 → 目录页 → 新教程，确认跳转、复制按钮、目录高亮都正常。

### 第 7 步（可选）：新增一篇基础篇

基础篇和教程专题用的是**同一个模板、同一套结构**，区别只在放置位置和互链方式：

| | 教程专题 | 基础篇 |
| --- | --- | --- |
| 文件名 | `tutorials/<方向>-<主题>.html` | `tutorials/<方向>-basic-<主题>.html` |
| 目录页位置 | 「教程专题」区块，id 前缀 `c-` | 「基础篇」区块，id 前缀 `b-` |
| 页尾互链 | 指向上一个/下一个专题 | 指向上一个/下一个基础篇，并指回栏目页 |
| 难度徽章 | 入门 / 进阶 / 综合 | 多为 入门 / 进阶 |

新增一篇基础篇后，记得同步三处：

1. 栏目页「基础篇」区块加一张卡片（`<a id="b-xxx" href="tutorials/<方向>-basic-xxx.html" …>`）；
2. `index.html` 的「先打地基」区块里，对应方向的 `<ul>` 加一行链接；
3. `route.html` 阶段 1 的「重点知识」列表里，如果新篇覆盖了新的知识块，补一条链接。

### 第 8 步：新增一篇知识体系教程

知识体系教程（`tutorials/ee-*.html` / `core-*.html` / `adv-*.html`）在结构上同样复用模板，但多了几处约定：

| | 说明 |
| --- | --- |
| 文件名 | 按层用前缀：`ee-`（学科基础）、`core-`（嵌入式核心）、`adv-`（专业方向） |
| 编号 | `knowledge.html` 里是**连续的 1~45 号**，插一篇要顺移后面所有编号 |
| 卡片位置 | 第 1 层在「学科基础」网格；第 2 层在「嵌入式核心」网格；第 3 层分「STM32 深入」与「ESP32 与工程实践」两个网格 |
| 页尾互链 | 按编号顺序指向**上一篇 / 下一篇**，卡片标题必须与该页 `<h1>` 完全一致 |
| 面包屑 | 首项固定为「知识体系」（指向 `../knowledge.html`），末项是本篇标题 |
| 页面标记 | `<body data-page="knowledge" class="min-h-screen">`（**不是** `data-page="index"`） |

新增一篇后，**要同步四处**：

1. `knowledge.html` 对应层的网格里加一张卡片（含编号徽标、一句话描述、右下角教材出处）；
2. 相邻两篇的页尾「上一篇 / 下一篇」互链要接上；
3. 页底**「教材对照表」**（`knowledge.html#books`）里，把新篇的编号补进它对应教材那一行的「支撑的知识块」列——这是知识体系页区别于方向目录页的关键；
4. 如果新篇是某一层的第一篇，`index.html` 的知识体系入口文案里的篇数也要一起改。

> 「教材对照表」是这一层可核查性的来源：读者能顺着它回到纸质教材的对应章节，
> 也能反过来看出某本教材到底支撑了站内哪几篇。新增时漏登记，表就会失效。

---

## 九、代码块怎么写

代码块采用「**作者只写内容和语言，其余交给 JS**」的约定：

```html
<div class="code-block" data-lang="c" data-title="main.c —— LED 流水灯">
  <pre><code>#include &lt;reg52.h&gt;

void main(void) { P1 = 0xFE; }</code></pre>
</div>
```

`site.js` 会自动补上标题栏、语言标签和复制按钮，所以**不要手写** `<div class="code-head">` 或复制按钮。

**注意事项：**

- 代码里的 `<` `>` `&` 必须转义成 `&lt;` `&gt;` `&amp;`，否则会破坏页面结构；
- `data-lang` 支持 `c` / `bash` / `python`；
- 想要**不做高亮、只原样显示**（例如画接线示意图），把 `data-lang` 写成 `text`；
- 想让某个代码块**不要复制按钮**，加 `data-copy="off"`。

---

## 十、常见修改位置

| 想改什么 | 改哪里 |
| --- | --- |
| 主色 `#165DFF` | `tailwind.config.js` 的 `brand` 色阶 + `src/input.css` 里 `--c-*` 变量 |
| 亮/暗背景、文字、边框色 | `src/input.css` 顶部的 `:root` 与 `.dark` 里的 CSS 变量 |
| 代码块配色 | `src/input.css` 里的 `--code-bg`、`--tok-*` 变量 |
| 导航菜单项 | 每个页面 `#siteHeader` 里的 `<nav>`（桌面 + 移动抽屉两处都要改） |
| 页脚版权、备案信息 | 每个页面的 `<footer>` |
| 站点图标 | 替换 `assets/img/favicon.svg` |
| 下载资源的真实链接 | `resource.html`：去掉按钮的 `data-demo-download`，改成 `<a href="文件路径" download>` |
| 工具的计算逻辑 | `assets/js/tools.js` |

> 导航和页脚目前是**每个页面各存一份**（纯静态、无模板引擎的代价）。
> 改菜单时记得 9 个页面一起改，或者用编辑器的「在文件中替换」批量处理。

---

## 十一、主题与交互的约定

这些约定是跨页面生效的，改的时候注意保持一致：

| 约定 | 作用 |
| --- | --- |
| `<body data-page="mcu51">` | 决定哪个导航项高亮；取值 `index`/`route`/`mcu51`/`stm32`/`esp32`/`tools`/`resource`/`project` |
| `data-nav="mcu51"` | 导航链接上的标记，与 `data-page` 配对 |
| `data-theme-toggle` | 主题切换按钮（左键切换，右键恢复跟随系统） |
| `data-year` | 自动填入当前年份 |
| `data-demo-download` | 静态演示下载按钮，点击弹出「自行上传文件后替换链接」提示 |
| `<script src="assets/js/theme.js">` | **必须同步加载**，写成 `defer` 会导致刷新瞬间闪白 |
| `<script src="assets/js/site.js" defer>` | 其余交互都在这里，可以延迟 |

---

## 十二、常见问题

**Q：页面样式全乱了 / 某些组件没样式？**
`assets/css/app.css` 没构建或构建产物过旧。跑一次 `pnpm run build`。

**Q：`pnpm install` 卡住不动？**
默认源在国内可能超时，换镜像：

```bash
pnpm install --registry=https://registry.npmmirror.com
```

**Q：构建报错 `The 'bg-xxx-500/12' class does not exist`？**
透明度用了非 5 的倍数。改成 `/10`、`/15`，或用任意值 `/[0.12]`（详见第六节）。

**Q：为什么不直接用 Tailwind 的 CDN 一行引入？**
`cdn.tailwindcss.com` 是在浏览器里**运行时**注入样式，会排在你自己的 `<link>` 之后难以覆盖，
而且**断网就完全失效**。本项目选择预构建，换来离线可用和零运行时开销。

**Q：工具里的计算结果可靠吗？**
延时计算按标准 51 机器周期公式推导，CRC 六种算法内置了权威 check 值自检
（对 ASCII `"123456789"` 比对标准结果，页面会显示 ✓）。
不过**延时仍受晶振精度、编译器优化、中断开销影响**，要求严格计时建议用示波器实测校准。

**Q：想加后台 / 评论 / 登录？**
本项目刻意保持纯静态——没有后端、没有数据库，也因此**没有任何可被攻击的入口**，
部署成本为零。需要这些功能建议单独接第三方服务（如 Giscus 评论、Supabase）。

---

## 十三、技术栈与设计约定

- **HTML5** —— 语义化标签（`header` / `nav` / `main` / `section` / `article` / `aside` / `footer`），每页独立
- **Tailwind CSS v3.4.17** —— 预构建为静态 CSS；语义色用 CSS 变量驱动，避免全站写 `dark:` 变体
- **原生 JavaScript（ES5 语法风格）** —— 无框架、无构建、无依赖，三个文件各司其职
- **可访问性** —— 交互元素带 `aria-label` / `aria-expanded`，统一 `:focus-visible` 焦点环，
  支持 `prefers-reduced-motion` 降级
- **设计规范** —— 主色 `#165DFF`，辅助灰调，无花哨动画，优先阅读体验；
  字体走系统栈（PingFang SC / Microsoft YaHei），不引外链字体

---

## 十四、许可

本站内容（教程文字、代码示例、图表）仅供学习交流使用，转载请注明出处。
站内涉及的芯片手册、开发工具等第三方资源的版权归各自厂商所有，
`resource.html` 中的下载按钮为静态演示占位，请自行上传合规文件后替换链接。

---

<p align="center">
  <b>McuStudy</b> · 纯静态站点 · 零依赖运行时 · 托管于 Vercel / GitHub Pages<br>
  © <span>2026</span> McuStudy
</p>