/**
 * [bg] タグの処理
 * 背景の画像または動画を表示・切り替えする
 * @param {Object} params - {storage, time}
 */
export function handleBg(manager, params) {
    const storage = params.storage;
    if (!storage) { console.warn('[bg] storageは必須です。'); manager.finishTagExecution(); return; }

    const time = Number(params.time) || 1000;
    const scene = manager.scene;
    const bgLayer = manager.layers.background;
    const gameWidth = 1280;
    const gameHeight = 720;

    // --- 1. 新しい背景オブジェクトを作成 ---
    let newBg;
    
    // ★★★ キーが動画キャッシュに存在するかどうかで、画像か動画かを判別 ★★★
    if (scene.cache.video.has(storage)) {
        // --- 動画の場合 ---
        console.log(`背景として動画[${storage}]を再生します。`);
        newBg = scene.add.video(gameWidth / 2, gameHeight / 2, storage);
        newBg.play(true); // trueでループ再生
        // 音量はBGM設定を流用するが、ミュートにしておくのが一般的
        newBg.setVolume(manager.configManager.getValue('bgmVolume'));
        // newBg.setMute(true);

    } else if (scene.textures.exists(storage)) {
        // --- 画像の場合 ---
        newBg = scene.add.image(gameWidth / 2, gameHeight / 2, storage);
    } else {
        console.warn(`[bg] アセット[${storage}]が見つかりません。`);
        manager.finishTagExecution();
        return;
    }

    // --- 2. 共通の表示処理 ---
    newBg.setDisplaySize(gameWidth, gameHeight); // 画面サイズに合わせる
    newBg.setAlpha(0); // 最初は透明
    bgLayer.add(newBg);

    // --- 3. クロスフェード処理 ---
    const oldBg = bgLayer.getAt(0);

    // 新しい背景をフェードイン
    scene.tweens.add({
        targets: newBg,
        alpha: 1,
        duration: time,
        ease: 'Linear'
    });

    // 古い背景があればフェードアウトして破棄
    if (oldBg && oldBg !== newBg) {
        scene.tweens.add({
            targets: oldBg,
            alpha: 0,
            duration: time,
            ease: 'Linear',
            onComplete: () => {
                // 古い背景が動画だった場合、再生も停止する
                if (oldBg.stop) {
                    oldBg.stop();
                }
                oldBg.destroy();
            }
        });
    }

    // 4. 状態更新と完了通知
    manager.stateManager.updateBg(storage);
    scene.time.delayedCall(time, () => {
        manager.finishTagExecution();
    });
}