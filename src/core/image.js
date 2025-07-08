/**
 * [image] タグの処理
 * 指定したレイヤーに画像を表示する
 * @param {Object} params - {storage, layer, x, y, time}
 */
export function handleImage(manager, params) {
    const storage = params.storage;
    const layerName = params.layer || 'cg'; // デフォルトは'cg'レイヤー
    if (!storage) { console.warn('[image] storageは必須です。'); 
       // manager.next();
        manager.finishTagExecution();
        return; }

    const targetLayer = manager.layers[layerName];
    if (!targetLayer) { console.warn(`[image] レイヤー[${layerName}]が見つかりません。`); 
    manager.finishTagExecution();
   // manager.next();
     return; }

    const time = Number(params.time) || 1000;
    const x = Number(params.x) || manager.scene.scale.width / 2;
    const y = Number(params.y) || manager.scene.scale.height / 2;

    const image = manager.scene.add.image(x, y, storage);
    image.setAlpha(0);
    targetLayer.add(image);

    // フェードイン
    manager.scene.tweens.add({
        targets: image,
        alpha: 1,
        duration: time,
        ease: 'Linear'
    });

    // アニメーションを待たずに次に進むこともできるが、待つ方が一般的
    manager.scene.time.delayedCall(time, () => {
      //  manager.next();
      manager.finishTagExecution();
    });
}