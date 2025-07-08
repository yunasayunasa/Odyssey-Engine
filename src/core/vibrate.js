/**
 * [vibrate] タグの処理
 * 画面全体を揺らす
 * @param {Object} params - {time, power}
 */
export function handleVibrate(manager, params) {
    const time = Number(params.time) || 500; // 揺れる時間
    const power = Number(params.power) || 0.005; // 揺れの強さ(0 to 1)

    // ★★★ メインカメラに対して、shakeエフェクトを呼び出す ★★★
    manager.scene.cameras.main.shake(time, power);

    // 揺れが終わるのを待ってから次に進む
    manager.scene.time.delayedCall(time, () => {
        manager.finishTagExecution();
       // manager.next();
    });
}