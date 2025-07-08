export function handleStopBgm(manager, params) {
    const time = Number(params.time) || 0; // フェードアウト時間
    manager.soundManager.stopBgm(time);
     // ★★★ 状態を更新 ★★★
    manager.stateManager.updateBgm(null);
manager.finishTagExecution();
  //  manager.next();
}