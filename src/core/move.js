/**
 * [move] タグの処理
 * 指定されたキャラクターをスムーズに移動させる
 * @param {ScenarioManager} manager
 * @param {Object} params - {name, x, y, time}
 */
export function handleMove(manager, params) {
    const name = params.name;
    if (!name) {
        console.warn('[move] name属性は必須です。');
      //  manager.next();
      manager.finishTagExecution();
        return;
    }
    
    // 移動対象のキャラクターオブジェクトを取得
    const chara = manager.scene.characters[name];
    if (!chara) {
        console.warn(`[move] 移動対象のキャラクター[${name}]が見つかりません。`);
      //  manager.next();
      manager.finishTagExecution();
        return;
    }

    // パラメータを取得 (timeのデフォルトは1秒)
    const time = Number(params.time) || 1000;
    // x, yは現在の位置をデフォルト値とする
    const x = params.x !== undefined ? Number(params.x) : chara.x;
    const y = params.y !== undefined ? Number(params.y) : chara.y;

    // Tweenで移動アニメーションを実行
    manager.scene.tweens.add({
        targets: chara,
        x: x, // 目標のX座標
        y: y, // 目標のY座標
        duration: time,
        ease: 'Cubic.easeInOut', // 少し滑らかなイージング
        onComplete: () => {
            // ★★★ アニメーション完了後に状態を更新 ★★★
            const charaData = manager.stateManager.getState().layers.characters[name];
            if (charaData) {
                charaData.x = x;
                charaData.y = y;
                manager.stateManager.updateChara(name, charaData);
            }
            
            // 次のシナリオへ
            manager.finishTagExecution();
           // manager.next();
        }
    });
}