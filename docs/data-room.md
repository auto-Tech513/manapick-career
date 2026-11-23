# データ室の記事（/data/{slug}/）の書き方

2026-11-24 新設（評価チーム依頼 CE-05、設計：design-extra「05_データ室の本文セクション群」）。
ページの枠（パンくず・見出し・目次・節の見出し・出典の箱）は既存の T1 記事と同じ。新しい部品は「数字の帯」と「図」の2つ。

## 置き場所と公開の流れ

| ファイル | 役割 |
|---|---|
| `content/data-room.json` | 本番用の記事。`items` 配列に1記事1オブジェクトで書く（初期状態は空） |
| `content/data-room-sample.json` | 表示の見本1件（数値は設計書の表示例）。本番ビルドには出力しない |
| `content/source-registry.json` | 出典の台帳。記事の `sourceIds` はここの `sourceId` を指す |

- `status: "draft"`：ページを出力しない・サイトマップに載せない。
- `status: "published"`：`/data/{slug}/` を出力し、サイトマップに載せる（索引の対象）。
- 見本（`status: "sample"`）は、ローカルで `DATA_ROOM_SAMPLE=1 npm run build` としたときと、Cloudflare Pages のプレビュー（`CF_PAGES_BRANCH` が `main` 以外）だけで出力する。出力されても `noindex, nofollow`・サイトマップ外。
- `npm run data-room:check`（prebuild と qa に含む）が形を検査する。公開記事に「表示例」の文字が残っていると失敗する。

## 1記事の形

```json
{
  "slug": "job-openings-ratio-2026-09",
  "status": "draft",
  "category": "雇用・求人",
  "title": "職業別の有効求人倍率（2026年9月）",
  "lead": "記事の頭の1〜2文。",
  "publishedAt": "2026-12-01",
  "checkedAt": "2026-12-01",
  "readMinutes": 3,
  "author": "manapick career編集部",
  "editor": "manapick career編集部",
  "kpi": {
    "items": [
      { "label": "全体", "value": "1.19", "unit": "倍", "note": "前月から −0.01" },
      { "label": "…", "value": "…", "unit": "倍", "note": "…" },
      { "label": "…", "value": "…", "unit": "倍", "note": "…" }
    ],
    "source": "出典：厚生労働省「一般職業紹介状況」（2026年9月分・取得日 2026-11-01）"
  },
  "sections": [
    { "id": "by-occupation", "heading": "職業ごとの求人倍率", "blocks": [ … ] }
  ],
  "sourceIds": ["mhlw-job-openings-2026-09"]
}
```

| 項目 | 必須 | 書き方 |
|---|---|---|
| `slug` | ○ | 半角英小文字・数字・ハイフン。URL は `/data/{slug}/`。`public/data/` にある名前（`occupation-briefs`）と見本の `sample-layout` は使えない |
| `category` | ○ | パンくずの3段目と見出しの上の「CA-DATA · ○○」に出る |
| `title` / `lead` | ○ | h1 と見出しの下の文 |
| `publishedAt` / `checkedAt` | ○ | `YYYY-MM-DD`。`checkedAt` はサイトマップの更新日にも使う |
| `readMinutes` | ○ | 目次の下と見出しの下の「読了目安」 |
| `author` / `editor` | ○ | 出典の箱（執筆・確認情報）と構造化データ |
| `kpi` | － | 記事の頭の「数字の帯」。**項目はちょうど3つ**（設計が3つの並びだけのため）。`value` は文字列（"1.20"）、`unit` は数字の右の小さい字、`note` は下の小さい字、`source` は帯の最下段 |
| `sections` | ○ | 節（目次と「SECTION 01」の見出しになる）。`id` は目次のリンク先（半角英小文字・ハイフン） |
| `sourceIds` | ○ | 出典の箱に並ぶ。`content/source-registry.json` に先に登録する |

## 節の中の部品（`blocks`）

上から順に並ぶ。

### 段落
```json
{ "type": "paragraph", "text": "本文の段落。" }
```

### 図（新規）— 横棒・1色・同じ尺度
```json
{
  "type": "figure",
  "tag": "FIG. 1",
  "title": "職業別の有効求人倍率",
  "note": "パートを含む・季節調整なし",
  "scaleMax": 6,
  "baseline": { "value": 1, "label": "1.0倍＝求人と求職が同じ" },
  "bars": [ { "label": "事務職", "value": 0.38, "display": "0.38" } ],
  "fine": "棒の長さは同じ尺度。色は1色（濃紺）で、良い悪いの色分けはしません。"
}
```
- 棒の長さは `value ÷ scaleMax`。すべての棒が同じ尺度。`value` は 0〜`scaleMax`。
- 基準線（`baseline`）は1本、必須。軸の下に `0`・`baseline.label`・`scaleMax` が並ぶ。
- `display` は右の数字の表示（"5.20" のように桁をそろえたいとき）。省略すると `value` のまま。
- `label` は4文字以内を推奨（幅640px以下では見出しの列が64pxで、5文字以上は2行に折れる。検査で警告）。
- 色分けはできない（設計：良い悪いの色分けをしない）。

### 表（T1 の表）
```json
{ "type": "table", "head": ["職業", "有効求人倍率", "前年同月"], "rows": [ { "label": "事務職", "cells": ["0.38", "—"] } ] }
```
- 1列目は `label`（行の見出し）、残りは `cells`（数は `head` の数−1）。セルは文字列。
- 数字だけのセル（`0.38`・`12%`・`—` など）は自動で数字用の書体・太さになる。

### 注意枠（T1 の注意枠）
```json
{ "type": "note", "label": "注意", "text": "ハローワークを通した求人だけの数字で、すべての求人ではありません。" }
```
- `label` を省略すると「注意」。

## 入れていないもの（デザイン作成待ち・判断待ち）

- 設計書の「このデータの読み方」の3枚カード（`.ce-read`）。今回の依頼の範囲（新規は数字の帯と図の2つ）に入っていないため未実装。
- 数字の帯の項目が3つ以外の並び、図の色分け・複数系列・縦棒。設計に無い。
- データ室一覧（`/research/`）・検索候補・RSS・llms.txt への掲載、広告枠、共有ボタン。公開の判断とあわせて決める。
