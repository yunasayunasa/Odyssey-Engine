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

    // ★★★ Tweenを順番に実行する chain() を使用 ★★★

    // Tween 1: 半分の時間かけて、画像を横に潰す
    const tween1 = {
        targets: chara,
        scaleX: 0,
        duration: halfTime,
        ease: 'Linear',
    };

    // Tween 2: 潰れた瞬間に、画像を左右反転させる
    const tween2 = {
        targets: chara,
        scaleX: 1, // 元の大きさに戻す
        duration: halfTime,
        ease: 'Linear',
        // ★★★ このTweenが始まる瞬間に呼ばれるコールバック ★★★
        onStart: () => {
            chara.toggleFlipX(); // 画像を反転
        }
    };
    
    // ★★★ 2つのTweenを連結して実行 ★★★
    manager.scene.tweens.chain({
        tweens: [tween1, tween2],
        
        // すべてのTweenが完了した後に呼ばれる
        onComplete: () => {
            manager.finishTagExecution();
           // manager.next();
        }
    });
}