export function handleCharaJump(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[chara_jump] nameは必須です。'); manager.finishTagExecution(); return; }
    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[chara_jump] キャラクター[${name}]が見つかりません。`); manager.finishTagExecution(); return; }

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
            x: { value: targetX, duration: time, ease: 'Linear' },
            y: { value: originY - height, duration: time / 2, yoyo: true, ease: 'Sine.Out' }
        },
        onComplete: () => {
            // ★ onCompleteは、ループしない場合 と nowaitでない場合 の両方を満たす時だけ呼ばれる
            if (!loop && !noWait) {
                chara.setPosition(targetX, targetY);
                // (ここに状態更新ロジックを入れると、より正確になる)
                manager.finishTagExecution();
            }
        }
    };
    
    if (loop) {
        tweenConfig.repeat = -1;
    }

    // --- Tween実行 ---
    manager.scene.tweens.add(tweenConfig);

    // ★★★ nowaitの場合だけ、即座に完了を通知する ★★★
    if (noWait) {
        manager.finishTagExecution();
    }
    // ループの場合は、ここでは何も呼ばない！[stop_anim]を待つ。
}