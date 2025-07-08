/**
 * [wait] タグの処理
 * 指定された時間、シナリオの進行を待つ
 * @param {ScenarioManager} manager - シナリオマネージャーのインスタンス
 * @param {Object} params - {time}
 */
export function handleWait(manager, params) {
    const time = Number(params.time) || 0;

    if (time > 0) {
        // Phaserのタイマー機能を使う
        manager.scene.time.delayedCall(time, () => {
            manager.finishTagExecution();
           // manager.next(); // 指定時間後に次の行へ
        });
    } else {
        // timeが0以下の場合は、すぐに次の行へ
        manager.finishTagExecution();
      //  manager.next();
    }
}