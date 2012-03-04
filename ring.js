var jp = jp || {};
jp.jvx = jp.jvx || {};
jp.jvx.ring = jp.jvx.ring || function() {

	// use init func.
	var initError = false;
	// use drawTextBox
	const contStr = '...'; 
	var cimg = {};
	// use drawImgResource
	var imgLoadCount = 0;
	var loadImageFn;

	var layer = [];

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

		var lineHeight = (fontHeight * 2), lineSize = 0, buf = new StringBuffer(), strSize = str.length;
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

	function loadImageRes(url, f) {
		cimg = {};
		loadImageFn = f;

		$.ajax({ 
			url: url,
			type: "POST", 
			dataType: "json",
			timeout: 3000,
			success: function(j, dataType) {
				for(k in j) cimg[k] = loadImage(j[k]);
				if((imgLoadCount === 0) && loadImageFn) loadImageFn(true);
			},
			error: function(req, status, e) {
				if(f) f(false, e);
			}
		});
	}

	function loadImage(imgUrl) {
		var imgs = {};
		for(key in imgUrl) {
			if(key.match(/^(width|height|diffx|diffy)$/)) {
				imgs[key] = imgUrl[key];
			} else {
				imgs[key] = new Image();
				imgs[key].onload = function() {
						imgLoadCount--;
						if((imgLoadCount === 0) && loadImageFn) loadImageFn(true);
					};
				imgs[key].src = imgUrl[key];
				imgLoadCount++;
			}
		}
		return imgs;
	}

	var RingContext2d = {
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
				if(p[i].match(/^[0-9]+px$/)) { fontHeight = parseInt(p[i].split(/px$/)[0]); }
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
			var imggrp = cimg[grp];
			if(!imggrp) return;
			var dx = (imggrp.diffx || 0), dy = (imggrp.diffy || 0);
			if(imggrp.width) {
				this.drawImage(imggrp[id], x - dx, y - dy, imggrp.width, imggrp.height);
			} else {
				this.drawImage(imggrp[id], x - dx, y - dy);
			}
		}
	}

	return {
		create: function(c) {
		var handler = {
			Point: function(x, y) {
					this.x = x; this.y = y;
				},
			Rectangle: function(x, y ,w, h) {
					this.x = x; this.y = y; this.width = w; this.height = h;
				},
			addLayer: function(l) {
					layer.push(l);
				},
			draw: function() {
					for(var i in layer) layer[i](this.context);
				},
			loadImageResource: function(url, f) {
					loadImageRes(url, f);
				},
			context: c.getContext("2d")
		}

		$.extend(handler.context, RingContext2d);
		return handler;
	}} 

}();

