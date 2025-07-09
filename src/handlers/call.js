export function handleCall(manager, params) { // asyncは不要
    const storage = params.storage;
    if (!storage) { manager.finishTagExecution(); return; }

    if (storage.endsWith('.ks')) {
        // .ksファイル呼び出し (ここはPromiseを返す非同期処理)
        return new Promise(async (resolve) => {
            manager.callStack.push({ file: manager.currentFile, line: manager.currentLine });
            await manager.loadScenario(storage, params.target);
            manager.next();
            resolve();
        });
    } else {
        // 別シーン呼び出し
        const sceneKey = storage;
        console.log(`別シーン[${sceneKey}]を起動します...`);
        
        // GameSceneとUISceneを一時停止
        manager.scene.scene.pause('GameScene');
        manager.scene.scene.pause('UIScene');
        
        // 対象シーンを起動
        manager.scene.scene.launch(sceneKey);
        
        // finishTagExecutionは呼ばない。GameSceneの再開イベントが責任を持つ。
    }
}