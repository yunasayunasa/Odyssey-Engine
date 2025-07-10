/**
 * [stop_anim] タグの処理
 * 指定されたキャラクターのループアニメーションを停止する
 */
export function handleStopAnim(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[stop_anim] nameは必須です。'); manager.finishTagExecution(); return; }
    
    const chara = manager.scene.characters[name];
    if (!chara) { /* エラー処理 */ manager.finishTagExecution(); return; }

    // ★ キャラクターに紐付いているTweenをすべて停止する
    // PhaserのTweenManagerは、特定のターゲットに対するTweenを一括で操作する機能を持つ
    manager.scene.tweens.killTweensOf(chara);

    // ★ StateManagerに保存されている座標に、キャラクターの位置を補正する
    const charaData = manager.stateManager.getState().layers.characters[name];
    if (charaData) {
        chara.setPosition(charaData.x, charaData.y);
    }

    console.log(`キャラクター[${name}]のアニメーションを停止しました。`);
    manager.finishTagExecution();
}