# cs-ops-automation
CS業務の効率化と解約防止、アップセル、SaaSプロダクト活用率の可視化などを目的に、Slackの自動化とSプロダクトのデータ抽出のために記述した GAS や SQLまとめです

##  概要

- スプレッドシートから商談・提案情報を取得し、Slackに自動通知
- SQLでチャーンリスクの高い企業を抽出し、GASでアラートを飛ばす
- プレ提案リマインドや当日商談通知など、日次業務の定型化・省力化を実現

##  使用技術
- Google Apps Script（GAS）
- SQL（MySQLライク）
- Slack Webhook
- Google Sheets
- Metabase
  
##  ディレクトリ構成
.
├── README.md
├── gas/
│   ├── pre_proposal_reminder.gs
│   ├── deal_today_reminder.gs
│   └── churn_alert.gs
├── sql/
│   └── churn_risk_query.sql


##  注意事項

- Slack Webhook URLや企業名などの個人情報・機密情報はマスキング済みです。
- 実行前に、必要に応じてスプレッドシート名やメタデータの列番号の調整が必要です。

##  作成者

- [@reiko11](https://github.com/reiko11)
