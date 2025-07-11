/**
 * [call] タグの処理
 * 別のシナリオファイル、または別のPhaserシーンを呼び出す
 */
export async function handleCall(manager, params) {
    const storage = params.storage;
    if (!storage) { console.warn('[call] storageは必須です。'); manager.finishTagExecution(); return; }

    // 戻り先をコールスタックに積む
    manager.callStack.push({
        file: manager.currentFile,
        line: manager.currentLine // ★ 次の行ではなく、今実行した[call]の次の行の番号
    });

    if (storage.endsWith('.ks')) {
        // --- .ksファイル（サブルーチン）呼び出し ---
        
        // ★ 1. 新しいシナリオをロードし、ジャンプ先を設定するだけ
        await manager.loadScenario(storage, params.target);
        
        // ★ 2. 完了を通知するだけ。next()は呼ばない！
        manager.finishTagExecution();

    } else {
        // --- 別のPhaserシーン呼び出し ---
        const sceneKey = storage;
        
        manager.scene.scene.pause('GameScene');
        manager.scene.scene.pause('UIScene');
        
        manager.scene.events.once('scene-return', () => {
            manager.scene.scene.resume('UIScene');
            manager.scene.scene.resume('GameScene');
            // ★ こちらも完了を通知するだけ
            manager.finishTagExecution();
        });
        
        manager.scene.scene.launch(sceneKey);
    }
}
