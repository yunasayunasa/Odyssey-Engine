/**
 * [delay] タグの処理
 * 文字の表示速度を変更する
 * @param {ScenarioManager} manager
 * @param {Object} params - { speed }
 */
export function handleDelay(manager, params) {
    console.log(`            [Handler:delay] >> 開始`);
    const speed = params.speed;
    if (speed === undefined) {
        console.warn('[delay] speed属性は必須です。');
        return; // 何もせず同期的に完了
    }

    // MessageWindowのプロパティを直接更新
    const newSpeed = Number(speed);
    if (!isNaN(newSpeed)) {
        manager.messageWindow.setTextSpeed(newSpeed); // ★ 専用メソッド経由が望ましい
        console.log(`テキスト表示速度を ${newSpeed}ms に変更しました。`);
    } else {
        console.warn(`[delay] speed属性には数値を指定してください: ${speed}`);
    }
console.log(`            [Handler:delay] << 完了`);
    // ★★★ このタグの処理は一瞬で終わるので、何も呼び出す必要はない ★★★
    // ScenarioManagerのメインループが、この関数の終了後に次の行の処理に進む
}