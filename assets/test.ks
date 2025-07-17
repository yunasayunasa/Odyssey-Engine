; === My Novel Engine 総合チュートリアル ===

; --- 変数の初期化 ---
[eval exp="f.love_meter = 0"]
[eval exp="sf.boot_count = (sf.boot_count || 0) + 1"]
[eval exp="f.player_name = 'マスター'"]

; --- １．基本的な表示と演出 ---
[playbgm storage="ronpa_bgm" time=1000]
[bg storage="bg_school" time=1500]
[wait time=1500]

[chara_show name="yuna" pos="left" y=800 visible=false]
[move name="yuna" y=450 alpha=1 time=1000]
[wait time=1000]

[delay speed=80]
yuna:「ようこそ！これは、あなたと一緒に作ったゲームエンジンのチュートリアルです。」

yuna:「このゲームを起動するのは、&sf.boot_count 回目ですね。」

[chara_show name="kaito" pos="right" time=1000]
[wait time=1000]

kaito:「僕の`[chara_show]`は、`time`属性でフェードインしたよ。」

yuna:「じゃあ、いくつか演出を見せるね。まずは揺れてみる。」

; --- ２．動的演出タグ ---

[shake name="yuna" time=500 power=10]
[vibrate time=300 power=0.01]
[wait time=500]
kaito:「わっ、びっくりした！」


[chara_jump name="kaito" height=50 time=600]
[wait time=600]
yuna:「次は、ジャンプ！」


[flip name="yuna" time=400]
[walk name="yuna" x=-200 time=2000]
[wait time=2000]
yuna:「じゃあ、私は向こうに歩いていくね。」
[chara_hide name="yuna"]

; --- ３．条件分岐と選択肢 ---
kaito:「さて、&f.player_name。僕に話しかけてみるかい？」
[link target="*talk_to_kaito" text="話しかける"]
[link target="*ignore_kaito" text="無視する"]
[p]
*talk_to_kaito
[eval exp="f.love_meter += 10"]
kaito:「話しかけてくれて嬉しいよ！ありがとう。」
[jump target="*choice_end"]

*ignore_kaito
[eval exp="f.love_meter -= 5"]
kaito:「そっか…ちょっと寂しいな。」
[jump target="*choice_end"]

*choice_end
[log exp="f.love_meter"]
[if exp="f.love_meter > 0"]
  kaito:「君は優しい人だね。」
[else]
  kaito:「次は話しかけてくれると嬉しいな。」
[endif]

; --- ４．画像とレイヤー操作 ---
kaito:「ここで、思い出の一枚絵を表示してみよう。」
[image storage="cg01" layer="cg" time=1000]
[wait time=1500]
[p]
[freeimage layer="cg"]


[cm]
[wait time=500]
[wait time=1000]
[chara_hide name="kaito"]

; --- ５．セーブ＆ロードとファイル呼び出し ---
[er layer="character"]
yuna:「この状態でセーブができます。メニューから試してみてね。」

yuna:「次に、`scene2.ks`をサブルーチンとして呼び出します。」

[fadeout time=500]
[wait time=500]
[call storage="scene2.ks"]
[fadein time=500]

yuna:「サブルーチンから戻ってきました。次はアクションシーンを呼び出します。」
yuna:コールタグによるテストです。
; --- 5. アクションシーン連携([jump]と[return-to-novel])のテスト ---
kaito:「いよいよアクションシーンへ突入！戻ってきたら結果を確認しよう。」

; ★★★ jumpタグにparams属性を追加 ★★★
; params属性内はJavaScriptのオブジェクトリテラル形式で記述。
; 変数展開は embedVariables が自動で行うので、"&f.player_name;" のままOK
[fadeout time=500]
[wait time=500]
[jump storage="ActionScene" params="{player_level:f.test_item, player_name:'&f.player_name;', start_area:'bridge'}"] 
[fadein time=500]

kaito:「アクションシーンから戻ってきました！戦闘結果は &f.battle_result です。」
[log exp="f.battle_result"]


[chara_show name="yuna" pos="left" time="500"]
[chara_show name="kaito" pos="right" time="500"]

yuna:「すべてのアクションから戻ってきました！[br]これにて、チュートリアルを終了します！」

[s]
