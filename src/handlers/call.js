/**
 * [call] タグの処理
 * 別のシナリオやシーンを呼び出す
 */
export function handleCall(manager, params) { // asyncはもう不要
    const storage = params.storage;
    if (!storage) { console.warn('[call] storageは必須です。'); manager.finishTagExecution(); return; }

    // 戻り先をコールスタックに積む (これは共通)
    manager.callStack.push({
        file: manager.currentFile,
        line: manager.currentLine 
    });
    console.log("コールスタックにプッシュ:", manager.callStack);

    if (storage.endsWith('.ks')) {
        // --- .ksファイル（サブルーチン）呼び出し ---
        // これはPromiseを返す非同期処理
        return new Promise(async (resolve) => {
            await manager.loadScenario(storage, params.target);
            manager.next();
            resolve();
        });
    } else {
        // --- 別のPhaserシーン呼び出し ---
        const sceneKey = storage;
        
        // ★★★ SystemSceneにシーン遷移を「依頼」する ★★★
        manager.scene.scene.get('SystemScene').events.emit('request-scene-change', {
            from: 'GameScene', // どのシーンから呼び出されたか
            to: sceneKey       // どのシーンを起動するか
        });

        // このタグの役目はここまで。
        // finishTagExecutionは、SystemScene経由で、戻ってきた時に呼ばれる。
    }
}