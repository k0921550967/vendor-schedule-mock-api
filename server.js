const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── 繁體中文詞庫 ──────────────────────────────────────────────
const VOCAB = {
  classNames: [
    '工業安全衛生實務', '精密加工技術入門', '自動化設備操作', '品質管制與檢驗',
    '電氣控制基礎', '機械製圖與讀圖', '焊接技術應用', 'CNC 程式設計',
    '倉儲物流管理', 'ISO 9001 內部稽核'
  ],
  schoolNames: [
    '台北市職業訓練中心', '桃園技術學院推廣部', '台中工業技術協會',
    '高雄市勞工局訓練所', '新北市技能發展中心', '台南產業人才培訓中心',
    '彰化縣職業技能研習所', '台灣製造業發展協會', '中部工業人才培訓中心',
    '北區人力資源開發中心'
  ],
  addresses: [
    '台北市大同區承德路三段 287 號', '新北市板橋區文化路一段 188 號',
    '桃園市桃園區中正路 512 號', '台中市西屯區工業區三十路 8 號',
    '台南市仁德區文華路一段 201 號', '高雄市前鎮區中山二路 36 號',
    '彰化縣彰化市中興路 145 號', '新竹市東區光復路二段 101 號',
    '苗栗縣頭份市中正路 320 號', '嘉義市東區吳鳳北路 56 號'
  ],
  teacherNames: [
    '林志明', '陳美華', '張建國', '王雅婷', '李俊賢',
    '吳淑芬', '黃文宏', '劉素珍', '蔡志偉', '許雅萍',
    '鄭國輝', '洪美玲'
  ]
};

const CATEGORIES = ['製造業初階', '製造業中階', '服務業初階', '服務業中階'];
const DURATIONS = [3, 4, 6];

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
  return shuffled.slice(0, n);
}

function futureISO(minDays, maxDays) {
  const days = randomInt(minDays, maxDays);
  const hours = randomInt(8, 18);
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

function generateRecord() {
  return {
    id: uuid(),
    class_id: uuid(),
    class_name: pickRandom(VOCAB.classNames),
    school_name: pickRandom(VOCAB.schoolNames),
    schedule_address: pickRandom(VOCAB.addresses),
    start_hour: futureISO(1, 60),
    duration: pickRandom(DURATIONS),
    teachers: pickSample(VOCAB.teacherNames, randomInt(0, 2)),
    student_count: randomInt(0, 40)
  };
}

/**
 * 將 total 筆資料隨機分配到 4 個 category，
 * 保證每個 category 至少 0 筆（不強迫 >=1）。
 */
function distributeRecords(total, targetCategories) {
  const result = Object.fromEntries(CATEGORIES.map(c => [c, []]));

  for (let i = 0; i < total; i++) {
    const cat = pickRandom(targetCategories);
    result[cat].push(generateRecord());
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

// 主要端點
app.get('/api/v1/schedule/vendor', (req, res) => {
  const { count, category, mode } = req.query;

  // mode=error
  if (mode === 'error') {
    return res.status(500).json({ error: 'Internal Server Error (mock)' });
  }

  // mode=empty
  if (mode === 'empty') {
    return res.json(Object.fromEntries(CATEGORIES.map(c => [c, []])));
  }

  // category 過濾
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

  // 總筆數
  let total;
  if (count !== undefined) {
    total = parseInt(count, 10);
    if (isNaN(total) || total < 0) {
      return res.status(400).json({ error: 'count 必須為非負整數' });
    }
  } else {
    total = randomInt(5, 15);
  }

  const data = distributeRecords(total, targetCategories);

  // 若有指定 category，只回傳指定的 key
  if (category) {
    const filtered = Object.fromEntries(
      targetCategories.map(c => [c, data[c]])
    );
    // 補上未請求的 category 為空陣列（維持固定結構）
    const full = Object.fromEntries(CATEGORIES.map(c => [c, filtered[c] ?? []]));
    return res.json(full);
  }

  res.json(data);
});

// ── 啟動 ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Mock API running on port ${PORT}`);
});
