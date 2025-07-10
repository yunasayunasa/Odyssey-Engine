export async function handleCall(manager, params) {
    const storage = params.storage;
    if (!storage) { manager.next(); return; }

    if (storage.endsWith('.ks')) {
        // .ksファイル呼び出し
        manager.callStack.push({ file: manager.currentFile, line: manager.currentLine });
        await manager.loadScenario(storage, params.target);
        manager.next();
    } else {
        // 別Phaserシーン呼び出し
        const sceneKey = storage;
        manager.callStack.push({ file: manager.currentFile, line: manager.currentLine });
        manager.scene.scene.pause('GameScene');
        manager.scene.scene.pause('UIScene');
        
        manager.scene.events.once('scene-return', () => {
            manager.scene.scene.resume('UIScene');
            manager.scene.scene.resume('GameScene');
            manager.next();
        });
        manager.scene.scene.launch(sceneKey);
    }
}