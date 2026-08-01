# 来自：curl -fsSL https://gist.githubusercontent.com/rayhashcell/0a69239ccfa8ddb0623f370054407dae/raw/codex-reset-remaining.sh | bash

import json
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

API_URL = "https://chatgpt.com/backend-api/wham/rate-limit-reset-credits"
AUTH_PATH = Path("~/.codex/auth.json").expanduser()
BEIJING_TIMEZONE = ZoneInfo("Asia/Shanghai")


def fail(message, exit_code=1):
    print(message, file=sys.stderr)
    raise SystemExit(exit_code)


def fmt(ts):
    if not ts:
        return "未设置"
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(BEIJING_TIMEZONE).strftime("%Y-%m-%d %H:%M:%S 北京时间")


def credit_type_label(value):
    labels = {
        "codex_rate_limits": "Codex 速率限制重置",
    }
    return labels.get(value, value or "未知分类")


def status_label(value):
    labels = {
        "available": "可用",
        "redeemed": "已兑换",
        "expired": "已过期",
        "used": "已使用",
    }
    return labels.get(value, value or "未知")


try:
    auth = json.loads(AUTH_PATH.read_text())
    tokens = auth["tokens"]
    access_token = tokens["access_token"]
except KeyError as exc:
    fail(f"Codex 登录文件缺少必要字段：{exc}")
except json.JSONDecodeError as exc:
    fail(f"Codex 登录文件不是有效 JSON：{exc}")

headers = {
    "Authorization": f"Bearer {access_token}",
    "OpenAI-Beta": "codex-1",
    "originator": "Codex Desktop",
}

account_id = tokens.get("account_id")
if account_id:
    headers["ChatGPT-Account-ID"] = account_id

request = urllib.request.Request(API_URL, headers=headers)

try:
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode())
except urllib.error.HTTPError as exc:
    if exc.code in (401, 403):
        fail(f"ChatGPT 后端拒绝了当前 Codex 登录态：HTTP {exc.code}。请重新登录 Codex。")
    fail(f"ChatGPT 后端返回 HTTP {exc.code}。")
except urllib.error.URLError as exc:
    fail(f"无法连接 ChatGPT 后端：{exc.reason}")

credits = payload.get("credits") or []
groups = {}
for credit in credits:
    credit_type = credit.get("reset_type") or credit.get("type") or "unknown"
    groups.setdefault(credit_type, []).append(credit)

print("Codex 重置次数（北京时间）")
print(f"可用次数：{payload.get('available_count', 0)}")

if not groups:
    print("当前账号没有返回可用的重置次数。")
else:
    for credit_type, items in groups.items():
        print()
        print(f"分类：{credit_type_label(credit_type)}（{credit_type}，{len(items)} 个）")
        for index, credit in enumerate(items, start=1):
            created_at = credit.get("created_at") or credit.get("granted_at")
            print(f"{index}. 状态：{status_label(credit.get('status'))}")
            print(f"   创建时间：{fmt(created_at)}")
            print(f"   到期时间：{fmt(credit.get('expires_at'))}")