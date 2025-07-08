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


    const time = Number(params.time) || 500; // ジャンプ全体の時間(ms)
    const halfTime = time / 2; // 片道の時間
    const height = Number(params.height) || 50; // ジャンプの高さ(px)

    // 元のY座標を保存
    const originY = chara.y;

    // Tweenでジャンプアニメーションを実行
    manager.scene.tweens.add({
        targets: chara,
        y: originY - height, // 目標のY座標（上へ）
        duration: halfTime,
        ease: 'Power1', // 飛び出す時
        yoyo: true, // trueにすると、アニメーション後、元の状態(originY)に自動で戻る
        
        // ★★★ yoyoで戻ってくる時のイージングは別に指定できる ★★★
        easeParams: [],
        easeEquations: {
            yoyo: 'Bounce.easeOut' // 戻ってくる時は、少しだけ跳ねるような感じ
        },

        onComplete: () => {
            // Y座標が微妙にずれることがあるので、正確な位置に戻す
            chara.y = originY;
            
            // 次のシナリオへ
            manager.finishTagExecution();
            //manager.next();
        }
    });
}