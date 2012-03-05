var jp = jp || {};
jp.jvx = jp.jvx || {};
jp.jvx.ring = jp.jvx.ring || function() {

  function ResourceContainer() {
    this.loadCount = 0;
    this.loadFinFn = null;
  }
  ResourceContainer.prototype.load = function(url, f) {
    if(this.init) this.init();
    var t = this;

    $.ajax({ 
      url: url,
      type: "POST", 
      dataType: "json",
      timeout: 3000,
      success: function(j, dataType) {
        t.analyze(j);
        if((t.loadCount === 0) && f) f(true);
      },
      error: function(req, status, e) {
        if(f) f(false, e);
      }
    });
  };
  ResourceContainer.prototype.countup = function() {
    this.loadCount++;
  };
  ResourceContainer.prototype.countdown = function() {
    with(this) {
      loadCount--;
      if((loadCount === 0) && loadFinFn) loadFinFn(true);
    }
  };

  function ImageContainer() {}
  ImageContainer.prototype = new ResourceContainer();
  ImageContainer.prototype.init = function() {
    this.img = {};
  };
  ImageContainer.prototype.analyze = function(j) {
    for(var grp in j) {
      var imgs = {};
      for(var key in j[grp]) {
        var i = j[grp][key];
        if(key.match(/^(width|height|diffx|diffy)$/)) {
          imgs[key] = i;
        } else {
          imgs[key] = new Image();
          imgs[key].onload = function() { this.countdown(); }
          imgs[key].src = i;
          this.countup();
        }
      }
      this.img[k] = imgs;
    }
  };
  ImageContainer.prototype.draw = function(c, grp, id, x, y) {
    var imggrp = this.img[grp];
    if(!imggrp) return;
    var dx = (imggrp.diffx || 0), dy = (imggrp.diffy || 0);
    if(imggrp.width) {
      c.drawImage(imggrp[id], x - dx, y - dy, imggrp.width, imggrp.height);
    } else {
      c.drawImage(imggrp[id], x - dx, y - dy);
    }
  };

  function StyleContainer() {}
  StyleContainer.prototype = new ResourceContainer();
  StyleContainer.prototype.init = function() {
    this.style = {};
  };
  StyleContainer.prototype.analyze = function(j) {
    for(var grp in j) {
      var styles = {};
      for(var key in j[grp]) {
        var i = j[grp][key];
        if((key === "fillStyle") && (i.indexOf("grad ") == 0)) {
        } else {
        }
      }
      this.style[k] = styles;
    }
  };
  StyleContainer.prototype.setStyle = function(c, grp) {
    var styles = this.style[grp];
    if(!styles) return;
    for(var k in styles) {
    }
  };

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
      this.images.draw(this, grp, id, x, y);
    },
    setStyle: function(name) {
      if(!this.styles) return;
      this.styles.setStyle(this, name);
    },
    loadImage: function(url, f) {
      this.images = new ImageContainer();
      this.images.load(url, f);
    },
    loadStyle: function(url, f) {
      this.styles = new StyleContainer();
      this.styles.load(url, f);
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
            with(handler) {
              for(var i in layer) layer[i](context);
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
//      $.extend(handler.context, new RingContext2d());
      handler.context.ring = new RingContext2d(handler.context);

      return handler;
    }
  };

}();

