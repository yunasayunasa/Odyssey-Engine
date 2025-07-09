export async function handleCall(manager, params) {
    // ★★★ Promiseを返すようにする ★★★
    return new Promise(async (resolve) => {
        const storage = params.storage;
        if (!storage) { resolve(); return; }

        if (storage.endsWith('.ks')) {
            manager.callStack.push({ file: manager.currentFile, line: manager.currentLine });
            await manager.loadScenario(storage, params.target);
            manager.next();
        } else {
            // ... (シーン遷移ロジック) ...
            // シーンから戻ってきたら、resolve()で完了を通知
            manager.scene.events.once('scene-resume', () => {
                manager.scene.scene.resume('UIScene');
                resolve(); // ★★★ Promiseを解決 ★★★
            });
        }
    });
}