; === 統合テスト用シナリオ ===
; このシナリオは、セーブ＆ロード、シーン遷移、フロー制御が
; 正しくバックエンドの状態を保持できるかを検証します。

; --- 1. 変数の初期化と起動回数の確認 ---
[eval exp="f.test_item = 0"]
[eval exp="f.test_flag = 'none'"]
[eval exp="f.player_name = 'テストさん'"]
[log exp="sf.boot_count"]
yuna:「ようこそ、&f.player_name さん！このテストゲームの起動は、&sf.boot_count 回目です。」

; --- 2. クリック待ちとセーブのテスト ---
[chara_show name="yuna" pos="center" time=500]
[p] 
; ここでクリック待ちになる
yuna:「この状態で、メニューからセーブしてみてください。」
yuna:「ロードしたら、ここから再開できるはずです。」
[p]

; --- 3. 変数操作と[if]分岐のテスト ---
kaito:「アイテムをゲットしますか？」
[link target="*get_item" text="ゲットする"]
[link target="*no_item" text="しない"]
[p] 
; 選択肢の直前でセーブ＆ロードを試す

*get_item
[eval exp="f.test_item = 1"]
kaito:「アイテムをゲットしたね！」
[jump target="*item_check"]

*no_item
kaito:「アイテムはゲットしなかったね。」
[jump target="*item_check"]

*item_check
[log exp="f.test_item"]
[if exp="f.test_item == 1"]
  kaito:「アイテムを持ってるから、特別なセリフだよ。」
  [eval exp="f.test_flag = 'item_true'"]
[else]
  kaito:「アイテムがないね。」
  [eval exp="f.test_flag = 'item_false'"]
[endif]
[log exp="f.test_flag"]
kaito:「この[if]分岐の直後でセーブ＆ロードしても、変数は正しい状態を保つはずです。」
[p]

; --- 4. サブルーチン呼び出し([call]と[return])のテスト ---
yuna:「次に、サブルーチンを呼び出します。」
[call storage="test_sub.ks"]
[log exp="f.sub_result"]
yuna:「サブルーチンから戻ってきました。結果は &f.sub_result です。」
yuna:「[call]の途中や[return]の直前でセーブ＆ロードしても、正しく戻れたでしょうか？」
[p]

; --- 5. アクションシーン連携([jump]と[return-to-novel])のテスト ---
kaito:「いよいよアクションシーンへ突入！戻ってきたら結果を確認しよう。」
[jump storage="ActionScene"] ; ActionSceneへ遷移
[log exp="f.battle_result"]
kaito:「アクションシーンから戻ってきました！戦闘結果は &f.battle_result です。」
[if exp="f.battle_result == 'win'"]
  yuna:「勝利おめでとうございます！」
  [eval exp="f.final_status = 'winner'"]
[else]
  yuna:「残念、敗北しましたね…」
  [eval exp="f.final_status = 'loser'"]
[endif]
[log exp="f.final_status"]
[p]

; --- 6. 最終確認 ---
yuna:「すべてのテストポイントを通過しました。」
[log exp="f.test_item"]
[log exp="f.test_flag"]
[log exp="f.sub_result"]
[log exp="f.battle_result"]
[log exp="f.final_status"]
[log exp="sf.boot_count"]
yuna:「これらの変数が全て正しい値であれば、テストは成功です！」
[s]