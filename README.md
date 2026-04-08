# vendor-schedule-mock-api

廠商排課 Mock API — Node.js + Express，可直接部署至 Render。

---

## 本地執行

```bash
npm install
npm start
```

預設監聽 `http://localhost:3000`。

---

## API 端點

### `GET /health`

回傳服務狀態。

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

---

### `GET /api/v1/schedule/vendor`

每次呼叫重新亂數生成資料，預設總筆數 5–15 筆，隨機分配到四個 category。

**回傳結構**

```json
{
  "製造業初階": [ ...records ],
  "製造業中階": [ ...records ],
  "服務業初階": [ ...records ],
  "服務業中階": [ ...records ]
}
```

**Record 欄位**

| 欄位 | 說明 |
|------|------|
| `id` | UUID |
| `class_id` | UUID |
| `class_name` | 課程名稱（中文） |
| `school_name` | 機構名稱（中文） |
| `schedule_address` | 台灣地址 |
| `start_hour` | ISO 8601，未來 1–60 天隨機 |
| `duration` | 時數：3 / 4 / 6 |
| `teachers` | 教師姓名陣列（0–2 人） |
| `student_count` | 報名人數（0–40） |

**Query String 參數**

| 參數 | 說明 | 範例 |
|------|------|------|
| `count` | 指定總筆數 | `?count=10` |
| `category` | 指定一或多個 category（逗號分隔） | `?category=製造業初階,服務業中階` |
| `mode=empty` | 四個 category 全回傳空陣列 | `?mode=empty` |
| `mode=error` | 回傳 HTTP 500 | `?mode=error` |

---

## 部署至 Render

1. 將此專案推送到 GitHub（public 或 private 均可）。
2. 登入 [Render](https://render.com) → **New** → **Web Service**。
3. 連結你的 GitHub repo。
4. 設定如下：

   | 設定項 | 值 |
   |--------|----|
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free（或依需求選擇） |

5. 點擊 **Create Web Service**，等待部署完成。
6. Render 會自動設定 `PORT` 環境變數，server.js 已正確讀取。

部署完成後即可透過 Render 提供的 URL 呼叫 API：

```
https://<your-service>.onrender.com/api/v1/schedule/vendor
```
