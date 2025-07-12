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

        const time = Number(params.time) || 2000; // 歩く総時間
        const targetX = params.x !== undefined ? Number(params.x) : chara.x;
        const targetY = params.y !== undefined ? Number(params.y) : chara.y; // 最終目標Y座標
        const walkHeight = Number(params.height) || 10; // 上下に動く幅
        const walkSpeed = Number(params.speed) || 150; // 1回の上下動にかかる時間(ms)

        // ★★★ StateManagerに関する処理はすべて不要 ★★★

        // --- 1. メインの移動Tween ---
        // このTweenが全体の完了を管理する
        const moveTween = manager.scene.tweens.add({
            targets: chara,
            x: targetX,
            y: targetY, // キャラクターの最終的なY座標もこのTweenが操作する
            duration: time,
            ease: 'Linear',
            onComplete: () => {
                // ★★★ 移動が完了したら、上下動Tweenとupdateリスナーを停止・解除 ★★★
                walkTween.stop();
                manager.scene.events.off('update', onUpdate);
                
                // 最終座標を正確に設定（Tweenが自動でやってくれるはずだが念のため）
                chara.setPosition(targetX, targetY);

                // 完了を通知
                resolve();
            }
        });

        // --- 2. 上下動のTween (無限ループ) ---
        // Y座標の競合を避けるため、キャラクターの「実際のY座標」ではなく、
        // 「Y座標に加算するオフセット値」を操作するためのカスタムプロパティを使う
        chara.setData('walkOffsetY', 0); // キャラクターのデータストアにオフセット値を初期化

        const walkTween = manager.scene.tweens.add({
            targets: chara.data.values, // キャラクターのデータストアをターゲットにする
            walkOffsetY: {
                from: 0,
                to: -walkHeight, // 上に移動
                yoyo: true,      // 元の高さに戻る
                repeat: -1,      // 無限ループ
                ease: 'Sine.easeInOut'
            },
            duration: walkSpeed
        });

        // --- 3. Phaserの `update` イベントで、2つのTweenの結果を合成する ---
        // 毎フレーム、キャラクターのY座標を再計算する
        const onUpdate = () => {
            // ★★★ 修正: moveTweenが操作するy座標に、walkOffsetYを合成 ★★★
            // moveTween.getValue('y') で、moveTweenが計算した現在のy座標を正確に取得
            chara.y = moveTween.getValue('y') + chara.data.values.walkOffsetY;
        };
        
        // シーンのupdateイベントにリスナーを登録
        manager.scene.events.on('update', onUpdate);
    });
}