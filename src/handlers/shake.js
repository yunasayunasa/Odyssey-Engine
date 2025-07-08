/**
 * [shake] タグの処理
 * 指定されたキャラクターを揺らす
 * @param {Object} params - {name, time, power}
 */
export function handleShake(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[shake] nameは必須です。');
        manager.finishTagExecution();
       // manager.next(); 
        return; }
    
    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[shake] キャラクター[${name}]が見つかりません。`); 
    manager.finishTagExecution();
    //manager.next(); 
    return; }

    const time = Number(params.time) || 500; // 揺れる総時間
    const power = Number(params.power) || 10; // 揺れの強さ（px）
    const duration = 50; // 1回の揺れにかかる時間(ms)
    
    // 元の位置を保存しておく
    const originX = chara.x;
    const originY = chara.y; // Y座標も揺らす場合のために保持

    let elapsed = 0; // 経過時間

    // ★★★ 揺れアニメーションを定義する再帰関数 ★★★
    const shakeAnim = () => {
        // 経過時間が総時間を超えたら、終了処理
        if (elapsed >= time) {
            chara.setPosition(originX, originY); // 最終的に元の位置に戻す
          manager.finishTagExecution();
            //manager.next();
            return;
        }

        // 次の揺れの目標座標をランダムに決める
        const targetX = originX + (Math.random() * power * 2) - power;
        const targetY = originY + (Math.random() * power * 2) - power;

        elapsed += duration;

        // 1回分の揺れTweenを実行
        manager.scene.tweens.add({
            targets: chara,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Power1',
            onComplete: () => {
                // 1回の揺れが終わったら、自分自身（次の揺れ）を呼び出す
                shakeAnim(); 
            }
        });
    };

    // ★★★ 最初の揺れを開始 ★★★
    shakeAnim();
}