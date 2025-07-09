/**
 * [call] タグの処理
 * 別のシナリオファイル、または別のPhaserシーンを呼び出す
 * @param {Object} params - {storage, target}
 */
export async function handleCall(manager, params) {
    const storage = params.storage;
    const target = params.target;
    if (!storage) { console.warn('[call] storageは必須です。'); manager.finishTagExecution(); return; }

    // 戻り先をコールスタックに積む
    manager.callStack.push({
        file: manager.currentFile,
        line: manager.currentLine 
    });
    console.log("コールスタックにプッシュ:", manager.callStack);

    // --- storageが.ksで終わるかで処理を分岐 ---
    if (storage.endsWith('.ks')) {
        // --- .ksファイル（サブルーチン）呼び出し ---
        await manager.loadScenario(storage, target);
        manager.next(); // サブルーチンの最初の行から実行
    } else {
        // --- 別のPhaserシーン呼び出し ---
        const sceneKey = storage;
        console.log(`別シーン[${sceneKey}]を起動します...`);

        // ★★★ GameSceneが戻ってきたことを知るためのイベントリスナー ★★★
        manager.scene.events.once('scene-resume', () => {
            console.log("GameSceneが再開されました。");
            // UISceneも再開
            manager.scene.scene.resume('UIScene');
            // ★★★ 呼び出し元の次の行からシナリオを再開 ★★★
            manager.next();
        });

        // GameSceneとUISceneを一時停止
        manager.scene.scene.pause('GameScene');
        manager.scene.scene.pause('UIScene');
        
        // 対象シーンを上に重ねて起動
        manager.scene.scene.launch(sceneKey);
        
        // ★★★ ここではnext()を呼ばない！ ★★★
        // イベントリスナーが、戻ってきた時にnext()を呼ぶ責任を持つ
    }
}