/**
 * [jump] タグの処理
 * 指定されたラベル、または別のシーンにジャンプする
 * @param {Object} params - {target, storage}
 */
export function handleJump(manager, params) {
    const storage = params.storage;
    const target = params.target;

    if (storage) {
        // ★★★ 別シーンへのジャンプ ★★★
        console.log(`別シーン[${storage}]へジャンプします。`);
        manager.scene.scene.start(storage);
        
        // 他のUIシーンなども一旦停止する
        if (manager.scene.scene.isActive('UIScene')) {
            manager.scene.scene.stop('UIScene');
        }
        // GameScene自身も停止する
        manager.scene.scene.stop('GameScene');

    } else if (target && target.startsWith('*')) {
        // ★★★ ラベルへのジャンプ (これは既存の機能) ★★★
        manager.jumpTo(target);
        manager.next();

    } else {
        console.warn('[jump] target属性かstorage属性は必須です。');
        manager.next();
    }
}