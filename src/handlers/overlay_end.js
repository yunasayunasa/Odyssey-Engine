/**
 * [overlay_end] タグの処理
 * オーバーレイ表示されているノベルパートシーンを終了させる
 */
export function handleOverlayEnd(manager, params) {
    console.log("[overlay_end] タグ実行。オーバーレイを終了します。");
    
    // SystemSceneに終了を報告する
    manager.scene.scene.get('SystemScene').events.emit('end-overlay', { 
        from: manager.scene.scene.key // 自分自身のシーンキー(NovelOverlayScene)を渡す
    });

    // このタグはフローを終了させるので、next()等は呼ばない
}