// src/handlers/walk.js (最終版 - onUpdateとデータ管理の厳密化)

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
        const targetY = params.y !== undefined ? Number(params.y) : chara.y;

        const walkHeight = Number(params.height) || 10;
        const walkSpeed = Number(params.speed) || 150;

        // ★★★ 修正箇所: データプロパティの初期化と onUpdate の登録/解除を厳密に管理 ★★★
        // 既にwalkアニメーションが実行中の場合、前のデータをクリーンアップ
        if (chara.getData('isWalking')) {
            // 前のアニメーションのリスナーとデータを強制的に解除
            manager.scene.events.off('update', chara.getData('walkUpdateListener'));
            chara.data.delete('baseX');
            chara.data.delete('currentYBase');
            chara.data.delete('walkOffsetY');
            chara.data.delete('isWalking');
            chara.data.delete('walkUpdateListener');
        }

        chara.setData('baseX', chara.x); 
        chara.setData('currentYBase', chara.y); 
        chara.setData('walkOffsetY', 0);
        chara.setData('isWalking', true); // このキャラがwalkアニメーション中であることを示すフラグ

        const moveTween = manager.scene.tweens.add({
            targets: chara.data.values,
            baseX: targetX,             
            currentYBase: targetY,      
            duration: time,
            ease: 'Linear',
            loop: -1 
        });

        const walkTween = manager.scene.tweens.add({
            targets: chara.data.values,
            walkOffsetY: -walkHeight,
            duration: walkSpeed,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // ★★★ 修正箇所: onUpdateリスナーを外部から参照できるようにする ★★★
        const walkUpdateListener = () => {
            chara.x = chara.getData('baseX');
            chara.y = chara.getData('currentYBase') + chara.getData('walkOffsetY');
        };
        manager.scene.events.on('update', walkUpdateListener);
        chara.setData('walkUpdateListener', walkUpdateListener); // リスナー関数自体をデータに保存

        resolve();
    });
}