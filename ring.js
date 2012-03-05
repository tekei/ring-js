var jp = jp || {};
jp.jvx = jp.jvx || {};
jp.jvx.ring = jp.jvx.ring || function() {

  function ResourceContainer() {}
  ResourceContainer.prototype = {
    load: function(url, f, context) {
      if(this.init) this.init();
      var t = this;
      this.loadCount = 0;
      this.loadFinFn = f;

      $.ajax({ 
        url: url,
        type: "POST", 
        dataType: "json",
        timeout: 3000,
        success: function(j, dataType) {
          t.analyze(j, context);
          if((t.loadCount === 0) && f) f(true);
        },
        error: function(req, status, e) {
          if(f) f(false, e);
        }
      });
    },
    countup: function() {
      this.loadCount++;
    },
    countdown = function() {
      with(this) {
        loadCount--;
        if((loadCount === 0) && loadFinFn) loadFinFn(true);
      }
    }
  };

  function ImageContainer() {}
  ImageContainer.prototype = new ResourceContainer();
  $.extend(ImageContainer.prototype, {
    init: function() {
      this.img = {};
    },
    analyze: function(j) {
      this.img = j;
      for(var grp in j) {
        for(var key in j[grp]) {
          if(!key.match(/^(width|height|diffx|diffy)$/)) {
            var i = new Image();
            with(this) {
              i.onload = function() { countdown(); }
            }
            i.src = j[grp][key];
            j[grp][key] = i;
            this.countup();
          }
        }
      }
    },
    draw: function(c, grp, id, x, y) {
      var imggrp = this.img[grp];
      if(!imggrp) return;
      var dx = (imggrp.diffx || 0), dy = (imggrp.diffy || 0);
      if(imggrp.width) {
        c.drawImage(imggrp[id], x - dx, y - dy, imggrp.width, imggrp.height);
      } else {
        c.drawImage(imggrp[id], x - dx, y - dy);
      }
    }
  });

  function StyleContainer() {}
  StyleContainer.prototype = new ResourceContainer();
  $.extend(StyleContainer.prototype, {
    init: function() {
      this.style = {};
    },
    analyze: function(j, c) {
      this.style = j;
      for(var grp in j) {
        var i = j[grp]["fillStyle"];
        if(i && (i.indexOf("grad ") == 0)) {
          var s = i.split(/[ ,]/)
          var grad = c.createLinearGradient.apply(c, s.slice(1, 5));
          for(var p = 5; p < s.length; p += 2)
            grad.addColorStop(parseFloat(s[p]), s[p + 1]);
          j[grp]["fillStyle"] = grad;
        }
      }
    },
    setStyle: function(c, grp) {
      var styles = this.style[grp];
      if(styles) $.extend(c, styles);
    }
  });

  // use drawTextBox
  const contStr = '...'; 

  function StringBuffer() {
    this.buf = [];
  }
  StringBuffer.prototype = {
    clear: function() { this.buf = []; },
    length: function() { return this.buf.length; },
    append: function(s) { this.buf.push(s); },
    str: function() { return this.buf.join(''); }
  };

  function splitMultiLineText(c, str, w, h, fontHeight, lineSpace) {
    var result = [];
    if(!str) str = '';
    if(c.measureText(str).width <= w) { result.push(str); return result; }

    var lineHeight = (fontHeight * 2), lineSize = 0;
    var buf = new StringBuffer(), strSize = str.length;
    var contStrLen = c.measureText(contStr).width;
    for(var i = 0;  i < str.length; i++) {
      lineSize += c.measureText(str.charAt(i)).width;
      if((h <= lineHeight) && (w < (lineSize + contStrLen))) {
        buf.append(contStr);
        result.push(buf.str());
        buf.clear();
        break;
      } else if(w < lineSize) {
        result.push(buf.str());
        lineHeight += fontHeight + lineSpace;
        buf.clear();
        lineSize = c.measureText(str.charAt(i)).width;
      }
      buf.append(str.charAt(i));
    }

    if(buf.length !== 0) result.push(buf.str());
    return result;
  }

  function RingContext2d(context) {
    this.context = context;
  }
  RingContext2d.prototype = {
    drawRoundedSquare: function(x, y, w, h, arc, s) {
      with({c: this.context}) {
        c.beginPath();
        c.moveTo(x + arc, y);
        c.arcTo(x + w, y, x + w, y + h - arc, arc);
        c.arcTo(x + w, y + h, x - arc, y + h, arc);
        c.arcTo(x, y + h, x, y + arc, arc);
        c.arcTo(x, y, x + w - arc, y, arc);
        c.closePath();
        c.fill();
        if(s) c.stroke();
      }
    },
    drawTextBox: function(str, x, y, w, h, lineSpace) {
      lineSpace = lineSpace || 0;
      var fontHeight = 12;
      var p = this.context.font.split(" ");
      for(var i in p) {
        if(p[i].match(/^[0-9]+px$/)) {
          fontHeight = parseInt(p[i].split(/px$/)[0]);
        }
      }

      var layoutStr = splitMultiLineText(this.context, str, w, h, fontHeight, lineSpace);
      var ypos = y;
      this.context.textBaseline = "top";
      for(var i in layoutStr) {
        this.context.fillText(layoutStr[i], x, ypos);
        ypos += (lineSpace + fontHeight);
      }
    },
    drawImage: function(grp, id, x, y) {
      if(!this.images) return;
      this.images.draw(this.context, grp, id, x, y);
    },
    setStyle: function(name) {
      if(!this.styles) return;
      this.styles.setStyle(this.context, name);
    },
    loadImage: function(url, f) {
      this.images = new ImageContainer();
      this.images.load(url, f);
    },
    loadStyle: function(url, f) {
      this.styles = new StyleContainer();
      this.styles.load(url, f, this.context);
    }
  };

  function Point(x, y) {
    this.x = x; this.y = y;
  }

  function Rectangle(x, y ,w, h) {
    this.x = x; this.y = y;
    this.width = w; this.height = h;
  }

  return {
    create: function(c) {
      var handler = {
        addLayer: function(l) {
            handler.layer.push(l);
          },
        draw: function() {
            var param = {};
            with(handler) {
              for(var i in layer) {
                layer[i](context, param);
              }
            }
          },
        loadImage: function(url, f) {
            handler.context.ring.loadImage(url, f);
          },
        loadStyle: function(url, f) {
            handler.context.ring.loadStyle(url, f);
          },
        context: c.getContext("2d"),
        layer: []
      }
      handler.context.ring = new RingContext2d(handler.context);

      return handler;
    }
  };

}();

