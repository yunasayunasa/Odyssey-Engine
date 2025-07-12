/**
 * [bg] タグの処理
 * 背景の画像または動画を表示・切り替えする
 */
export function handleBg(manager, params) {
    return new Promise(async (resolve) => {
        const storage = params.storage;
        if (!storage) { resolve(); return; }

        const time = Number(params.time) || 1000;
        const scene = manager.scene;
        const bgLayer = manager.layers.background;
        
        let newBg;

        if (scene.cache.video.has(storage)) {
            // --- 動画の場合 ---
            newBg = scene.add.video(0, 0, storage).setOrigin(0.5);
            
            // ★★★ ここからが最重要：DOM要素に直接属性を設定 ★★★
            const videoElement = newBg.video;
            if (videoElement) {
                videoElement.setAttribute('playsinline', 'true'); // iOSでのインライン再生
                videoElement.setAttribute('muted', 'true');       // 自動再生のためのミュート
                videoElement.setAttribute('autoplay', 'true');    // 自動再生
                console.log("動画要素に playsinline, muted, autoplay 属性を設定しました。");
            }
            
            newBg.play(true); // ループ再生

        } else if (scene.textures.exists(storage)) {
            // --- 画像の場合 ---
            newBg = scene.add.image(0, 0, storage).setOrigin(0.5);
        } else {
            console.warn(`[bg] アセット[${storage}]が見つかりません。`);
            resolve();
            return;
        }

        // --- 共通の表示処理 ---
        const camera = scene.cameras.main;
        newBg.setPosition(camera.width / 2, camera.height / 2);
        
        // ENVELOP風の拡縮
        const camAspectRatio = camera.width / camera.height;
        const bgAspectRatio = newBg.width / newBg.height;
        if (bgAspectRatio > camAspectRatio) {
            newBg.displayHeight = camera.height;
            newBg.displayWidth = camera.height * bgAspectRatio;
        } else {
            newBg.displayWidth = camera.width;
            newBg.displayHeight = camera.width / bgAspectRatio;
        }
        
        newBg.setAlpha(0);
        bgLayer.add(newBg);
        bgLayer.sendToBack(newBg); // ★念のため、必ず一番後ろに配置

        // --- クロスフェード処理 ---
        const oldBg = bgLayer.getAt(0);
        scene.tweens.add({ targets: newBg, alpha: 1, duration: time, ease: 'Linear' });
        if (oldBg && oldBg !== newBg) {
            scene.tweens.add({
                targets: oldBg,
                alpha: 0,
                duration: time,
                ease: 'Linear',
                onComplete: () => {
                    if (oldBg.stop) oldBg.stop();
                    oldBg.destroy();
                }
            });
        }
        
        manager.stateManager.updateBg(storage);
        scene.time.delayedCall(time, resolve);
    });
}