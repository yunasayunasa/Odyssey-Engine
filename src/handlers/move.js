/**
 * [move] タグの処理
 * 指定されたキャラクターをスムーズに移動させる
 * @param {ScenarioManager} manager
 * @param {Object} params - { name, x, y, alpha, time }
 */
export function handleMove(manager, params) {
    const name = params.name;
    if (!name) {
        console.warn('[move] name属性は必須です。');
        manager.finishTagExecution();
        return;
    }
    
    const chara = manager.scene.characters[name];
    if (!chara) {
        console.warn(`[move] 移動対象のキャラクター[${name}]が見つかりません。`);
        manager.finishTagExecution();
        return;
    }

    // ★★★ 新しい設計では、ハンドラは純粋に「見た目」を操作することに集中する ★★★
    const targets = chara;
    const duration = Number(params.time) || 1000;
    const ease = 'Cubic.easeInOut';

    // Tweenで変更するプロパティを動的に構築する
    const tweenProps = {
        targets: targets,
        duration: duration,
        ease: ease,
        onComplete: () => {
            // ★★★ アニメーションが完了したら、次の行に進むことだけを通知する ★★★
            // stateManagerへの通知は一切不要
            manager.finishTagExecution();
        }
    };

    // 指定されたプロパティだけをtweenPropsに追加する
    if (params.x !== undefined) tweenProps.x = Number(params.x);
    if (params.y !== undefined) tweenProps.y = Number(params.y);
    if (params.alpha !== undefined) tweenProps.alpha = Number(params.alpha);
    // 他にもscaleなど、動かしたいプロパティがあればここに追加できる

    // Tweenを実行
    manager.scene.tweens.add(tweenProps);
}