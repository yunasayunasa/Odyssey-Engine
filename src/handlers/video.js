/**
 * [video] タグの処理
 * 指定したレイヤーで動画を再生する
 * @param {Object} params - {storage, layer, loop, mute, nowait}
 */
export function handleVideo(manager, params) {
    const storage = params.storage;
    if (!storage) { console.warn('[video] storageは必須です。'); manager.finishTagExecution(); return; }

    const layerName = params.layer || 'background'; // デフォルトは背景レイヤー
    const targetLayer = manager.layers[layerName];
    if (!targetLayer) { console.warn(`[video] レイヤー[${layerName}]が見つかりません。`); manager.finishTagExecution(); return; }
    
    const gameWidth = 1280;
    const gameHeight = 720;
    
    // --- 動画オブジェクトの作成と設定 ---
    const video = manager.scene.add.video(gameWidth / 2, gameHeight / 2, storage);
    video.play(params.loop === 'true');
    video.setMute(params.mute === 'true'); // mute属性
    
    // 背景として使う場合、画面いっぱいに表示
    if (layerName === 'background') {
        video.setDisplaySize(gameWidth, gameHeight);
    }
    
    targetLayer.add(video);

    // ★★★ nowait属性の処理 ★★★
    if (params.nowait === 'true') {
        manager.finishTagExecution();
        return; // 即座に次の行へ
    }
    
    // ★★★ 完了待ちの処理 (Promiseを返す) ★★★
    // ループ再生の場合は完了しないので、waitタグと併用する必要がある
    if (params.loop !== 'true') {
        return new Promise(resolve => {
            video.once('complete', () => {
                console.log(`動画[${storage}]の再生が完了しました。`);
                video.destroy();
                resolve();
            });
        });
    }
    // ループ再生でnowaitでない場合、シナリオはここで止まる。[stopvideo]で進める。
}