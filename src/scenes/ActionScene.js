export async function handleCall(manager, params) {
    const storage = params.storage;
    const target = params.target;
    if (!storage) { console.warn('[call] storageは必須です。'); manager.finishTagExecution(); return; }

    // ★★★ 戻り先をコールスタックに積む (これは共通) ★★★
    manager.callStack.push({
        file: manager.currentFile,
        line: manager.currentLine 
    });
    console.log("コールスタックにプッシュ:", manager.callStack);

    // ★★★ storageが.ksで終わるかで処理を分岐 ★★★
    if (storage.endsWith('.ks')) {
        // --- .ksファイル（サブルーチン）呼び出し ---
        await manager.loadScenario(storage, target);
        manager.finishTagExecution(); // 完了を通知
    } else {
        // --- 別のPhaserシーン呼び出し ---
        const sceneKey = storage;
        console.log(`別シーン[${sceneKey}]を起動します...`);

        // GameSceneを一時停止
        manager.scene.scene.pause('GameScene');
        // UISceneも一時停止
        manager.scene.scene.pause('UIScene');
        
        // ★★★ 戻ってきたことを検知するイベントリスナーを設定 ★★★
        manager.scene.events.once('scene-resume', () => {
            console.log("GameSceneが再開されました。");
            // UISceneも再開
            manager.scene.scene.resume('UIScene');
            // シナリオ進行を再開
            manager.finishTagExecution();
        });

        // 対象シーンを上に重ねて起動
        manager.scene.scene.launch(sceneKey);
        
        // finishTagExecutionは、イベントリスナーが呼ぶので、ここでは呼ばない！
    }
}
export default ActionScene;