export function handlePlayBgm(manager, params) {
    const storage = params.storage;
    if (!storage) { console.warn('[playbgm] storageは必須です。');
        manager.finishTagExecution();
      //  manager.next(); 
        return; }

    const volume = Number(params.volume) || 0.5;
    const time = Number(params.time) || 0; // フェードイン時間

    manager.soundManager.playBgm(storage, volume, time);
     // ★★★ 状態を更新 ★★★
    manager.stateManager.updateBgm(storage);
manager.finishTagExecution();
   // manager.next(); // BGMは再生しっぱなしでOK
}