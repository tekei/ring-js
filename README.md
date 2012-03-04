ring.js
======================
iphone 3GS上でサクサク動いて欲しいcanvasライブラリ。  
mailChartアプリで必要な機能のみを実装。  
暫定仕様 : jQuery必要

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

2. 角丸型の四角形表示
    * drawRoundedSquare  
    パラメータ = x, y, width, height, arc, [strike]

3. イメージ管理  
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

4. 複数行文字列表示  
    入りきらない場合は、「...」と表示。ワードラップ制御未搭載
    * drawTextBox  
    パラメータ = text, x, y, width, height, [行間スペース(px)]

5. フォーマット管理  
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

その他
------
基本的に、contextに追加した関数のprefixはdraw, set, getとする　　  
(超暫定仕様。あとで、ringに入れる)

ライセンス
------
MIT License
