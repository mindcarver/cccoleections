#!/usr/bin/env python3
"""
Sync new AI projects to cccoleections features.json and push to remote.
Usage: python3 sync_to_cccoleections.py
Input: reads project data from stdin as JSON array:
  [{"owner": "...", "repo": "...", "desc": "...", "category": "..."}]
"""
import json
import sys
import subprocess
import os

CCCOL_PATH = "/Users/carver/workspace/ai-tools/cccoleections"
FEATURES_PATH = f"{CCCOL_PATH}/data/features.json"

def infer_tags(p):
    tags = []
    desc = p.get("desc", "").lower()
    cat = p.get("category", "")
    if "agent" in desc or cat == "agents":
        tags.extend(["agent", "multi-agent"])
    if "llm" in desc or "大模型" in desc:
        tags.append("llm")
    if "金融" in desc or "交易" in desc or cat == "ai-finance":
        tags.append("finance")
    if "coding" in desc or "编程" in desc or "code" in p.get("repo", "").lower():
        tags.append("coding")
    if "开源" in desc:
        tags.append("open-source")
    if "框架" in desc or "framework" in desc:
        tags.append("framework")
    if "工具" in desc or "tool" in desc:
        tags.append("tool")
    if "mcp" in desc:
        tags.append("mcp")
    if "rag" in desc:
        tags.append("rag")
    if not tags:
        tags.append("ai")
    return list(set(tags))[:6]

def main():
    # Read projects from stdin
    input_data = sys.stdin.read().strip()
    if not input_data:
        print("No input data, nothing to sync.")
        return

    try:
        projects = json.loads(input_data)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON input: {e}")
        sys.exit(1)

    if not isinstance(projects, list) or len(projects) == 0:
        print("Empty project list, nothing to sync.")
        return

    # Read existing features
    with open(FEATURES_PATH) as f:
        data = json.load(f)
    existing_ids = {feat["id"] for feat in data["features"]}

    added = 0
    for p in projects:
        repo_lower = p["repo"].lower()
        if repo_lower in existing_ids:
            continue

        short_desc = p["desc"].split("。")[0] if p.get("desc") else p["repo"]
        feat = {
            "id": repo_lower,
            "category": p.get("category", "ai-tools"),
            "tags": infer_tags(p),
            "title": {
                "en": f"{p['repo']} - {p['owner']}",
                "zh": f"{p['repo']} - {short_desc}"
            },
            "description": {
                "en": p.get("desc", ""),
                "zh": p.get("desc", "")
            },
            "details": {
                "en": f"{p.get('desc', '')} GitHub: github.com/{p['owner']}/{p['repo']}",
                "zh": f"{p.get('desc', '')} GitHub: github.com/{p['owner']}/{p['repo']}"
            },
            "examples": [f"github.com/{p['owner']}/{p['repo']}"],
            "version": "2026.1",
            "status": "new"
        }
        data["features"].append(feat)
        existing_ids.add(repo_lower)
        added += 1

    if added == 0:
        print("No new projects to add.")
        return

    # Write back
    with open(FEATURES_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Git commit and push
    os.chdir(CCCOL_PATH)
    subprocess.run(["git", "add", "-A"], check=True)
    subprocess.run([
        "git", "commit", "-m",
        f"Auto-sync: add {added} new AI project(s) from cron monitoring"
    ], check=True)
    result = subprocess.run(
        ["git", "pull", "--rebase", "origin", "main"],
        capture_output=True, text=True
    )
    result = subprocess.run(
        ["git", "push", "origin", "main"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"Push failed: {result.stderr}")
        sys.exit(1)

    print(f"Synced {added} new projects to cccoleections and pushed to remote.")

if __name__ == "__main__":
    main()
