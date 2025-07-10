/**
 * [chara_jump] タグの処理 // ← コメントも修正
 * 指定されたキャラクターをその場でジャンプさせる
 * @param {Object} params - {name, time, height}
 */
// ★★★ 関数名も変更 ★★★
export function handleCharaJump(manager, params) {
    const name = params.name;
    // ★★★ エラーメッセージも修正 ★★★
    if (!name) { console.warn('[chara_jump] nameは必須です。'); 
       
       
        //manager.next(); 
        manager.finishTagExecution();
        return;
    manager.finishTagExecution();
    }

    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[chara_jump] キャラクター[${name}]が見つかりません。`);
    manager.finishTagExecution();
   // manager.next(); 
    return; }


     // --- パラメータ取得 ---
    const time = Number(params.time) || 500;
    const height = Number(params.height) || 50;
    const x_add = Number(params.x_add) || 0;
    const y_add = Number(params.y_add) || 0;
    const loop = params.loop === 'true';
    const noWait = params.nowait === 'true';

    // --- 座標計算 ---
    const originX = chara.x;
    const originY = chara.y;
    const targetX = originX + x_add;
    const targetY = originY + y_add;

    // --- Tween定義 ---
    const tweenConfig = {
        targets: chara,
        props: {
            x: { value: targetX, duration: time },
            y: { value: originY - height, duration: time / 2, yoyo: true, ease: 'Sine.Out' }
        },
        onComplete: () => {
            // ループしない場合のみ、完了処理を行う
            if (!loop) {
                chara.setPosition(targetX, targetY); // 最終位置に補正
                // (状態更新のロジックもここに追加)
                manager.finishTagExecution();
            }
        }
    };
    
    if (loop) {
        tweenConfig.repeat = -1; // 無限ループ
    }

    // Tween実行
    manager.scene.tweens.add(tweenConfig);

    // ★ nowaitがtrueなら、アニメーションを待たずに即完了通知
    if (noWait || loop) {
        manager.finishTagExecution();
    }
}