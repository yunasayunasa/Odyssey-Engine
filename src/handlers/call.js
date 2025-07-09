export function handleCall(manager, params) {
    return new Promise(async (resolve) => {
        const storage = params.storage;
        console.log(`[handleCall] 開始: storage = "${storage}"`);

        if (!storage) {
            console.warn('[call] storageは必須です。');
            resolve();
            return;
        }

        if (storage.endsWith('.ks')) {
            console.log(`[handleCall] .ksファイル呼び出しを実行します。`);
            manager.callStack.push({ file: manager.currentFile, line: manager.currentLine });
            await manager.loadScenario(storage, params.target);
            // .ksを呼び出した場合は、ここでnext()を呼んで、Promiseを解決する
            manager.next();
            resolve();
        } else {
            // 別のPhaserシーン呼び出し
            console.log(`[handleCall] 別のPhaserシーン呼び出しを実行します。`);
            const sceneKey = storage;
            
            manager.scene.events.once('scene-resume', () => {
                console.log("GameSceneが'scene-resume'を検知。Promiseを解決します。");
                manager.scene.scene.resume('UIScene');
                resolve(); // ★★★ Promiseを解決して、parseメソッドのawaitを終了させる ★★★
            });

            manager.scene.scene.pause('GameScene');
            manager.scene.scene.pause('UIScene');
            manager.scene.scene.launch(sceneKey);
            
            // launchは非同期なので、ここでは何もせず、イベントを待つ
        }
    });
}