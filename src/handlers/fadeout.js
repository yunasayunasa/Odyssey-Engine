export function handleFadeout(manager, params) {
    const time = Number(params.time) || 1000;
    const color = params.color || '0x000000'; // デフォルトは黒

    const r = parseInt(color.slice(2, 4), 16);
    const g = parseInt(color.slice(4, 6), 16);
    const b = parseInt(color.slice(6, 8), 16);

    manager.scene.cameras.main.fadeOut(time, r, g, b);
    
    // アニメーション完了を待つ
    manager.scene.time.delayedCall(time, () => {
        manager.finishTagExecution();
    });
}