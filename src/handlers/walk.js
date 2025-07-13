// src/handlers/walk.js (最終版)

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
        // ★ 修正箇所: 最終Y座標を保持する
        const finalY = params.y !== undefined ? Number(params.y) : chara.y; 
        
        const walkHeight = Number(params.height) || 10;
        const walkSpeed = Number(params.speed) || 150;

        // 上下動のオフセットをデータ領域に設定
        // ★ 修正箇所: baseYもデータ領域で管理し、onUpdateで常に合成する
        chara.setData('baseX', chara.x); // Xもデータ領域で管理するとより統一的
        chara.setData('baseY', chara.y); 
        chara.setData('walkOffsetY', 0);

        // --- 1. メインの移動Tween（X, Y座標の基準値を操作） ---
        const moveTween = manager.scene.tweens.add({
            targets: chara.data.values, // データ領域をターゲット
            baseX: targetX,             // baseXを動かす
            baseY: finalY,              // ★修正箇所: baseYを最終Y座標へ動かす
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

        // --- 3. 毎フレーム、2つの結果を合成して実際の座標に反映 ---
        const onUpdate = () => {
            // ★修正箇所: baseXとbaseYにオフセットを合成
            chara.x = chara.getData('baseX');
            chara.y = chara.getData('baseY') + chara.getData('walkOffsetY');
        };
        manager.scene.events.on('update', onUpdate);

        // --- 4. 完了処理 ---
        moveTween.on('complete', () => {
            walkTween.stop();
            manager.scene.events.off('update', onUpdate);
            
            // ★ 修正箇所: データもここで削除
            chara.data.remove('baseX');
            chara.data.remove('baseY');
            chara.data.remove('walkOffsetY');

            // 最終座標を正確に設定
            chara.setPosition(targetX, finalY); // ★修正箇所: 最終Y座標を設定
            
            resolve();
        });
    });
}