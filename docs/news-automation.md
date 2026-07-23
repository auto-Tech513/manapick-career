# キャリアニュース朝夕監査

## 登録内容

- 自動化ID: `manapick-career`
- 表示名: `manapick career 公式ニュース朝夕監査（隔離実行）`
- 実行時刻: 毎日 08:00 / 18:00（Asia/Tokyo）
- 対象: Codex管理下の専用クリーンクローンにある `manapick-career` リポジトリのニュース、出典レジストリ、日本語OG画像
- 状態: ACTIVE
- 出力: `status: "draft"` の候補を置く専用ブランチと、review-onlyのDraft PR作成試行。自動merge・自動公開はしない

## 採用条件

1. 厚生労働省、総務省統計局、JILPT、経済産業省、IPA、内閣府等の一次資料を優先する。
2. 既存記事と同じ発表、同じ検索意図、高類似本文を採用しない。
3. `content/news-expanded.json` の共通定型文を除く記事固有本文を、各記事1,000字以上にする。
4. 対象範囲、数字の読み方、断定できないこと、次の確認行動を明記する。
5. 重要主張を `content/source-registry.json` の `sourceId` へ結び付ける。
6. 公表日と、人が一次資料を確認した `checkedAt` を混同しない。
7. 文脈がある場合だけ、manapick、manapick AI、manapick license の独自ページへ通常リンクする。
8. 候補ごとに `content/news-publication.json` のレコードを追加し、`status: "draft"`、`publishedAt: null`、人によるレビュー証跡なしで開始する。
9. 日本語OG画像は、OFL-1.1の BIZ UDPGothic TTF（Regular / Bold）をResvgの `fontFiles` へ直接渡し、`loadSystemFonts: false` で環境依存フォールバックを禁止して生成する。package version、TTFのSHA-256、使用文字のcmap収録、日本語禁則、1200×630pxを検査し、代表画像は原寸で確認する。旧Noto・versionless公開ディレクトリは削除し、draftの確認用画像が必要な場合は一時出力先を使い、`public/og` へ置かない。
10. `reviewEvidence` は `git:<commit>` の形式だけでなく、そのcommitが現在のGit履歴に実在し、人による確認日より後でないことを公開前検査で確認する。浅いcloneで証跡commitを取得できない環境は公開検査を成功扱いにしない。
11. `contentSha256` は人が確認した本文・出典・連携実装を固定する承認値とする。自動化はこの値と `reviewedAt`、`reviewedBy`、`reviewedByHumanAt`、`reviewEvidence` を設定・更新・削除しない。
12. `npm ci` でロックファイルどおりに依存関係を再構築してから、`lint`、`content:check`、`editorial:check`、`source:check`、`similarity:check`、`build`、`links:check` の全検査に合格させる。

品質条件を満たす一次情報がない実行では、件数を埋めるための記事を作らず0本で終了する。

## 公開境界

ニュースの公開状態は `content/news-publication.json` を正本とし、値は `draft`、`reviewed`、`published` の3段階とする。対応レコードがない記事は実行時にdraft相当として扱われ、品質検査にも失敗する。`published` であっても、サイト公開日、一次資料公表日、記名された人のレビュー、レビュー日、追跡可能なGit承認証跡、本文品質などが揃わなければ公開配列へ入らない。

公開配列へ入らないニュースは、ニュース一覧・個別ページ、sitemap、RSSフィード、llms.txt、`NewsArticle`を含むJSON-LD、Open Graph / Xメタデータ、公開OG画像から除外する。旧フォントの公開ディレクトリも生成時に削除し、draft画像が過去のURLで残らないようにする。自動処理は追加候補を必ずdraftにし、専用ブランチへのcommitとreview-onlyのDraft PR作成試行までに留める。08:00 / 18:00のどちらの実行もstatusの昇格、`main` へのmerge、本番公開は行わない。最新の一次資料から作った候補も、人が確認するまではdraftのままである。

編集者は一次資料、全主張、リンク、記事固有本文、OG画像を確認し、`reviewed` を経て、記名レビューとGit承認証跡をレジストリへ記録した場合だけ `published` へ昇格できる。Draft PRの作成成功やmergeだけを公開承認の代わりにはしない。

## 確認状態

自動化ID、08:00 / 18:00（JST）の登録値、ACTIVE状態、専用クリーンクローン、`npm ci`、review-onlyのDraft PR方針は2026-07-20に確認した。専用クローンでは同日の `npm ci` と `npm run qa` が成功した。

2026-07-23の08:00枠では、freshな `/private/tmp` cloneから候補作成と専用ブランチへのcommitまで到達した。ブランチは `automation/career-news-20260723-080053`、commitは `b7efe3360a78d6da2cc8d7e7a9f83e29d14328b0` である。ただしGitHubでのDraft PR作成はHTTP 403で失敗したため、PR URLはなく、PR作成成功とは扱わない。commitは専用ブランチにだけ存在し、`main` は変更されず、記事も公開されていない。

このcommitは公開レジストリ導入とdraft OG隔離を自動化プロンプトへ反映する前の履歴であり、現行ゲートを通過した公開候補ではない。同日、自動化プロンプトを更新し、候補ごとの `content/news-publication.json` 登録、常時draft、公開用OGディレクトリへのdraft画像出力禁止を明記した。

同日、GitHub CLIの実体 `/Users/mu/.local/bin/gh`（v2.96.0）が `auto-Tech513` として `repo` scopeで認証済みであることを実測した。接続済みGitHub機能がHTTP 403になった場合だけ、この絶対パスで認証を再確認してDraft PRを1回作成するフォールバックを自動化へ追加した。PATH上の `gh` には依存しない。更新後の自動化による実際のDraft PR URLは次回実行まで未確認であり、失敗時もmainへ代替pushしない。
