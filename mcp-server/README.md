# portfolio-mcp

MCP server to read/write portfolio content in Firebase Firestore (`siteConfig`).

## 1. Get a service account

1. Open [Firebase Console](https://console.firebase.google.com/) → select the portfolio project.
2. **Project settings** → **Service accounts**.
3. **Firebase Admin SDK** → **Generate new private key**.
4. Save the JSON as `mcp-server/service-account.json` (gitignored — do not commit).

## 2. Install & build

```bash
cd /Users/antt/Desktop/Taipei/anttxqt/mcp-server
cp .env.example .env
npm install
npm run build
```

Smoke (stdio):

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json node dist/index.js
```

## 3. Claude Desktop config

Edit `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/Users/antt/Desktop/Taipei/anttxqt/mcp-server/dist/index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "/Users/antt/Desktop/Taipei/anttxqt/mcp-server/service-account.json"
      }
    }
  }
}
```

Restart Claude Desktop. You should see 7 tools: `describe_schema`, `read_section`, `list_items`, `update_section`, `upsert_item`, `delete_item`, `move_item`.

## 4. Recommended AI workflow

1. **`describe_schema`** — understand sections, collections, keys, preview→confirm.
2. **`read_section` / `list_items`** — read current data; keep `_hash`.
3. **Preview** — call a mutation with `confirm: false` (default).
4. **Confirm** — call again with `confirm: true` and `expectedHash`.

## 5. Security

The service account has Admin SDK access. Keep it local, never commit or share it.
