# Nurse Quest Life OS v1

ゆかりん専用の生活管理Webアプリです。

## 今すぐ使う

1. このフォルダをGitHubリポジトリへ入れる
2. GitHub Pagesを有効化
3. 公開URLをスマホで開く
4. 「ホーム画面に追加」

Google連携をしなくても、データはブラウザ内へ保存されます。

## 入っている機能

- 今日のミッション、完了時EXP
- 支出を1日に何件でも登録
- 課題と期限
- HP、睡眠、体重、体調メモ
- 献立候補
- バックアップの書き出し・読み込み
- PWA（スマホのホーム画面に追加）
- Apps ScriptによるGoogleスプレッドシート同期
- GeminiによるAI秘書プラン作成

## Googleスプレッドシート同期・AI秘書

1. Googleスプレッドシートを1つ新規作成
2. 拡張機能 → Apps Script
3. `apps-script/Code.gs` を貼り付ける
4. Apps Scriptの「プロジェクトの設定」→「スクリプト プロパティ」に追加
   - `SYNC_KEY`：自分で決めた長いパスコード
   - `GEMINI_API_KEY`：Google AI Studioで取得したAPIキー
5. `setup` を一度実行
6. デプロイ → 新しいデプロイ → ウェブアプリ
   - 次のユーザーとして実行：自分
   - アクセスできるユーザー：全員
7. 発行された `/exec` URLをアプリの設定へ貼る
8. 同じSYNC_KEYをアプリの「同期用パスコード」に入力

APIキーはWebアプリ側には保存されず、Apps ScriptのScript Propertiesに置かれます。

## ファイル構成

- `index.html` 画面
- `styles.css` デザイン
- `app.js` 動作
- `manifest.json` PWA設定
- `sw.js` オフラインキャッシュ
- `apps-script/Code.gs` 同期・AI秘書API

## 次の拡張候補

- Googleカレンダー予定の自動取得
- LINE通知
- 冷蔵庫在庫
- バイト勤務・給与
- ガチャ、ボス、称号、実績
- 既存Nurse Questデータとの統合
