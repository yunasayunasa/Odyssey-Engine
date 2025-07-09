export function handleCall(manager, params) { // asyncは不要
    const storage = params.storage;
    if (!storage) { console.warn('[call] storageは必須です。'); manager.finishTagExecution(); return; }

    // 戻り先をコールスタックに積む
    manager.callStack.push({
        file: manager.currentFile,
        line: manager.currentLine 
    });

    if (storage.endsWith('.ks')) {
        // .ksファイル呼び出しは非同期なのでPromiseを返す
        return new Promise(async (resolve) => {
            await manager.loadScenario(storage, params.target);
            manager.next();
            resolve(); // Promiseを解決して、awaitを終了させる
        });
    } else {
        // 別シーン呼び出し
        const sceneKey = storage;
        console.log(`別シーン[${sceneKey}]を起動します...`);
        
        // GameSceneと自分自身(UIScene)を一時停止
        manager.scene.scene.pause('GameScene');
        manager.scene.scene.pause('UIScene');
        
        // 対象シーンを起動
        manager.scene.scene.launch(sceneKey);
        
        // このタグはここで処理を中断する。続きはUISceneがやる。
    }
}