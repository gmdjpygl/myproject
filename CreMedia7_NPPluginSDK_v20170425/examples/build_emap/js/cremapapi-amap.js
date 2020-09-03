var CREMapAPI = {
	time: "2014.07.01",
	
	type: "amap",
	
	inited: false,
	
	mapObjects: [],
	markerLabel: null,
	geocoder: null,
	
	maps: function (callbackFun) {
		try {
			if (typeof AMap == "undefined" || typeof AMap.Map == "undefined") {
				CREMapAPI.inited = false;
				return false;	
			}
			else {
				CREMapAPI.inited = true;
			}
			
			var Self = this;
			
			Self.type = "amap";
			// - 此地图类型展示普通街道视图
			Self.defaultMTID = 0; // 0：普通，1：卫星
			// - 默认中心点
			Self.defaultPOS = new AMap.LngLat(117.2808, 31.8639);
			// - 默认级别
			Self.defaultZOOM = 13;
			// 默认旋转角度
			Self.defaultRotation = 0;
			// 地图显示的参考坐标系，取值'EPSG3857' | 'EPSG3395' | 'EPSG4326' 默认值：'EPSG3857' 
			Self.defaultCrs = "EPSG3857";
			
			Self.callbackFun = callbackFun || function () {};
			
			Self.options = null;
			Self.container = null;
			Self.map = null;
			Self.resize = null;
			Self.markers = null;
			Self.maptype = null; // 0,1
			Self.mapcenter = null;
			
			Self.initialize = function (options) {
				try {
					var options = options || {};
					// 高德地图中容器必须是Dom ID
					if (typeof options.container == "object" && options.container) {
						if (!options.container.id || document.getElementById(options.container.id) != options.container) {
							return false;
						}
						Self.container = options.container = options.container.id;
					}
					
					Self.container = options.container = Self.container || options.containerId;
					
					Self.options = {
						mapType: options.mapTypeId || Self.defaultMTID,
						enableAutoResize: options.enableAutoResize,
						position: new AMap.LngLat(options.longitude, options.latitude) || Self.defaultPOS,
						zoom: options.zoom || Self.defaultZOOM,
						rotation: options.rotation || Self.defaultRotation,
						crs: options.crs || Self.defaultCrs
					};
					// - 创建Map实例
					Self.map = new AMap.Map(Self.container, {
						view: new AMap.View2D({
							center: Self.options.position,
							rotation: Self.options.rotation,
							zoom: Self.options.zoom,
							crs: Self.options.crs
						})
					});
					// 添加控件
					Self.map.plugin(["AMap.MapType", "AMap.ToolBar", "AMap.OverView", "AMap.Scale", "AMap.PolyEditor", "AMap.RangingTool"], function () {
						Self.options.plugin = {};
						// 地图类型
						Self.options.plugin.mapType = new AMap.MapType({
							defaultType: Self.options.mapType,
							showRoad: true
						});
						Self.map.addControl(Self.options.plugin.mapType);
						// 地图工具条
						Self.options.plugin.toolbar = new AMap.ToolBar({
							
						});
						Self.map.addControl(Self.options.plugin.toolbar);
						// 地图鹰眼
						Self.options.plugin.overview = new AMap.OverView();
						Self.map.addControl(Self.options.plugin.overview);
						// 地图比例尺
						Self.options.plugin.scale = new AMap.Scale();
						Self.map.addControl(Self.options.plugin.scale);
					});
					
					//AMap.event.addListener(Self.map, 'complete', function() {
						//console.log(this.getCenter());
					//});
					
					CREMapAPI.mapObjects.push(Self.map);
					// 加载一些服务类
					Self.map.plugin(["AMap.CitySearch", "AMap.Geocoder"], function () {
					});
					Self.markers = new CREMapAPI.markers(Self);
					
					// +
					
				}
				catch (e) {
				}
			};
			
			// - 移除地图显示
			Self.undo = function () {
				if (Self.map) {
					if (Self.container) {
						for (var key in window) {
							if (key && key.search("_amap_geo_") != -1) {
								delete window[key];
							}
						}
						// 注销地图对象，并清空地图容器
						Self.map.destroy();
						Self.map = null;
						Self.mapcenter = null;
						Self.maptype = null;
					} 
				}
			};
			Self.resize = function(lat, lng) { 
				if(Self.map) {
					AMap.event.trigger(Self.map, "resize", {lat: lat, lng: lng});
				}
			};
			// - 放大级别
			Self.zoomIn = function () {
				if (Self.map) {
					Self.map.zoomIn();
				}
			};
			// - 缩小级别
			Self.zoomOut = function () {
				if (Self.map) {
					Self.map.zoomOut();
				}
			};
			// - 画折线方法
			Self.polyline = function( gpsdatalist ) {
				var path = [];
				for (var i = gpsdatalist.length - 1; i >= 0; i--) {
					var gps = gpsdatalist[i];
					if (typeof gps.longitude != "undefined" && typeof gps.latitude != "undefined") {
						path.push(new AMap.LngLat(gps.longitude, gps.latitude));	
					}
				}
				try {
					var polyline = new AMap.Polyline({
						map: Self.map,
						path: path,
						strokeColor: "#00AAFF",
						strokeWeight: 3,
						strokeOpacity: 0.8
					});
					AMap.event.addListener(polyline, "mouseover", function () {
						this.setOptions({
							strokeColor: "blue",
							strokeOpacity: 1
						});
					});
					AMap.event.addListener(polyline, "mouseout", function () {
						this.setOptions({
							strokeColor: "#00AAFF",
							strokeOpacity: 0.8
						});
					});
					// - 添加到标记
					Self.addOverlay(polyline);
					return polyline;
				}
				catch (e) {
				}
			};
			
			// - 叠加覆盖物
			Self.addOverlay = function (overlay) {
				if (Self.map && overlay) {
					overlay.setMap(Self.map);
					return overlay;
				}
			};
			// - 移除覆盖物
			Self.removeOverlay = function (overlay) {
				if (overlay) {
					overlay.setMap(null);
					overlay = null;
					return overlay;
				}
			};
			
			// 测距信息
			Self.Ruler = {
				ruler: null,
				ruler_lis_addnode: null,
				ListenAddNode: function (e) {
					
				},
				ruler_lis_end: null,
				ListenEnd: function (e) {
					
				},
				end: true
			};
			// - 清除所有测距
			Self.clearDistance = function () {
				Self.disableDistance();
			};
			// 开启测距
			Self.enableDistance = function () {
				try {
					if (!Self.Ruler.ruler) {
						Self.Ruler.ruler = new AMap.RangingTool(Self.map);
						Self.Ruler.ruler.turnOn();
						
						// 增加测距点事件
						Self.Ruler.ruler_lis_addnode = AMap.event.addListener(Self.Ruler.ruler, "addnode", function (e) {
							Self.Ruler.ListenAddNode(e);
						});
						// 结束测距点事件
						Self.Ruler.ruler_lis_end = AMap.event.addListener(Self.Ruler.ruler, "end", function (e) {
							Self.Ruler.ListenEnd(e);
						});
					}
				}
				catch (e) {
				}
			};
			// 关闭测距
			Self.disableDistance = function (removeAll) {
				try {
					if (Self.Ruler.ruler) {
						Self.Ruler.ruler.turnOff();
						Self.Ruler.ruler = null;
						
						if (Self.Ruler.ruler_lis_addnode) {
							AMap.event.removeListener(Self.Ruler.ruler_lis_addnode);
							Self.Ruler.ruler_lis_addnode = null;
						}
						if (Self.Ruler.ruler_lis_end) {
							AMap.event.removeListener(Self.Ruler.ruler_lis_end);
							Self.Ruler.ruler_lis_end = null;
						}
					}
				}
				catch (e) {				
				}
			};
			
		/* 
			// 以下移除标记不可行 		
			Self.Ruler = {
				Struct: function (index, markers) {
					this.index = index || 0;
					this.markers = markers || [];
				},
				Store: {},
				Add: function (marker) {
					try {
						if (!this.bRuler) {
							var struct = new this.Struct(this.index);
							this.Store[this.index] = struct;
							
							this.bRuler = true;
						}
						else {
							var struct = this.Store[this.index] || null;
						}
						if (!struct) return false;
						struct.markers.push(marker);
						return true;
					}
					catch (e) {
						return false;
					}
				},
				RemoveAll: function () {
					try {
						for (var key in Self.Ruler.Store) {
							var struct = Self.Ruler.Store[key];
							if (struct.markers && struct.markers.length > 0) {
								for (var i = 0; i < struct.markers.length - 1; i++) {
									var marker = struct.markers[i];
									if (marker) {
										Self.removeOverlay(marker);
									}
								}
							}
							struct.markers = [];
						}
						this.bRuler = false;
						this.Store = {};
						this.SetIndex(0); 
						
						return true;
					}
					catch (e) {
						return false;
					}
				},
				ruler: null,
				ruler_lis_addnode: null,
				ListenAddNode: function (e) {
					Self.Ruler.Add(e.marker);
				},
				ruler_lis_end: null,
				ListenEnd: function (e) {
					this.bRuler = false;
					this.SetIndex();
				},
				bRuler: null,
				index: 0,
				GetIndex: function () {
					return this.index;
				},
				SetIndex: function (index) {
					return index || ++this.index;
				},
				end: true				
			};
			// - 清除所有测距
			Self.clearDistance = function () {
				Self.disableDistance();
			};
			// 开启测距
			Self.enableDistance = function () {
				try {
					if (!Self.Ruler.ruler) {
						Self.Ruler.ruler = new AMap.RangingTool(Self.map);
						Self.Ruler.ruler.turnOn();
						
						// 增加测距点事件
						Self.Ruler.ruler_lis_addnode = AMap.event.addListener(Self.Ruler.ruler, "addnode", function (e) {
							Self.Ruler.ListenAddNode(e);
						});
						// 结束测距点事件
						Self.Ruler.ruler_lis_end = AMap.event.addListener(Self.Ruler.ruler, "end", function (e) {
							Self.Ruler.ListenEnd(e);
						});
					}
				}
				catch (e) {
				}
			};
			// 关闭测距
			Self.disableDistance = function () {
				try {
					if (Self.Ruler.ruler) {
						Self.Ruler.ruler.turnOff();
						Self.Ruler.ruler = null;
						
						if (Self.Ruler.ruler_lis_addnode) {
							AMap.event.removeListener(Self.Ruler.ruler_lis_addnode);
							Self.Ruler.ruler_lis_addnode = null;
						}
						if (Self.Ruler.ruler_lis_end) {
							AMap.event.removeListener(Self.Ruler.ruler_lis_end);
							Self.Ruler.ruler_lis_end = null;
						}
						
						Self.Ruler.RemoveAll();
					}
				}
				catch (e) {				
				}
			}; */
		}
		catch (e) {
			return false;
		} 
	},
	
	markers: function (mapObj) {
		if (mapObj && mapObj.map) {
			this.map = mapObj.map;
			this.add = function (lat, lng, options) {
				 try {
					var position = new AMap.LngLat(lng, lat);
					var infoWindow = new AMap.InfoWindow({
						autoMove: options.autoMove ? true : false,
						closeWhenClickMap: options.closeWhenClickMap ? true : false,
						content: options.infoWindowContent || "",
						position: position
					});
					var offsetw = options.offsetw || 32, 
						offseth = options.offseth || 32,
						iconsize = new AMap.Size(offsetw, offseth),
						labelsize = new AMap.Size((0 - 3 * offsetw / 5), offseth),
						ICON = new AMap.Icon({
							image: options.icon,
							size: iconsize,
							imageSize: iconsize
						});
					
					var contentObj = document.createElement("DIV");
					contentObj.innerHTML = '<img src="'+options.icon+'" style="width:'+iconsize.getWidth()+'px;height:'+iconsize.getHeight()+'px;" /><div class="marker-label" style="background-color:#FFFFFF;padding:2px 2px 2px 2px;border:1px #000000 dashed;">'+options.title+'</div>';
					
					var marker = new AMap.Marker({
						map: this.map,
						position: position,
						offset: new AMap.Pixel(-(iconsize.getWidth()/2), -(iconsize.getHeight()/2)),
						icon: ICON,
						title: options.title,
						content: contentObj
					});
					mapObj.addOverlay(marker);
					
					options.map = this.map;
					options.marker = marker;
					options.infoWindow = infoWindow;
					options.position = position;
					options.icon = options.icon;
					options.iconsize = iconsize;
					options.title = options.title;
					
					var mks = new CREMapAPI.MarkerStruct(options);
					
					AMap.event.addListener(mks.marker, "click", function() {  
						mks.infoWindow.setContent(mks.html);
						mks.infoWindow.open(mks.map, mks.marker.getPosition());  
					});
					AMap.event.addListener(mks.infoWindow, "open", function() { 
						mks.infoWindowOpened = true;									
					});
					AMap.event.addListener(mks.infoWindow, "close", function() { 
						mks.infoWindowOpened = false;									
					});
					
					// - 上层的marker实际为mks 
					return mks;
				}
				catch (e) {	
				} 
			} 	
		} 
	}, 
	// - 绑定的标记
	MarkerStruct: function (options) {
		var Self = this;
		Self.marker = options.marker;
		Self.puid = options.puid;
		Self.map = options.map;
		Self.html = options.infoWindowContent;
		Self.infoWindow = options.infoWindow;
		Self.infoWindowOpened = false;
		Self.title = options.title;
		Self.icon = options.icon;
		Self.iconsize = options.iconsize;
		
		// - 设置文字标记内容
		Self.setLabel = function (label) {
			var contentObj = document.createElement("DIV");
			contentObj.innerHTML = '<img src="'+Self.icon+'" style="width:'+Self.iconsize.getWidth()+'px;height:'+Self.iconsize.getHeight()+'px;" /><div class="marker-label" style="background-color:#FFFFFF;padding:2px 2px 2px 2px;border:1px #000000 dashed;">'+label+'</div>';
			
			Self.title = label;
			Self.marker.setContent(contentObj);
			Self.marker.setTitle(label);
		};
		// - 设置图标
		Self.setIcon = function (icon) {
			var contentObj = document.createElement("DIV");
			contentObj.innerHTML = '<img src="'+icon+'" style="width:'+Self.iconsize.getWidth()+'px;height:'+Self.iconsize.getHeight()+'px;" /><div class="marker-label" style="background-color:#FFFFFF;padding:2px 2px 2px 2px;border:1px #000000 dashed;">'+Self.title+'</div>';
			
			Self.icon = icon;
			Self.marker.setContent(contentObj);
		};
		// - 移动位置
		Self.move = function (lat, lng, ifSetCenter) {
			if (typeof lat != "undefined" && typeof lng != "undefined") {
				var point = new AMap.LngLat(lng, lat);
				Self.marker.setPosition(point);
				if (ifSetCenter) Self.map.setCenter(point);
				// - 是否在最上显示
				Self.marker.setTop(ifSetCenter || false);
			}
		};
		// - 当前位置显示为地图中心位置
		Self.showCenter = function () {
			if (Self.map) {
				Self.map.setCenter(Self.marker.getPosition());	
			}
		};
		// - 设置所属地图
		Self.setMap = function (map) {
			if (Self.marker) {
				if (!map) {
					Self.marker.setMap(null);
					Self.infoWindow.close();
				}
				else {
					if (Self.marker.getMap()) {
						Self.marker.setMap(null);	
					}
					Self.marker.setMap(map);
					Self.map = map;
				}
			}
		};
		// - 设置显示级别
		Self.setZIndex = function(v) {
			if(Self.marker){
				Self.marker.setzIndex((v || 1000));	
			}
		};
		// - 设置显示级别
		Self.setInfoWindow = function(html) {  
			Self.html = html || Self.html;
			Self.infoWindow.setContent(Self.html);
			if(Self.infoWindowOpened == true) {
				Self.infoWindow.open(Self.map, Self.marker.getPosition());
			}
		};
	},
	
	TranslateGPSToXMapPoints: function(points, callbackFun) {
		try{
			if(points.constructor == Array){ 
				
			} 
		}
		catch(e) { 
		}
	},
	GPSConvertorPoint: function(lat, lng, callback) {
		try {
			var realPos = CREMapAPI.EvilTransform.transform(Number(lat), Number(lng));
			if (typeof callback == "function") {
				callback(realPos.mgLat, realPos.mgLon);
			}
			return realPos;
		}
		catch(e) { 
		}
	},
	
	geocode: function (lat, lng, object) {
		try {
			if (object && typeof AMap != "undefined" && typeof AMap.Geocoder != "undefined") {
				var identity = object._HANDLE + "_" + object.puid + "_" + object.gps_idx,
					_complete = "_amap_geo_cb_complete_" + identity,
					_error = "_amap_geo_cb_error_" + identity,
					_geo = "_amap_geo_" + identity,
					_listener_complete = "_amap_geo_listener_complete_" + identity,
					_listener_error = "_amap_geo_listener_error_" + identity;
					
				if (!window[_complete]) {
					window[_complete] = function (data) {
						CREMapAPI.Geocoder_complete.call(this, data, object);
					};
				}
				if (!window[_error]) {
					window[_error] = function (es) {
					};
				}
				if (!window[_geo]) {
					window[_geo] = new AMap.Geocoder();
					window[_listener_complete] 
						= AMap.event.addListener(window[_geo], "complete", window[_complete]);
					window[_listener_error] 
						= AMap.event.addListener(window[_geo], "error", window[_error]);
				}
				// 变更地址 
				window[_geo].getAddress(new AMap.LngLat(lng, lat));
			}
		}
		catch (e) {
		}
	},
	// 反向地理编码实际回调
	Geocoder_complete: function (data, object) {
		try {
			if (data && data.info == "OK" && data.regeocode && object) {
				object.geocode_callback && object.geocode_callback(object, (data.regeocode.formattedAddress || ""));		
			}
		}
		catch (e) {
		}
	},
	
	/*
	---
	remark: 地理坐标（GPS坐标）转成火星坐标（如Google、高德地图坐标）
	...
	*/
	EvilTransform: {
		pi: 3.14159265358979324,
		 //
        // Krasovsky 1940
        //
        // a = 6378245.0, 1/f = 298.3
        // b = a * (1 - f)
        // ee = (a^2 - b^2) / a^2;
        a: 6378245.0,
        ee: 0.00669342162296594323,

		transform: function (wgLat, wgLon)
        {
            if (this.outOfChina(wgLat, wgLon))
            {
                return {
					mgLat: wgLat,
					mgLon: wgLon
				};
            }
            var dLat = this.transformLat(wgLon - 105.0, wgLat - 35.0);
            var dLon = this.transformLon(wgLon - 105.0, wgLat - 35.0);
            var radLat = wgLat / 180.0 * this.pi;
            var magic = Math.sin(radLat);
            magic = 1 - this.ee * magic * magic;
            var sqrtMagic = Math.sqrt(magic);
            dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * this.pi);
            dLon = (dLon * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * this.pi);
            mgLat = wgLat + dLat;
            mgLon = wgLon + dLon;
			return {
				mgLat: mgLat,
				mgLon: mgLon
			};
        },
		outOfChina: function (lat, lon)
        {
            if (lon < 72.004 || lon > 137.8347)
                return true;
            if (lat < 0.8293 || lat > 55.8271)
                return true;
            return false;
        },
		transformLat: function (x, y)
        {
            var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * this.pi) + 20.0 * Math.sin(2.0 * x * this.pi)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(y * this.pi) + 40.0 * Math.sin(y / 3.0 * this.pi)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(y / 12.0 * this.pi) + 320 * Math.sin(y * this.pi / 30.0)) * 2.0 / 3.0;
            return ret;
        },
		transformLon: function (x, y)
        {
            var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * this.pi) + 20.0 * Math.sin(2.0 * x * this.pi)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(x * this.pi) + 40.0 * Math.sin(x / 3.0 * this.pi)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(x / 12.0 * this.pi) + 300.0 * Math.sin(x / 30.0 * this.pi)) * 2.0 / 3.0;
            return ret;
        },
		
		end: true
	},
	
	end: true
};
