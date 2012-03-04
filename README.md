ring.js
======================
iphone 3GS上でサクサク動いて欲しいcanvasライブラリ  
(機能より速度重視。ただし、勉強用ライブラリなのでそこまででもない)  
mailChartアプリで必要な機能のみを実装  
暫定仕様 : jQueryに依存

実装機能一覧
------
1. (暫定) 簡易レイヤ機能
    * addLayer  
    上位レイヤの追加のみ対応
    * setClientSize  
    パラメータ = width, height
    * draw  
    再描画。画面クリアする場合は、クリア用レイヤーを最下位にセット  
    レイヤー関数には、以下の引数をセット
      * context  
      CanvasRenderingContext2D機能に加えて、下記関数が利用可能
      * param  
      レイヤー間で引き渡せる連想配列。  
      予約語は"viewport", "width", "height" (クライアント領域)

2. イメージ管理  
    指定したjsonファイルに記載されたイメージを一括取得。イメージ名で表示
    * loadImageResource  
    パラメータ = json URL, loaded callback
    * drawImgResource  
    パラメータ = group, name, x, y
    groupは、以下のパラメータを設定可能
      * width, height  
      表示サイズ (単位px)
      * diffx, diffy  
      表示開始位置のズレ (単位px) <片方のみの指定不可>

3. フォーマット管理  
   文字種、色などの設定をフォーマット名で一括設定  
    (jsonファイルに指定。CSSの読み込みは未搭載)
    * loadFormatAsset  
    パラメータ = json URL, loaded callback
    * setFormatAsset  
    未設定パラメータは制御無し。指定可能パラメータは  
      * strokeStyle
      * fillStyle
      * lineWidth
      * lineCap
      * shadowColor
      * shadowOffsetX
      * shadowOffsetY
      * shadowBlur
      * globalCompositeOperation
      * font
      * textAlign
      * textBaseline
      * linearGradient  
      fillStyleのみ利用可  
      指定方法 = "grad" x1,y1,x2,y2 offset1,color1 ....

4. viewport  
   表示領域に基づく描画、スクロール等を制御  
   スマートフォンでの表示領域変更時は自動で左上を起点にサイズ調整  
   (レイヤーのクリッピング制御は未搭載。レイヤー毎に自前の制御必要)
    * setClientArea  
    パラメータ = x, y  
    表示領域より大きい場合は、マウス・フリックで表示領域を移動  
    ※表示オブジェクトのドラッグ移動制御は未サポート
    * setViewScale  
    キャンバス内の拡大、縮小指定  
    両パラメータとも1の場合はピンチによる制御無し  
    （マウススクロールによる拡大・縮小サポートは未搭載）
    * addViewScaleChangedListener, addClientAreaChangedListener  
    拡大、縮小処理発生時と表示領域変更時のイベント  
    drawイベントは自動で発行されます   
    * drawArea  
    表示領域を指定して描画

5. オブジェクト選択イベント  
(これから)

6. 描画サポート
    * drawRoundedSquare  
    角丸型の四角形表示  
    パラメータ = x, y, width, height, arc, [strike]
    * drawTextBox  
    複数行文字列表示。入りきらない場合は、「...」と表示。ワードラップ制御未搭載  
    パラメータ = text, x, y, width, height, [行間スペース(px)]


その他
------
基本的に、contextに追加した関数のprefixはdraw, set, getとする　　  
(超暫定仕様。あとで、ringに入れる)

ライセンス
------
MIT License
