export function handleJump(manager, params) {
    const storage = params.storage;
    const target = params.target;

    if (storage) {
        // 別シーンへのジャンプ
        console.log(`別シーン[${storage}]へジャンプします。`);
        // ★★★ GameSceneとUISceneを、stopしてからstartする ★★★
        manager.scene.scene.stop('UIScene');
        manager.scene.scene.start(storage); // startがGameSceneを自動でstopする
    } else if (target && target.startsWith('*')) {
        // ラベルへのジャンプ
        manager.jumpTo(target);
        manager.next();
    } else {
        manager.next();
    }
}