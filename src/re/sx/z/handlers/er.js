/**
 * [er] タグの処理
 * 指定されたレイヤー上のオブジェクトをすべて消去する
 * @param {Object} params - {layer, time}
 */
export function handleErase(manager, params) {
    const layerName = params.layer;
    if (!layerName) {
        console.warn('[er] layer属性は必須です。(例: character)');
      //  manager.next();
      manager.finishTagExecution();
        return;
    }

    // ★★★ 消去対象のレイヤー（コンテナ）を取得 ★★★
    const targetLayer = manager.layers[layerName];
    if (!targetLayer) {
        console.warn(`[er] 指定されたレイヤー[${layerName}]が見つかりません。`);
      //  manager.next();
      manager.finishTagExecution();
        return;
    }
    
    // アニメーション時間は未実装なので、即時消去
    // 将来的にはtime属性でフェードアウトなども可能
    
    // ★★★ レイヤー内のすべてのオブジェクトを破棄 ★★★
    targetLayer.removeAll(true); // trueを渡すと、オブジェクトもdestroyされる

    // ★★★ StateManagerの状態も更新する ★★★
    if (layerName === 'character') {
        // キャラクターレイヤーを消去した場合
        manager.stateManager.state.layers.characters = {}; // 管理オブジェクトを空にする
        manager.scene.characters = {}; // GameSceneの管理リストも空にする
        console.log('State Updated: キャラクターを全員消去しました。');
    }
    // 他のレイヤー（背景など）を消去した場合のstate更新も、必要ならここに追加
manager.finishTagExecution();
   // manager.next();
}