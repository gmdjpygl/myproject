var CREMapAPI = {
	time: "2014.03.17",
	
	inited: false,
	
	mapObjects: [],
	markerLabel: null,
	geocoder: null,
	
	maps: function (callbackFun) {
		try {
			if (typeof BMap == "undefined" || typeof BMap.Map == "undefined") {
				CREMapAPI.inited = false;
				return false;	
			}
			else {
				CREMapAPI.inited = true;
			}
			
			var Self = this;
			
			Self.type = "baidumap";
			// - 此地图类型展示普通街道视图
			Self.defaultMTID = BMAP_NORMAL_MAP;
			// - 默认中心点
			Self.defaultPOS = new BMap.Point(117.2808, 31.8639);
			// - 默认级别
			Self.defaultZOOM = 13;
			
			Self.callbackFun = callbackFun || function () {};
			
			Self.options = null;
			Self.container = null;
			Self.map = null;
			Self.resize = null;
			Self.markers = null;
			Self.maptype = null; // 0,1
			Self.mapcenter = null;
			
			Self.initialize = function (options) {
				var options = options || {};
				if (!options.container && !options.containerId && !document.getElementById(options.containerId)) {
					return false;	
				}
				Self.container = options.container = options.container || options.containerId;
				
				Self.options = {
					mapType: options.mapTypeId || Self.defaultMTID,
					enableAutoResize: options.enableAutoResize,
					position: new BMap.Point(options.longitude, options.latitude) || Self.defaultPOS,
					zoom: options.zoom || Self.defaultZOOM
				};
				// - 创建Map实例
				Self.map = new BMap.Map(Self.container, Self.options); 
				// - 初始化地图,设置中心点坐标和地图级别
				Self.map.centerAndZoom(Self.options.position, Self.options.zoom);  
				// - 启用滚轮放大缩小
				Self.map.enableScrollWheelZoom();
				// - 添加地图类型控件
				// Self.map.addControl(new BMap.MapTypeControl());
				// equals + {BMAP_PERSPECTIVE_MAP}
				Self.map.addControl
				(
					new BMap.MapTypeControl
					(
					 	{
							mapTypes: [
								BMAP_NORMAL_MAP, // 此地图类型展示普通街道视图
								BMAP_SATELLITE_MAP, // 此地图类型展示卫星视图
								BMAP_HYBRID_MAP// , 	// 此地图类型展示卫星和路网的混合视图
								// BMAP_PERSPECTIVE_MAP  // 此地图类型展示透视图像视图
							],
							anchor: BMAP_ANCHOR_TOP_RIGHT
						}
					)
				);  
				// - 添加平移缩放控件
				Self.map.addControl(new BMap.NavigationControl());  
				// - 添加比例尺控件
				Self.map.addControl(new BMap.ScaleControl());  
				// - 添加缩放地图控件
				Self.map.addControl(new BMap.OverviewMapControl());
				
				CREMapAPI.mapObjects.push(Self.map);  
				// - 创建地理编码实例 
				CREMapAPI.geocoder = new BMap.Geocoder(); 
				Self.markers = new CREMapAPI.markers(Self);
				
				// - 绑定一些事件
				if (typeof EventWrapper != "undefined") {
					// - 监听地图大小变化
					EventWrapper.addListener(Self.map, "resize", function (options) {
						options = options || {};
						
						var center = this.getCenter();
						if (typeof options.lat != "undefined" && typeof options.lng != "undefined") {
							center = new BMap.Point(lng, lat); 
						}
						this.setCenter(center);
						Self.mapcenter = center;
						if (typeof Self.callbackFun == "function") {
							Self.callbackFun("resize");	
						}
					});
					// - 设置中心点
					Self.resize = function (lat, lng) {
						if (Self.map) {
							EventWrapper.trigger(Self.map, "resize", {lat: lat, lng: lng});	
						}
					};
					// - 监听地图类型改变
					EventWrapper.addListener(Self.map, "maptypechange", function () {
						if (typeof Self.callbackFun == "function") {
							Self.maptype = this.getMapType();
							Self.callbackFun("maptypeid_changed", this.getMapType());	
						}
					});
					// - 监听地图拖拽结束
					EventWrapper.addListener(Self.map, "dragend", function () {
						// - 触发类型改变
						EventWrapper.trigger(this, "maptypechange"); 
					});
					// - 监听地图级别改变结束
					EventWrapper.addListener(Self.map, "zoomend", function () {
						// - 触发类型改变
						EventWrapper.trigger(this, "maptypechange"); 
					});
					// - 当地图所有图块完成加载时触发此事件
					EventWrapper.addListener(Self.map, "tilesloaded", function () {
						EventWrapper.trigger(this, "zoomend");
					});
				}
			};
			
			// - 移除地图显示
			Self.undo = function () {
				if (Self.map) {
					if (Self.container) {
						var childs = Self.container.childNodes;
						for (var i = 0; i < childs.length; i++) {
							if (childs[i]) {
								 Self.container.removeChild(childs[i]);	
							}
						}
						Self.map = null;
						Self.mapcenter = null;
						Self.maptype = null;
					} 
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
						path.push(new BMap.Point(gps.longitude, gps.latitude));	
					}
				}
				try {
					var polyline = new BMap.Polyline(
						path, {
							strokeColor: "#00AAFF",
							strokeWeight: 3,
							strokeOpacity: 0.8,
							enableEditing: false
						}
					);	
					if (typeof EventWrapper != "undefined") {
						EventWrapper.addListener(polyline, "mouseover", function () {
							this.setStrokeColor("blue"); 
							this.setStrokeOpacity(1);
						});	
						EventWrapper.addListener(polyline, "mouseout", function () {
							this.setStrokeColor("#00AAFF"); 
							this.setStrokeOpacity(0.8);
						});	
					}
					// - 添加到标记
					Self.addOverlay(polyline);
					return polyline;
				}
				catch (e) {
				}
			};
			
			// - 叠加覆盖物
			Self.addOverlay = function (overlay) {
				if (Self.map) {
					Self.map.addOverlay(overlay);
					return overlay;
				}
			};
			// - 移除覆盖物
			Self.removeOverlay = function (overlay) {
				if (Self.map) {
					Self.map.removeOverlay(overlay);
					overlay = null;
					return overlay;
				}
			};
				
			var rularStruct = function () {
				var me = this; 
				this.markers = [];
				this.startMarker = null;
				this.activeMarker = null;
				this.endMarker = null;
				this.active = true;
				this.totalDistance = 0;
				this.polyline = null;
				this.activePolyline = null;
				this.draw = function (mode) {
					var len = me.markers.length;
					if (len <= 0) return false;
					if (me.activePolyline != null) {
						me.activePolyline = Self.removeOverlay(me.activePolyline);	
					}	
					
					// - 计算总测距
					var lastMarker = me.markers[len - 1];
					
					if (mode != "virtualMove") {
						if (me.polyline != null) {
							me.polyline = Self.removeOverlay(me.polyline);
						}
						if (len <= 1) return false;
						
						var path = [];
						for (var i = 0; i < len; i++) {
							path.push(me.markers[i].getPosition());	
						}
						me.polyline = new BMap.Polyline(
							path, {
								strokeColor: "#0000FF",
								strokeWeight: 2,
								strokeOpacity: 0.8,
								enableEditing: false
							}
						);
						// - 添加到标记
						Self.addOverlay(me.polyline);
						
						var prevMarker = me.markers[len - 2];
						
						var distance = Self.map.getDistance(prevMarker.getPosition(), lastMarker.getPosition());
						me.totalDistance += (distance || 0);
						
						var content = "";
						if (me.totalDistance <= 1000) {
							content = Number(me.totalDistance).toFixed(3) + "米";	
						}
						else {
							content = Number(me.totalDistance/1000).toFixed(3) + "公里";	
						}
						var label = new BMap.Label(
							content, {
								offset: new BMap.Size(5, 5)					   
							}
						);
						lastMarker.setLabel(label);
					}
					else {
						// - 算上额外浮动的点
						var activeDistance = Self.map.getDistance(lastMarker.getPosition(), me.activeMarker.getPosition());
						if (activeDistance >= 0) {
							activeDistance += me.totalDistance;
							var activeContent = "总长：";
							if (activeDistance <= 1000) {
								activeContent += Number(activeDistance).toFixed(3) + "米";	
							}
							else {
								activeContent += Number(activeDistance/1000).toFixed(3) + "公里";	
							}
							activeContent += me.activeMarker.defaultLabelText;
							me.activeMarker.getLabel().setContent(activeContent);
						}
						
						// - 画动态线
						var activePath = [lastMarker.getPosition(), me.activeMarker.getPosition()];
						
						me.activePolyline = new BMap.Polyline(
							activePath, {
								strokeColor: "#0000FF",
								strokeStyle: "dashed",
								strokeWeight: 2,
								strokeOpacity: 0.8,
								enableEditing: false
							}
						);
						Self.addOverlay(me.activePolyline);/**/
					} 
				};
				this.remove = function () {
					var me = this;
					if (this.polyline != null) {
						this.polyline = Self.removeOverlay(this.polyline);
					}
					if (this.activePolyline != null) {
						this.activePolyline = Self.removeOverlay(this.activePolyline);	
					}
					for (var i = 0; i < me.markers.length; i++) {
						Self.removeOverlay(me.markers[i]);
					}
					me.markers = [];
				};
				this.guid = rularStruct.guid++;
			};
			// - 相当于静态变量
			rularStruct.guid = 0;
			
			// - 清除所有测距
			Self.clearDistance = function () {
				if (Self.map) {
					if (typeof Self.Rular == "undefined") {
						Self.Rular.removeAll();
					}
				}
			};
			// - 使能测距
			Self.enableDistance = function () {
				if (Self.map) {
					if (typeof Self.Rular == "undefined") {
						Self.Rular = {
							active: false,
							_originalActive: false,
							clickEvent: null,
							dblclickEvent: null,
							mousemoveEvent: null,
							curEditing: null,
							rularStore: [],
							polylines: [],
							remove: function (GUID) {
								if (typeof GUID != "undefined") {
									for (var i = 0; i < Self.Rular.rularStore.length; i++) {
										var item = Self.Rular.rularStore[i];
										if (item.guid == GUID) {
											item.remove();
											Self.Rular.rularStore.splice(i, 1);
											break;
										}
									}
								}
							},
							removeAll: function () {
								for (var i = 0; i < Self.Rular.rularStore.length; i++) {
									Self.Rular.rularStore[i].remove();
								}
								Self.Rular.rularStore = [];
								
								rularStruct.guid = 0;
							}
						};
					}
					if (Self.Rular.active) {
						return true;	
					}
					
					Self.Rular.active = true;
					Self.Rular._originalActive = true;
					
					Self.map.disableDoubleClickZoom();
					
					BMap.Marker.prototype.defaultLabelText = "<div><font color='gray'>单击选择地点，双击结束</font></div>";
					var dynamicMarker = new BMap.Marker(Self.map.getCenter(), {
						icon: new BMap.Icon("images/baidumap/marker_node.png", new BMap.Size(8, 8))
					});
					Self.addOverlay(dynamicMarker);
					Self.Rular.dynamicMarker = dynamicMarker;
					
					if (typeof EventWrapper != "undefined") {
						
						Self.Rular.mousemoveEvent = EventWrapper.addListener(Self.map, "mousemove", function (result) {
							if (Self.Rular.active && result.point) {
								if (result.pixel) {
									if (result.pixel.x < 0 || result.pixel.y < 0) {
										return false;	
									}
								}
								var pixel = Self.map.pointToOverlayPixel(result.point);
								var offset_point = Self.map.overlayPixelToPoint(new BMap.Pixel(pixel.x, pixel.y - 20));
								
								if (Self.Rular.curEditing) {
									var activeMarker = Self.Rular.curEditing.activeMarker;
									activeMarker.setPosition(offset_point);
									Self.Rular.curEditing.draw("virtualMove");
								}
								else {
									if (Self.Rular.dynamicMarker) {
										Self.Rular.dynamicMarker.setPosition(offset_point);
										if (!Self.Rular.dynamicMarker.getLabel()) {
											Self.Rular.dynamicMarker.setLabel(
												new BMap.Label(
													(Self.Rular.dynamicMarker.defaultLabelText || ""), {
														offset: new BMap.Size(20, 10)					   
													}
												)
											);
										}
										else {
											Self.Rular.dynamicMarker.getLabel().setContent(Self.Rular.dynamicMarker.defaultLabelText);
										}
									}
								}
							}
						});
						Self.Rular.clickEvent = EventWrapper.addListener(Self.map, "click", function (result) {
							// console.log("click -> " + result.point.lat + "::" + result.point.lng);		
							
							if (Self.Rular.active) {
								if (result.pixel) {
									if (result.pixel.x < 0 || result.pixel.y < 0) {
										return false;	
									}
								}
								var pixel = Self.map.pointToOverlayPixel(result.point);
								var offset_point = Self.map.overlayPixelToPoint(new BMap.Pixel(pixel.x, pixel.y - 20));
								
								var size = new BMap.Size(8, 8);
								var tmpMarker = new BMap.Marker(offset_point, {
									icon: new BMap.Icon("images/baidumap/marker_node.png", size)							
								});
								Self.addOverlay(tmpMarker);
							
								if (!Self.Rular.curEditing) {
									var label = new BMap.Label(
										"起点", {
											offset: size					   
										}
									);
									tmpMarker.setLabel(label); 
									
									Self.Rular.dynamicMarker.setLabel(
										new BMap.Label(
											(Self.Rular.dynamicMarker.defaultLabelText || ""), {
												offset: new BMap.Size(20, 10)					   
											}
										)
									);
									Self.Rular.dynamicMarker.setTop(true);
									
									var rs = new rularStruct();
									rs.startMarker = tmpMarker;
									rs.activeMarker = Self.Rular.dynamicMarker; // activeMarker;
									
									Self.Rular.curEditing = rs;
									Self.Rular.rularStore.push(rs);
								}
								Self.Rular.curEditing.markers.push(tmpMarker);
								
								// - 划线
								Self.Rular.curEditing.draw();
							}
						});	
						Self.Rular.dblclickEvent = EventWrapper.addListener(Self.map, "dblclick", function (result) {
							// console.log("dblclick");
							if (Self.Rular.active && result.point) {
								if (Self.Rular.curEditing) {
									if (result.pixel) {
										if (result.pixel.x < 0 || result.pixel.y < 0) {
											return false;	
										}
									}
									var pixel = Self.map.pointToOverlayPixel(result.point);
									var offset_point = Self.map.overlayPixelToPoint(new BMap.Pixel(pixel.x, pixel.y - 20));
									
									var markers = Self.Rular.curEditing.markers;
									if (markers.length <= 1) return false;
									var lastMarker = markers.pop();
									// - 移除最后一个点
									Self.removeOverlay(lastMarker);
									
									if (markers.length > 1) {
										lastMarker = markers.pop();
										// - 再移除一个点
										Self.removeOverlay(lastMarker);	
									}
									
									// - 新建一个点
									var totalDistance = Self.Rular.curEditing.totalDistance;
									if (totalDistance >= 0) {
										if (totalDistance <= 1000) {
											totalDistance = Number(totalDistance).toFixed(3) + "米";	
										}
										else {
											totalDistance = Number(totalDistance/1000).toFixed(3) + "公里";	
										}	
									}
									var tmpMarker = new BMap.Marker(offset_point, {
										icon: new BMap.Icon(
											"images/baidumap/marker_ending.png", 
											new BMap.Size(20, 20)
										)
									});
									Self.addOverlay(tmpMarker);
									Self.Rular.curEditing.markers.push(tmpMarker);
									
									// - 添加讫点单击事件									
									var GUID = Self.Rular.curEditing.guid;
									EventWrapper.addListener(tmpMarker, "click", function(e) {
										Self.Rular.remove(GUID);
										if (Self.Rular.dynamicMarker) {
											Self.Rular.dynamicMarker.show();	
										}
										setTimeout(function () {
											Self.Rular.active = Self.Rular._originalActive;
										}, 50);
										
										/*
										Self.Rular.active = Self.Rular._originalActive;
										var e = typeof e != "undefined" ? e : event;
										if (typeof e.cancelBubble != "undefined") e.cancelBubble = true;
										if (typeof e.preventDefault != "undefined") e.preventDefault();
										if (typeof e.stopPropagation != "undefined") e.stopPropagation();
										*/
										return false;
									});
									EventWrapper.addListener(tmpMarker, "mouseover", function() {
										Self.Rular.active = false;
										
										if (Self.Rular.dynamicMarker) {
											Self.Rular.dynamicMarker.hide();	
										}
									});
									EventWrapper.addListener(tmpMarker, "mouseout", function() {
										Self.Rular.active = Self.Rular._originalActive;
										if (Self.Rular.dynamicMarker) {
											Self.Rular.dynamicMarker.show();	
										}
									});
									
									// - 划线
									Self.Rular.curEditing.draw();
									
									tmpMarker.getLabel().setContent("讫点，总长：" + totalDistance + "<div><font color='gray'>点击图标消除此次测距</font></div>");
									tmpMarker.getLabel().setOffset(new BMap.Size(20, 10));
									Self.Rular.curEditing.endMarker = tmpMarker;
									
									if (Self.Rular.curEditing.activeMarker) {
										var activeMarker = Self.Rular.curEditing.activeMarker;
										activeMarker.getLabel().setContent(Self.Rular.dynamicMarker.defaultLabelText);
									}
									
									Self.Rular.curEditing = null;
								}
							}
						});	
					}
					return true;
				} 
			};
			// - 不使能测距
			Self.disableDistance = function (removeAll) {
				if (Self.map) {
					if (typeof Self.Rular == "undefined" || !Self.Rular.active) {
						return true;	
					}
					Self.Rular.active = false;
					Self.Rular._originalActive = false;
					Self.Rular.curEditing = null;
					
					if (removeAll === true) {
						Self.Rular.removeAll();
					}
					
					Self.map.enableDoubleClickZoom();
					
					if (Self.Rular.dynamicMarker != null) {
						Self.removeOverlay(Self.Rular.dynamicMarker);
						Self.Rular.dynamicMarker = null;	
					}
					
					if (typeof EventWrapper != "undefined") {
						EventWrapper.removeListener(Self.Rular.clickEvent);	
						EventWrapper.removeListener(Self.Rular.dblclickEvent);
						EventWrapper.removeListener(Self.Rular.mousemoveEvent);
					}
					return true;
				}
			};
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
					var position = new BMap.Point(lng, lat);
					var infoWindow = new BMap.InfoWindow(
						options.infoWindowContent, {
							// title: options.title,
							enableAutoPan: false,
							maxWidth: 300 
						}
					);  
					var offsetw = options.offsetw || 32, 
						offseth = options.offseth || 32,
						iconsize = new BMap.Size(offsetw, offseth),
						labelsize = new BMap.Size((0 - 3 * offsetw / 5), offseth),
						icon = new BMap.Icon(options.icon, iconsize),
						label = new BMap.Label(options.title, {
							offset: labelsize,
							position: position
						});
					
					label.setTitle(options.title);
					
					var marker = new BMap.Marker(
						position, {
							icon: icon,
							title: options.title
						}
					);
					marker.setLabel(label);
					// - 添加一个Marker
					mapObj.addOverlay(marker);
					
					options.map = this.map;
					options.marker = marker;
					options.infoWindow = infoWindow;
					options.position = position;
					options.icon = icon;
					options.iconsize = iconsize;
					options.label = label;
					options.labelsize = labelsize;
					
					var mks = new CREMapAPI.MarkerStruct(options);
					
					if(typeof EventWrapper != "undefined") { 
						EventWrapper.addListener(mks.marker, "click", function() {  
							mks.infoWindow.setContent(mks.html);
							this.openInfoWindow(mks.infoWindow);  
						});
						EventWrapper.addListener(mks.marker, "infowindowopen", function() { 
							mks.infoWindowOpened = true;									
						});
						EventWrapper.addListener(mks.marker, "infowindowclose", function() { 
							mks.infoWindowOpened = false;									
						});
					}
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
		Self.label = options.label;
		// - 设置文字标记内容
		Self.setLabel = function (label) {
			if (Self.label) {
				Self.label.setContent(label);	
			}
			else {
				Self.label = new BMap.Label(
					label, {
						offset: options.labelsize,
						position: options.position
					}
				);	
			}
			Self.label.setTitle(label);
		};
		// - 设置图标
		Self.setIcon = function (icon) {
			if (!Self.icon) {
				Self.icon = new BMap.Icon(icon, options.iconsize); 
			}
			else {
				Self.icon.setImageUrl(icon);	
			}
			Self.marker.setIcon(Self.icon);
		};
		// - 移动位置
		Self.move = function (lat, lng, ifSetCenter) {
			if (typeof lat != "undefined" && typeof lng != "undefined") {
				var point = new BMap.Point(lng, lat);
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
					Self.marker.getMap().removeOverlay(Self.marker);
				}
				else {
					if (Self.marker.getMap()) {
						Self.marker.getMap().removerOverlay(Self.marker);	
					}
					map.addOverlay(Self.marker);
					Self.map = map;
				}
			}
		};
		// - 设置显示级别
		Self.setZIndex = function(v) {
			if(Self.marker){
				Self.marker.setZIndex((v || 1000));	
			}
		};
		// - 设置显示级别
		Self.setInfoWindow = function(html) {  
			Self.html = html || Self.html;
			Self.infoWindow.setContent(Self.html);
			if(Self.infoWindowOpened == true){
				Self.marker.openInfoWindow(Self.infoWindow);
			}
		};
	},
	
	TranslateGPSToXMapPoints: function(points, callbackFun) {
		try{
			if(points.constructor == Array){ 
				BMap.Convertor.transMore(points, 0, callbackFun); 
			} 
		}
		catch(e) { 
		}
	},
	
	GPSConvertorPoint: function(lat, lng, callback) {
		try {
			
			if(BMap) {
				var oPoint = new BMap.Point(lng, lat);
				
				BMap.Convertor.translate(
					oPoint, 
					0,
					function(point) {
						if(typeof callback == "function") {
							if (point.constructor == Array) {
								point = point[0];	
							}
							callback(point.lat, point.lng);	
						}
					}
				); 
			}
		}
		catch(e) { 
		}
	}, 
	
	// - 反向地理编码
 	geocode: function(lat, lng, object) {
		try{
			if(CREMapAPI.geocoder && CREMapAPI.geocoder != null) { 
				// 根据坐标得到地址描述  
 				CREMapAPI.geocoder.getLocation(
					new BMap.Point(lng, lat),
					function(result) { 
						if( result && typeof result.address != "undefined" ) { 
							// alert(Object.toJSON(result))
							if(object && typeof object.geocode_callback == "function") {
								object.geocode_callback(object, (result.address || ""));
							}
						}
					}
				);
			} 
		}
		catch(e){ 
		}
	},
	
	end: true
};

