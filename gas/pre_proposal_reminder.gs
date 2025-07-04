function remindPreProposalFromSheet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('元データのシート名');
  const data = sheet.getDataRange().getValues();

  const webhookUrl = "https://hooks.slack.com/your_webhookURL_here";

  const approachingMap = {}; // 120〜150日：{ userID: [ '・企業名（残日数：130日）', ... ] }
  const overdueMap = {};     // 120日未満：{ userID: [ '・企業名', ... ] }

  for (let i = 1; i < data.length; i++) {
    const company = data[i][0];        // A列：企業名
    const remainingRaw = data[i][2];   // C列：残日数
    const status = data[i][3];         // D列：プレ提案状況
    const slackName = data[i][5];      // F列：Slack表示名（SlackユーザーIDとして扱う）

    if (!company || !remainingRaw || !slackName) continue;

    const remaining = parseInt(remainingRaw, 10);
    if (isNaN(remaining)) continue;

    const isCompleted = typeof status === 'string' && status.includes("継続提案実施済");
    if (isCompleted) continue;

    const entry = (remaining >= 120)
      ? ・${company}（残日数：${remaining}日）
      : ・${company};

    const targetMap = (remaining >= 120 && remaining <= 150) ? approachingMap
                      : (remaining < 120) ? overdueMap
                      : null;

    if (targetMap) {
      if (!targetMap[slackName]) {
        targetMap[slackName] = [];
      }
      targetMap[slackName].push(entry);
    }
  }

  if (Object.keys(approachingMap).length > 0) {
    let msg1 = :rotating_light:プレ提案120日前が近づいてきています！\nそろそろアポ取りに行きましょう！:rotating_light:\n\n;
    for (const user in approachingMap) {
      msg1 += <@${user}> さん\n${approachingMap[user].join("\n")}\n\n;
    }
    sendSlackViaWebhook(msg1, webhookUrl);
  }

  // if (Object.keys(overdueMap).length > 0) {
  //   let msg2 = :japanese_ogre:120日切りました！プレ提案しましょう！:japanese_ogre:\n\n;
  //   for (const user in overdueMap) {
  //     msg2 += <@${user}> さん\n${overdueMap[user].join("\n")}\n\n;
  //   }
  //   sendSlackViaWebhook(msg2, webhookUrl);
  // }

  if (Object.keys(approachingMap).length === 0 && Object.keys(overdueMap).length === 0) {
    Logger.log("⚠ 条件に該当するデータが見つかりませんでした。");
  }
}

//動作確認用

function testSlackWebhook() {
  const webhookUrl = "https://hooks.slack.com/your_webhookURL_here";

  const payload = JSON.stringify({
    text: ":white_check_mark: テスト通知：Slack Webhook動作確認です。",
    username: "テストBot",
    icon_emoji: ":robot_face:"
  });

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log("コード: " + response.getResponseCode());
    Logger.log("レスポンス: " + response.getContentText());
  } catch (e) {
    Logger.log("Slack通知失敗: " + e.message);
  }
}
