/**
 * [freeimage] タグの処理
 * 指定したレイヤーの画像をすべて消去する
 * @param {Object} params - {layer, time}
 */
export function handleFreeImage(manager, params) {
    const layerName = params.layer || 'cg';
    if (!layerName) { console.warn('[freeimage] layerは必須です。'); 
        //manager.next(); 
        //return;
        manager.finishTagExecution();
        return;
    }
    
    const targetLayer = manager.layers[layerName];
    if (!targetLayer) { console.warn(`[freeimage] レイヤー[${layerName}]が見つかりません。`);
    manager.finishTagExecution();
   // manager.next(); return; 
}

    const time = Number(params.time) || 1000;

    // レイヤー内のすべてのオブジェクトをフェードアウトさせてから破棄
    manager.scene.tweens.add({
        targets: targetLayer.list, // コンテナ内の全オブジェクトが対象
        alpha: 0,
        duration: time,
        ease: 'Linear',
        onComplete: () => {
            targetLayer.removeAll(true); // 全員破棄
        }
    });
    
    manager.scene.time.delayedCall(time, () => {
      //  manager.next();
      manager.finishTagExecution();
    });
}