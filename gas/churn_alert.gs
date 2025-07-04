const SHEET_NAME = 'ログイン未達'; // スプレッドシートのシート名
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/your_webhookURL_here'; // 任意のWebhook URLに差し替え

function notifyAllCSInOneMessage() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  const csCompanyMap = {};

  for (let i = 1; i < data.length; i++) {
    const slackMention = data[i][68]; // BQ列：Slackメンション（<@U12345678>）
    const companyName = data[i][5];   // F列：会社名

    if (!slackMention || !companyName) continue;

    if (!csCompanyMap[slackMention]) {
      csCompanyMap[slackMention] = [];
    }
    csCompanyMap[slackMention].push(・${companyName});
  }

  // 通知メッセージを1つにまとめる
  let fullMessage = ':loudspeaker: *31日以上ログインしていない契約中の企業一覧*\n\n';

  for (const [mention, companies] of Object.entries(csCompanyMap)) {
    fullMessage += ${mention} さん\n${companies.join('\n')}\n\n;
  }

  const payload = {
    text: fullMessage
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
}
