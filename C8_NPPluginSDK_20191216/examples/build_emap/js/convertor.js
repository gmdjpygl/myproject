/*
---
time: 2014.03.03
author: huzw
...
*/
(function () {
	var head = document.getElementsByTagName("head").item(0);
	
	function load_script (srcUrl, blockNumber, callback) {
		try {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = srcUrl;
			script.customType = "bmapTranslating";
			script.blockNumber = blockNumber;
			
			script.onload = script.onreadystatechange = function () {
				if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
					callback && callback(script.blockNumber);
										 
					script.onload = script.onreadystatechange = null;
					
					if (head && script.parentNode) {
						head.removeChild(script);
					}
				}
			};
			
			head.appendChild(script);
		}
		catch (e) {
			return false;	
		}
	};
	
	// - type of 0: GPS -> BMap, 2: GCJ-02 -> BMap
	function transMore (points, type, callback) {
		try {
			if (!points) return false;
			
			var cbPrefix = "bmapTranslate_" + Math.round(Math.random() * 10000);
			
			BMap.Convertor.DataStore[cbPrefix] = {
				points: points,
				tmpPoints: {},
				checkCallback: function () {
					var SELF = this;
					var count = 0, newPoints = [];
					for(var i in SELF.tmpPoints) {
						count++;
					}
					if (count == SELF.points.length) {
						for (var j = 0; j < SELF.points.length; j++) {
							newPoints.push(SELF.tmpPoints[j]);	
						};
						callback && callback(newPoints);
						
						delete BMap.Convertor.DataStore[cbPrefix];
					}
				}
			};
					
			for(var i = 0; i < points.length; i++) {
				(function (point, index) {
					var cbName = cbPrefix + "_bno_" + index;
					var srcUrl = "http://api.map.baidu.com/ag/coord/convert?from="+ type + "&to=4&x=" + point.lng + "&y=" + point.lat + "&callback=BMap.Convertor." + cbName;
					
					load_script(srcUrl, index);
					
					BMap.Convertor[cbName] = function (translate) {
						var _cbpfx = cbName.replace("_bno_" + index, "");
						// console.log(cbName + "::" + index + "::" + _cbpfx + "::" + typeof BMap.Convertor.DataStore[_cbpfx]);
						
						if (typeof BMap.Convertor.DataStore[_cbpfx] != "undefined") {
							var tmpPoints = BMap.Convertor.DataStore[_cbpfx].tmpPoints;
							
							var newPoint = new BMap.Point(translate.x, translate.y);
							tmpPoints[index] = newPoint;
							
							// console.log(index + "::" + newPoint);
							
							BMap.Convertor.DataStore[_cbpfx].checkCallback();
						}
						delete BMap.Convertor[cbName];
					}; 
					
				})(points[i], i); 
			}
		}
		catch (e) {
			return false;
		}
	};
	
	function translate (point, type, callback) {
		try {
			return transMore([point], type, callback);
		}
		catch (e) {
			return false;	
		}
	};
	
	window.BMap = window.BMap || {};
	window.BMap.Convertor = {
		DataStore: {},
		transMore: transMore,
		translate: translate
	};
	
})();