export function handleFadein(manager, params) {
    const time = Number(params.time) || 1000;
    const color = params.color || '0x000000';

    const r = parseInt(color.slice(2, 4), 16);
    const g = parseInt(color.slice(4, 6), 16);
    const b = parseInt(color.slice(6, 8), 16);

    manager.scene.cameras.main.fadeIn(time, r, g, b);

    manager.scene.time.delayedCall(time, () => {
        manager.finishTagExecution();
    });
}