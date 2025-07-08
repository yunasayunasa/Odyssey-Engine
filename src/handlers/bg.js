/**
 * [bg] タグの処理
 * 背景を表示・切り替えする
 * @param {ScenarioManager} manager
 * @param {Object} params - {storage, time}
 */
export function handleBg(manager, params) {
    const storage = params.storage;
    if (!storage) {
        console.warn('[bg] storage属性は必須です。');
       // manager.next();
       manager.finishTagExecution();
        return;
    }

      const time = Number(params.time) || 0;
    const scene = manager.scene;
    const bgLayer = manager.layers.background;
    const gameWidth = scene.scale.width;
    const gameHeight = scene.scale.height;

       // 新しい背景画像を作成
    const newBg = scene.add.image(gameWidth / 2, gameHeight / 2, storage);

    // ★★★ ここが重要 ★★★
    // 画像の表示サイズを、ゲーム画面のサイズに合わせる
    newBg.setDisplaySize(gameWidth, gameHeight);

    newBg.setAlpha(0);
    bgLayer.add(newBg);

    // 現在表示されている背景（古い背景）を探す
    const oldBg = bgLayer.getAt(0); // コンテナの0番目にあるのが現在の背景

    if (time > 0) {
        // 新しい背景をフェードインさせる
        scene.tweens.add({
            targets: newBg,
            alpha: 1,
            duration: time,
            ease: 'Linear'
        });

        // 古い背景があれば、同時にフェードアウトさせる（クロスフェード）
        if (oldBg && oldBg !== newBg) {
            scene.tweens.add({
                targets: oldBg,
                alpha: 0,
                duration: time,
                ease: 'Linear',
                onComplete: () => {
                    oldBg.destroy(); // フェードアウト完了後に破棄
                }
            });
        }
        
        // アニメーションの完了を待ってから次に進む
        scene.time.delayedCall(time, () => {
    manager.stateManager.updateBg(storage);
           // manager.next();
           manager.finishTagExecution();
        });
    

    } else {
        // 即時切り替え
        newBg.setAlpha(1);
        if (oldBg && oldBg !== newBg) {
            oldBg.destroy();
        }
        manager.stateManager.updateBg(storage);
        manager.finishTagExecution();
        //manager.next();
    }
}
