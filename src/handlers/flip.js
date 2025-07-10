/**
 * [flip] タグの処理
 * 指定されたキャラクターを表情差分付きで反転させる
 */
export function handleFlip(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[flip] nameは必須です。'); manager.finishTagExecution(); return; }

    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[flip] キャラクター[${name}]が見つかりません。`); manager.finishTagExecution(); return; }

    const time = Number(params.time) || 500;
    const halfTime = time / 2;
    const face = params.face;

    // ★★★ タイムラインやチェインを使わず、Tweenを2つ作るだけ ★★★

    // 1. まず、半分の時間かけて画像を横に潰すアニメーション
    manager.scene.tweens.add({
        targets: chara,
        scaleX: 0,
        duration: halfTime,
        ease: 'Linear',
        
        // ★★★ このアニメーションが完了した瞬間に、すべての差し替え処理を行う ★★★
        onComplete: () => {
            // 2. 画像の向きを反転させる
            chara.toggleFlipX();

            // 3. face属性があれば、テクスチャを差し替える
            if (face) {
                const def = manager.characterDefs[name];
                const newStorage = def ? def.face[face] : null;
                if (newStorage) {
                    chara.setTexture(newStorage);
                    // StateManagerの状態も更新
                    const charaData = manager.stateManager.getState().layers.characters[name];
                    if (charaData) {
                        charaData.face = face;
                        charaData.storage = newStorage;
                        charaData.flipX = chara.flipX; // 反転状態も保存
                        manager.stateManager.updateChara(name, charaData);
                    }
                }
            } else {
                // 表情変更がない場合も、反転状態だけは保存する
                const charaData = manager.stateManager.getState().layers.characters[name];
                if (charaData) {
                    charaData.flipX = chara.flipX;
                    manager.stateManager.updateChara(name, charaData);
                }
            }

            // 4. 潰れた状態から、元の幅に戻すアニメーションを開始する
            manager.scene.tweens.add({
                targets: chara,
                scaleX: 1,
                duration: halfTime,
                ease: 'Linear',
                onComplete: () => {
                    // ★★★ すべての処理が完了したので、シナリオを次に進める ★★★
                    manager.finishTagExecution();
                }
            });
        }
    });
}