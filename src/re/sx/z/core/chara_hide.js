/**
 * [chara_hide] タグの処理
 * @param {ScenarioManager} manager - シナリオマネージャーのインスタンス
 * @param {Object} params - {name, time}
 */
export function handleCharaHide(manager, params) {
    const name = params.name;
    if (!name) {
        console.warn('[chara_hide] name属性は必須です。');
       // manager.next();
       manager.finishTagExecution();
        return;
    }

    const chara = manager.scene.characters[name];
    if (!chara) {
        console.warn(`[chara_hide] 非表示にしようとしたキャラクター[${name}]が見つかりません。`);
        manager.finishTagExecution();
        
        //manager.next();
        return;
    }
const onComplete = () => {
        chara.destroy();
        delete manager.scene.characters[name];
        
        // ★★★ 状態を更新 (nullを渡して削除) ★★★
        manager.stateManager.updateChara(name, null);
        manager.finishTagExecution();
       // manager.next();
    };


    const time = Number(params.time) || 0;

    if (time > 0) {
        manager.scene.tweens.add({
            targets: chara,
            alpha: 0,
            duration: time,
            ease: 'Linear',
            onComplete: () => {
                chara.destroy();
                delete manager.scene.characters[name];
                manager.finishTagExecution();
              //  manager.next();
                onComplete;
            }
        });
    } else {
        chara.destroy();
        delete manager.scene.characters[name];
        manager.finishTagExecution();
      //  manager.next();
    }
}