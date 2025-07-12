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
        if (!name) { console.warn('[walk] nameは必須です。'); resolve(); return; }

        const chara = manager.scene.characters[name];
        if (!chara) { console.warn(`[walk] キャラクター[${name}]が見つかりません。`); resolve(); return; }

        const time = Number(params.time) || 2000;
        const targetX = params.x !== undefined ? Number(params.x) : chara.x;
        const targetY = params.y !== undefined ? Number(params.y) : chara.y;
        const walkHeight = Number(params.height) || 10;
        const walkSpeed = Number(params.speed) || 150;

        // ★★★ Tweenが操作するためのカスタムデータを設定 ★★★
        chara.setData('baseY', chara.y);       // 移動の基準となるY座標
        chara.setData('walkOffsetY', 0); // 上下動のオフセット

        // --- 1. メインの移動Tween（基準Y座標を操作） ---
        const moveTween = manager.scene.tweens.add({
            targets: chara.data.values, // データ領域をターゲットにする
            baseY: targetY,             // chara.yではなく、baseYを動かす
            duration: time,
            ease: 'Linear'
        });

        // --- 2. 上下動のTween（オフセットY座標を操作）---
        const walkTween = manager.scene.tweens.add({
            targets: chara.data.values, // こちらもデータ領域をターゲット
            walkOffsetY: -walkHeight,   // walkOffsetYを動かす
            duration: walkSpeed,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // --- 3. 毎フレーム、2つの結果を合成して実際の座標に反映 ---
        const onUpdate = () => {
            // 移動後の基準Y座標 + 上下動のオフセット = 最終的なY座標
            chara.y = chara.getData('baseY') + chara.getData('walkOffsetY');
        };
        manager.scene.events.on('update', onUpdate);

        // --- 4. 完了処理 ---
        // メインの移動Tweenが終わったら、すべてをクリーンアップする
        moveTween.on('complete', () => {
            walkTween.stop(); // 上下動を停止
            manager.scene.events.off('update', onUpdate); // updateリスナーを解除

            // ★★★ 正しいデータ削除方法 ★★★
            chara.data.remove('baseY');
            chara.data.remove('walkOffsetY');

            // 最終座標を正確に設定
            chara.setPosition(targetX, targetY);
            
            // 完了を通知
            resolve();
        });
    });
}