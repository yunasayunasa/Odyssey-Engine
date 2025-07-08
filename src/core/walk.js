/**
 * [walk] タグの処理
 * キャラクターを歩いているように移動させる
 * @param {Object} params - {name, x, y, time, height, speed}
 */
export function handleWalk(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[walk] nameは必須です。');
        manager.finishTagExecution();
        //manager.next(); return; 
    }
    
    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[walk] キャラクター[${name}]が見つかりません。`);
    manager.finishTagExecution();
    //manager.next(); return;
 }

    const time = Number(params.time) || 2000; // 歩く時間
    const x = params.x !== undefined ? Number(params.x) : chara.x;
    const y = params.y !== undefined ? Number(params.y) : chara.y;

    // ★★★ 歩行アニメーションのパラメータ ★★★
    const walkHeight = Number(params.height) || 10; // 上下に動く幅
    const walkSpeed = Number(params.speed) || 150; // 1回の上下動にかかる時間(ms)

    // --- 1. 水平/垂直方向の移動Tween ---
    // これは[move]とほぼ同じだが、onCompleteで状態更新だけを行う
    const moveTween = manager.scene.tweens.add({
        targets: chara,
        x: x,
        y: y,
        duration: time,
        ease: 'Linear',
        onComplete: () => {
            // ★ 移動完了後、上下動Tweenを停止し、Y座標を元に戻す
            walkTween.stop();
            chara.y = y; // 最終的なY座標にきっちり合わせる

            // 状態更新と次のシナリオへ
            const charaData = manager.stateManager.getState().layers.characters[name];
            if (charaData) {
                charaData.x = x;
                charaData.y = y;
                manager.stateManager.updateChara(name, charaData);
            }
            manager.finishTagExecution();
           // manager.next();
        }
    });

    // --- 2. 上下動のTween ---
    // 元のY座標を基準に、上下にピョコピコ動かす
    const walkTween = manager.scene.tweens.add({
        targets: chara,
        y: chara.y - walkHeight, // 上に移動
        duration: walkSpeed,
        ease: 'Sine.easeInOut',
        yoyo: true,  // 元の高さに戻る
        repeat: -1   // 無限ループ
    });
}