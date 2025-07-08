/**
 * [button] タグの処理
 * クリック可能な画像ボタンを配置する
 * @param {Object} params - {graphic, x, y, target}
 */
export function handleButton(manager, params) {
    const graphic = params.graphic;
    if (!graphic) { console.warn('[button] graphic属性は必須です。'); 
        //manager.next(); return; 
        manager.finishTagExecution();
    }

    const target = params.target;
    if (!target) { console.warn('[button] target属性は必須です。'); 
        //manager.next(); return; 
        manager.finishTagExecution();
        }

    const x = Number(params.x) || manager.scene.scale.width / 2;
    const y = Number(params.y) || manager.scene.scale.height / 2;

    // ★★★ add.image を使い、setInteractive()でクリック可能にする ★★★
    const buttonImage = manager.scene.add.image(x, y, graphic)
        .setInteractive()
        .setOrigin(0.5); // 中央基点

    // ボタンがクリックされたら、指定のラベルにジャンプする
    buttonImage.on('pointerdown', () => {
        // 他のボタンや選択肢が表示されている可能性も考慮し、クリア処理を入れると安全
        // manager.scene.clearChoiceButtons(); // 必要なら
        manager.jumpTo(target);
    });

    // ★★★ GameSceneにボタンを登録して、後から消せるようにする ★★★
    manager.scene.uiButtons.push(buttonImage);
manager.finishTagExecution();
    //manager.next(); // ボタンを配置したら、すぐに次の行へ
}