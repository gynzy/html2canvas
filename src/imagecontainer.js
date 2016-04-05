var Promise = require('./promise');

function ImageContainer(src, cors) {
	this.src = src;
	this.image = new Image();
	var self = this;
	this.tainted = null;

	this.getSrc = function() {
		return new Promise(function(resolveSrc, rejectSrc) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', self.src, true);

			xhr.responseType = 'arraybuffer';

			xhr.onload = function(e) {
				if (this.status === 200) {
					var uInt8Array = new Uint8Array(this.response);
					var i = uInt8Array.length;
					var biStr = new Array(i);
					while (i--) {
						biStr[i] = String.fromCharCode(uInt8Array[i]);
					}
					var data = biStr.join('');
					var base64 = window.btoa(data);

					resolveSrc("data:image/png;base64," + base64);
				}
			};

			xhr.onerror = rejectSrc;
			xhr.send();
		});
	};

	this.promise = new Promise(function(resolve, reject) {
		self.image.onload = resolve;
		self.image.onerror = reject;

		if (cors) {
			self.getSrc().then(function(imgSrc) {
				self.image.src = imgSrc;
				if (self.image.complete === true) {
					resolve(self.image);
				}
			}, function(err) {
				reject(err);
			});
		} else {
			self.image.src = src;
			if (self.image.complete === true) {
				resolve(self.image);
			}
		}
	});
}

module.exports = ImageContainer;
