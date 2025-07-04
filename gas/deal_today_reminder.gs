function noticeDealsToChannelWithMention() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('元データのシート名');
  const data = sheet.getDataRange().getValues();

  // 今日の日付を yyyy/MM/dd 形式で取得
  const today = new Date();
  today.setDate(today.getDate());
  const targetDate = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy/MM/dd');

  // 商談リストを SlackユーザーID ごとに集約
  const dealsByUser = {};

  for (let i = 1; i < data.length; i++) {
    const creator = data[i][0];      // A列：作成者名
    const dealName = data[i][1];     // B列：商談名
    const dealDateRaw = data[i][3];  // D列：商談開始日
    const slackUserId = data[i][6];  // G列：SlackユーザーID（U12345678）

    if (!dealDateRaw || !slackUserId) continue;

    let formattedDate = "";

    try {
      if (dealDateRaw instanceof Date) {
        formattedDate = Utilities.formatDate(dealDateRaw, 'Asia/Tokyo', 'yyyy/MM/dd');
      } else if (typeof dealDateRaw === 'string') {
        const parsedDate = new Date(dealDateRaw.replace(/-/g, "/"));
        formattedDate = Utilities.formatDate(parsedDate, 'Asia/Tokyo', 'yyyy/MM/dd');
      }
    } catch (e) {
      Logger.log(日付変換エラー（行${i + 1}）: ${dealDateRaw});
      continue;
    }

    if (formattedDate === targetDate) {
      if (!dealsByUser[slackUserId]) {
        dealsByUser[slackUserId] = [];
      }
      dealsByUser[slackUserId].push(・${dealName});
    }
  }

  // Slack通知文を組み立てる
  let fullMessage = 📅 *本日（${targetDate}）の商談リマインド*\n\nおとめとレコメンド訴求お願いします💖\n\n;

  for (let userId in dealsByUser) {
    const mention = <@${userId}>;
    const userDeals = dealsByUser[userId].join("\n");
    fullMessage += ${mention} さん\n${userDeals}\n\n;
  }

  // Webhookで通知を送信（1通でまとめて通知）
  const webhookUrl = "https://hooks.slack.com/your_webhookURL_here"; // ← あなたのパブリックチャンネルのWebhook URL

  sendSlackViaWebhook(fullMessage, webhookUrl);
}

function sendSlackViaWebhook(message, webhookUrl) {
  const payload = JSON.stringify({
    icon_emoji: ":bell:",
    text: message,
    username: "商談リマインダーボット"
  });

  const options = {
    method: "post",
    contentType: "application/json",
    payload: payload,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(webhookUrl, options);
  Logger.log("Webhook Response: " + response.getContentText());
}
