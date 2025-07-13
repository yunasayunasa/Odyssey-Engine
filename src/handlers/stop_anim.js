// src/handlers/stop_anim.js (最終版)

/**
 * [stop_anim] タグの処理
 * 指定されたターゲットのループアニメーションをすべて停止する
 * @param {ScenarioManager} manager
 * @param {Object} params - { name }
 * @returns {Promise<void>}
 */
export function handleStopAnim(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[stop_anim] name属性は必須です。'); return Promise.resolve(); }
    
    const target = manager.scene.characters[name]; 
    if (!target) { console.warn(`[stop_anim] 停止対象のオブジェクト[${name}]が見つかりません。`); return Promise.resolve(); }

    // キャラクターに紐づくTweenをすべて停止・削除する
    manager.scene.tweens.killTweensOf(target);

    // ★★★ 修正箇所: walkアニメーション関連のデータとリスナーを解除 ★★★
    if (target.getData('isWalking')) {
        manager.scene.events.off('update', target.getData('walkUpdateListener')); // リスナーを解除
        target.data.delete('baseX');
        target.data.delete('currentYBase');
        target.data.delete('walkOffsetY');
        target.data.delete('isWalking');
        target.data.delete('walkUpdateListener'); // リスナーの参照も削除
        
        // 最終的な位置に正確に設定 (揺れが止まり、walk開始時の位置か、walk目標位置で停止)
        // target.x, target.y は killTweensOf の時点で最終位置になっているはず
        // 必要ならここで、target.setPosition(target.x, target.y); としても良いが、重複の可能性あり
    }

    console.log(`オブジェクト[${name}]のアニメーションを停止しました。`);
    return Promise.resolve();
}