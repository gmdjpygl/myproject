var CREMapAPI = {
	time: "2014.04.10",
	
	inited: false,
	
	mapObjects: [],
	markerLabel: null,
	geocoder: null,
	directionsService: null,
	
	maps: function (callbackFun) {
		try {
			if (typeof google == "undefined" || typeof google.maps == "undefined") {
				CREMapAPI.inited = false;
				return false;
			}
			else {
				CREMapAPI.inited = true;
			}
			
			var Self = this;
			
			Self.type = "googlemap";
			// - 此地图类型展示普通街道视图
			Self.defaultMTID = google.maps.MapTypeId.ROADMAP;
			// - 默认中心点
			Self.defaultPOS = new google.maps.LatLng(31.8639, 117.2808);
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
			
			Self.moveflag = false;
			
			// - 创建一个地图显示
			Self.initialize = function (options) {
				try {
					var options = options || {};
					if (!options.container && !options.containerId && !document.getElementById(options.containerId)) {
						return false;	
					}
					Self.container = options.container = options.container || options.containerId;
					if (typeof Self.container == "string") {
						Self.container = document.getElementById(options.containerId);
					}
					
					Self.options = {
						center: new google.maps.LatLng(options.latitude, options.longitude) || Self.defaultPos,
						zoom: typeof options.zoom != "undefined" && !isNaN(options.zoom) ? options.zoom : Self.defaultZOOM,
						mapTypeId: options.mapTypeId || Self.defaultMTID,
						streetViewControl: typeof options.streetViewControl != "undefined" ? options.streetViewControl : false,
						overviewMapControl: typeof options.OMC != "undefined" ? options.OMC : true,
						overviewMapControlOptions: {
							opened: typeof options.OMC_opened != "undefined" ? options.OMC_opened : false
						},
						rotateControl: typeof options.rotateControl != "undefined" ? options.rotateControl : true,
						scaleControl: typeof options.scaleControl != "undefined" ? options.scaleControl : true 
					};
				
					Self.maptype = 0;
					Self.mapcenter = Self.options.center;
					
					// - 嵌入显示地图
					Self.map = new google.maps.Map(Self.container, Self.options);
					
					CREMapAPI.mapObjects.push(Self.map);
					CREMapAPI.defineMarkerLabel();
					CREMapAPI.geocoder = new google.maps.Geocoder();
					CREMapAPI.directionsService = new google.maps.DirectionsService(); 
					
					Self.markers = new CREMapAPI.markers(Self);
					
					// - 侦测地图改变大小事件
					google.maps.event.addListener(Self.map, "resize", function(options) {
						options = options || {};
						
						var center = this.getCenter();
						if (typeof options.lat != "undefined" && typeof options.lng != "undefined") {
							center = new google.maps.LatLng(options.lat, options.lng);
						}
						this.setCenter(center);
						Self.mapcenter = center;
						if(typeof Self.callbackFun == "function") {
							Self.callbackFun("resize");
						} 												
					});
					// - 设置中心点
					Self.resize = function(lat, lng) { 
						if(Self.map) {
							google.maps.event.trigger(Self.map, "resize", {lat: lat, lng: lng});
						}
					};
					// - 侦测地图中心位置变化事件
					google.maps.event.addListener(Self.map, "center_changed", function() {
						Self.mapcenter = this.getCenter();
					});
					// - 侦测地图类型变化事件
					google.maps.event.addListener(Self.map, "maptypeid_changed", function() {
						Self.maptype = 0;
						switch (this.getMapTypeId()) {
							case google.maps.MapTypeId.HYBRID:
							case google.maps.MapTypeId.SATELLITE:
								Self.maptype = 1;
								break;
						}
						if(typeof Self.callbackFun == "function") {
							Self.callbackFun("maptypeid_changed", this.getMapTypeId());
						}  
					});
					
					// - 侦测地图拖动开始事件
					google.maps.event.addListener(Self.map, "dragstart", function() {
						Self.moveflag = true;	
						if(typeof Self.callbackFun == "function") {
							Self.callbackFun("dragstart", this.getMapTypeId());
						}  														   
					});
					// - 侦测地图拖动结束事件
					google.maps.event.addListener(Self.map, "dragend", function() {
						Self.moveflag = false;	
						if(typeof Self.callbackFun == "function") {
							Self.callbackFun("dragend", this.getMapTypeId());
						}								   
						// - 触发类型改变	
						google.maps.event.trigger(this, "maptypeid_changed");
					});
					// - 侦测地图缩放级别变化事件
					google.maps.event.addListener(Self.map, "zoom_changed", function() {
						// - 触发类型改变	
						google.maps.event.trigger(this, "maptypeid_changed");
						
						if (typeof Self.callbackFun == "function") {
							Self.callbackFun("zoom_changed", this.getCenter);
											 
						}
					});
					google.maps.event.trigger(Self.map, "zoom_changed");
				}
				catch (e) {
				}
			};
			
			// - 移除一个地图显示
			Self.undo = function () {
				if(Self.map) {
					if (Self.container) {
						var childs = Self.container.childNodes;
						for (var i = 0; i < childs.length; i++) {
							if (childs[i]) {
								 Self.container.removeChild(childs[i]);	
							}
						}	
					}
					Self.map = null;
					Self.mapcenter = null;
					Self.maptype = null;
				}
			};
			// - 放大级别
			Self.zoomIn = function () {
				if (Self.map) {
					Self.map.setZoom(Self.map.getZoom() + 1);
				}
			};
			// - 缩小级别
			Self.zoomOut = function () {
				if (Self.map) {
					Self.map.setZoom(Self.map.getZoom() - 1);
				}
			};
			// - 划折线，返回一个折线实例对象polyline，移除时可设置polyline.setMap(null);
			Self.polyline = function(gpsdatalist) {
				try {
					var path = [];
					for (var i = gpsdatalist.length - 1; i >= 0; i--) {
						var gps = gpsdatalist[i];
						if (typeof gps.longitude != "undefined" && typeof gps.latitude != "undefined") {
							path.push(new google.maps.LatLng(gps.latitude, gps.longitude));	
						}
					}
					var polyline = new google.maps.Polyline({
						clickable: true,
						path: path,
						strokeColor: "#00AAFF",
						strokeWeight: 3,
						strokeOpacity: 0.8
					});
					google.maps.event.addListener(polyline, "mouseover", function () {
						this.setOptions({
							strokeColor: "blue",
							strokeOpacity: 1
						});
					});
					google.maps.event.addListener(polyline, "mouseout", function () {
						this.setOptions({
							strokeColor: "#00AAFF",
							strokeOpacity: 0.8
						});
					});
					// - 添加标记
					polyline.setMap(Self.map);
					return polyline;
				}
				catch (e) {	
				}
			};
			
			// - 添加Overlay
			this.addOverlay = function(overlay) {
				if(Self && Self.map) {
					if(overlay && overlay.setMap) {
						overlay.setMap(Self.map);  
						return overlay;
					}
				}
			}; 
			// - 移除Overlay
			this.removeOverlay = function(overlay) {
				if(Self && Self.map) {
					if(overlay && overlay.setMap) {
						overlay.setMap(null);  
						overlay = null; 
						return overlay;
					}
				}
			};
			
			/*
			---
			time: 2014.04.14
			remark: 测距功能
			...
			*/
			this._latLngToPoint = function (latLng, zoom) {
				if (Self.map) {
					var normalizedPoint = Self.map.getProjection().fromLatLngToPoint(latLng); // returns x,y normalized to 0~255
					var scale = Math.pow(2, (zoom || Self.map.getZoom()));
					var pixelCoordinate = new google.maps.Point(normalizedPoint.x * scale, normalizedPoint.y * scale);
					return pixelCoordinate;	
				}
			};
			this._pointToLatLng = function (point, zoom) {
				if (Self.map) {
					var scale = Math.pow(2, (zoom || Self.map.getZoom()));
					var normalizedPoint = new google.maps.Point(point.x / scale, point.y / scale);
					var latlng = Self.map.getProjection().fromPointToLatLng(normalizedPoint);
					return latlng;
				}
			};
			// - 获得两点间距离
			this._getDistance = function (startingLatLng, endingLatLng) {
				if (Self.map && startingLatLng && endingLatLng) {
					try {
						var distance = 0;
						
						var lat = [startingLatLng.lat(), endingLatLng.lat()]  
						var lng = [startingLatLng.lng(), endingLatLng.lng()] //var R = 6371; // km (change this constant to get miles)  
						var R = 6378137; // In meters  
						var dLat = (lat[1] - lat[0]) * Math.PI / 180;  
						var dLng = (lng[1] - lng[0]) * Math.PI / 180;  
						var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);  
						var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));  
						
						distance = R * c;
					}
					catch (e) {
					}
					finally {
						return distance || 0;
					};
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
					try {
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
							me.polyline = new google.maps.Polyline({
									path: path,
									strokeColor: "#0000FF",
									strokeWeight: 2,
									strokeOpacity: 0.8,
									clickable: false
							});
							// - 添加到标记
							Self.addOverlay(me.polyline);
							
							var prevMarker = me.markers[len - 2];
							
							var distance = Self._getDistance(prevMarker.getPosition(), lastMarker.getPosition());
							me.totalDistance += (distance || 0);
							
							var content = "";
							if (me.totalDistance <= 1000) {
								content = Number(me.totalDistance).toFixed(3) + "米";	
							}
							else {
								content = Number(me.totalDistance/1000).toFixed(3) + "公里";	
							}
							lastMarker.setLabel(content);
						}
						else {
							// - 算上额外浮动的点
							var activeDistance = Self._getDistance(lastMarker.getPosition(), me.activeMarker.getPosition());
							if (activeDistance >= 0) {
								activeDistance += me.totalDistance;
								var activeContent = "总长：";
								if (activeDistance <= 1000) {
									activeContent += Number(activeDistance).toFixed(3) + "米";	
								}
								else {
									activeContent += Number(activeDistance/1000).toFixed(3) + "公里";	
								}
								activeContent += defaultLabelText;
								me.activeMarker.setLabel(activeContent);
							}
							
							// - 画动态线
							var activePath = [lastMarker.getPosition(), me.activeMarker.getPosition()];
							
							me.activePolyline = new google.maps.Polyline({
								path: activePath,
								strokeColor: "#A2A7FA",
								strokeWeight: 2,
								strokeOpacity: 0.8,
								clickable: false
							});
							Self.addOverlay(me.activePolyline);	
						}
					}
					catch (e) {
					}
				};
				this.remove = function () {
					if (this.polyline != null) {
						this.polyline = Self.removeOverlay(this.polyline);	
					}
					if (this.activePolyline != null) {
						this.activePolyline = Self.removeOverlay(this.activePolyline);	
					}
					for (var i = 0; i < me.markers.length; i++) {
						me.markers[i].setMap(null);
					}
					me.markers = [];
				};
				this.guid = rularStruct.guid++;
			};
			// - 相当于静态变量
			rularStruct.guid = 0;
			// - 动态测距点提示
			var defaultLabelText = "<div><font color='gray'>单击选择地点，双击结束</font></div>";
			
			// - 清除所有测距
			Self.clearDistance = function () {
				if (Self.map) {
					Self.Rular && Self.Rular.removeAll();
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
					
					// - 失效双击改变地图级别
					Self.map.setOptions({
						disableDoubleClickZoom: true				
					});
					
					// - 首先在中心显示动态测距点
					var center = Self.map.getCenter();
					Self.Rular.dynamicMarker = Self.markers.add(center.lat(), center.lng(), {
						bInfoWindow: false,
						puid: defaultLabelText,
						title: defaultLabelText,
						icon: "images/baidumap/marker_node.png" 
					}); 
					// - 注册鼠标移动事件
					Self.Rular.mousemoveEvent = google.maps.event.addListener(Self.map, "mousemove", function (e) {
						if (Self.Rular.active && e.latLng) {
							/*var projection = Self.map.getProjection();
							var pixel = projection.fromLatLngToPoint(e.latLng);
							var newPoint = new google.maps.Point(Number(pixel.x), Number(pixel.y) - 16);
							var latLng = projection.fromPointToLatLng(newPoint, false);*/
							
							var pixel = Self._latLngToPoint(e.latLng);
							var newPoint = new google.maps.Point(Number(pixel.x), Number(pixel.y) - 16);
							var latLng = Self._pointToLatLng(newPoint);
							
							if (Self.Rular.curEditing) {
								var activeMarker = Self.Rular.curEditing.activeMarker;
								activeMarker.move(latLng.lat(), latLng.lng());
								Self.Rular.curEditing.draw("virtualMove");
							}
							else {
								if (Self.Rular.dynamicMarker) {
									Self.Rular.dynamicMarker.move(latLng.lat(), latLng.lng());
									if (!Self.Rular.dynamicMarker.getLabel()) {
										Self.Rular.dynamicMarker.setLabel(defaultLabelText || "");
									}
								}
								else {
									Self.Rular.dynamicMarker.setLabel(defaultLabelText || "");
								}
							} 
						}
					});
					// - 注册鼠标点击事件
					Self.Rular.clickEvent = google.maps.event.addListener(Self.map, "click", function (e) {
						if (Self.Rular.active && e.latLng) {
							// - 临时选择点标记
							var tmpMarker = Self.markers.add(e.latLng.lat(), e.latLng.lng(), {
								bInfoWindow: false,
								title: "",
								icon: "images/baidumap/marker_node.png"
							});
							
							if (!Self.Rular.curEditing) {
								tmpMarker.setLabel("起点");
								Self.Rular.dynamicMarker.setLabel(defaultLabelText);
								var rs = new rularStruct();
								rs.startMarker = tmpMarker;
								rs.activeMarker = Self.Rular.dynamicMarker;
								
								Self.Rular.curEditing = rs;
								Self.Rular.rularStore.push(rs);
							}
							Self.Rular.curEditing.markers.push(tmpMarker);
							
							// - 划线
							Self.Rular.curEditing.draw();
						}
					});
					// - 注册鼠标双击事件
					Self.Rular.dblclickEvent = google.maps.event.addListener(Self.map, "dblclick", function (e) {
						if (Self.Rular.active && e.latLng) {
							var markers = Self.Rular.curEditing.markers;
							if (markers.length <= 1) return false;
							var lastMarker = markers.pop();
							// - 移除最后一个点
							Self.removeOverlay(lastMarker);
							
							/*if (markers.length > 1) {
								lastMarker = markers.pop();
								// - 再移除一个点
								Self.removeOverlay(lastMarker);	
							}
							*/
							
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
							var tmpMarker = Self.markers.add(e.latLng.lat(), e.latLng.lng(), {
								bInfoWindow: false,
								icon: "images/baidumap/marker_ending.png"
							});
							Self.addOverlay(tmpMarker);
							Self.Rular.curEditing.markers.push(tmpMarker);
							
							// - 添加讫点单击事件									
							var GUID = Self.Rular.curEditing.guid;
							google.maps.event.addListener(tmpMarker.marker, "click", function (e) {
								Self.Rular.remove(GUID);
								if (Self.Rular.dynamicMarker) {
									Self.Rular.dynamicMarker.show();	
								}
								setTimeout(function () {
									Self.Rular.active = Self.Rular._originalActive;
								}, 50);
							});
							google.maps.event.addListener(tmpMarker.marker, "mouseover", function (e) {
								Self.Rular.active = false;
								
								if (Self.Rular.dynamicMarker) {
									Self.Rular.dynamicMarker.hide();	
								}
							});
							google.maps.event.addListener(tmpMarker.marker, "mouseout", function (e) {
								Self.Rular.active = Self.Rular._originalActive;
								if (Self.Rular.dynamicMarker) {
									Self.Rular.dynamicMarker.show();	
								}
							});
							// - 划线
							Self.Rular.curEditing.draw();
							
							tmpMarker.setLabel("讫点，总长：" + totalDistance + "<div><font color='gray'>点击图标消除此次测距</font></div>");
							Self.Rular.curEditing.endMarker = tmpMarker;
							
							if (Self.Rular.curEditing.activeMarker) {
								var activeMarker = Self.Rular.curEditing.activeMarker;
								activeMarker.setLabel(defaultLabelText);
							}
							Self.Rular.curEditing = null;
						}
					});
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
					
					Self.map.setOptions({
						disableDoubleClickZoom: false
					});
					
					if (Self.Rular.dynamicMarker != null) {
						Self.removeOverlay(Self.Rular.dynamicMarker);
						Self.Rular.dynamicMarker = null;	
					}
					
					google.maps.event.removeListener(Self.Rular.clickEvent);	
					google.maps.event.removeListener(Self.Rular.dblclickEvent);
					google.maps.event.removeListener(Self.Rular.mousemoveEvent);
					return true;
				}
			};
		}
		catch (e) {			
		}
	},
	
	markers: function (mapObj) {
		try {
			if (mapObj && mapObj.map) {
				this.map = mapObj.map;
				// - 添加一个带文字自定义标记
				this.add = function (lat, lng, options) {
					var marker, position;
					try {
						var options = options || {};
						marker = new google.maps.SuperLabelMarker({
							map: this.map,
							position: options.position || new google.maps.LatLng(lat, lng),
							infoWindowOpened: false,
							puid: options.puid,
							title: options.title,
							html: options.infoWindowContent,
							icon: options.icon,
							label: options.title,
							
//							---
//							desc: 添加设置位置方法
//							params: 
//								- lat(number) 纬度
//								- lng(number) 经度
//								- ifSetCenter(boolean) 是否设置为中心位置
//							remark:
//								- this.marker -> An instance of google.maps.Marker 
//							...
//							
							move: function (lat, lng, ifSetCenter) {
								if (!this.overlay || !this.marker) return false;
								
								if (typeof lat != "undefined" && typeof lng != "undefined") {
									var pixel = this.overlay.getProjection().fromLatLngToContainerPixel(new google.maps.LatLng(lat, lng));
									var LatLng = this.overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(Number(pixel.x), Number(pixel.y) + 16));
									if (this.marker.getPosition() != LatLng) {
										this.marker.setPosition(LatLng);
										
										if (ifSetCenter) {
											if (typeof mapObj.mapcenter != "undefined") {
												mapObj.mapcenter = LatLng;
											}
											this.map.setCenter(LatLng);
										}
										if(mapObj.callbackFun && typeof mapObj.callbackFun == "function"){
											mapObj.callbackFun("marker_move", this.puid);
										}
									}
								}
							},
							// - 设置叠加层度
							setZIndex: function (value) {
								if (this.bInfoWindow === false) return false;
								this.infoWindow.setZIndex(value || 1000);
							},
							// - 设置消息窗口
							setInfoWindow: function (html) {
								if (this.bInfoWindow === false) return false;
								this.html = html || "";
								this.infoWindow.setContent(this.html);
								this.infoWindow.setOptions({maxWidth: 300, zIndex: 1000});
							},
							// - 当前位置显示为地图中心位置
							showCenter: function () {
								if (this.map) {
									this.map.setCenter(this.marker.getPosition());	
								}
							},
							// - 获取位置
							getPosition: function () {
								if (this.map) {
									return this.marker.getPosition();	
								}
							},
							// - 设置位置
							setPosition: function (lat, lng) {
								if (this.map) {
									var latLng = this.marker.getPosition();
									if (typeof lat != "undefined" && typeof lng != "undefined") {
										latLng = new google.maps.LatLng(lat, lng);	
									}
									this.marker.setPosition(latLng);
								}
							},
							// - 显示
							show: function () {
								if (this.map) {
									this.marker.setVisible(true);
									this.overlay.updateVisible();
								}
							},
							// - 隐藏
							hide: function () {
								if (this.map) {
									this.marker.setVisible(false);
									this.overlay.updateVisible();
								}
							},
							// - 可以继续添加自定义的方法属性
							// ...
							
							end: true 
						});
						
						if (marker.marker) {
							// - 侦测marker的点击事件
							google.maps.event.addListener(marker.marker, "click", function () {
									if (marker.bInfoWindow !== false) {
										marker.infoWindow.setContent(marker.html);
										marker.infoWindow.open(marker.map, this);
										marker.infoWindow.setOptions({maxWidth: 300, zIndex: 1000 }); 
										
										marker.infoWindowOpened = true;
										// - 侦测消息窗口关闭事件
										google.maps.event.addListener(marker.infoWindow, "closeclick", function() {
												marker.infoWindowOpened = false; 
										});
									}
									if(mapObj.callbackFun && typeof mapObj.callbackFun == "function") {
										mapObj.callbackFun("marker_click", marker.puid);
									}
							});
							// - 侦测marker的位置变化事件
							google.maps.event.addListener(marker.marker, "position_changed", function () {
								if (marker.bInfoWindow !== false) {
									marker.infoWindow.setOptions({maxWidth: 300, zIndex: 1000 });
									marker.infoWindow.setContent(marker.html);
								}
								if(mapObj.callbackFun && typeof mapObj.callbackFun == "function") {
									mapObj.callbackFun("marker_position_changed", marker.puid);
								}
							});
						}
					}
					catch (e) {
					}
					finally {
						return marker || null;
					}
				};
			}
		}
		catch (e) {
		}
	},
	defineMarkerLabel: function() {
		
        CREMapAPI.markerLabel = function(marker) {
            this.marker = marker;

            this.el = document.createElement("div");
            this.el.className = "marker-label";
			this.el.style.position = "absolute";
			this.el.style.backgroundColor = "#FFFFFF";
			this.el.style.padding = "2px 2px 2px 2px";
			this.el.style.border = "1px #000000 dashed";
        };
        CREMapAPI.markerLabel.prototype = new google.maps.OverlayView();

		CREMapAPI.markerLabel.prototype.onAdd = function () {
			var Self = this;
			Self.getPanes().overlayImage.appendChild(Self.el);
			
            google.maps.event.addListener(Self.marker, 'position_changed', function () {Self.updatePosition();});
            google.maps.event.addListener(Self.marker, 'zindex_changed', function () {Self.updateZIndex();});
            google.maps.event.addListener(Self.marker, 'visible_changed', function () {Self.updateVisible();});
		};
 		CREMapAPI.markerLabel.prototype.onRemove = function () {
			var Self = this;
			Self.el.parentNode.removeChild(Self.el);

            google.maps.event.clearListeners(Self.marker, 'position_changed');
            google.maps.event.clearListeners(Self.marker, 'zindex_changed');
            google.maps.event.clearListeners(Self.marker, 'visible_changed');
        };
		
        CREMapAPI.markerLabel.prototype.draw = function() {
            this.updateContent();
            this.updatePosition();
        };

        CREMapAPI.markerLabel.prototype.setMarker = function(marker) {
            this.marker = marker;
        };

        CREMapAPI.markerLabel.prototype.updateContent = function() {
            var label = this.marker.get('label');
 
            if (label) {
                this.el.innerHTML = label;
            }
        };

        CREMapAPI.markerLabel.prototype.updatePosition = function() {
            var overlay = this;
            if(this.overlay)
            {
                overlay = this.overlay;
            }
			if (!overlay || !overlay.marker) return false;
			
            var position = overlay.getProjection().fromLatLngToDivPixel(overlay.marker.getPosition()) || {x: 0, y: 0};
			
            var w = parseInt(overlay.el.offsetWidth) || 0;
            var y = parseInt(overlay.el.offsetHeight) || 0;
            var l = (Math.round(position.x) - w/2);
            var t = Math.round(position.y) + 1;
            overlay.el.style.left = l + 'px';
            overlay.el.style.top = t + 'px';
            overlay.el.style.whiteSpace = "nowrap";
            overlay.updateZIndex(); 
        };


        CREMapAPI.markerLabel.prototype.updateVisible = function() {
            this.el.style.display = this.marker.getVisible() ? 'block' : 'none';
        };

        CREMapAPI.markerLabel.prototype.updateZIndex = function() {
            var zIndex = (this.marker.getZIndex() || parseInt(this.el.style.top, 10));

            this.el.style.zIndex = zIndex;
        };
		
		// - 自定义的文字标记
		google.maps.SuperLabelMarker = function (options) {
			var Self = this,
				markerOptions = {};
			var options = options || {};
			options.label = options.label || "";
			options.optimized = false;
			
			for (var key in options) {
				if (typeof options[key] != "function") {
					markerOptions[key] = options[key];
				}
				Self[key] = options[key];
			} 
			// - 创建一个标记实例对象
			Self.marker = new google.maps.Marker(markerOptions); 
			// - 创建一个叠加文字实例对象
			Self.overlay = new CREMapAPI.markerLabel(Self.marker);
			Self.overlay.setMap(Self.map);
			// - 创建一个消息窗口实例对象
			Self.infoWindow = new google.maps.InfoWindow({content: "loading..."});
		};
		google.maps.SuperLabelMarker.prototype.getLabel = function () {
			return this.marker.get("label");
		};
		google.maps.SuperLabelMarker.prototype.setLabel = function (label) {
			this.marker.set("label", label);
			this.overlay.draw();
		};
		// - 设置标记图标
		google.maps.SuperLabelMarker.prototype.setIcon = function (var_icon) {
			if (var_icon) this.marker.setIcon(var_icon);
		};
		// - 设置标记的地图，移除时map置为null
		google.maps.SuperLabelMarker.prototype.setMap = function (map) {
			this.marker.setMap(map);
			this.overlay.setMap(map);	
		};
    },
	// - 获取点点距离
	distance: function (startingPoint, endingPoint, callback) {
		try {
			if (CREMapAPI.directionsService && CREMapAPI.directionsService != null) {
				if (startingPoint && endingPoint) {
					var request = {
						origin: startingPoint,
						destination: endingPoint,
						travelMode: google.maps.DirectionsTravelMode.DRIVING,
						unitSystem: google.maps.DirectionsUintSystem.METRIC
					};
					CREMapAPI.directionsService.route(request, function (response, status) {
						if (status == google.maps.DirectionsStatus.OK) {
							var distance = response.routes[0].legs[0].distance.value;
							if (typeof callback == "function") {
								callback(distance);	
							}
						}											 
					}); 
				} 
			}
		}
		catch (e) {
		}
	},
	// - 反地址解析
	geocode: function (lat, lng, object){
		try{
			if (CREMapAPI.geocoder && CREMapAPI.geocoder != null) {
				CREMapAPI.geocoder.geocode({
						"location": new google.maps.LatLng(lat, lng)
					}, 
					function(results, status) {   
						if (status == google.maps.GeocoderStatus.OK) { 
							 if (results[0]) {
								if(typeof object.geocode_callback == "function") {
									object.geocode_callback(object,results[0].formatted_address);
								}
								//alert(results[0].formatted_address);
							 }  
						} 
						else {
						  // alert("Geocoder failed due to: " + status);  
						}  
					}
				);  
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
	TranslateGPSToXMapPoints: function(points, callbackFun) {
		try{
			if(points.constructor == Array) { 
				
			} 
		}
		catch(e) { 
		}
	},
	
	// - Baidumap to Googlemap position
	/*__SwitchBtoG: function (lat, lng, options) {
		try {
			var x_pi = 3.14159265358979324 * 3000.0 / 180.0;

			var x = lng - 0.0065, y = lat - 0.006;	
			var z = sqrt(x * x + y * y) - 0.00002 * sin(y * x_pi);
			var theta = atan2(y, x) - 0.000003 * cos(x * x_pi);
			lat = z * cos(theta);
			lng = z * sin(theta);
		}
		catch(e) {
		}
		finally {
			return  {
				lat: lat || 0,
				lng: lng || 0
			};
		};
	},*/
	
	/*
	---
	remark: 地理坐标（GPS坐标）转成火星坐标（如Google地图坐标）
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