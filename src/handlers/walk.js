// src/handlers/walk.js (最終版 - x,y省略対応)

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
        // ★★★ 修正箇所: targetX, targetY のデフォルト値を chara.x, chara.y とする ★★★
        const targetX = params.x !== undefined ? Number(params.x) : chara.x;
        const targetY = params.y !== undefined ? Number(params.y) : chara.y; 

        const walkHeight = Number(params.height) || 10;
        const walkSpeed = Number(params.speed) || 150;

        // ★★★ 修正箇所: データプロパティの初期化を現在の位置で正確に行う ★★★
        chara.setData('baseX', chara.x); // walk開始時のX座標を初期基準線とする
        chara.setData('currentYBase', chara.y); // walk開始時のY座標を初期基準線とする
        chara.setData('walkOffsetY', 0); // 初期揺れオフセットは0

        // --- 1. メインの移動Tween（X, Y座標の基準線を操作） ---
        const moveTween = manager.scene.tweens.add({
            targets: chara.data.values,
            baseX: targetX,             // baseXを最終X座標まで動かす
            currentYBase: targetY,      // currentYBaseを最終Y座標まで動かす
            duration: time,
            ease: 'Linear'
        });

        // --- 2. 上下動のTween（オフセットデータのみを操作）---
        const walkTween = manager.scene.tweens.add({
            targets: chara.data.values,
            walkOffsetY: -walkHeight,
            duration: walkSpeed,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // --- 3. 毎フレーム、2つのTweenの結果を合成して実際の座標に反映 ---
        const onUpdate = () => {
            chara.x = chara.getData('baseX');
            chara.y = chara.getData('currentYBase') + chara.getData('walkOffsetY');
        };
        manager.scene.events.on('update', onUpdate);

        // --- 4. 完了処理 ---
        moveTween.on('complete', () => {
            walkTween.stop();
            manager.scene.events.off('update', onUpdate);
            
            // 使用したデータを削除
            chara.data.remove('baseX');
            chara.data.remove('currentYBase');
            chara.data.remove('walkOffsetY');

            // 最終座標を正確に設定 (揺れが止まり、指定位置に停止)
            chara.setPosition(targetX, targetY); 
            
            resolve();
        });
    });
}