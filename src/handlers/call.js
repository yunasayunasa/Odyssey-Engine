export async function handleCall(manager, params) {
    const storage = params.storage;
    if (!storage) { manager.finishTagExecution(); return; }

    if (storage.endsWith('.ks')) {
        // .ksファイルのサブルーチン呼び出し
        manager.callStack.push({ file: manager.currentFile, line: manager.currentLine });
        await manager.loadScenario(storage, params.target);
        manager.next();
    } else {
        // 別のPhaserシーン呼び出し
        const sceneKey = storage;
        console.log(`別シーン[${sceneKey}]を起動します...`);
        
        // ★★★ 戻ってきたことを検知するリスナーを、ここで一度だけ設定 ★★★
        manager.scene.events.once('scene-resume', () => {
            console.log("GameSceneが再開を検知しました。シナリオを次に進めます。");
            // UISceneのポーズも解除
            manager.scene.scene.resume('UIScene');
            // ★★★ タグの処理が完了したことを通知 ★★★
            manager.finishTagExecution();
        });

        // GameSceneとUISceneを一時停止
        manager.scene.scene.pause('GameScene');
        manager.scene.scene.pause('UIScene');
        
        // 対象シーンを上に重ねて起動
        manager.scene.scene.launch(sceneKey);
    }
}