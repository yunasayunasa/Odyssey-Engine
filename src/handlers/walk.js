// src/handlers/walk.js (最終版 - ループ化と[stop_anim]連携)

/**
 * [walk] タグの処理
 * キャラクターを歩いているように上下動させながら移動させる。
 * アニメーションはデフォルトでループし、[stop_anim]で停止される。
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
        const targetY = params.y !== undefined ? Number(params.y) : chara.y; // 最終的なY目標座標

        const walkHeight = Number(params.height) || 10;
        const walkSpeed = Number(params.speed) || 150;

        // データプロパティを初期化
        chara.setData('baseX', chara.x); 
        chara.setData('currentYBase', chara.y); 
        chara.setData('walkOffsetY', 0);

        // --- 1. メインの移動Tween（X, Y座標の基準線を操作） ---
        const moveTween = manager.scene.tweens.add({
            targets: chara.data.values,
            baseX: targetX,             
            currentYBase: targetY,      
            duration: time,
            ease: 'Linear',
            // ★★★ 修正箇所: ループアニメーションにする ★★★
            loop: -1 // 無限ループ
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
            chara.x = chara.getData('baseX');
            chara.y = chara.getData('currentYBase') + chara.getData('walkOffsetY');
        };
        manager.scene.events.on('update', onUpdate);

        // ★★★ 修正箇所: このハンドラ自身は即座にPromiseを解決する ★★★
        // アニメーションは裏でループし続ける
        resolve();

        // ★★★ 修正箇所: アニメーションの停止とクリーンアップは [stop_anim] に任せる ★★★
        // moveTween.on('complete', ...) のロジックは削除
        // moveTweenはloop: -1 なのでcompleteイベントは発火しない
    });
}