/**
 * [flip] タグの処理
 * 指定されたキャラクターを表情差分付きで反転させる
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

        // ★★★ Phaserのタイムライン機能で連続したアニメーションを作成 ★★★
        const timeline = manager.scene.tweens.createTimeline();

        // 1. 半分の時間かけて画像を横に潰す
        timeline.add({
            targets: chara,
            scaleX: 0,
            duration: halfTime,
            ease: 'Linear'
        });

        // 2. 潰れた瞬間にテクスチャと向きを差し替える
        timeline.add({
            targets: chara,
            duration: 0, // 時間は0
            onStart: () => { // アニメーション開始の瞬間に実行
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
                // ★★★ StateManagerへの通知は一切不要 ★★★
            }
        });

        // 3. 残り半分の時間で元の幅に戻す
        timeline.add({
            targets: chara,
            scaleX: chara.scaleX, // 元のスケールに戻す（左右反転してもスケールは同じ）
            duration: halfTime,
            ease: 'Linear'
        });

        // ★★★ タイムライン全体の完了を待つ ★★★
        timeline.on('complete', () => {
            // スケールを正確な値に戻す
            chara.setScale(chara.scaleX, chara.scaleY);
            resolve(); // Promiseを解決して完了を通知
        });

        // タイムラインを実行
        timeline.play();
    });
}