# portfolio-mcp

MCP server để đọc/ghi nội dung portfolio trên Firebase Firestore (collection `siteConfig`).

## 1. Lấy service account từ Firebase Console

1. Mở [Firebase Console](https://console.firebase.google.com/) → chọn project portfolio.
2. Vào **Project settings** (biểu tượng bánh răng) → tab **Service accounts**.
3. Chọn **Firebase Admin SDK** → **Generate new private key**.
4. Tải file JSON về máy (ví dụ `service-account.json`).
5. Đặt file vào thư mục `mcp-server/` (hoặc đường dẫn khác) và **không commit** file này lên git.

## 2. Cài đặt & build

```bash
cd /Users/antt/Desktop/Taipei/anttxqt/mcp-server
cp .env.example .env
# Sửa FIREBASE_SERVICE_ACCOUNT_PATH trong .env nếu cần
npm install
npm run build
```

Chạy thử (stdio):

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json node dist/index.js
```

## 3. Cấu hình Claude Desktop

Thêm vào file cấu hình MCP của Claude Desktop:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "node",
      "args": ["/Users/antt/Desktop/Taipei/anttxqt/mcp-server/dist/index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "/Users/antt/Desktop/Taipei/anttxqt/mcp-server/service-account.json"
      }
    }
  }
}
```

Trên Windows, thay đường dẫn tuyệt đối, ví dụ:

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\Desktop\\Taipei\\anttxqt\\mcp-server\\dist\\index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "C:\\Users\\YourName\\Desktop\\Taipei\\anttxqt\\mcp-server\\service-account.json"
      }
    }
  }
}
```

Khởi động lại Claude Desktop sau khi sửa config.

## 4. Quy trình AI khuyến nghị

1. **`describe_schema`** — gọi trước để hiểu sections, collections, quy tắc key và preview→confirm.
2. **`read_section`** hoặc **`list_items`** — đọc dữ liệu hiện tại, lưu `_hash` trả về.
3. **Ghi (preview)** — gọi `update_section`, `upsert_item`, `delete_item`, hoặc `move_item` với `confirm: false` (mặc định) để xem trước thay đổi.
4. **Ghi (confirm)** — gọi lại cùng tool với `confirm: true` và `expectedHash` từ bước đọc để tránh ghi đè dữ liệu đã thay đổi.

## 5. Cảnh báo bảo mật

Service account JSON có quyền **Admin SDK** trên Firebase project — có thể đọc/ghi Firestore (và có thể nhiều tài nguyên khác tùy role). Chỉ lưu file trên máy tin cậy, thêm vào `.gitignore`, và cấp quyền tối thiểu cần thiết trên Firebase nếu có thể. Không chia sẻ file hoặc đưa vào repo public.
