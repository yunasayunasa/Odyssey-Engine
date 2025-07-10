/**
 * [bg] タグの処理
 * 背景を表示・切り替えする
 */
export function handleBg(manager, params) {
    const storage = params.storage;
    if (!storage) { return; } // Promiseを返さずに終了すれば、parseが即next()を呼ぶ

    const time = Number(params.time) || 0;
    const scene = manager.scene;
    const bgLayer = manager.layers.background;

    // ★★★ 非同期処理なので、Promiseを返す ★★★
    return new Promise(resolve => {
        const newBg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, storage);
        newBg.setDisplaySize(scene.scale.width, scene.scale.height);
        newBg.setAlpha(0);
        bgLayer.add(newBg);
        const oldBg = bgLayer.getAt(0);

        if (time > 0) {
            // 新しい背景をフェードイン
            scene.tweens.add({
                targets: newBg,
                alpha: 1,
                duration: time,
                ease: 'Linear'
            });

            // 古い背景があればフェードアウト
            if (oldBg && oldBg !== newBg) {
                scene.tweens.add({
                    targets: oldBg,
                    alpha: 0,
                    duration: time,
                    ease: 'Linear',
                    onComplete: () => oldBg.destroy()
                });
            }
            
            // ★ アニメーション完了後に、Promiseを解決する
            scene.time.delayedCall(time, resolve);

        } else {
            // 即時切り替え
            newBg.setAlpha(1);
            if (oldBg && oldBg !== newBg) {
                oldBg.destroy();
            }
            // 同期処理なので、すぐにPromiseを解決する
            resolve();
        }
    });
}