// --------------------------------------------------------------------------------------------------------------------------
/** 
* 百度地图API事件包装器，以类似google map api事件调用 
* 方式使用百度地图API 
* 此代码使用closure compiler压缩 
* @author JZ 
* @version 1.0 
*/
 
 (function(){
/** 
* 命名空间 */
window['EventWrapper'] = window['EventWrapper'] || {};

var e_wpr = window['EventWrapper'];
/** 
* 添加DOM事件监听函数 
* @param HTMLElement DOM元素 
* @param String 事件名称 
* @param Function 事件处理函数 
* @returns MapsEventListener 事件监听对象 
*/
e_wpr['addDomListener'] = function(instance, eventName, handler) {    
	if (instance.addEventListener) {        
		instance.addEventListener(eventName, handler, false);    
	}    
	else if (instance.attachEvent) {        
		instance.attachEvent('on' + eventName, handler);    
	}    
	else {        
		instance['on' + eventName] = handler;    
	}    
	return new MapsEventListener(instance, eventName, handler, MapsEventListener.DOM_EVENT);
};

/** 
* 添加DOM事件监听函数，函数仅执行一次 
* @param HTMLElement DOM元素 
* @param String 事件名称 
* @param Function 事件处理函数 
* @returns MapsEventListener 事件监听对象 
*/
e_wpr['addDomListenerOnce'] = function(instance, eventName, handler) {    
	var eventListener = e.addDomListener(instance, eventName, function(){        
		// 移除        
		e.removeListener(instance, eventName, handler);        
		return handler.apply(this, arguments);    
	});    
	return eventListener;
};
/** 
* 添加地图事件监听函数 
* @param Object 实例 
* @param String 事件名称 
* @param Function 事件处理函数 
* @returns MapsEventListener 事件监听对象 
*/
e_wpr['addListener'] = function(instance, eventName, handler) {    
	instance.addEventListener(eventName, handler);    
	return new MapsEventListener(instance, eventName, handler, MapsEventListener.MAP_EVENT);
};
/** 
* 添加地图事件监听函数，函数仅执行一次 
* @param Object 实例 
* @param String 事件名称 
* @param Function 事件处理函数 
* @returns MapsEventListener 事件监听对象 
*/
e_wpr['addListenerOnce'] = function(instance, eventName, handler){    
	var eventListener = e.addListener(instance, eventName, function(){        
		// 移除        
		e.removeListener(eventListener);        
		return handler.apply(this, arguments);    
	});    
	return eventListener;
};
/** 
* 移除特定实例的所有事件的所有监听函数 
* @param Object 
*/
e_wpr['clearInstanceListeners'] = function(instance) {    
	var listeners = instance._e_ || {};    
	for (var i in listeners) {        
		e_wpr['removeListener'](listeners[i]);    
	}    
	instance._e_ = {};
};
/** 
* 移除特定实例特定事件的所有监听函数 
* @param Object 实例 
* @param string 事件名 
*/
e_wpr['clearListeners'] = function(instance, eventName) {    
	var listeners = instance._e_ || {};    
	for (var i in listeners) {        
		if (listeners[i]._eventName == eventName) {            
			e_wpr['removeListener'](listeners[i]);        
		}    
	}
};
/** 
* 移除特定的事件监听函数 
* @param MapsEventListener 
*/
e_wpr['removeListener'] = function(listener) {    
	var instance = listener._instance;    
	var eventName = listener._eventName;    
	var handler = listener._handler;    
	var listeners = instance._e_ || {};    
	for (var i in listeners) {        
		if (listeners[i]._guid == listener._guid) {            
			if (listener._eventType == MapsEventListener.DOM_EVENT) {                
				// DOM事件                
				if (instance.removeEventListener) {                    
					instance.removeEventListener(eventName, handler, false);                
				}                
				else if (instance.detachEvent) {                    
					instance.detachEvent('on' + eventName, handler);                
				}                
				else {                    
					instance['on' + eventName] = null;                
				}            
			}            
			else if (listener._eventType == MapsEventListener.MAP_EVENT) {                
				// 地图事件                
				instance.removeEventListener(eventName, handler);            
			}            
			delete listeners[i];        
		}    
	}
};

/** 
* 触发特定事件 
* @param Object 实例 
* @param string 事件名称 
*/
e_wpr['trigger'] = function(instance, eventName) {    
	var listeners = instance._e_ || {};    
	for (var i in listeners) {      
		if (listeners[i]._eventName == eventName) {            
			var args = Array.prototype.slice.call(arguments, 2);        
			listeners[i]._handler.apply(instance, args);        
		}    
	}
};
/** 
* 事件监听对象 
* @private 
* @param Object 对象实例 
* @param string 事件名称 
* @param Function 事件监听函数 
* @param EventTypes 事件类型 
*/
function MapsEventListener(instance, eventName, handler, eventType){    
	this._instance = instance;    
	this._eventName = eventName;    
	this._handler = handler;    
	this._eventType = eventType;    
	this._guid = MapsEventListener._guid ++;    
	this._instance._e_ = this._instance._e_ || {};    
	this._instance._e_[this._guid] = this;
}

MapsEventListener._guid = 1;
MapsEventListener.DOM_EVENT = 1;
MapsEventListener.MAP_EVENT = 2;

})();
 
// --------------------------------------------------------------------------------------------------------------------------