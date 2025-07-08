/**
 * [delay] タグの処理
 * 文字の表示速度を変更する
 * @param {Object} params - {speed}
 */
export function handleDelay(manager, params) {
    const speed = params.speed;
    if (speed === undefined) {
        console.warn('[delay] speed属性は必須です。');
       // manager.next();
       manager.finishTagExecution();
        return;
    }

    // ★★★ MessageWindowのプロパティを更新 ★★★
    manager.messageWindow.currentTextDelay = Number(speed);
    
    console.log(`テキスト表示速度を ${speed}ms に変更しました。`);
   // manager.next();
   manager.finishTagExecution();
}