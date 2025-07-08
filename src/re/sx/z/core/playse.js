/**
 * [playse] タグの処理
 * 効果音(SE)を再生する
 * @param {Object} params - {storage, volume}
 */
export function handlePlaySe(manager, params) {
    const storage = params.storage;
    if (!storage) {
        console.warn('[playse] storage属性は必須です。');
    //    manager.next();
    manager.finishTagExecution();
        return;
    }

    const volume = Number(params.volume) || 1.0;

    manager.soundManager.playSe(storage, { volume: volume });
manager.finishTagExecution();
    // SEは再生しっぱなしで、すぐに次の行へ進む
    //manager.next();
}