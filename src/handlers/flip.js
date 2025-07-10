/**
 * [flip] タグの処理
 * 指定されたキャラクターをペーパーマリオ風に反転させる
 * @param {Object} params - {name, time}
 */
export function handleFlip(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[flip] nameは必須です。'); 
        manager.finishTagExecution();
       // manager.next();
         return; }

    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[flip] キャラクター[${name}]が見つかりません。`); 
    manager.finishTagExecution();
  //  manager.next(); 
    return; }

    const time = Number(params.time) || 500;
    const halfTime = time / 2;
    const face = params.face; // 新しい表情名

    manager.scene.tweens.chain({
        tweens: [
            { targets: chara, scaleX: 0, duration: halfTime, ease: 'Linear' },
            {
                targets: chara,
                duration: 0,
                onStart: () => {
                    chara.toggleFlipX(); // まず反転
                    // ★ face属性があれば、テクスチャを差し替え ★
                    if (face) {
                        const def = manager.characterDefs[name];
                        const newStorage = def ? def.face[face] : null;
                        if (newStorage) {
                            chara.setTexture(newStorage);
                            // StateManagerの状態も更新
                            const charaData = manager.stateManager.getState().layers.characters[name];
                            if(charaData) {
                                charaData.face = face;
                                charaData.storage = newStorage;
                                manager.stateManager.updateChara(name, charaData);
                            }
                        }
                    }
                }
            },
            { targets: chara, scaleX: 1, duration: halfTime, ease: 'Linear' }
        ],
        onComplete: () => {
            manager.finishTagExecution();
        }
    });
}