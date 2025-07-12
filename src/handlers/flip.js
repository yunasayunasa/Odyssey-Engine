/**
 * [flip] タグの処理
 * 指定されたキャラクターを表情差分付きで反転させる
 * (Timelineの代わりにchainを使用)
 * @param {ScenarioManager} manager
 * @param {Object} params - { name, face, time }
 * @returns {Promise<void>}
 */
export function handleFlip(manager, params) {
    return new Promise(resolve => {
        const name = params.name;
        if (!name) {
            console.warn('[flip] nameは必須です。');
            resolve();
            return;
        }

        const chara = manager.scene.characters[name];
        if (!chara) {
            console.warn(`[flip] キャラクター[${name}]が見つかりません。`);
            resolve();
            return;
        }

        const time = Number(params.time) || 500;
        const halfTime = time / 2;
        const originalScaleX = chara.scaleX; // 元のスケールを保持

        // ★★★ Tween.chain() で連続したアニメーションを作成 ★★★
        manager.scene.tweens.chain({
            // すべてのアニメーションが完了したときに呼ばれる
            onComplete: () => {
                // 念のため最終的なスケールを補正
                chara.setScale(originalScaleX, chara.scaleY);
                console.log(`[Handler:flip] chain完了。resolve()を呼び出します。`);
                resolve();
            },
            
            // 実行するTweenを配列で指定
            tweens: [
                // 1. 半分の時間かけて画像を横に潰す
                {
                    targets: chara,
                    scaleX: 0,
                    duration: halfTime,
                    ease: 'Linear'
                },
                
                // 2. 潰れた瞬間にテクスチャと向きを差し替える
                // onStartコールバックを持つダミートゥイーンを挟む
                {
                    targets: chara,
                    // 何も変化させないのでdurationは0で良い
                    duration: 0,
                    onStart: () => {
                        console.log(`[Handler:flip] 中間処理: 反転とテクスチャ変更`);
                        // 向きを反転
                        chara.toggleFlipX();

                        // face属性があれば、テクスチャを差し替える
                        const face = params.face;
                        if (face) {
                            const def = manager.characterDefs[name];
                            const newStorage = def ? def.face[face] : null;
                            if (newStorage) {
                                chara.setTexture(newStorage);
                            } else {
                                console.warn(`[flip] キャラクター[${name}]の表情[${face}]が見つかりません。`);
                            }
                        }
                    }
                },

                // 3. 残り半分の時間で元の幅に戻す
                {
                    targets: chara,
                    scaleX: originalScaleX, // 元のスケールに戻す
                    duration: halfTime,
                    ease: 'Linear'
                }
            ]
        });
    });
}