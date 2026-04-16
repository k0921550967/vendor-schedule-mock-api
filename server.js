const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── 開課單位資料（序號 1-10 已確認地點；11-24 暫時模擬）────────
const VENDORS = [
  // ── 已確認 ──────────────────────────────────────────────────
  {
    name: '銘傳大學',
    venue: '銘傳大學會計系（台北校區/基河校區）',
    address: '台北市士林區中山北路五段250號',
    confirmed: true
  },
  {
    name: '健行科技大學',
    venue: '健行科技大學財務金融系A520數位金融實驗教室',
    address: '桃園市中壢區健行路229號',
    confirmed: true
  },
  {
    name: '國立東華大學',
    venue: '國立東華大學管理學院',
    address: '花蓮縣壽豐鄉大學路二段1號',
    confirmed: true
  },
  {
    name: '逢甲大學',
    venue: '逢甲大學商學院301教室（電腦教室）',
    address: '臺中市西屯區文華路100號',
    confirmed: true
  },
  {
    name: '國立中興大學',
    venue: '國立中興大學社管大樓（管理學院）',
    address: '臺中市南區興大路145號',
    confirmed: true
  },
  {
    name: '靜宜大學',
    venue: '靜宜大學國際企業學系',
    address: '臺中市沙鹿區臺灣大道7段200號',
    confirmed: true
  },
  {
    name: '台中市電腦商業同業公會',
    venue: '台中市電腦商業同業公會（昌平路）',
    address: '臺中市北屯區昌平路一段95之8號9樓',
    confirmed: true
  },
  {
    name: '國立高雄科技大學',
    venue: '國立高雄科技大學（第一校區）產學營運處',
    address: '高雄市楠梓區卓越路2號',
    confirmed: true
  },
  {
    name: '國立屏東大學',
    venue: '國立屏東大學國際經營與貿易學系',
    address: '屏東市民生東路51號',
    confirmed: true
  },
  {
    name: '高雄市電腦商業同業公會',
    venue: '高雄市電腦商業同業公會',
    address: '高雄市左營區重信路196號',
    confirmed: true
  },
  // ── 暫時模擬地點 ────────────────────────────────────────────
  {
    name: '台北市進出口商業同業公會',
    venue: '台北市進出口商業同業公會會議室',
    address: '台北市中正區忠孝西路一段36號',
    confirmed: false
  },
  {
    name: '社團法人台灣電子商務暨創業聯誼協會',
    venue: '台灣電子商務暨創業聯誼協會研討室',
    address: '台北市大安區復興南路一段390號',
    confirmed: false
  },
  {
    name: '財團法人中華飲食文化基金會',
    venue: '中華飲食文化基金會多功能教室',
    address: '台北市中山區松江路225號',
    confirmed: false
  },
  {
    name: '中華民國進出口商業同業公會全國聯合會',
    venue: '全聯會會議中心',
    address: '台北市中正區羅斯福路二段100號',
    confirmed: false
  },
  {
    name: '台灣區照明燈具輸出業同業公會',
    venue: '照明燈具公會研習室',
    address: '台北市大同區延平北路二段83號',
    confirmed: false
  },
  {
    name: '臺灣區不織布工業同業公會',
    venue: '不織布公會教育訓練教室',
    address: '台北市萬華區康定路311號',
    confirmed: false
  },
  {
    name: '台灣針織工業同業公會',
    venue: '針織公會教育訓練中心',
    address: '台北市中山區南京東路三段301號',
    confirmed: false
  },
  {
    name: '台灣織襪工業同業公會',
    venue: '織襪公會多功能教室',
    address: '台中市南屯區工業區一路200號',
    confirmed: false
  },
  {
    name: '台灣塑膠製品工業同業公會',
    venue: '塑膠公會研習教室',
    address: '台北市信義區基隆路一段432號',
    confirmed: false
  },
  {
    name: '台灣區電機電子工業同業公會',
    venue: '電電公會訓練中心',
    address: '台北市內湖區民權東路六段109號',
    confirmed: false
  },
  {
    name: '台灣全國觀光暨商圈聯盟總會',
    venue: '觀光聯盟多媒體教室',
    address: '台北市中正區北平東路30號',
    confirmed: false
  },
  {
    name: '台中市中小企業協會',
    venue: '台中市中小企業協會會議室',
    address: '台中市西區五權路2號',
    confirmed: false
  },
  {
    name: '台灣工具機暨零組件工業同業公會',
    venue: '工具機公會訓練教室',
    address: '台中市西屯區工業區二路68號',
    confirmed: false
  },
  {
    name: '彰化縣工業會',
    venue: '彰化縣工業會教育訓練中心',
    address: '彰化縣彰化市中山路二段88號',
    confirmed: false
  }
];

