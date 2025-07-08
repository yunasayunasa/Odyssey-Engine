/**
 * [chara_mod] タグの処理
 * 表示中のキャラクターの表情などを変更する
 * @param {Object} params - {name, face, time}
 */
export function handleCharaMod(manager, params) {
    const name = params.name;
    const face = params.face;
    if (!name || !face) {
        console.warn('[chara_mod] name属性とface属性は必須です。');
      //  manager.next();
      manager.finishTagExecution();
        return;
    }

    // ★ 表示中のキャラクターオブジェクトと、その定義を取得
    const chara = manager.scene.characters[name];
    const def = manager.characterDefs[name];
    if (!chara || !def) {
        console.warn(`[chara_mod] 変更対象のキャラクター[${name}]が見つかりません。`);
      //  manager.next();
      manager.finishTagExecution();
        return;
    }

    // ★ 新しい表情に対応する画像キーを取得
    const storage = def.face[face];
    if (!storage) {
        console.warn(`キャラクター[${name}]の表情[${face}]が見つかりません。`);
       // manager.next();
       manager.finishTagExecution();
        return;
    }

    const time = Number(params.time) || 200; // デフォルト200msで切り替え

 // ★★★ 状態更新用の新しいキャラクター情報を準備 ★★★
    // 既存の状態をコピーし、表情とstorageだけを上書き
    const currentState = manager.stateManager.getState().layers.characters[name];
    if (!currentState) {
        console.warn(`[chara_mod] 状態管理にキャラクター[${name}]が見つかりません。`);
      //  manager.next();
      manager.finishTagExecution();
        return;
    }
    const newCharaData = {
        ...currentState, // 既存の状態をコピー
        face: face,
        storage: storage
    };

    // ★★★ 画像を切り替える (setTexture) ★★★
    // 一瞬で切り替えるのではなく、クロスフェードさせるとリッチになる
    
    // 1. 新しい画像を、古い画像と全く同じ位置・サイズ・透明度で、上に重ねて作成
    const newChara = manager.scene.add.image(chara.x, chara.y, storage);
    newChara.setAlpha(0); // 最初は透明
    newChara.setScale(chara.scaleX, chara.scaleY); // スケールも合わせる
    manager.layers.character.add(newChara);
    
    // 2. 新しい画像をフェードイン
    manager.scene.tweens.add({
        targets: newChara,
        alpha: 1,
        duration: time,
        ease: 'Linear'
    });
    
    // 3. 古い画像をフェードアウトして破棄
    manager.scene.tweens.add({
        targets: chara,
        alpha: 0,
        duration: time,
        ease: 'Linear',
        onComplete: () => {
            chara.destroy();
        }
    });

    // 4. 管理リストの参照を、新しいキャラクターオブジェクトに差し替える
    manager.scene.characters[name] = newChara;

    // アニメーションを待って次に進む
    manager.scene.time.delayedCall(time, () => {
       // ★★★ 新しい情報で状態を更新 ★★★
        manager.stateManager.updateChara(name, newCharaData); 
        //manager.next();
    });
}