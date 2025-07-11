export function handleOverlayEnd(manager, params) {
    console.log("[overlay_end] タグ実行。オーバーレイ終了を報告します。");
    
    // ★★★ 司令塔に、オーバーレイの終了を報告 ★★★
    manager.scene.scene.get('SystemScene').events.emit('end-overlay', { 
        from: manager.scene.scene.key // 'NovelOverlayScene'
    });
}