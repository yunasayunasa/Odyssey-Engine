export function handleOverlayEnd(manager, params) {
    console.log("[overlay_end] タグ実行。オーバーレイを終了します。", params);
    
    // SystemSceneに、終了報告と「次の行き先」情報を渡す
    manager.scene.scene.get('SystemScene').events.emit('end-overlay', { 
        from: manager.scene.scene.key,
        targetStorage: params.storage, // 次のシナリオファイル or シーンキー
        targetLabel: params.target    // 次のラベル
    });

    // このタグはフローを終了させるので、next()等は呼ばない
}
