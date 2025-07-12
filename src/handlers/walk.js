/**
 * [walk] タグの処理
 * キャラクターを歩いているように上下動させながら移動させる
 * @param {ScenarioManager} manager
 * @param {Object} params - { name, x, y, time, height, speed }
 * @returns {Promise<void>}
 */
export function handleWalk(manager, params) {
    return new Promise(resolve => {
        const name = params.name;
        if (!name) {
            console.warn('[walk] nameは必須です。');
            resolve();
            return;
        }

        const chara = manager.scene.characters[name];
        if (!chara) {
            console.warn(`[walk] キャラクター[${name}]が見つかりません。`);
            resolve();
            return;
        }

        const time = Number(params.time) || 2000;
        const targetX = params.x !== undefined ? Number(params.x) : chara.x;
        const targetY = params.y !== undefined ? Number(params.y) : chara.y;
        const walkHeight = Number(params.height) || 10;
        const walkSpeed = Number(params.speed) || 150;

        // ★★★ StateManagerに関する処理はすべて不要 ★★★

        // --- 1. メインの移動Tween ---
        // このTweenが全体の完了を管理する
        const moveTween = manager.scene.tweens.add({
            targets: chara,
            x: targetX,
            y: targetY,
            duration: time,
            ease: 'Linear',
            onComplete: () => {
                // ★ 移動が完了したら、上下動Tweenを停止し、最終処理を行う
                walkTween.stop();
                // 最終座標を正確に設定
                chara.setPosition(targetX, targetY);
                // 完了を通知
                resolve();
            }
        });

        // --- 2. 上下動のTween (無限ループ) ---
        // y座標の競合を避けるため、このTweenは直接chara.yを操作しない。
        // 代わりに、charaオブジェクトにカスタムプロパティ(walkOffset)を追加し、それを動かす。
        chara.setData('walkOffsetY', 0); // カスタムプロパティを初期化

        const walkTween = manager.scene.tweens.add({
            targets: chara.data.values, // カスタムプロパティをターゲットにする
            walkOffsetY: -walkHeight,   // 上に移動
            duration: walkSpeed,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // --- 3. Phaserの `update` イベントで、2つのTweenの結果を合成する ---
        const onUpdate = () => {
            // moveTweenによって変更されたy座標に、walkTweenによるオフセットを加算する
            chara.y = moveTween.getValue() + chara.data.values.walkOffsetY;

            // moveTweenが完了したら、このupdateリスナーを解除する
            if (!moveTween.isPlaying()) {
                manager.scene.events.off('update', onUpdate);
                // データも削除
                chara.removeData('walkOffsetY');
            }
        };
        
        manager.scene.events.on('update', onUpdate);
    });
}