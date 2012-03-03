var jp = jp || {};
jp.jvx = jp.jvx || {};
jp.jvx.ring = jp.jvx.ring || function() {

	function StringBuffer() {
	  this.buf = [];
	}

	StringBuffer.prototype = {
		clear: function() { this.buf = []; },
		length: function() { return this.buf.length; },
		append: function(s) { this.buf.push(s); },
		toString: function() { return this.buf.join(''); }
	}

	function initContext(canvas) {
		var c = canvas.getContext("2d");
		c.drawRoundedSquare = function(x, y, w, h, arc, s) {
				this.beginPath();
				this.moveTo(x + arc, y);
				this.arcTo(x + w, y, x + w, y + h - arc, arc);
				this.arcTo(x + w, y + h, x - arc, y + h, arc);
				this.arcTo(x, y + h, x, y + arc, arc);
				this.arcTo(x, y, x + w - arc, y, arc);
				this.closePath();

				this.fill();
				if(s) this.stroke();
		};
		return c;
	}

	var layer = [];

	return { 
		create: function(c) {
		var handler = {
		context: null,
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
			}
		}
		handler.context =  initContext(c);
		return handler;
	}} 

}();