// ── AI 財務相關課程名稱 ─────────────────────────────────────────
const CLASS_NAMES = [
  'AI財務分析工具應用入門',
  'ChatGPT輔助財務報表解讀實務',
  '生成式AI在財務預測的應用',
  'AI驅動的供應鏈成本控制',
  '數位帳務自動化與AI工具整合',
  'AI財務風險管理與智慧預警',
  'Copilot輔助財務建模與試算',
  '餐飲業AI收益管理與財務優化',
  '旅宿業智慧定價與AI財務分析',
  '觀光業AI輔助預算規劃實務',
  'AI工具於中小企業財務管理應用',
  '製造業智慧化成本核算與AI輔助'
];

// ── 師資名單 ────────────────────────────────────────────────────
const TEACHER_NAMES = [
  '林志明', '陳美華', '張建國', '王雅婷', '李俊賢',
  '吳淑芬', '黃文宏', '劉素珍', '蔡志偉', '許雅萍',
  '鄭國輝', '洪美玲'
];

// 外層 key，固定 5 種
const CATEGORIES = [
  '製造業初階',
  '製造業中階',
  '服務業初階',
  '服務業中階(住宿/餐飲/旅遊)',
  '服務業中階(批發/零售)'
];


const DURATIONS = [2, 4, 8];

// ── 工具函式 ──────────────────────────────────────────────────
function uuid() {
  return crypto.randomUUID();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSample(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// minDays 可為負數（代表過去），maxDays 為未來天數
// 預設：最早 30 天前（-30），最晚 60 天後（+90）
function dateISO(minDays = -30, maxDays = 90) {
  const days = randomInt(minDays, maxDays);
  const hours = randomInt(8, 18);
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

// class_name 在分配後才決定，這裡先不填
function generateRecord() {
  const vendor = pickRandom(VENDORS);

  return {
    id: uuid(),
    class_id: uuid(),
    class_name: '',
    school_name: vendor.name,
    schedule_address: vendor.address,
    start_hour: dateISO(-30, 60),
    duration: pickRandom(DURATIONS),
    teachers: pickSample(TEACHER_NAMES, randomInt(1, 3)),
    student_count: randomInt(0, 40)
  };
}

/**
 * 將 total 筆資料隨機分配到各 category，
 * 再依 start_hour 排序後依序命名第1班、第2班…
 */
function distributeRecords(total, targetCategories) {
  const result = Object.fromEntries(CATEGORIES.map(c => [c, []]));

  for (let i = 0; i < total; i++) {
    const cat = pickRandom(targetCategories);
    result[cat].push(generateRecord());
  }

  // 排序後按時間順序補上 class_name
  for (const cat of CATEGORIES) {
    result[cat].sort((a, b) => new Date(a.start_hour) - new Date(b.start_hour));
    result[cat].forEach((record, idx) => {
      record.class_name = `${cat}第${idx + 1}班`;
    });
  }

  return result;
}

// ── 路由 ─────────────────────────────────────────────────────

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 開課單位列表
app.get('/api/v1/vendors', (req, res) => {
  const { confirmed } = req.query;
  let list = VENDORS;
  if (confirmed === 'true') list = VENDORS.filter(v => v.confirmed);
  if (confirmed === 'false') list = VENDORS.filter(v => !v.confirmed);
  res.json({ total: list.length, vendors: list });
});

// 主要端點
app.get('/api/v1/schedule/vendor', (req, res) => {
  const { count, category, mode } = req.query;

  if (mode === 'error') {
    return res.status(500).json({ error: 'Internal Server Error (mock)' });
  }

  if (mode === 'empty') {
    return res.json(Object.fromEntries(CATEGORIES.map(c => [c, []])));
  }

  let targetCategories = CATEGORIES;
  if (category) {
    const requested = category.split(',').map(s => s.trim());
    targetCategories = requested.filter(c => CATEGORIES.includes(c));
    if (targetCategories.length === 0) {
      return res.status(400).json({
        error: `無效的 category，可用值：${CATEGORIES.join(', ')}`
      });
    }
  }

  let total;
  if (count !== undefined) {
    total = parseInt(count, 10);
    if (isNaN(total) || total < 0) {
      return res.status(400).json({ error: 'count 必須為非負整數' });
    }
  } else {
    total = randomInt(20, 30);
  }

  const data = distributeRecords(total, targetCategories);

  if (category) {
    const full = Object.fromEntries(
      CATEGORIES.map(c => [c, targetCategories.includes(c) ? data[c] : []])
    );
    return res.json(full);
  }

  res.json(data);
});

// ── 啟動 ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Mock API running on port ${PORT}`);
});
