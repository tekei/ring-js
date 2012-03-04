var jp = jp || {};
jp.jvx = jp.jvx || {};
jp.jvx.ring = jp.jvx.ring || function() {

  function ResourceContainer() {
    this.loadCount = 0;
    this.loadFinFn;
  }
  ResourceContainer.prototype = {
    load: function(url, f) {
      if(this.init()) this.init();
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
    }
    loading: function() {
      this.loadCount++;
    }
    loaded: function() {
      with(this) {
        loadCount--;
        if((loadCount === 0) && loadFinFn) loadFinFn(true);
      }
    }
  }

  function ImageContainer() {}
  ImageContainer.prototype = new ResourceContainer();
  ImageContainer.prototype = {
    init: function() {
      this.img = {};
    },
    analyze: function(j) {
      for(var grp in j) {
        var imgs = {};
        for(var key in j[grp]) {
          var i = j[grp][key];
          if(key.match(/^(width|height|diffx|diffy)$/)) {
            imgs[key] = i;
          } else {
            imgs[key] = new Image();
            imgs[key].onload = function() { this.loaded(); }
            imgs[key].src = i;
            this.loading();
          }
        }
        this.img[k] = imgs;
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
  }

  function StyleContainer() {}
  StyleContainer.prototype = new ResourceContainer();
  StyleContainer.prototype = {
    init: function() {
      this.style = {};
    },
    analyze: function(j) {
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
    },
    set: function(c, grp) {
      if(this.style[k]) {
      for(var grp in j) {
      var imggrp = this.img[grp];
      if(!imggrp) return;
      var dx = (imggrp.diffx || 0), dy = (imggrp.diffy || 0);
      if(imggrp.width) {
        c.drawImage(imggrp[id], x - dx, y - dy, imggrp.width, imggrp.height);
      } else {
        c.drawImage(imggrp[id], x - dx, y - dy);
      }
    }
  }

  StyleContainer.prototype = {
    load: function(url, f) {
      this.style = {};
      this.loadFinFn = f;
      var t = this;

      $.ajax({ 
        url: url,
        type: "POST", 
        dataType: "json",
        timeout: 3000,
        success: function(j, dataType) {
          t.style = t.analyze(j);
          if((t.loadCount === 0) && f) f(true);
        },
        error: function(req, status, e) {
          if(f) f(false, e);
        }
      });
    },
  }

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
  }

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

  function RingContext2d() {
    this.images = new ImageContainer();
  }
  RingContext2d.prototype = {
    drawRoundedSquare: function(x, y, w, h, arc, s) {
      this.beginPath();
      this.moveTo(x + arc, y);
      this.arcTo(x + w, y, x + w, y + h - arc, arc);
      this.arcTo(x + w, y + h, x - arc, y + h, arc);
      this.arcTo(x, y + h, x, y + arc, arc);
      this.arcTo(x, y, x + w - arc, y, arc);
      this.closePath();
      this.fill();
      if(s) this.stroke();
    },
    drawTextBox: function(str, x, y, w, h, lineSpace) {
      lineSpace = lineSpace || 0;
      var fontHeight = 12;
      var p = this.font.split(" ");
      for(var i in p) {
        if(p[i].match(/^[0-9]+px$/)) {
          fontHeight = parseInt(p[i].split(/px$/)[0]);
        }
      }

      var layoutStr = splitMultiLineText(this, str, w, h, fontHeight, lineSpace);
      var ypos = y;
      this.textBaseline = "top";
      for(var i in layoutStr) {
        this.fillText(layoutStr[i], x, ypos);
        ypos += (lineSpace + fontHeight);
      }
    },
    drawImgResource: function(grp, id, x, y) {
      this.images.draw(this, grp, id, x, y);
    }
  }

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
        loadImageResource: function(url, f) {
            handler.context.images.load(url, f);
          },
        context: c.getContext("2d"),
        layer: []
      }

      $.extend(handler.context, new RingContext2d());
      return handler;
    }
  } 

}();

