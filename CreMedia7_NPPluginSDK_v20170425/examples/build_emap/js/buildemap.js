var _be = BuildEmap = {
	version: "v1.0.1",
	time: "2014-03-17",
	author: "huzw",
	
	connectId: null,
	
	Load: function () {
		// - 初始化传参	
		_be.Url.Init();
		// - 初始化调试对象
		_be.Debug.Init(); 
		// - 初始化页面框架
		_be.Frame.Init();
		// - 加载地图文件
		_be.LoadMapJS.Init();
		
		var ips = new NPPILY.Struct.InitParamStruct
		(
		 	GLOBALS.debug.active,
			_be.Debug.Note, 
			{
				warmTip : {
					active : false,
					pluginFile : GLOBALS.pluginFile
				}
			}
		);
		// - 初始化NPPILY
		var operator = NPPILY.Init(ips);
		if (operator.rv == NrcapError.NRCAP_SUCCESS) {
			// - 开始登录
			_be.Login.Init();
		}
		else {
			if (!$("#warmTip-box")[0]) {
				$("body")
					.append('<div id="warmTip-box"></div>')
					.find("#warmTip-box")
					.dialog({
						width: 430,
						height: 210,
						modal: true,
						title: "温馨提示",
						collapsible: false,
						minimizable: false,
						maximizable: false,
						resizable: false,
						content: '<div style="margin:20px auto;width:90%;height:70%;border:0px gray solid;"><p>初始化NPPILY对象失败，可能是插件安装失败：）</p><p><ul class="warmTip-ul"><li>请<a href="'+GLOBALS.pluginFile+'">下载插件</a>后手动运行安装</li><li>在Windows7系统以上应以管理员方式运行安装</li><li>正确安装插件后可<a href="javascript:void(0);" onclick="window.location.reload();return false;">刷新页面</a>重试</li></ul></p></div>',
						buttons: [{
							iconCls: "icon-ok",
							text: "确定",
							handler: function () {
								$("#warmTip-box").dialog("close");
								return false;
							}
						}]
					});
			}
			
			$("#warmTip-box").dialog("open");
			
		} 
	},
	
	UnLoad: function () {
		NPPILY.UnLoad();
		_be.connectId = null;
	},
	
	Url: {
		Init: function () {
			try {
				var fn = "_be.Url.Init";
				
				var orgUrl = window.location.search.replace("\?", "") || "";
				logger(fn, "orgUrl -> " + orgUrl);
				
				var arrayUrl = orgUrl.split("\&");
				if(GLOBALS.debug.active) logger(fn, "arrayUrl -> " + $.toJSON(arrayUrl));
				
				$.each(arrayUrl, function(index, item) {
					if (!item || typeof item == "undefined") {
						return true;
					}
					
					var node = item.split("="),
						key = node[0],
						value = node.length >= 2 ? decodeURIComponent(node[1]) : null;
					
					switch(key) {
						case "loginMode":
							GLOBALS.loginMode = value || GLOBALS.loginMode || "auto";
							break;
						case "ip":
							GLOBALS.ip = value || GLOBALS.path.split(":")[0] || "";
							break;
						case "port":
							GLOBALS.port = value || GLOBALS.path.split(":")[1] || "8866";
							break;
						case "username":
							GLOBALS.username = value || GLOBALS.username || "admin";
							break;
						case "epId":
						case "epid":
							GLOBALS.epId = value || GLOBALS.epId || "system";
							break;
						case "psw":
						case "password":
							GLOBALS.password = value || GLOBALS.password || "";
							break;
						case "bfix":
							GLOBALS.bfix = value || GLOBALS.bfix || "0";
							break;
						
						case "mapType":
						case "maptype":
							GLOBALS.map.type = value || GLOBALS.map.type || "0";
							break;
						case "ZOOM":
						case "zoom":
							GLOBALS.map.zoom = Number(value || GLOBALS.map.zoom || 13);
							break;
						case "lat":
						case "latitude":
							GLOBALS.map.center.latitude = Number(value || GLOBALS.map.center.latitude || 31.8639);
							break;
						case "lng":
						case "longitude":
							GLOBALS.map.center.longitude = Number(value || GLOBALS.map.center.longitude || 117.2808);
							break;
						
						case "_debug": // - 是否开启调试参数（保留）
							GLOBALS.debug.active = value !== true && value !== "true" ? false : true;
							break;
						case "_enableDDraw":
						case "_ddraw":
							GLOBALS.enableDDraw = value !== true && value !== "true" ? false : true; 
							GLOBALS.defaultDDraw = value !== true && value !== "true" ? false : true; 
							break;
						
						case "_autoReConnect": // - 允许自动重连
						case "_autorc":
							GLOBALS.enable_autorc = value !== true && value !== "true" ? false : true; 
							break;
						case "_autoReConnectInterval": // - 自动重连间隔（单位毫秒）
						case "_autorcinterval":
							GLOBALS.brcInterval = typeof value != "undefined" && !isNaN(value) ? Number(value) : 10000; 
							break;
							
						case "_pluginFile": // - 插件路径，需要encodeURIComponent编码
							GLOBALS.pluginFile = decodeURIComponent(value) || GLOBALS.pluginFile || "../../MediaPlugin7.exe";
							break; 
					};
					
					GLOBALS.path = GLOBALS.ip ? (GLOBALS.ip + ":" + (GLOBALS.port||"8866")) : (GLOBALS.path || "127.0.0.1:8866");
				});
				
				// - 检测是否支持DDraw模式
				
				if(GLOBALS.debug.active) logger(fn, "GLOBALS -> " + $.toJSON(GLOBALS));
				
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		end: true
	},
	
	// - 装载页面元素
	Frame: {
		Init: function () {
			try {
				var fn = "_be.Frame.Init";
				
				_be.Frame.GetBrowser();
				
				// - create whole layout
				var html = [];
				html.push('<div data-options="region:\'center\',title:\'电子地图\',split:true,collapsible:true">');
					html.push('<div id="map-container" class="map-container"><span style="position:relative;top:10px;left:10px;">正在装载地图，请稍候...</span></div>');
				html.push('</div>');
				// html.push('<div data-options="region:\'east\',title:\'控制\',split:true,width:200,minWidth:200,collapsible:'+!!($.browser.msie == true)+',collapsed:'+!!($.browser.msie == true)+'">');
				html.push('<div data-options="region:\'east\',title:\'控制\',split:true,width:200,minWidth:200,collapsible:false,collapsed:false">');
					// - 控制容器
					html.push('<div id="control-container" style="width:100%;height:100%;" data-options="border:false,fit:true">');
						html.push('<div data-options="region:\'center\',border:false"><div id="control-top" class="control-top"></div></div>');
						html.push('<div data-options="region:\'south\',minHeight:40,maxHeight:110,height:110,border:false,split:true"><div id="control-bottom" class="control-bottom"></div></div>');
					html.push('</div>');
				html.push('</div>');
				html.push('<div data-options="region:\'south\',title:\'GPS信息\',height:100,collapsed:true">');
					html.push('<table id="gps-grid-box" class="easyui-datagrid"></table>');
				html.push('</div>');
				
				var bLayout = $("body")
					.append(html.join(""))
					.attr("class", "easyui-layout")
					.layout();
				
				bLayout.layout("panel", "center")
					.panel({
						"onResize": function (w, h) {
							// - 改变地图中心点
							if (_be.Emap.mapObj) {
								_be.Emap.mapObj.resize();	
							}
						}
					});
					
				bLayout.layout("panel", "east")
					.panel({
						onBeforeCollapse: function () {
							// alert("Before hide east panel");	
						},
						"onResize": function (w, h) {
							logger(fn, w + "::" + h);
						}
					});
				
				// - 控制面板
				_be.Frame.Control();
				
				// - 创建底部GPS信息
				_be.Frame.CreateGPSBox();
			}
			catch (e) {
				excep(fn, e);	
			}
  		},
		GetBrowser: function () {
			try {
				var fn = "_be.Frame.GetBrowser";
				
				$.browser = $.browser || {};
				var ua = navigator.userAgent.toLowerCase();
				$.browser.msie = /(msie)|(trident)/.test(ua)?true:false;
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 控制面板
		Control: function () {
			try {
				var fn = "_be.Frame.Control";
				
				// - 控制容器
				$("#control-container").layout();
				
				_be.Control.Init();
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 创建底部GPS信息
		CreateGPSBox: function () {
			try {
				var fn = "_be.Frame.CreateGPSBox";
				
				if ($("#gps-grid-box")[0]) {
					var inited = $("#gps-grid-box").attr("inited");
					if (!inited) {
						var columns = [{
								field: "gps_puid_idx", title: "", width: 0, hidden: true		   
							},{
								field: "gps_name", title: "名称", width: 200			   
							}, {
								field: "gps_status", title: "状态", width: 80			   
							}, {
								field: "gps_longitude", title: "经度", width: 100			   
							}, {
								field: "gps_latitude", title: "纬度", width: 100			   
							}, {
								field: "gps_altitude", title: "海拔(m)", width: 75
							}, {
								field: "gps_speed", title: "速度(km/h)", width: 75			   
							}, {
								field: "gps_bearing", title: "方向", width: 150			   
							}, {
								field: "gps_time", title: "时间", width: 150			   
							}, {
								field: "gps_address", title: "地址", width: 250, fixed: true			   
							}];
					 
						$("#gps-grid-box").datagrid({
							fit: true,
							border: false,
							collapsible: false,
							singleSelect: true,
							nowrap: false,
							idField: "gps_puid_idx",
							rownumbers: true,
							fitColumns: false,
							columns: [columns],
							view: detailview,
							detailFormatter: function (index, row) {
								return _be.Frame.CreateGPSViewBox(index, row);
							},
							onDblClickRow: function (index, row) {
								var expander = $(this).datagrid("getExpander", index);
								if (expander.hasClass("datagrid-row-expand")) {
									$(this).datagrid("expandRow", index);
								}
								else {
									$(this).datagrid("collapseRow", index);
								}
								$(this).datagrid("fitColumns", index);
								$(this).datagrid("selectRow", index);
							}
						});	
						$("#gps-grid-box").attr("inited", 1);
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 创建底部容器
		CreateGPSViewBox: function (index, rowData) {
			try {
				var fn = "_be.Frame.CreateGPSViewBox"; // F7BFBF E4EAEE F0E8E0
				
				var puid = rowData.gps_puid_idx.split("_")[0];
				if (puid && (puNode = _be.Resource.GetPUNode(puid))) {
					var html = [],
						containerID = "gps_ddv-" + index,
						gridkey = rowData.gps_puid_idx;
					
					html.push('<div id="'+containerID+'" gridkey="'+gridkey+'" style="position:relative;top:-5px;">');	
						html.push('<ul style="list-style:none;width:100%;">');
							html.push('<li style="float:left;cursor:pointer;margin-left:10px;border:1px gray dashed;background-color:#BFBFF7;color:#000000;border-radius:4px;padding:0px 5px 0px 5px;" onmouseover="this.style.textDecoration=\'underline\';" onmouseout="this.style.textDecoration=\'none\';" onclick="_be.Video.PopPlayAllVideo(\''+puid+'\');" title="将会弹出一个新的页面进行播放全部视频，理论上只能够播放前十六路视频，超过不进行播放">全部弹出播放</li>');
							html.push('<li style="float:left;cursor:pointer;margin-left:10px;border:1px gray dashed;background-color:#F7BFBF;color:#000000;border-radius:4px;padding:0px 5px 0px 5px;" onmouseover="this.style.textDecoration=\'underline\';" onmouseout="this.style.textDecoration=\'none\';" onclick="_be.Video.PlainPlayAllVideo(\''+puid+'\');" title="在此页面内播放全部视频（所有已经正在播放的视频将会关闭）">全部播放</li>');
						for (var i = 0; i < puNode.childResource.length; i++) {
							var child = puNode.childResource[i];
							if (child.type == NPPILY.Enum.PuResourceType.VideoIn) {
								var coreName = (child.name || child.description);
								html.push('<li style="float:left;cursor:pointer;margin-left:10px;border:1px gray dashed;background-color:#E4EAEE;#BFF7BF;color:#000000;border-radius:4px;padding:0px 5px 0px 5px;" onmouseover="this.style.textDecoration=\'underline\';" onmouseout="this.style.textDecoration=\'none\';" onclick="_be.Video.PlayVideo(\''+puid+'\', \''+child.idx+'\');" title="'+coreName+'">' + coreName + '</li>'); 	
							}
						}
						html.push('</ul>');
					html.push('</div>');
					
					return html.join("");
				}
				return "";
			}
			catch (e) {
				excep(fn, e);
				return "";
			}
		},
		
		end: true
	},
	// - 控制对象
	Control: {
		curwindownumber: 4,
		curactivewinkey: "",
		windowInCreating: false,
		
		Init: function () {
			try {
				var fn = "_be.Control.Init";
				
				_be.Control.CreateTop();
				_be.Control.CreateBottom();
				_be.Control.ToggleLogin();
				
				// - 获取设置配置
				_be.Settings.GetCookie();
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		CreateTop: function () {
			try {
				var fn = "_be.Control.CreateTop";
				
				var html = [];
				html.push('<div id="control-windows" class="control-windows">');
				html.push('</div>');
				html.push('<div id="control-buttons" class="control-buttons">');
				html.push('</div>');
				
				$("#control-top")
					.html(html.join(""))
					.css({
						overflow: "hidden"	
					});
								
				// - 创建窗口
				_be.Control.CreateWindows();
				// - 创建控制图标
				_be.Control.CreateButtonTools();
				
				// - 侦测改变大小事件
				$("#control-container")
					.layout("panel", "center")
					.panel({
						"doSize": true,
						"onResize": _be.Control.ResponseControlTopResize
					});
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 创建窗口
		CreateWindows: function (winno) {
			try {
				var fn = "_be.Control.CreateWindows";
				
				var winno = Number(winno) || _be.Control.curwindownumber || 4;
				if (winno != 1 && winno != 4 && winno != 9 && winno != 16 && winno != 6) return false;
				
				if (_be.Control.windowInCreating) {
					logger(fn, "windows in creating...");
					return false;	
				}
				
				// - 记录旧的播放信息
				var historyPlays = [],
					count = 1,
					confirmFlag = false,
					stopChange = false;
				NPPILY.WindowContainers.each(function(item) {
					var node = item.value;
					
					if (node.window && node.window.status.playvideoing) {
						if (count++ > winno) {
							if (!confirmFlag) {
								confirmFlag = true;
								if (!confirm("将关闭部分视频，是否继续切换？")) {
									stopChange = true;	
								}
							}
						}
						else {
							historyPlays.push({
								puid: node.window.params.puid,
								ivIndex: node.window.params.idx,			
								streamType: node.window.params.streamType
							});
						}
					} 
				});
				
				// - 清除停止所有
 				if (!stopChange) {
					_be.Video.Clear();
				}
				else {
					return false;
				}
				
				_be.Control.windowInCreating = true;
				
				var html = [];
				switch (winno) {
					case 1:
					case 4:
					case 9:
					case 16:
						for (var i = 0; i < winno; i++) {
							html.push('<div id="control-windowbox'+i+'" class="winbox' + winno + '">');
								html.push('<div id="control-window'+i+'" class="win"></div>');
								html.push('<div id="control-windowtitle'+i+'" class="wintitle">');
									html.push('<div class="title1">无视频</div><div class="title2"></div>');
								html.push('</div>');
							html.push('</div>');
						}
						break;
					case 6:
						for (var i = 0; i < winno; i++) {
							html.push('<div id="control-windowbox'+i+'" class="winbox' + winno + '">');
								html.push('<div id="control-window'+i+'" class="win"></div>');
								html.push('<div id="control-windowtitle'+i+'" class="wintitle">');
									html.push('<div class="title1">无视频</div><div class="title2"></div>');
								html.push('</div>');
							html.push('</div>');	
						}
						break;
				}
				
				
				_be.Control.curwindownumber = winno;
				
				var windows = $("#control-windows")
								.html(html.join(""))
								.find("DIV[id^=control-windowbox]");
								
				// - 改变大小
				_be.Control.ResponseControlTopResize();
								
				$.each(windows, function (index, dom) {
					NPPILY.WindowContainers.set(
						dom.id,
						new NPPILY.Struct.WindowContainerStruct(
							$(dom),
							NPPILY.Enum.WindowType.Video,
							false,
							null,
							null
						)
					);
					// - 绑定事件
					$(dom).off("click");
					$(dom).on("click", function (event) {
						_be.Control.ActiveWindow(this.id);
					});
				});
				
				// - 恢复播放
				$.each(historyPlays, function (index, hp) {
					if (index < windows.length) {
						// - 激活第n个窗口
						windows.eq(index).click();
						// - 播放视频
						_be.Video.PlayVideo(hp.puid, hp.ivIndex, hp.streamType);
					}
				});
				
				// - 激活首个窗口
				windows.first().click();
				
				setTimeout(function () {
					_be.Control.windowInCreating = false;
				}, 100);
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 创建控制图标
		CreateButtonTools: function () {
			try {
				var fn = "_be.Control.CreateButtonTools";
			
				var html = [];
				
				html.push('<span id="control-stopvideo" class="easyui-tooltip container" title="停止视频">');
					html.push('<input type="button" id="control-stopvideo-btn" class="stopvideo" />');
				html.push('</span>');
				html.push('<span id="control-audio" class="easyui-tooltip container" title="开启/停止音频">');
					html.push('<input type="button" id="control-audio-btn" class="audio" />');
				html.push('</span>');
				html.push('<span id="control-localsnapshot" class="easyui-tooltip container" title="本地抓拍">');
					html.push('<input type="button" id="control-localsnapshot-btn" class="localsnapshot" />');
				html.push('</span>');
				html.push('<span id="control-opensnapshotdir" class="easyui-tooltip container" title="打开本地抓图保存目录">');
					html.push('<input type="button" id="control-opensnapshotdir-btn" class="icon-redo opensnapshotdir" value="" />');
				html.push('</span>');
				html.push('<span id="control-localrecord" class="easyui-tooltip container" title="开启/停止本地录像">');
					html.push('<input type="button" id="control-localrecord-btn" class="localrecord" />');
				html.push('</span>');
				html.push('<span id="control-openrecorddir" class="easyui-tooltip container" title="打开本地录像保存目录">');
					html.push('<input type="button" id="control-openrecorddir-btn" class="icon-redo openrecorddir" value="" />');
				html.push('</span>');
				html.push('<span id="control-fullscreen" class="easyui-tooltip container" title="视频窗口全屏">');
					html.push('<input type="button" id="control-fullscreen-btn" class="fullscreen" />');
				html.push('</span>');
				if (GLOBALS.defaultDDraw) {
					html.push('<span id="control-switchddraw" class="easyui-tooltip container" title="切换DDraw模式">');
						html.push('<input type="button" id="control-switchddraw-btn" class="switchddraw" />');
					html.push('</span>');
				}
				html.push('<span id="control-window_1" class="easyui-tooltip container" title="一分屏">');
					html.push('<input type="button" id="control-window_1-btn" class="window_1" />');
				html.push('</span>');
				html.push('<span id="control-window_4" class="easyui-tooltip container" title="四分屏">');
					html.push('<input type="button" id="control-window_4-btn" class="window_4" />');
				html.push('</span>');
				html.push('<span id="control-window_6" class="easyui-tooltip container" title="六分屏">');
					html.push('<input type="button" id="control-window_6-btn" class="window_6" />');
				html.push('</span>');
				html.push('<span id="control-window_9" class="easyui-tooltip container" title="九分屏">');
					html.push('<input type="button" id="control-window_9-btn" class="window_9" />');
				html.push('</span>');
				html.push('<span id="control-window_16" class="easyui-tooltip container" title="十六分屏">');
					html.push('<input type="button" id="control-window_16-btn" class="window_16" />');
				html.push('</span>');
				html.push('<span id="control-settings" class="easyui-tooltip container" title="其他设置">');
					html.push('<input type="button" id="control-settings-btn" class="settings" />');
				html.push('</span>');
				
				$("#control-buttons")
					.html(html.join(""))
					.find(".container")
					.tooltip()
					.on("mouseover mouseout mousedown mouseup click", function (event) {
						switch (event.type) {
							case "mouseover":
							case "mouseup":
								$(this).css({
									backgroundColor: "#E3E3E3",
									borderStyle: "solid"
								});
								break;
							case "mouseout":
								$(this).css({
									backgroundColor: "transparent",
									borderStyle: "dashed"
								});
								break;
							case "mousedown":
								$(this).css({
									backgroundColor: "#CECECE"
								});
								break;
							case "click":
								var winkey = _be.Control.curactivewinkey || "";
								switch (this.id.replace("control-", "")) {
									case "stopvideo":
										_be.Video.StopVideo(winkey);
										break;
									case "audio":
										_be.Video.PlayAudio(winkey);
										break;
									case "localsnapshot":
										_be.Video.LocalSnapshot(winkey);
										break;
									case "opensnapshotdir":
										_be.Control.OpenDir("snapshot");
										break;
									case "localrecord":
										_be.Video.LocalRecord(winkey);
										break;
									case "openrecorddir":
										_be.Control.OpenDir("record");
										break;
									case "fullscreen":
										_be.Video.FullScreen(winkey);
										break;
									case "switchddraw":
										_be.Video.SwitchDDraw(winkey);
										break;
									case "window_1":
										_be.Control.CreateWindows(1);
										break;
									case "window_4":
										_be.Control.CreateWindows(4);
										break;
									case "window_6":
										_be.Control.CreateWindows(6);
										break;
									case "window_9":
										_be.Control.CreateWindows(9);
										break;
									case "window_16":
										_be.Control.CreateWindows(16);
										break;
									case "settings":
										_be.Settings.Init();
										break;
								}
								// - 更新状态
								_be.Video.UpdateStatus(winkey);
								break;
						};
					});
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 打开目录
		OpenDir: function (action) {
			try {
				var fn = "_be.Control.OpenDir";
				
				switch (action) {
					case "snapshot":
						NPPILY.Folder.OpenFolder(_be.Settings.saveAsPath.localSnapshot);
						break;
					case "record":
						NPPILY.Folder.OpenFolder(_be.Settings.saveAsPath.localRecord);
						break;
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 激活窗口
		ActiveWindow: function (winkey) {
			try {
				var fn = "_be.Control.ActiveWindow";
				
				if (winkey) {
					NPPILY.WindowContainers.each(
						function (item) {
							var node = item.value;
							if (item.key == winkey) {
								node.active = true;
								$(node.container).find(".wintitle").css({
									color: "#FFFFFF",
									backgroundColor: "#65A3E5"
								});
								_be.Control.curactivewinkey = winkey;
							}
							else {
								node.active = false;
								$(node.container).find(".wintitle").css({
									color: "#15428B",
									backgroundColor: "transparent"
								});
							}
						}
					);
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 侦测改变大小事件
		ResponseControlTopResize: function (width, height) {
			try {
				var fn = "_be.Control.ResponseControlTopResize";
				
				if (typeof width == "undefined" || typeof height == "undefined") {
					var options = $("#control-container")
						.layout("panel", "center")
						.panel("options");
					
					width = options.width;
					height = options.height;
				}
				
				logger(fn, width + "::" + height);
				
				if (width > 0 && height > 60) {
					$("#control-windows")
						.css({
							width: (width - 2) + "px",
							height: (height - $("#control-buttons").height() - 5) + "px" 	 
						});
					
					var windows = $("#control-windows DIV[id^=control-windowbox]");
					
					var cw = $("#control-windows").width(),
						ch = $("#control-windows").height();
						
					switch(windows.length) {
						case 1:
						case 4:
						case 9:
						case 16:
							var sbw = sbh = 1;
							if (windows.length == 4) {
								sbw = width <= 300 ? 1 : 2;
								sbh = sbw != 1 ? 2 : 4;
							}
							else if (windows.length == 9) {
								sbw = width <= 300 ? 1 : 3;
								sbh = sbw != 1 ? 3 : 9;
							}
							else if (windows.length == 16) {
								sbw = width <= 300 ? 1 : 4;
								sbh = sbw != 1 ? 4 : 16;
							}
							
							//var ew = Math.floor((cw - sbw * 3 - 1) / sbw),
							//	eh = Math.floor((ch - sbh * 3 - 1) / sbh);
								
							var ew = Math.floor(cw / sbw) - 3,
								eh = Math.floor(ch / sbh) - 1;
							
							windows.each(function (index, dom) {
								$(dom).css({
									width: ew + "px",
									height: (eh>0?eh:0) + "px",
									borderBottom: "0px gray solid"
								});
								
								$("#" + dom.id.replace("windowbox", "window")).css({
									height: ((eh - 18)>0?(eh - 18):0) + "px"												   
								});
								$("#" + dom.id.replace("windowbox", "windowtitle")).css({
									height: "18px"												   
								});
							});
							break;
						
						case 6:
							var ew = Math.floor((cw) / 3) - 3,
								eh = Math.floor((ch) / 3) - 2,
								bigw = 2 * ew + 3,
								bigh = 2 * eh + 1;
							
							windows.each(function (index, dom) {
								$(dom).css({
									width: (index == 0 ? bigw : ew) + "px",
									height: ((index == 0 ? bigh : eh) > 0 ? (index == 0 ? bigh : eh) : 0) + "px",
									borderBottom: "0px gray solid"
								});	
								
								$("#" + dom.id.replace("windowbox", "window")).css({
									height: (((index == 0 ? bigh : eh) - 18) > 0 ? ((index == 0 ? bigh : eh) - 18) : 0) + "px"												   
								});
								$("#" + dom.id.replace("windowbox", "windowtitle")).css({
									height: "18px"												   
								});
							}); 
							break;
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		CreateBottom: function () {
			try {
				var fn = "_be.Control.CreateBottom";
				
				var html = [];
				
				html.push('<a id="control-login" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:\'icon-redo\'" style="display:none;">登录</a>');
				html.push('<a id="control-logout" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:\'icon-undo\'">退出</a>');
				html.push('<a id="control-refresh" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:\'icon-reload\'">刷新页面</a>');
				html.push('<a id="control-range" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:\'custom-icon-rular\',toggle:true">测距</a>');
				html.push('<a id="control-zoomin" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:\'icon-add\'">放大</a>');
				html.push('<a id="control-zoomout" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:\'icon-remove\'">缩小</a>');
				// html.push('<span style="display:inline-block;margin-top:5px;margin-left:5px;"><select id="control-switchmap" class="easyui-combobox"><option value="baidumap" title="">使用百度地图</option><option value="googlemap" title="">使用谷歌地图</option></select></span>');
				html.push('<span style="display:inline-block;margin-top:5px;margin-left:5px;"><select id="control-switchmap" class="easyui-combobox">');
				if (GLOBALS.map.values) {
					$.each(GLOBALS.map.values, function (index, item) {
						html.push('<option value="'+item.id+'" '+(item.enable?'':'disabled="disabled"')+'>使用'+item.name+'</option>');
					});
				}
				html.push('</select></span>');
				
				$("#control-bottom")
					.html(html.join(""))
					.find("a")
					.css({
						marginTop: "5px",
						marginLeft: "2px"
					})
					.linkbutton({
						plain: true			
					})
					.each(function (index, dom) {
						switch(dom.id) {
							case "control-login":
								$(dom).click(function () {
									_be.Control.Login();  
									_be.Control.ToggleLogin();
								});
								break;
							case "control-logout":
								$(dom).click(function () {
									// alert("Are you sure exit this connect?");					   
									$.messager.confirm("确认", "将断开连接，您确认退出吗？", function (v) {
										if (v) {
											_be.Control.Exit();
											_be.Control.ToggleLogin();
										}
									});
								});
								 
								break;
							case "control-zoomin":
								$(dom).click(function () {
									_be.Control.Zoom("zoomIn");
								});
								break;
							case "control-zoomout":
								$(dom).click(function () {
									_be.Control.Zoom("zoomOut");
								});
								break;
							case "control-range":
								$(dom).click(function () {
									_be.Control.Distance();
								});
								break;
							case "control-refresh":
								$(dom).click(function () {
									if (_be.Login.status) {
										$.messager.confirm("确认", "确认刷新页面？", function (v) {
											if (v) window.location.reload();										  
										});
									}
									else {
										window.location.reload();	
									}
								});
								break;
						}
					});
				
				$("#control-switchmap")
					.combobox({
						// hasDownArrow:false,
						width: 160,
						editable: false,
						onSelect: _be.Control.SwitchMap
					});
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 切换地图
		SwitchMap: function (record) {
			try {
				var fn = "_be.Control.SwitchMap";
				
				if (record) {
					switch(record.value) {
						case "baidumap":
						case "amap":
						case "googlemap":
							// - 停止测距
							_be.Emap.Distance("disable");
							$("#control-range").attr("distance", 0);
							$("#control-range").linkbutton("unselect");
							
							// - 阻止记录GPS数据信息
							_be.Emap.stoppingRecord = true;
							
							// - 清除记录
							_be.Emap.GPSObjectStore.each(function (item) {
								var node = item.value;
								node.gpsData = [];
								node.gpsRealData = [];
								
								if (_be.Emap.mapObj) {
									if (node.polyline != null) {
										node.polyline = _be.Emap.mapObj.removeOverlay(node.polyline);	
									}
									if (node.marker) {
										node.marker = _be.Emap.mapObj.removeOverlay(node.marker);	
									}
								}
							});
							// - 移除地图
							if (_be.Emap.mapObj) {
								_be.Emap.mapObj.undo();
								_be.Emap.mapObj = null;
							}
							
							// - 加载地图
							_be.LoadMapJS.Init(record.value);
							break;
					};
					
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 测距
		Distance: function () {
			try {
				var fn = "_be.Control.Distance";
				
				if (!_be.Emap.mapObj) return false;
				
				if ($("#control-range").attr("distance") != 1) {
					_be.Emap.Distance("enable");
					$("#control-range").attr("distance", 1);
				}
				else {
					_be.Emap.Distance("disable");
					$("#control-range").attr("distance", 0);
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 放大 ＆ 缩小
		Zoom: function (action) {
			try {
				var fn = "_be.Control.Zoom";
				
				_be.Emap.Zoom(action);
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 登录
		Login: function () {
			try {
				var fn = "_be.Control.Login";
				
				// - 显示登录框
				_be.Login.ShowLoginBox();
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 退出
		Exit: function () {
			try {
				var fn = "_be.Control.Exit";
				
				_be.Login.DisConnection();
			}
			catch (e) {
				excep(fn, e);
			}
		},
		ToggleLogin: function () {
			try {
				var fn = "_be.Control.ToggleLogin";
				
				if (_be.Login.status) {
					$("#control-login").hide();
					$("#control-logout").show();
				} 
				else {
					$("#control-login").show();
					$("#control-logout").hide();
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		end: true
	},
	
	// - 装载地图
	LoadMapJS: {
		Init: function (mapType) {
			var scripts;
			
			// - 若存在同样的节点就移除了
			if ($("#convertor")[0]) {
				$("#convertor").remove();	
			}
			if ($("#cremapapi")[0]) {
				$("#cremapapi").remove();	
			}
			if ($("#baidumap")[0]) {
				$("#baidumap").remove();	
			}
			if ($("#googlemap")[0]) {
				$("#googlemap").remove();	
			}
			if ($("#amap")[0]) {
				$("#amap").remove();
			}
			
			// - 移除所有的网络引用
			$("script[src^='http://'], link[href^='http://']").remove();
			
			$("#map-container")
				.html('<span style="position:relative;top:10px;left:10px;">正在装载地图，请稍候...</span>');
			
			var mapType = (mapType||GLOBALS.map.type);
			
			if (GLOBALS.map.values) {
				var found = false,
					disabled = false,
					mt = null;
				$.each(GLOBALS.map.values, function (index, item) {
					if (!found && item.enable) {
						found = true;
						mt = item.id;
					}
					if (item.id == mapType && !item.enable) {
						disabled = true;
					}
				});
				if (!found) return false;
				if (disabled) {
					mapType = mt;
				}
			}
			
			switch ((mapType||GLOBALS.map.type)) {
				case "baidumap":
					mapType = "baidumap";
					
					scripts = [{ 
						id: "convertor",
						src: "js/convertor.js"
					}, { 
						id: "cremapapi",
						src: "js/cremapapi-baidumap.js"
					}, {
						id: "baidumap",
						src: "http://api.map.baidu.com/api?v=1.4&callback=_be.LoadMapJS.Callback"
					}];
					break;
				case "amap":
					mapType = "amap";
					
					scripts = [{ 
						id: "cremapapi",
						src: "js/cremapapi-amap.js"
					}, {
						id: "amap",
						src: "http://webapi.amap.com/maps?v=1.3&key=c84af8341b1cc45c801d6765cda96087&callback=_be_amap_callback"
					}];
					// 高德地图回调必须是这个样子的，为什么呢？
					window._be_amap_callback = function () {
						_be.LoadMapJS.Callback();
					};
					break;
				case "googlemap":
					mapType = "googlemap";
					
					scripts = [{ 
						id: "cremapapi",
						src: "js/cremapapi-googlemap.js"
					}, {
						id: "googlemap",
						src: "http://maps.googleapis.com/maps/api/js?sensor=false&callback=_be.LoadMapJS.Callback"
					}];
					break;
			};
			
			GLOBALS.map.type = mapType || GLOBALS.map.type;
			// - 设置地图类型
			$("#control-switchmap")
				.combobox("setValue", GLOBALS.map.type);
			
			if (scripts) {
				for(var i = 0; i < scripts.length; i++) {
					var script = document.createElement("script");
					script.id = (scripts[i].id||"");
					script.src = (scripts[i].src||""); 
					script.callback = (scripts[i].callback||""); 
					document.body.appendChild(script);
				} 	
			}  
		},
		
		Callback: function () {
			/*var map = new BMap.Map("map-container", {mapType: BMAP_NORMAL_MAP, enableAutoResize: true});
			map.centerAndZoom(new BMap.Point(GLOBALS.map.center.longitude, GLOBALS.map.center.latitude), GLOBALS.map.zoom);
			*/
			
			/*var map = new google.maps.Map($("#map-container")[0], {zoom: 13, center: new google.maps.LatLng(31.121212, 117.324212), mapTypeId: google.maps.MapTypeId.ROADMAP});*/
			
			if (!_be.Emap.mapObj) {
				var mapObj = new CREMapAPI.maps(_be.LoadMapJS.ResponseMapEventCB);
				mapObj.initialize({
					container: $("#map-container")[0],
					// containerId: "map-container",
					latitude: GLOBALS.map.center.latitude,
					longitude: GLOBALS.map.center.longitude,
					zoom: GLOBALS.map.zoom
				});
				_be.Emap.mapObj = mapObj;
				
				// - 打开允许记录GPS数据信息
				_be.Emap.stoppingRecord = false;	
			}
		},
		
		// - 响应地图事件回调
		ResponseMapEventCB: function (eventID) {
			try {
				var fn = "_be.LoadMapJS.ResponseMapEventCB";
				
				switch(eventID) {
					case "zoom_changed":
						logger(fn, "E-map is triggering some events ...");
						_be.Emap.ZoomMarkers(); 
						break;
				};
				
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		end: true
	},
	
	// - 登录对象
	Login: {
		status: false, // true | false
		
		loginInfor: [],
		
		Init: function () {
			try {
				var fn = "_be.Login.Init";
				
				if (GLOBALS.loginMode !== "normal") {
					// - 自动登录
					this.Connect(
					 	new NPPILY.Struct.ConnParamStruct(
							GLOBALS.path, 
							GLOBALS.username, 
							GLOBALS.epId, 
							GLOBALS.password, 
							GLOBALS.bfix 
						)
					);
				}
				else {
					// - 创建登陆框
					_be.Login.ShowLoginBox();
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 显示登陆框
		ShowLoginBox: function (options) {
			try {
				var fn = "_be.Login.ShowLoginBox";
				
				if (!$("#login-window-box")[0]) {
					var html = [];
					html.push('<div class="login-window-body">');
					
					html.push('<table class="login-window-table">');
					html.push('<tr>');
					html.push('<td>&nbsp;&nbsp;&nbsp;路径</td>');
					html.push('<td>&nbsp;');
					html.push('<select id="address" class="easyui-combobox" data-options="width:180,valueField:\'value\',textField:\'label\'"></select>');
					html.push('</td>');
					html.push('<td>路径格式为＂IP（域名）：端口＂</td>');
					html.push('</tr>');
					
					html.push('<tr>');
					html.push('<td>&nbsp;&nbsp;&nbsp;用户</td>');
					html.push('<td>&nbsp;<input id="username" class="easyui-validatebox" style="width:92px;height:18px;border:1px solid #95B8E7;" />&nbsp;@&nbsp;<input id="epId" class="easyui-validatebox" style="width:62px;height:18px;border:1px solid #95B8E7;" /></td>');
					html.push('<td>用户名@企业账户</td>');
					html.push('</tr>');
					
					html.push('<tr>');
					html.push('<td>&nbsp;&nbsp;&nbsp;密码</td>');
					html.push('<td>&nbsp;<input id="password" class="easyui-validatebox" type="password" style="width:176px;height:18px;border:1px solid #95B8E7;" />&nbsp;</td>');
					html.push('<td><input id="remeberPsw" type=checkbox style="width:16px;height:16px;vertical-align:middle;" /><label for="remeberPsw">记住密码</label>&nbsp;&nbsp;<input id="bfix" type=checkbox style="width:16px;height:16px;vertical-align:middle;" /><label for="bfix">透过网闸登录</label></td>');
					html.push('</tr>');
					
					html.push('</table>');
					
					html.push('</div>');
					html.push('<div class="login-window-control">');
					html.push('<a id="login-submit" class="login-submit" href="javascript:void(0);">登录</a>&nbsp;');
					html.push('<a id="login-reset" class="login-reset" href="javascript:void(0);">重置</a>');
					html.push('</div>');
					
					$("body")
						.append('<div id="login-window-box"></div>')
						.find("#login-window-box")
						.attr("inited", 0)
						.window({
							title: "用户登录",
							modal: true,
							width: 490,
							height: 260,
							resizable: false,
							collapsible: false,
							minimizable: false,
							maximizable: false,
							content: html.join(""),
							onOpen: function () {
								var inited = $("#login-window-box").attr("inited");
								if (inited == 0 && $(".login-window-body")[0]) {
									$("#login-window-box").attr("inited", 1);
								 	
									$("#address")
										.combobox({
											onSelect: function (record) {
												if (_be.Login.loginInfor) {
													for (var i = 0; i < _be.Login.loginInfor.length; i++) {
														var li = _be.Login.loginInfor[i];
														if (record.value == li.address) {
															$("#username").val(li.username);
															$("#epId").val(li.epId);
															$("#password").val(li.password||"");
															/*$("#remeberPsw").attr("checked", (li.remeberPsw != 1 ? false : true));
															$("#bfix").attr("checked", (li.bfix != 1 ? false : true));
															*/
															$("#remeberPsw")[0].checked = (li.remeberPsw == 0 ? false : true);
															$("#bfix")[0].checked = (li.bfix == 0 ? false : true);
														}
													}
												}
											}
										});
									// - 载入路径信息
									_be.Login.LoadCookieData(options);
									
									$("#login-submit")
										.linkbutton({
											iconCls: 'icon-redo'
										})
										.bind("click", function () {
											_be.Login.Submit();						 
										});
									$("#login-reset")
										.linkbutton({
											iconCls: 'icon-undo'
										})
										.bind("click", function () {
											_be.Login.Reset();					 
										});
									
								}
							}
						});
				}
				else {
					// - 载入路径信息
					_be.Login.LoadCookieData(options);
				}
					
				$("#login-window-box").window("open");
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 载入Cookie信息
		LoadCookieData: function (options) {
			try {
				var fn = "_be.Login.LoadCookieData";
				
				var options = options || {};
				options.loginFailed = options.loginFailed == true ? true : false;
				
				var loginInfor = $.cookie("loginInfor") || "";
				if (!loginInfor) {
					if (!options.loginFailed) {
						loginInfor = [{
							address: "127.0.0.1:8866",
							username: "admin",
							epId: "system",
							password: "",
							bfix: 0,
							remeberPsw: 1,
							selected: 1
						}];	
					}
				}
				else {
					loginInfor = $.evalJSON(loginInfor) || [];
				}
				_be.Login.loginInfor = loginInfor || [];
				
				var addrData = [], selectedAddr = "", firstAddr = "";
				
				if (options.loginFailed) {
					var found;
					$.each(_be.Login.loginInfor, function (index, item) {
						if (item.address == GLOBALS.path) {
							found = true;
							
							item.username = GLOBALS.username;
							item.epId = GLOBALS.epId;
							item.password = GLOBALS.password;
							item.bfix = GLOBALS.bfix;
						}
					});
					if (!found) {
						_be.Login.loginInfor.splice(0, 0, {
							address: GLOBALS.path,
							username: GLOBALS.username,
							epId: GLOBALS.epId,
							password: GLOBALS.password,
							bfix: GLOBALS.bfix,
							remeberPsw: 1,
							selected: 1				
						});
					}
				}
				
				if (GLOBALS.debug.active) logger(fn, "_be.Login.loginInfor -> " + $.toJSON(_be.Login.loginInfor));
				
				for (var i = 0; i < _be.Login.loginInfor.length; i++) {
					var li = _be.Login.loginInfor[i],
						r = new RegExp(NPPUtils.Regexs.domain, "gm");
					if (li == "" || li == null || typeof li != "object" || !r.test(li.address)) {
						_be.Login.loginInfor.splice(i, 1);
						continue; 
					}
					var addr = li.address;
					addrData.push({
						label: addr,
						value: addr
					});	
					
					if (!selectedAddr) {
						if (li.selected != 0) {
							selectedAddr = addr;	
						}
					}
					else {
						li.selected = 0;	
					}
					
					if (!firstAddr) {
						firstAddr = addr;	
					}
				}
				$("#address").combobox("loadData", addrData);
				
				if (!selectedAddr) selectedAddr = firstAddr;
				$("#address").combobox("select", selectedAddr);
				
			}
			catch (e) {
				excep(fn, e);	
			}	
		},
		// - 记录登录信息
		SaveLoginCookie: function () {
			try {
				var fn = "_be.Login.SaveLoginCookie";
				
				if (_be.connectId && NPPILY.Connections.get(_be.connectId)) {
					_be.Login.loginInfor = _be.Login.loginInfor || [];
				
					var _connStruct = NPPILY.Connections.get(_be.connectId);
					var connParam = _connStruct.connParam;
					
					var found,
						r = new RegExp(NPPUtils.Regexs.domain, "gm");
					
					$.each(_be.Login.loginInfor, function (index, item) {
						if (item == "" || item == null || typeof item != "object" || !r.test(item.address)) {
							_be.Login.loginInfor.splice(index, 1);
							return true;	
						}
						if (item.address == connParam.path) {
							found = true;
							
							item.username = connParam.username;
							item.epId = connParam.epId;
							item.password = connParam.password;
							item.bfix = connParam.bFixCUIAddress;
							
							item.selected = 1;
							item.remeberPsw = $("#remeberPsw")[0].checked == true ? 1 : 0;
						}
						else {
							item.selected = 0;	
						}
					});
					
					if (!found) {
						_be.Login.loginInfor.splice(0, 0, {
							address: connParam.path,
							username: connParam.username,
							epId: connParam.epId,
							password: connParam.password,
							bfix: connParam.bFixCUIAddress,
							remeberPsw: 1,
							selected: 1	
						});
					}
					
					// - 记录到cookie中
					$.cookie("loginInfor", $.toJSON(_be.Login.loginInfor));
					if (GLOBALS.debug.active) logger(fn, "loginInfor -> " + $.toJSON(_be.Login.loginInfor));
				}
			}
			catch (e) {
				excep(fn, e);	
			}	
		},
		
		// - 提交登录
		Submit: function () {
			try {
				var fn = "_be.Login.Submit";
				
				var path = $("#address").combobox("getText"),
					username = $("#username").val(),
					epId = $("#epId").val(),
					password = $("#password").val(),
					bfix = $("#bfix")[0].checked;
				
				this.Connect(
					new NPPILY.Struct.ConnParamStruct(
						path, 
						username, 
						epId, 
						password, 
						bfix 
					)
				);
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 重置
		Reset: function () {
			try {
				var fn = "_be.Login.Reset";
				
				$("#address").combobox("clear"),
				$("#username").val(""),
				$("#epId").val(""),
				$("#password").val(""),
				$("#remeberPsw")[0].checked = false;
				$("#bfix")[0].checked = false;
			}
			catch (e) {
				excep(fn, e);	
			}
		}, 
		
		// - 登录
		Connect: function (connParam) {
			try {
				var fn = "_be.Login.Connect";
				
				if (connParam instanceof NPPILY.Struct.ConnParamStruct) {
					$("#login-window-box")
						.window("close");
					
					// - 创建正在连接提示信息
					_be.Mask.Show("正在建立连接，请稍候...");
					
					setTimeout(
						function () {
							var operator = NPPILY.Connect(connParam);
							
							_be.Mask.Hide();
							
							if (operator.rv == NrcapError.NRCAP_SUCCESS) {
								_be.Login.Success(operator);
							}
							else {
								_be.Login.Failure(operator);
							} 
							
							_be.Control.ToggleLogin();
						}, 500
					);
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		}, 
		// - 登录成功
		Success: function (operator) {
			try {
				var fn = "_be.Login.Success";
				
				_be.Login.status = true;
			
				_be.connectId = operator.response;
				
				// - 注册事件通知
				_be.NCEvent.Init();
				
				// - 记录登录信息
				_be.Login.SaveLoginCookie();
								
				
				/*$.messager.show({
					title: "提示 - 登录成功",
					msg: "<ul><li>登录成功，获取资源...</li></ul>",
					timeout: 2000,
					height: 130
				});*/
				
				var _connStruct = NPPILY.Connections.get(_be.connectId);
				if (_connStruct) {
					var toHeight = 165, gps_datagrid_title;
					if (_connStruct.connType != NPPILY.Enum.ConnectionType.Device) {
						toHeight = 290;
						gps_datagrid_title = "登录服务器 - " +　(_connStruct.systemName || "NVS");
					}
					else {
						gps_datagrid_title = "直连设备";
					}
					$("body")
						.layout("expand", "south")
						.layout("panel", "south")
						.panel("resize", {height: toHeight});
					
					$("#gps-grid-box")
						.datagrid({
							"title": gps_datagrid_title, 
							iconCls: "icon-tip",
							onClickRow: function (ri, rd) {
								_be.Emap.ClickGPSList(ri, rd);
							}
						});
						
					// - 初始化资源
					_be.Mask.Show("登录成功，获取资源...");
					setTimeout(function () {
						_be.Resource.Init();
					}, 500);
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 登录失败
		Failure: function (operator) {
			try {
				var fn = "_be.Login.Failure";
				
				_be.Login.status = false;
				
				$.messager.show({
					title: "提示 - 登录失败",
					msg: "<ul><li>错误代码<font color='blue'>"+operator.rv+"</font></li><li>描述<font color='blue'>"+NrcapError.Detail(operator.rv)+"</font></li></ul>",
					timeout: 3000,
					height: 130
				});
				_be.Login.ShowLoginBox({
					loginFailed: GLOBALS.loginMode != "normal" ? true : false,
					operator: operator
				});
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 断开连接
		DisConnection: function () {
			try {
				var fn = "_be.Login.DisConnection";
				
				_be.Emap.Clear();
				_be.Video.Clear();
				
				NPPILY.DisConnection(_be.connectId);
				_be.connectId = null;
				_be.Login.status = false;
				// - 显示登录框
				_be.Login.ShowLoginBox();
				_be.Control.ToggleLogin();
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		end: true
	},
	// - NC事件处理
	NCEvent: 
	{
		Init: function () {
			try {
				var fn = "_be.NCEvent.Init";
				
				// - 注册NC相关事件，插件回调函数通知前端，故不需要主动定时获取事件
				var connectId = _be.connectId;
			
				if(connectId && NPPILY.Connections.get(connectId)) {
					var _connStruct = NPPILY.Connections.get(connectId);
					
					// - 把连接信息注册
					_be.NCEvent.HandleCaller.Register(_connStruct.session, _be.NCEvent.EventNotify.Receiver);
					
					var _ncNtfStore = {
						"stream_status_notify" : {
							active: true,
							notify: NPPILY.Enum.NCObjectNotify.stream_status_notify
						},
						"event_notify" : {
							active: true,
							notify: NPPILY.Enum.NCObjectNotify.event_notify	
						}, 
						"gps_data_notify" : {
							active: true,
							notify: NPPILY.Enum.NCObjectNotify.gps_data_notify		
						} 
					};
					
					for (var key in _ncNtfStore) {
						if (_ncNtfStore[key].active == true) {
							var name = _ncNtfStore[key].notify;
							
							NPPILY.NCNotifyManager.Add
							(
								name, 
								function (_ncnStruct) 
								{
									_be.NCEvent.HandleCaller.Execute(_ncnStruct);
								}	
							);
						}
					}
				}
			}
			catch (e) {
				excep(fn, e);
				return false;	
			} 	
		},
		
		// - 句柄与处理函数控制
		HandleCaller:
		{
			// - 存储句柄与处理函数映射
			Mappings: {},
			
			// - 注册
			Register: function (_HANDLE, _METHOD) {
				try {
					var fn = "_be.NCEvent.HandleCaller.Register";
					
					if (_HANDLE && typeof _METHOD == "function") {
						this.Mappings[_HANDLE] = _METHOD;	
					}
				}
				catch (e) {
					excep(fn, e);
					return false;	
				} 	
			},
			// - 卸载
			UnRegister: function (_HANDLE) {
				try {
					var fn = "_be.NCEvent.HandleCaller.UnRegister";
					
					if (_HANDLE && typeof this.Mappings[_HANDLE] == "function") {
						this.Mappings[_HANDLE] = function () {};
						delete this.Mappings[_HANDLE];
					}
				}
				catch (e) {
					excep(fn, e);
					return false;	
				} 	
			},
			// - 执行查找匹配映射
			Execute: function (_ncnStruct) {
				try {
					var fn = "_be.NCEvent.HandleCaller.Execute";
					
					if (_ncnStruct && _ncnStruct instanceof NPPILY.Struct.NCObjectNotifyStruct) {
						if (_ncnStruct._HANDLE && typeof this.Mappings[_ncnStruct._HANDLE] == "function") {
							this.Mappings[_ncnStruct._HANDLE](_ncnStruct);
						}	
					}
				}
				catch (e) {
					excep(fn, e);
					return false;	
				} 	
			},
			
			end: true
		},
		
		// - 事件通知
		EventNotify: {
			Receiver: function (_ncnStruct) {
				try {
					var fn = "_be.NCEvent.EventNotify.Receiver";
					
					if (GLOBALS.debug.active && GLOBALS.debug.NCNotify.enable_event_notify) {
						logger(fn, "event_notify - > " + $.toJSON(_ncnStruct));
					}
					
					if (_ncnStruct.errorCode == 0) {
						var kd = _ncnStruct.keyData || {};
						switch (kd.event.id) {
							// - 设备上下线
							case "EVT_PU_Online":
							case "EVT_PU_Offline":
								_be.Resource.PUNotify(_ncnStruct);
								break;	
						} 
					}
					else {
						// - 发生连接断开事件 
						$.messager.show({
							title: "提示 - 断开连接",
							msg: "已侦测到断开连接，请重新建立连接..."
						});
						
						// - 断开连接
						_be.Login.DisConnection();
					}
				}
				catch (e) {
					excep(fn, e);
				}
			},
			
			end: true
		},
		
		end: true
	},
	
	// - 资源对象
	Resource: {
		resource: new NPPUtils.Hash(),
		
		Init: function () {
			try {
				var fn = "_be.Resource.Init";
				
				// var data = [{gps_name: "Android(GPS0)", gps_status: "正常"}]
				
				var resource = [], offset = 0, count = 300;
				// - 获取资源
				while(true) {
					var operator = NPPILY.ForkResource
					(
					 	_be.connectId,
						NPPILY.Enum.ForkResourceLevel.nppForkPUInfo,
						offset,
						count
					);
					if (operator.rv == NrcapError.NRCAP_SUCCESS) {
						if (operator.response) {
							if (operator.response.constructor != Array) {
								operator.response = [operator.response];	
							}
							resource = resource.concat(operator.response);
							if (operator.response.length >= count) {
								offset = offset + count;
							}
							else {
								break;	
							}
						}
						else {
							break;	
						}
					}
					else {
						break;
					} 
				};
				if (GLOBALS.debug) logger(fn, "count of -> " + resource.length + ", resource -> " + $.toJSON(resource));
				
				var _connStruct = NPPILY.Connections.get(_be.connectId);
				
				// - 获取到在线的设备
				$.each(resource, function (index, item) {
					if (_connStruct.connType == NPPILY.Enum.ConnectionType.Device) {
						for (var i = 0; i < item.childResource.length; i++) {
							var child = item.childResource[i];
							if (child.type == NPPILY.Enum.PuResourceType.GPS) {
								// - 把具有GPS资源的记录下来
							 	if (!_be.Resource.resource.get(item.puid)) {
								 	_be.Resource.resource.set(item.puid, item);
								}
								// - 创建GPS数据接收通道
								_be.Emap.CreateGPS(item, child);	
							} 
						}
						return true;
					}
					if (item.online == 1 && item.enable == 1) {
						 switch (item.modelType) {
							 case NPPILY.Enum.PuModelType.ENC:
							 case NPPILY.Enum.PuModelType.WENC:
								// - 获取子资源创建GPS数据接收通道
								_be.Resource.ForkChildResource(item);
								break;
							default: 
								return true;
								break;
						 }
					} 
				});
				
				// - 关闭掩码
				_be.Mask.Hide();
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 获取子资源
		ForkChildResource: function (puNode) {
			try {
				var fn = "_be.Resource.ForkChildResource";
				
				var operator = NPPILY.ForkResource
				(
					_be.connectId,
					NPPILY.Enum.ForkResourceLevel.nppForkPUResourceInfo,
					0,
					0,
					"",
					{
						_HANDLE: puNode._HANDLE	
					}
				);
				if (operator.rv == NrcapError.NRCAP_SUCCESS) {
					if (operator.response) {
						puNode.childResource = operator.response;
						
						for (var i = 0; i < operator.response.length; i++) {
							var child = operator.response[i];
							if (child.type == NPPILY.Enum.PuResourceType.GPS) {
								// - 把具有GPS资源的记录下来
							 	if (!_be.Resource.resource.get(puNode.puid)) {
								 	_be.Resource.resource.set(puNode.puid, puNode);
								}
								// - 创建GPS数据接收通道
								_be.Emap.CreateGPS(puNode, child);	
							} 
						}
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 设备上下线通知
		PUNotify: function(_ncnStruct) {
			try {
				var fn = "_be.Resource.PUNotify";
				
				var kd = _ncnStruct.keyData || {},
					e = kd.event || {};
				
				switch (e.id) {
					// - 设备上下线
					case "EVT_PU_Online":
						_be.Resource.PUOnline(e.src_id, _ncnStruct);
						break;
					case "EVT_PU_Offline":
						_be.Resource.PUOffline(e.src_id, _ncnStruct);
						break;	
				} 
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 设备上线
		PUOnline: function (puid) {
			try {
				var fn = "_be.Resource.PUOnline";
				
				var puNode = _be.Resource.GetPUNode(puid);
				if (!puNode) {
					var operator = NPPILY.ForkResource
					(
						_be.connectId,
						NPPILY.Enum.ForkResourceLevel.nppForkOnePUInfo,
						0,
						0,
						"",
						{
							PUID: puid	
						}
					);
					if (operator.rv == NrcapError.NRCAP_SUCCESS) {
						puNode = operator.response;
					}	
				}
				else {
					puNode.online = 1;	
				}
				if (puNode && puNode.childResource) {
					if (puNode.modelType != NPPILY.Enum.PuModelType.ENC && puNode.modelType != NPPILY.Enum.PuModelType.WENC) {
						return false;							
					}
					var data = [];
					for (var i = 0; i < puNode.childResource.length; i++) {
						var child = puNode.childResource[i];
						if (child.type == NPPILY.Enum.PuResourceType.GPS) {
							// - 判断是否存在GPS
							var exists = _be.Emap.GPSChannelExists(puid, child.idx);
							if (!exists) {
								// - 把具有GPS资源的记录下来
								if (!_be.Resource.resource.get(puNode.puid)) {
									_be.Resource.resource.set(puNode.puid, puNode);
								}
								// - 创建GPS数据接收通道
								_be.Emap.CreateGPS(puNode, child);		
							}
						} 
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 设备下线
		PUOffline: function (puid) {
			try {
				var fn = "_be.Resource.PUOffline";
				
				var puNode = _be.Resource.GetPUNode(puid);
				if (puNode) {
					puNode.online = 0;
					if (puNode && puNode.childResource) {
						for (var i = 0; i < puNode.childResource.length; i++) {
							var child = puNode.childResource[i];
							if (child.type == NPPILY.Enum.PuResourceType.GPS) {
								// - 判断是否存在GPS
								var exists = _be.Emap.GPSChannelExists(puid, child.idx);
								if (exists) {
									// - 移除GPS数据接收通道
									_be.Emap.RemoveGPS(puNode, child);		
								}
							}
						} 
						// - 停止相关视频
						NPPILY.WindowContainers.each(function (item) {
							var node = item.value;
							if (node.window && node.window.status.playvideoing && node.window.params.puid == puid) {
								// - 关闭视频
								_be.Video.ResponseOperation("StopVideo", item.key);
							}
						});
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 获取设备信息节点
		GetPUNode: function (puid) {
			try {
				var fn = "_be.Resource.GetPUNode";
				var pu = null;
				if (_be.Resource.resource) {
					pu = _be.Resource.resource.get(puid);
				}
				return pu;
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		end: true
	},
	
	// - 电子地图对象
	Emap: {
		// - 地图对象
		mapObj: null,
		// - 是否阻止记录接收到的GPS数据信息
		stoppingRecord: false,
		
		GPSObjectStruct: function () {
			this.key = "";
			this._HANDLE = "";
			this.domainRoad = "";
			this.puid = null;
			this.puName = null;
			this.puDesc = null;
			this.gps_idx = 0;
			this.gpsNode = null;
			this.gpsData = [];
			this.gpsRealData = [];
			this.geocode_callback = null;
			this.marker = null;
			this.polyline = null;
			this.lock = false;
		},
		GPSObjectStore: new NPPUtils.Hash(),
		
		MappingHandleKey: {},
		
		Init: function () {
			try {
				var fn = "_be.Emap.Init";
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 变动车辆标记位置
		ZoomMarkers: function () {
			try {
				var fn = "_be.Emap.ZoomMarkers";
				
				if (_be.Emap.GPSObjectStore) {
					_be.Emap.GPSObjectStore.each(function (item) {
						var node = item.value;
						if (node.marker != null) {
							var lastRealData = node.gpsRealData[node.gpsRealData.length - 1];
							if (lastRealData) {
								// - 设置一下位置
								node.marker.move(
									lastRealData.latitude, 
									lastRealData.longitude, 
									(node.lock == true ? true : false)
								);
							}	
						}
					});	
				}
			}
			catch(e) {
				excep(fn, e);
			}
		},
		Zoom: function (action) {
			try {
				var fn = "_be.Emap.Zoom";
				
				switch (action) {
					case "zoomOut":
						_be.Emap.mapObj.zoomOut();
						break;
					default:
						_be.Emap.mapObj.zoomIn();
						break;
				} 
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 测距
		Distance: function (action) {
			try {
				var fn = "_be.Emap.Distance";
				
				switch (action) {
					case "enable":
						if (typeof _be.Emap.mapObj.enableDistance == "function") {
							_be.Emap.mapObj.enableDistance();
						}
						break;
					default:
						if (typeof _be.Emap.mapObj.disableDistance == "function") {
							_be.Emap.mapObj.disableDistance(true);
						}
						break;
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 判断是否存在接收通道
		GPSChannelExists: function (puid, gpsIndex) {
			try {
				var fn = "_be.Emap.GPSChannelExists";
				
				var key = puid + "_" + gpsIndex;
				return _be.Emap.GPSObjectStore.get(key) ? true : false;
			}
			catch (e) {
				excep(fn, e);	
				return false;
			}
		},
		
		// - 创建GPS数据接收通道
		// @puNode object 设备信息节点
		// @gpsNode object gps资源信息节点
		CreateGPS: function (puNode, gpsNode) {
			try {
				var fn = "_be.Emap.CreateGPS";
				
				if (gpsNode instanceof NPPILY.Struct.PUResourceNodeStruct) {
					// logger(fn, "gpsNode -> " + gpsNode.idx);
					
					var operator = NPPILY.StartGPSStream
					(
					 	_be.connectId, 
						puNode.puid, 
						gpsNode.idx
					);
					if (operator.rv == NrcapError.NRCAP_SUCCESS) {
						var gpsObj = new _be.Emap.GPSObjectStruct();
						gpsObj._HANDLE = operator.response || gpsNode._HANDLE;
						gpsObj.key = puNode.puid + "_" + gpsNode.idx;
						gpsObj.puid = puNode.puid;
						gpsObj.puName = puNode.name;
						gpsObj.puDesc = puNode.description;
						gpsObj.gps_idx = gpsNode.idx;
						gpsObj.gpsNode = gpsNode;
						gpsObj.geocode_callback = _be.Emap.GeocodeCallback;
						
						_be.Emap.GPSObjectStore.set(gpsObj.key, gpsObj);
						
						_be.Emap.MappingHandleKey[gpsObj._HANDLE] = gpsObj.key;
						
						// - 注册接收状态通知
						_be.NCEvent.HandleCaller.Register(gpsObj._HANDLE, _be.Emap.GPSData_Callback);
					
						var icon_cls_pfx = "gateway", icon_cls_sfx = "";
						if (puNode.modelType == NPPILY.Enum.PuModelType.ENC) {
							icon_cls_pfx = "station";	
						}
						var icon_cls = icon_cls_pfx + "" + icon_cls_sfx;
						
						// - 加入到列表
						$("#gps-grid-box").datagrid("appendRow", {
							gps_puid_idx: (gpsObj.puid + "_" + gpsObj.gps_idx),
							gps_name: "&nbsp;&nbsp;<span class='"+icon_cls+" icon-tip' style='width: 16px; height: 20px; vertical-align: middle; display: inline-block;'></span>" + (gpsObj.puName + "(" + gpsObj.gpsNode.name + ")")
						});
					}  	
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 移除GPS数据接收通道
		RemoveGPS: function (puNode, gpsNode) {
			try {
				var fn = "_be.Emap.RemoveGPS";
				
				if (puNode && gpsNode && gpsNode.type == NPPILY.Enum.PuResourceType.GPS) {
					// - 停止接收
					var operator = NPPILY.StopGPSStream
					(
					 	_be.connectId, 
						puNode.puid, 
						gpsNode.idx
					);
					// - 从列表中移除
					var key = puNode.puid + "_" + gpsNode.idx,
						obj = $("#gps-grid-box"),
						ri = obj.datagrid("getRowIndex", key);
					if (ri >= 0) {
						obj.datagrid("deleteRow", ri);		
					}
					// - 从数据存储中删除
					var gpsObj = _be.Emap.GPSObjectStore.get(key);
					if (gpsObj) {
						// - 卸载接收状态通知
						_be.NCEvent.HandleCaller.UnRegister(gpsObj._HANDLE);
						if (typeof _be.Emap.MappingHandleKey[gpsObj._HANDLE] != "undefined") {
							delete _be.Emap.MappingHandleKey[gpsObj._HANDLE];	
						}
						// - 从地图中移除
						if(gpsObj.polyline != null){
							gpsObj.polyline.setPath([]);	
							gpsObj.polyline = null; 
						}
						gpsObj.lock = false;
						if(gpsObj.marker != null){
							gpsObj.marker.setMap(null); // 移除标记	
						}
						_be.Emap.GPSObjectStore.unset(key);
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 接收响应
		GPSData_Callback: function (_ncnStruct) {
			try {
				var fn = "_be.Emap.GPSData_Callback";
				
				if (GLOBALS.debug && GLOBALS.debug.NCNotify.enable_gps_data_notify) {
					logger(fn, (_be.Emap.stoppingRecord?"!Dropping":"!Using") + " GPSData - _nanStruct -> " + $.toJSON(_ncnStruct));
				}
				
				// - 停止记录GPS数据信息
				if (_be.Emap.stoppingRecord) {
					return false;	
				}
				
				var gridKey = _be.Emap.MappingHandleKey[_ncnStruct._HANDLE];
					
				var rowIndex = $("#gps-grid-box").datagrid("getRowIndex", gridKey);
				
				if (rowIndex >= 0) { 
					var kd = _ncnStruct.keyData || {};
					if (typeof kd.utc != "undefined") {
						var lat = Number(kd.latitude).toFixed(6),
							lng = Number(kd.longitude).toFixed(6),
							t = NPPUtils.DateFormat("yyyy-MM-dd HH:mm:ss", new Date(parseInt(kd.utc) * 1000)),
							alt = kd.altitude,
							sp = kd.speed,
							maxsp = kd.max_speed,
							minsp = kd.min_speed,
							b = _be.Emap.BearingDetail(kd.bearing),
							st;
							
						switch(Number(kd.gps_status)) {
							case 0: st = "正常"; break;
							case 1: st = "无信号"; break;
							case 2: st = "无模块"; break;
						}
						
						$("#gps-grid-box").datagrid("updateRow", {
							index: rowIndex,
							row: {
								gps_status: st,
								gps_longitude: lng,
								gps_latitude: lat,
								gps_time: t,
								gps_bearing: b,
								gps_speed: sp,
								gps_altitude: alt 
							}
						});
						
						// - 记录到变量中
						var gpsObj = _be.Emap.GPSObjectStore.get(gridKey);
						if (gpsObj.gpsData.length >= GLOBALS.map.maxGPSData && GLOBALS.map.maxGPSData != 0) {
							gpsObj.gpsData = [];
							gpsObj.gpsRealData = [];
						}
						gpsObj.gpsData.push(kd);
						
						// - 坐标转换
						var _kdcopy = {};
						$.extend(true, _kdcopy, kd);
						CREMapAPI.GPSConvertorPoint(lat, lng, function (rLat, rLng) {
							_kdcopy.latitude = rLat;
							_kdcopy.longitude = rLng;
							// logger(fn, "_kdcopy -> " + $.toJSON(_kdcopy)); 
							gpsObj.gpsRealData.push(_kdcopy);
							
							// - 更新地图设备图标
							_be.Emap.UpdateMarkers(gpsObj, kd);　
							// 反向地理坐标解析回调
							CREMapAPI.geocode(rLat, rLng, gpsObj); 
						});
					}
				} 
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		Clear: function () {
			try {
				var fn = "_be.Emap.Clear";
				
				if (_be.Emap.GPSObjectStore) {
					_be.Emap.GPSObjectStore.each(
						function (item) {
							var gpsObj = item.value;
							// - 停止接收
							var operator = NPPILY.StopGPSStream
							(
								_be.connectId, 
								gpsObj.puid, 
								gpsObj.gps_idx
							);
							// - 卸载接收状态通知
							_be.NCEvent.HandleCaller.UnRegister(gpsObj._HANDLE);
							if (typeof _be.Emap.MappingHandleKey[gpsObj._HANDLE] != "undefined") {
								delete _be.Emap.MappingHandleKey[gpsObj._HANDLE];	
							}
							// - 从地图中移除
							if(gpsObj.polyline != null){
								gpsObj.polyline.setPath([]);	
								gpsObj.polyline = null; 
							}
							gpsObj.lock = false;
							if(gpsObj.marker != null){
								gpsObj.marker.setMap(null); // 移除标记	
							}
						}
					); 
					_be.Emap.GPSObjectStore = new NPPUtils.Hash();
				}
				
				$("#gps-grid-box")
					.datagrid("loadData", []);
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 单击列表项
		ClickGPSList: function (rowIndex, rowData) {
			try {
				var fn = "_be.Emap.ClickGPSList";
				
				logger(fn, rowIndex + " -> " + $.toJSON(rowData));
				
				if (rowData) {
					
					var key = rowData.gps_puid_idx,
						gpsObj = _be.Emap.GPSObjectStore.get(key);
								
					if (gpsObj && gpsObj.marker) {
						gpsObj.marker.showCenter();
					}
					return false;
					
					CREMapAPI.GPSConvertorPoint(
						rowData.gps_latitude, 
						rowData.gps_longitude, 
						function (lat, lng) {
							var key = rowData.gps_puid_idx,
								gpsObj = _be.Emap.GPSObjectStore.get(key);
							
							if (gpsObj && gpsObj.marker) {
								// 转到对应的标记
								gpsObj.marker.move(lat, lng, true);
							}
						}
					);	
				} 
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 更新地图设备图标
		UpdateMarkers: function (gpsObj, lastData) {
			try {
				var fn = "_be.Emap.UpdateMarkers";
				
				if (gpsObj && lastData) {
					var mapObj = _be.Emap.mapObj;
					if (mapObj && mapObj.markers) {
						var rd = gpsObj.gpsRealData;
						var lastRealData = rd[rd.length - 1];
						
						var lat = Number(lastData.latitude).toFixed(6),
							lng = Number(lastData.longitude).toFixed(6),
							t = NPPUtils.DateFormat("yyyy-MM-dd HH:mm:ss", new Date(parseInt(lastData.utc) * 1000)),
							alt = lastData.altitude,
							sp = lastData.speed,
							maxsp = lastData.max_speed,
							minsp = lastData.min_speed,
							b = _be.Emap.BearingDetail(lastData.bearing),
							st;
							
						switch(Number(lastData.gps_status)) {
							case 0: st = "正常"; break;
							case 1: st = "无信号"; break;
							case 2: st = "无模块"; break;
						}
						
						var id_pfx = gpsObj.puid + "_" + gpsObj.gps_idx;
						
						var htmlstr = "<div style=\"margin:2px 0px;\">"; 
							htmlstr += "<div style=\"margin:2px 0px;\" ><span id=\""+id_pfx+"_marker_time\">时间："+t+"</span></div>";
							htmlstr += "<div style=\"margin:2px 0px;\" ><span id=\"\" >车辆："+gpsObj.puName+"</span></div>";
							htmlstr += "<div style=\"margin:2px 0px;\" ><span id=\""+id_pfx+"_marker_speed\">速度："+sp+"（km/h）</span></div>";
							htmlstr += "<div style=\"margin:2px 0px;\" ><span id=\""+id_pfx+"_marker_state\">状态："+st+"</span></div>";
							htmlstr += "<div style=\"margin:2px 0px;\" ><span id=\""+id_pfx+"_marker_bearing\">方向："+b+"</span></div>";
							htmlstr += "<div style=\"margin:2px 0px;border-bottom:1px solid dashed;padding-bottom:5px;\" ><span id=\""+id_pfx+"_marker_bearing\" k=span_address>位置："+(gpsObj.lastAddress||"搜索中...")+"</span></div>";
							htmlstr += "<div style=\"margin:2px 0px;\" ></div><div style=\"width:;height:2px;line-height:2px;border-top:1px #c0c0c0;\"></div>"; 
						htmlstr += "</div>";
						
						htmlstr += "<div>";
							
							if(gpsObj.polyline == null){
								htmlstr += "<span onmouseover=\"this.style.textDecoration='underline';\" onmouseout=\"this.style.textDecoration='none';\" style=\"cursor:pointer;color:#0464BB;text-decoration:none;\" id=\""+id_pfx+"_polyline\" href=\"javascript:void(0);\" onclick=\"_be.Emap.Polyline('"+gpsObj.puid+"', '"+gpsObj.gps_idx+"');\">轨迹跟踪</span>&nbsp;";					
							}
							else {
								htmlstr += "<span onmouseover=\"this.style.textDecoration='underline';\" onmouseout=\"this.style.textDecoration='none';\" style=\"cursor:pointer;color:#0464BB;text-decoration:none;\" id=\""+id_pfx+"_polyline\" href=\"javascript:void(0);\" onclick=\"_be.Emap.RemovePolyline('"+gpsObj.puid+"', '"+gpsObj.gps_idx+"');\">停止跟踪</span>&nbsp;";					
							}  
							if(gpsObj.lock === false){
								htmlstr += "<span onmouseover=\"this.style.textDecoration='underline';\" onmouseout=\"this.style.textDecoration='none';\" style=\"cursor:pointer;color:#0464BB;text-decoration:none;\" id=\""+id_pfx+"_lock\" href=\"javascript:void(0);\" onclick=\"_be.Emap.LockVihicle('"+gpsObj.puid+"', '"+gpsObj.gps_idx+"');\">锁定车辆</span>&nbsp;";					
							}
							else {
								htmlstr += "<span onmouseover=\"this.style.textDecoration='underline';\" onmouseout=\"this.style.textDecoration='none';\" style=\"cursor:pointer;color:#0464BB;text-decoration:none;\" id=\""+id_pfx+"_lock\" href=\"javascript:void(0);\" onclick=\"_be.Emap.UnLockVihicle('"+gpsObj.puid+"', '"+gpsObj.gps_idx+"');\">解除锁定</span>&nbsp;";					
							} 
							// - 清除轨迹 ---
							htmlstr += "<span onmouseover=\"this.style.textDecoration='underline';\" onmouseout=\"this.style.textDecoration='none';\" style=\"cursor:pointer;color:#0464BB;text-decoration:none;\" id=\""+id_pfx+"_clear_polyline\" href=\"javascript:void(0);\" onclick=\"_be.Emap.ClearPolylineStore('"+gpsObj.puid+"', '"+gpsObj.gps_idx+"');\" />清除轨迹</span>";
						
						htmlstr += "</div>";
						
						htmlstr += _be.Emap.GetGPSCameraListStr(gpsObj.puid); // gps video list
						
						// 添加一个onclick事件
						// htmlstr = "<div id=\""+id_pfx+"_panel\" onclick=\"_be.Emap.AttachEmapEvent('marker_infowindow_click', '"+gpsObj.puid+"');\" >" + htmlstr + "</div>";
						
						htmlstr = "<div style=\"width:auto;height:auto;overflow:auto;\">"+htmlstr+"</div>";
						
						var iconUrl = _be.Emap.GetIconUrl(lastData.bearing);
						
						// - 更新标记
						if (gpsObj.marker == null) {
							gpsObj.marker = mapObj.markers.add(
								lastRealData.latitude,
								lastRealData.longitude, {
									puid: gpsObj.puid,
									title: (gpsObj.puName+"("+gpsObj.gpsNode.name+")"),
									infoWindowContent: htmlstr,
									icon: iconUrl 
								}
							);
							
						}
						else {
							// - 设置信息面板内容
							/*if ($("#"+id_pfx+"_marker_time")[0]) {
								$("#"+id_pfx+"_marker_time").html("时间：" + t);	
							}
							if ($("#"+id_pfx+"_marker_speed")[0]) {
								$("#"+id_pfx+"_marker_speed").html("速度：" + sp + "（km/h）");	
							}
							if ($("#"+id_pfx+"_marker_state")[0]) {
								$("#"+id_pfx+"_marker_state").html("状态：" + st);	
							}
							if ($("#"+id_pfx+"_marker_bearing")[0]) {
								$("#"+id_pfx+"_marker_bearing").html("方向：" + b);	
							}
							if ($("#"+id_pfx+"_marker_address")[0]) {
								$("#"+id_pfx+"_marker_address").html("位置："+gpsObj.lastAddress);
							}*/
							// - 设置图标
							gpsObj.marker.setIcon(iconUrl);
							// - 设置信息面板内容
							gpsObj.marker.setInfoWindow(htmlstr);
							
							// - 移动标记点
							gpsObj.marker.move(
								lastRealData.latitude, 
								lastRealData.longitude, 
								(gpsObj.lock == true ? true : false)
							); 
							
							if(gpsObj.polyline != null) {
								_be.Emap.Polyline(gpsObj.puid, gpsObj.gps_idx);	
							}
						}
					} 
				} 
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 反向地理坐标解析回调
		GeocodeCallback: function (gpsObj, address) {
			try {
				var fn = "_be.Emap.GeocodeCallback";
				
				if (!gpsObj) return false;
				
				var obj = $("#gps-grid-box"),
					rowIndex = obj.datagrid("getRowIndex", gpsObj.key);
				obj.datagrid("updateRow", {
					index: rowIndex,
					row: {
						gps_address: address	
					}
				});
				
				gpsObj.lastAddress = address || gpsObj.lastAddress || "";
				
				if (gpsObj.marker) {
					// - 设置信息面板内容
					var id_pfx = gpsObj.puid + "_" + gpsObj.gps_idx;
					
					var html = gpsObj.marker.html.replace(/k=span_address>(位置[:：][\s\S]*?)<\/span>/, "k=span_address>位置："+gpsObj.lastAddress+"</span>");
					gpsObj.marker.setInfoWindow(html);
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 获取摄像头列表
		GetGPSCameraListStr: function (puid) {
            try{
				var fn = "_be.Emap.GetGPSCameraListStr";
				var html = [];
				var puNode = _be.Resource.GetPUNode(puid);
				html.push("<span onmouseover=\"this.style.textDecoration='underline';\" onmouseout=\"this.style.textDecoration='none';\" style=\"cursor:pointer;color:#0464BB;text-decoration:none;margin-top:2px;margin-top:2px !important;\" onclick=\"_be.Video.PlainPlayAllVideo('"+puid+"');\" title=\"在此页面内播放全部视频（所有已经正在播放的视频将会关闭）\">全部播放</span>&nbsp;");
				if (puNode && puNode.childResource) {
					var k = 1;
					$.each(puNode.childResource, function (i, child) {
						if(child.type == NPPILY.Enum.PuResourceType.VideoIn){
							html.push("<span onmouseover=\"this.style.textDecoration='underline';\" onmouseout=\"this.style.textDecoration='none';\" style=\"cursor:pointer;color:#0464BB;text-decoration:none;margin-top:2px;margin-top:2px !important;\" onclick=\"_be.Video.PlayVideo('"+puid+"', '"+child.idx+"');\" title=\""+child.name+"\">摄像头"+(k++)+"</span>&nbsp;");
						}									   
					});
				}
				return html.join("");
			}
			catch (e) {
				excep(fn, e);	
				return "";
			}
			
		},
		// - 跟踪轨迹
		Polyline: function (puid, gpsIndex) {
            try{
				var fn = "_be.Emap.Polyline";
				
				var key = puid + "_" + gpsIndex,
					gpsObj = _be.Emap.GPSObjectStore.get(key);
				if (gpsObj) {
					if(gpsObj.polyline != null) {
						gpsObj.polyline.setPath([]);	
					} 
					
					// - 运行速度太慢了
					/*var points = [];
					$.each(gpsObj.gpsData, function(index, data) {
						points.push({lat: data.latitude, lng: data.longitude});								
					});
					
					CREMapAPI.TranslateGPSToXMapPoints(
						points,
						function (newPoints) {
							var np = [];
							$.each(newPoints, function(index, data) {
								np.push({latitude: data.lat, longitude: data.lng});					   
							});
							gpsObj.polyline = _be.Emap.mapObj.polyline(np);
						}
					);*/
					
					// - 采用实时转换过后的
					gpsObj.polyline = _be.Emap.mapObj.polyline(gpsObj.gpsRealData);  
					
					_be.Emap.SetInfoWindowStatus(gpsObj);
				}
			}
			catch (e) {
				excep(fn, e);	
			}
			
		},
		// - 移除轨迹
		RemovePolyline: function (puid, gpsIndex) {
            try{
				var fn = "_be.Emap.RemovePolyline";
				
				var key = puid + "_" + gpsIndex,
					gpsObj = _be.Emap.GPSObjectStore.get(key);
				if (gpsObj &&　gpsObj.polyline != null) {
					gpsObj.polyline.setPath([]);
					
					gpsObj.polyline = null;
					_be.Emap.SetInfoWindowStatus(gpsObj);
				}
			}
			catch (e) {
				excep(fn, e);	
			}
			
		},
		// - 锁定车辆
		LockVihicle: function (puid, gpsIndex) {
            try{
				var fn = "_be.Emap.LockVihicle";
				
				var key = puid + "_" + gpsIndex;
				
				_be.Emap.GPSObjectStore.each(
					function (item) {
						var node = item.value;
						if (item.key == key) {
							node.lock = true;
							
							// - 设置状态
							_be.Emap.SetInfoWindowStatus(node); 
						
						}
						else {
							node.lock = false;
						}
					}
				);
			}
			catch (e) {
				excep(fn, e);	
			}
			
		},
		// - 移除锁定
		UnLockVihicle: function (puid, gpsIndex) {
            try{
				var fn = "_be.Emap.UnLockVihicle";
				var key = puid + "_" + gpsIndex,
					gpsObj = _be.Emap.GPSObjectStore.get(key);
				if (gpsObj) {
					gpsObj.lock = false;
				}
				_be.Emap.SetInfoWindowStatus(gpsObj);
			}
			catch (e) {
				excep(fn, e);	
			}			
		},
		// - 清除轨迹
		ClearPolylineStore: function(puid, gpsIndex) {
			try {
				var fn = "_be.Emap.ClearPolylineStore";
				
				var key = puid + "_" + gpsIndex,
					gpsObj = _be.Emap.GPSObjectStore.get(key);
				
				if (gpsObj) {
					var title = "操作确认",
						msg = "确定要清除\""+(gpsObj.puName+"("+gpsObj.gpsNode.name+")")+"\"本地已接收到的GPS信息轨迹？",
						fn = function (r) {
							if (r == false) return false;
							
							gpsObj.gpsData = [];
							gpsObj.gpsRealData = [];
							
							if(gpsObj.polyline != null) { 
								_be.Emap.Polyline(puid, gpsIndex);
							} 
						};
						
					$.messager.confirm(title, msg, fn); 	
				}
			}
			catch(e) {
				excep(fn, e);
				return false;
			}
		},
		// - 设置信息窗口状态
		SetInfoWindowStatus: function (gpsObj) {
			try{
				var fn = "_be.Emap.SetInfoWindowStatus";
				
				if(gpsObj && gpsObj.puid) {
					var puid = gpsObj.puid,
						gi = gpsObj.gps_idx,
						key = puid + "_" + gi;
					
					if ($("#" + key + "_polyline")[0]) {
						if (gpsObj.polyline != null) {
							$("#" + key + "_polyline")
								.html("停止跟踪")
								.get(0).onclick = function () {
									_be.Emap.RemovePolyline(puid, gi);				   
								};
						}
						else {
							$("#" + key + "_polyline")
								.html("轨迹跟踪")
								.get(0).onclick = function (event) {
									_be.Emap.Polyline(puid, gi);				   
								};
						}
					}
					if ($("#" + key + "_lock")[0]) {
						if(gpsObj.lock === true) {
							$("#" + key + "_lock")
								.html("解除锁定")
								.get(0).onclick = function (event) {
									_be.Emap.UnLockVihicle(puid, gi);				   
								};
						} 
						else {
							$("#" + key + "_lock")
								.html("锁定车辆")
								.get(0).onclick = function (event) {
									_be.Emap.LockVihicle(puid, gi);				   
								};
						} 
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 获取对应图标
        GetIconUrl: function(bearing) {
            try{
				var fn = "_be.Emap.GetIconUrl";
				
                var icon_prefix = "images/emap",
					icon_name = "01.png";
				
            	var bearing = parseFloat(bearing) || 0; 
                  
				if(typeof bearing != "undefined" && !isNaN(bearing))
           		{
					if ((bearing >= 0 && bearing < 22.5 ) || (bearing >= 337.5  && bearing <= 360))
					{
						icon_name = "01.png";
					}
					else if (bearing >= 22.5 && bearing < 67.5)
					{
						icon_name = "02.png";
					}
					else if (bearing >= 67.5 && bearing < 112.5)
					{
						icon_name = "03.png";
					}
					else if (bearing >= 112.5 && bearing < 157.5)
					{
						icon_name = "04.png";
					}
					else if (bearing >= 157.5 && bearing < 202.5)
					{
						icon_name = "05.png";
					}
					else if (bearing >= 202.5 && bearing < 247.5)
					{
						icon_name = "06.png";
					}
					else if (bearing >= 247.5 && bearing < 292.5)
					{
						icon_name = "07.png";
					}
					else if (bearing >= 292.5 && bearing < 337.5)
					{
						icon_name = "08.png";
					}   
				}
                return icon_prefix + "/" + icon_name;  
            }
			catch(e){ 
				excep(fn, e);
				return "images/emap/01.png";
            }
        },
		// - 根据角度对应方向描述
		BearingDetail: function(bearing) {
			try {
				var fn = "_be.Emap.BearingDetail";
				
				var description = "";
            
				var bearing = parseFloat(bearing) || 0; 
					
				if(typeof bearing != "undefined" && !isNaN(bearing)) {
					if((bearing >= 0 && bearing < 22.5) || 
						(bearing >= 337.5 && bearing <= 360))
					{
						description = "正北（方向角："+bearing.toFixed(2)+"）";
					}
					else if (bearing >= 22.5 && bearing < 67.5)
					{
						description = "东北（方向角："+bearing.toFixed(2)+"）";
					}
					else if (bearing >= 67.5 && bearing < 112.5)
					{
						description = "正东（方向角："+bearing.toFixed(2)+"）";
					}
					else if (bearing >= 112.5 && bearing < 157.5)
					{
						description = "东南（方向角："+bearing.toFixed(2)+"）";
					}
					else if (bearing >= 157.5 && bearing < 202.5)
					{
						description = "正南（方向角："+bearing.toFixed(2)+"）";
					}
					else if (bearing >= 202.5 && bearing < 247.5)
					{
						description = "西南（方向角："+bearing.toFixed(2)+"）";
					}
					else if (bearing >= 247.5 && bearing < 292.5)
					{
						description = "正西（方向角："+bearing.toFixed(2)+"）";
					}
					else if (bearing >= 292.5 && bearing < 337.5)
					{
						description = "西北（方向角："+bearing.toFixed(2)+"）";
					}
				
				} 
				else {
					description = bearing;
				}
				return description;	
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		end: true
	},
	
	// - 视频对象
	Video: {
		MappingHandleWinkey: {},
		
		Init: function () {
			try {
				var fn = "_be.Video.Init";
				
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 清除所有
		Clear: function () {
			try {
				var fn = "_be.Video.Clear";
				NPPILY.WindowContainers.each(function (item) {
					_be.Video.ResponseOperation("StopVideo", item.key);
				});
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// 播放所有视频
		PlainPlayAllVideo: function (puid) {
			try {
				var fn = "_be.Video.PlainPlayAllVideo";
				
				if (puid && (puNode = _be.Resource.GetPUNode(puid))) {
					var ivs = [];
					for (var i = 0; i < puNode.childResource.length; i++) {
						var child = puNode.childResource[i];
						if (child.type == NPPILY.Enum.PuResourceType.VideoIn) {
							ivs.push(child);
						}
					}
					
					var curwinno = _be.Control.curwindownumber;
					if (ivs && ivs.length > 0) {
						var towinno = curwinno;
						
						if (ivs.length <= 1) {
							towinno = 1;	
						}
						else if (ivs.length <= 4) {
							towinno = 4;	
						}
						else if (ivs.length <= 6) {
							towinno = 6;	
						}
						else if (ivs.length <= 9) {
							towinno = 9;	
						}
						else {
							// 超过了，就播放前十六路
							towinno = 16;
						}
						
						// 先关闭所有视频
						_be.Video.Clear();
						
						if (towinno != curwinno) {
							// 切换窗口
							_be.Control.CreateWindows(towinno);
						}
						
						var windows = $("#control-windows DIV[id^=control-windowbox]");
						if (windows && windows.length >= towinno) {
							// 开始全部播放
							$.each(ivs, function (index, item) {
								if (index > windows.length - 1) {
									return false;
								}	
								// 激活窗口
								windows.eq(index).click();
								// 播放视频
								_be.Video.PlayVideo(puid, item.idx);
							});
							
							// 激活首个窗口
							windows.eq(0).click();
						} 
					}
				}
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		
		// - 弹出播放
		PopPlayAllVideo: function (puid) {
			try {
				var fn = "_be.Video.PopPlayAllVideo";
				
				if (_be.connectId && NPPILY.Connections.get(_be.connectId)) {
					var _connStruct = NPPILY.Connections.get(_be.connectId);
					
					var pageName = "gps-popallvideos",
						url = $.stringFormatter(
							GLOBALS.pop.url,
							_connStruct.connParam.path.split(":")[0],
							_connStruct.connParam.path.split(":")[1],
							_connStruct.connParam.username,
							_connStruct.connParam.epId,
							_connStruct.connParam.password,
							_connStruct.connParam.bFixCUIAddress,
							puid,
							GLOBALS.pop._debug,
							GLOBALS.pop._console
						);
				
					window.open(url, pageName);
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 播放视频
		PlayVideo: function (puid, ivIndex, streamType) {
			try {
				var fn = "_be.Video.PlayVideo";
				
				if (puid && typeof ivIndex != "undefined") {
					var puNode = _be.Resource.GetPUNode(puid);
					if (puNode) {
						var childRes = {};
						$.each(puNode.childResource, function (index, item) {
							if (item.type == NPPILY.Enum.PuResourceType.VideoIn && item.idx == ivIndex) {
								childRes = item;
								return false;
							}
						});
						
						var streamType = streamType || NPPILY.Enum.NrcapStreamType.REALTIME;
						
						NPPILY.WindowContainers.each(function (item) {
							var node = item.value;
							if (node.active == true) {
								var create = true;
								if (node.window) {
									create = false;
									if (node.window.status.playvideoing) {
										_be.Video.ResponseOperation("StopVideo", item.key);
									}
								}
								if (create) {
									var winevt = new NPPILY.Struct.WindowEventStruct();
									winevt.lbtn_click.status = true;
									winevt.lbtn_click.callback = function () {
										_be.Video.ResponseOperation("ActiveWindow", item.key);
									};
									winevt.fsw_show.callback = winevt.fsw_hide.callback = function () {
										_be.Video.ResponseOperation("BackFullScreen", item.key);
									};
									// - 右键菜单
									winevt.menu_command.status = true;
									winevt.menu_command.menu = [{
										key: "stopvideo", text: "停止视频"							
									}, {
										key: "playaudio", text: "播放音频"
									}, {
										key: "localsnapshot", text: "本地抓拍"
									}, {
										key: "localrecord", text: "开启本地录像"
									}, {
										key: "separator", text: "first"							
									}];
									if (GLOBALS.defaultDDraw) {
										winevt.menu_command.menu.push({
											key: "switchddraw", text: "切换DDraw模式"  
										});
										winevt.menu_command.menu.push({
											key: "separator", text: "second"  
										});
									}
									winevt.menu_command.menu.push({
										key: "fullscreen", text: "全屏"		
									});
									
									winevt.menu_command.callback = function (menukey) {
										_be.Video.ResponseOperation("menu_command", item.key, menukey);
									};
									
									var customParams = {
										ivStreamType: streamType,
										ivStreamTypeName: _be.Video.GetStreamTypeName(streamType)
									};
									
									// - 创建窗口
									var win_operator = NPPILY.CreateWindow
									(
										_be.connectId,
										$(node.container).find(".win").get(0),
										NPPILY.Enum.WindowType.VIDEO,
										winevt,
										customParams
									);
									if (win_operator.rv == NrcapError.NRCAP_SUCCESS) {
										node.window = win_operator.response;	
									}
								}
								// - 视频详细信息
								node.description = childRes;
								
								// - 播放视频
								var play_operator = NPPILY.PlayVideo
								(
									_be.connectId,
									node.window,
									puid,
									ivIndex,
									streamType
								);
								if (play_operator.rv == NrcapError.NRCAP_SUCCESS) {
									NPPILY.ResizeWindowDimension(node.window, "100%", "100%");
									
									var _HANDLE = node.window.params.ivStreamHandle;
									_be.Video.MappingHandleWinkey[_HANDLE] = item.key;
									_be.NCEvent.HandleCaller.Register(_HANDLE, _be.Video.ResponseStreamHandleCallback);
									
									
									// - 允许DDraw模式
									if (GLOBALS.defaultDDraw != node.window.status.isddrawing) {
										_be.Video.SwitchDDraw(item.key);
									}
								}
								else {
									NPPILY.ResizeWindowDimension(node.window, 0, 0);
								}
								// - 更新状态
								_be.Video.UpdateStatus(item.key);
							}
						});
					}	
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 是否有切换窗口菜单
		CheckSwitchToBigWindow: function (winkey) {
			try {
				var fn = "_be.Video.CheckSwitchToBigWindow";
				
				var curwinno = _be.Control.curwindownumber,
					windows = $("DIV[id^=control-windowbox]"),
					allowswap = false;
				
				if (curwinno == 6 && winkey && windows.get(0) && windows.get(0).id != winkey) {
					allowswap = true;
				}
			}
			catch (e) {
				excep(fn, e);	
			}
			finally {
				return allowswap ? true : false;	
			}
		},
		// - 响应操作
		ResponseOperation: function (action, winkey) {
			try {
				var fn = "_be.Video.ResponseOperation";
				
				var allowUS = true;
				
				switch (action) {
					case "StopVideo":
						_be.Video.StopVideo(winkey);
						break;
					case "ActiveWindow":
						_be.Control.ActiveWindow(winkey);
						allowUS = false;
						break;
					case "BackFullScreen":
						break;
					case "menu_command":
						var menukey = arguments[2] || "";
						switch (menukey) {
							case "stopvideo":
								_be.Video.StopVideo(winkey);
								break;
							case "playaudio":
								_be.Video.PlayAudio(winkey);
								break;
							case "localsnapshot":
								_be.Video.LocalSnapshot(winkey);
								break;
							case "localrecord":
								_be.Video.LocalRecord(winkey);
								break;
							case "switchtobigwindow":
								_be.Video.SwitchToBigWindow(winkey);
								break;
							case "switchddraw":
								_be.Video.SwitchDDraw(winkey);
								break;
							case "fullscreen":
								_be.Video.FullScreen(winkey);
								break;
						};
						break;
				};
						
				if (allowUS) {
					// - 更新状态
					_be.Video.UpdateStatus(winkey);
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 更新状态
		UpdateStatus: function (winkey) {
			try {
				var fn = "_be.Video.UpdateStatus";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					var winContainer = NPPILY.WindowContainers.get(winkey);
					if (winContainer) {
						var _hasOperator = false,
							_objT1 = $(winContainer.container).find(".wintitle .title1"),
							_objT2 = $(winContainer.container).find(".wintitle .title2");
						
						if (winContainer.window) {
							if (winContainer.window.status.playvideoing) {
								_hasOperator = true;
								
								// - 更新右键菜单项
								var customMenus = [];
								customMenus.push({key: "stopvideo", text: "停止视频"});
								if (winContainer.window.status.playaudioing) {
									customMenus.push({key: "playaudio", text: "停止音频"});
								}
								else {
									customMenus.push({key: "playaudio", text: "播放音频"});
								}
								customMenus.push({key: "localsnapshot", text: "本地抓拍"});
								if (winContainer.window.status.recording) {
									customMenus.push({key: "localrecord", text: "停止本地录像"});
								}
								else {
									customMenus.push({key: "localrecord", text: "开启本地录像"});
								}
								customMenus.push({key: "separator", text: "first"});
								var hasSplit = false;
								if (_be.Video.CheckSwitchToBigWindow(winkey)) {
									hasSplit = true;
									customMenus.push({key: "switchtobigwindow", text: "切换到大窗口播放"});	
								}
								if (GLOBALS.defaultDDraw) {
									hasSplit = true;
									customMenus.push({key: "switchddraw", text: "切换DDraw模式"});
								}
								if (hasSplit) {
									customMenus.push({key: "separator", text: "second"});
								}
								if (winContainer.window.status.isfullscreening) {
									customMenus.push({key: "fullscreen", text: "退出全屏"});
								}
								else {
									customMenus.push({key: "fullscreen", text: "全屏"});
								}
								NPPILY.WindowAttachEvent.UpdateMenuCommand(winContainer.window, customMenus, true);
								
								var html = [];
								// - ddraw
								if (GLOBALS.defaultDDraw) {
									if (winContainer.window.status.isddrawing) {
										html.push('<button class="video_ddrawing" onfocus="this.blur();" title="您正在使用DDraw模式观看"></button>');	
									}
									else {
										html.push('<button class="video_ddraw_disabled" onfocus="this.blur();" title="您正在使用非DDraw模式观看"></button>');
									}
								}
								
								// - recording
								if (winContainer.window.status.recording) {
									html.push('<button class="video_recording" onfocus="this.blur();" title="正在本地录像"></button>');	
								} 
								// - playaudioing
								if (winContainer.window.status.playaudioing) {
									html.push('<button class="video_playaudioing" onfocus="this.blur();" title="正在播放音频"></button>');
								}
								
								_objT2.html(html.join(""));
							}
							else {
								_objT2.html("");
								_objT1.html("无视频").attr("title", "");
							}
						}
						else {
							_objT2.html("");
							_objT1.html("无视频").attr("title", "");
						}
						
						if (_objT2.get(0)) {
							if (_objT2.html() != "") {
								_hasOperator = true;	
							}
							_objT2.width((_hasOperator?"30%":"1%"));
						}
						if (_objT1.get(0)) {
							_objT1.width((_hasOperator?"69%":"98%"));
						} 
					} 
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 停止视频
		StopVideo: function (winkey) {
			try {
				var fn = "_be.Video.StopVideo";
				
				NPPILY.WindowContainers.each(function(item) {
					if (item.key == winkey) {
						if (item.value.window) {
							var _HANDLE = item.value.window.params.ivStreamHandle;
							var operator = NPPILY.StopVideo(item.value.window);
							if (operator.rv == NrcapError.NRCAP_SUCCESS)
							{
								 if (_HANDLE in _be.Video.MappingHandleWinkey) {
									 delete _be.Video.MappingHandleWinkey[_HANDLE];
								 }
								 _be.NCEvent.HandleCaller.UnRegister(_HANDLE);
							}
							NPPILY.ResizeWindowDimension(item.value.window, 0, 0);
						}
					}
				});
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 音频
		PlayAudio: function (winkey) {
			try {
				var fn = "_be.Video.PlayAudio";
				
				NPPILY.WindowContainers.each(function(item) {
					if (item.key == winkey) {
						NPPILY.PlayAudio(item.value.window);
					}
				});
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 本地抓拍
		LocalSnapshot: function (winkey) {
			try {
				var fn = "_be.Video.LocalSnapshot";
				
				NPPILY.WindowContainers.each(function(item) {
					if (item.key == winkey) {
						NPPILY.Snapshot(item.value.window, _be.Settings.saveAsPath.localSnapshot);
					}
				});
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 本地录像
		LocalRecord: function (winkey) {
			try {
				var fn = "_be.Video.LocalRecord";
				
				NPPILY.WindowContainers.each(function(item) {
					if (item.key == winkey) {
						NPPILY.LocalRecord(item.value.window, _be.Settings.saveAsPath.localRecord);
					}
				});
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 切换到大窗口播放
		SwitchToBigWindow: function (winkey) {
			try {
				var fn = "_be.Video.SwitchToBigWindow";
				
				var windows = $("DIV[id^=control-windowbox]"),
					bigwinkey = windows.get(0).id;
				
				if (bigwinkey && winkey) {
					var bigwinnode = NPPILY.WindowContainers.get(bigwinkey);
					var winnode = NPPILY.WindowContainers.get(winkey);
					var swap = {
						bigwinkey: bigwinkey,
						winkey: winkey,
						bigwininfo: null,
						wininfo: null
					};
					if (bigwinnode.window && bigwinnode.window.status.playvideoing) {
						swap.bigwininfo = {
							puid: bigwinnode.window.params.puid,
							ivIndex: bigwinnode.window.params.idx,
							streamType: bigwinnode.window.params.streamType
						};
						// - 停止播放
						_be.Video.StopVideo(bigwinkey);
					}
					if (winnode.window && winnode.window.status.playvideoing) {
						swap.wininfo = {
							puid: winnode.window.params.puid,
							ivIndex: winnode.window.params.idx,
							streamType: winnode.window.params.streamType
						};
						// - 停止播放
						_be.Video.StopVideo(winkey);
						// - 激活大窗口
						windows.get(0).click();
						_be.Video.PlayVideo(
							swap.wininfo.puid, 
							swap.wininfo.ivIndex, 
							swap.wininfo.streamType
						);
						
						if (swap.bigwininfo != null) {
							// - 激活小窗口
							$("DIV[id^="+winkey+"]").get(0).click();
							_be.Video.PlayVideo(
								swap.bigwininfo.puid, 
								swap.bigwininfo.ivIndex, 
								swap.bigwininfo.streamType
							);
						}
					}
					
					// - 激活首个窗口
					windows.get(0).click();
				}
			}
			catch (e) {
				excep(fn, e);	
			}
			finally {
				return true;	
			}
		},
		// - 切换DDraw模式
		SwitchDDraw: function (winkey) {
			try {
				var fn = "_be.Video.SwitchDDraw";
				
				if (!GLOBALS.defaultDDraw) {
					return false;	
				}
				
				// - 先判断对于win7系统低版本ie无效
				if (navigator.platform == "Win32" || navigator.platform == "Windows") {
					var agt = navigator.userAgent.toLowerCase();
					if (agt.indexOf("windows nt 6.1") > -1 || agt.indexOf("windows 7") > -1) {
						if (agt.search("msie") != -1) {
							var _IEVNO = $.trim(agt.substr(agt.search("msie") + 5, 3));
							if(!isNaN(_IEVNO) && Number(_IEVNO) < 10) {
								logger(fn, "DDrawSwitch nonsupport, _IEVNO -> " + _IEVNO);
								return false;
							}
						}
					}
				}
				
				NPPILY.WindowContainers.each(function(item) {
					if (item.key == winkey) {
						NPPILY.EnableDDraw(item.value.window, (NPPILY.IsDDrawing(item.value.window).response ? 0: 1));
					}
				});
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 全屏
		FullScreen: function (winkey) {
			try {
				var fn = "_be.Video.FullScreen";
				
				NPPILY.WindowContainers.each(function(item) {
					if (item.key == winkey) {
						if (item.value.window) {
							if (item.value.window.status.isfullscreening) {
								NPPILY.ExitFullScreen(item.value.window);
							}
							else {
								NPPILY.FullScreen(item.value.window);
							}
						}
					}
				});
			}
			catch (e) {
				excep(fn, e);
			}
		},
		
		// -  接收流状态信息回调
		ResponseStreamHandleCallback: function (_ncnStruct) {
			try {
				var fn = "_be.Video.ResponseStreamHandleCallback";
				
				if (GLOBALS.debug.NCNotify.enable_stream_status_notify && GLOBALS.debug) {
					logger(fn, "Stream Status - _ncnStruct -> " + $.toJSON(_ncnStruct));	
				}
				var winkey = _be.Video.MappingHandleWinkey[_ncnStruct._HANDLE];
				
				NPPILY.WindowContainers.each(function(item) {
					if (item.key == winkey) {
						var node = item.value;
						if (node.window && node.window.status.playvideoing) {
							var html = [];
							if (node.description != null) {
								html.push((node.description.name || ""));
							}
							if (typeof _ncnStruct.statusDesc != "undefined" && _ncnStruct.statusDesc != "") {
								html.push("&nbsp;");
								html.push(_ncnStruct.statusDesc);
								html.push(",");
							}
							if (node.window && node.window.customParams.ivStreamTypeName) {
								html.push(node.window.customParams.ivStreamTypeName);
							}
							html.push(",");
							html.push("帧率=" + (_ncnStruct.keyData.frame_rate || 0));
							html.push(",");
							html.push("码率=" + ((_ncnStruct.keyData.bit_rate || 0)/1000).toFixed(0) + "kb");
							
							var _hasOperator = false,
								_objT1 = $(node.container).find(".wintitle .title1"),
								_objT2 = $(node.container).find(".wintitle .title2");
								
							if (_objT2.get(0)) {
								if (_objT2.html() != "") {
									_hasOperator = true;	
								}
								_objT2.width((_hasOperator?"30%":"1%"));
							}
							if (_objT1.get(0)) {
								_objT1
									.html(html.join(""))
									.attr("title", html.join("").replace(/(\&nbsp;)/g, ""))
									.width((_hasOperator?"69%":"98%"));
							} 
						}
					}
				});
			}
			catch (e) {
				excep(fn, e);
			}
		},
		// - 流类型描述
		GetStreamTypeName: function (streamType) {
			try {
				var fn = "_be.Video.GetStreamTypeName";
				switch (streamType) {
					case NPPILY.Enum.NrcapStreamType.REALTIME: 
						return "实时流";
						break;
					case NPPILY.Enum.NrcapStreamType.STORAGE:
						return "存储流";
						break;
					case NPPILY.Enum.NrcapStreamType.PICTURE:
						return "图片流";
						break;
					case NPPILY.Enum.NrcapStreamType.MOBILE2G:
						return "2G手机码流";
						break;
					case NPPILY.Enum.NrcapStreamType.MOBILE3G:
						return "3G手机码流";
						break;
					case NPPILY.Enum.NrcapStreamType.TRANSCODE:
						return "平台转码流";
						break;
					case NPPILY.Enum.NrcapStreamType.HD:
						return "高清流";
						break;
				};
			}
			catch (e) {
				excep(fn, e);
				return "";
			}
		},
		
		
		end: true
	},
	
	// - 设置配置对象
	Settings: {
		saveAsPath: {
			localSnapshot: "C:/",
			localRecord: "C:/",
			
			end: true
		},
		Init: function () {
			try {
				var fn = "_be.Settings.Init";
				
				// - 开启一个设置窗口
				if (!$("#control-settings-window").get(0)) {
					var html = [];
					html.push('<div id="control-settings-window">');
						html.push('<table class="settings-table">');
							html.push('<tr>');
								html.push('<td colspan=3><h4 style="height:18px;line-height:18px;vertical-align:middle;background-color:#CCCCCC;">存储路径设置</h4></td>');
							html.push('</tr>');
							html.push('<tr>');
								html.push('<td align=center><label>&nbsp;&nbsp;&nbsp;&nbsp;本地抓拍：&nbsp;&nbsp;</label></td>');
								html.push('<td><input id="settings-lss" type="text" style="width:200px;height:18px;border:1px solid #95B8E7;" value="C:/" /></td>');
								html.push('<td>');
									html.push('<a href="javascript:void(0);" id="settings-lss-select" class="easyui-linkbutton" title="选择保存目录" data-options="iconCls:\'icon-edit\'"></a>');
									html.push('&nbsp;<a href="javascript:void(0);" id="settings-lss-open" class="easyui-linkbutton" title="打开保存目录" data-options="iconCls:\'icon-redo\'"></a>');
								html.push('</td>');
							html.push('</tr>');
							html.push('<tr>');
								html.push('<td align=center><label>&nbsp;&nbsp;&nbsp;&nbsp;本地录像：&nbsp;&nbsp;</label></td>');
								html.push('<td><input id="settings-lrec" type="text" style="width:200px;height:18px;border:1px solid #95B8E7;" value="C:/" /></td>');
								html.push('<td>');
									html.push('<a href="javascript:void(0);" id="settings-lrec-select" class="easyui-linkbutton" title="选择保存目录" data-options="iconCls:\'icon-edit\'"></a>');
									html.push('&nbsp;<a href="javascript:void(0);" id="settings-lrec-open" class="easyui-linkbutton" title="打开保存目录" data-options="iconCls:\'icon-redo\'"></a>');
								html.push('</td>');
							html.push('</tr>');
						html.push('</table>');
					html.push('</div>');
					
					$("body")
						.append(html.join(""))
						.find("#control-settings-window")
						.window({
							width: 450,
							height: 200,
							modal: true,
							title: "设置",
							collapsible: false,
							minimizable: false,
							maximizable: false,
							resizable: false
						});
						
					$("#settings-lss")
						.dblclick(function() {
							_be.Settings.SelectDir("snapshot");				   
						});
					$("#settings-lrec")
						.dblclick(function() {
							_be.Settings.SelectDir("record");				   
						});
					$("#settings-lss-select")
						.linkbutton()
						.click(function () {
							_be.Settings.SelectDir("snapshot");	
						});
					$("#settings-lss-open")
						.linkbutton()
						.click(function () {
							_be.Control.OpenDir("snapshot");	
						});
					$("#settings-lrec-select")
						.linkbutton()
						.click(function () {
							_be.Settings.SelectDir("record");	
						});
					$("#settings-lrec-open")
						.linkbutton()
						.click(function () {
							_be.Control.OpenDir("record");	
						});
					
				}
				$("#control-settings-window").window("open");
				
				_be.Settings.GetCookie();
			}
			catch (e) {
				excep(fn, e);	
			}
		},
		// - 选择保存路径
		SelectDir: function (action) {
			try {
				var fn = "_be.Settings.SelectDir";
				var operator = NPPILY.Folder.GetFileFolder();
				if (operator.rv == NrcapError.NRCAP_SUCCESS) {
					switch (action) {
						case "snapshot":
							_be.Settings.saveAsPath.localSnapshot = operator.response || _be.Settings.saveAsPath.localSnapshot || "C:/";
							$("#settings-lss").val(_be.Settings.saveAsPath.localSnapshot);
							break;
						case "record":
							_be.Settings.saveAsPath.localRecord = operator.response || _be.Settings.saveAsPath.localRecord || "C:/";
							$("#settings-lrec").val(_be.Settings.saveAsPath.localRecord);
							break;
					};
					
					_be.Settings.SetCookie();
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		
		GetCookie: function () {
			try {
				var fn = "_be.Settings.GetCookie";
				
				var settings = $.cookie("settings") || "";
				if (settings) {
					settings = $.evalJSON(settings);	
				}
				else {
					settings = {
						sap_lss: "C:/",
						sap_lrec: "C:/"
					};
				}
				
				_be.Settings.saveAsPath.localSnapshot = settings.sap_lss;
				_be.Settings.saveAsPath.localRecord = settings.sap_lrec;
				
				// - 填充到显示框中
				$("#settings-lss").val(_be.Settings.saveAsPath.localSnapshot);
				$("#settings-lrec").val(_be.Settings.saveAsPath.localRecord);
			}
			catch (e) {
				excep(fn, e);
			}
		},
		SetCookie: function () {
			try {
				var fn = "_be.Settings.SetCookie";
				
				var settings = {
					sap_lss: _be.Settings.saveAsPath.localSnapshot,
					sap_lrec: _be.Settings.saveAsPath.localRecord
				};
				
				$.cookie("settings", $.toJSON(settings));
			}
			catch (e) {
				excep(fn, e);
			}
		},
		
		end: true
	},
	
	// 蒙版文字提示
	Mask: {
		time: "2014.06.23",	
		
		maskID: "mask_window",
		
		maskObj: null,
		
		Show: function (msg) {
			try {
				var fn = "_be.Mask.Show";
				
				if (!msg) return false;
				
				var maskID = this.maskID,
					contentID = maskID + "_content";
					
				if (!this.maskObj) {
					if (!$("#" + maskID)[0]) {
						this.maskObj = $("body")
							.append('<div id="'+maskID+'"></div>')
							.find("#" + maskID)
							.window({
								width: 200,
								height: 40,
								noheader: true,
								collapsible: false,
								minimizable: false,
								maximizable: false,
								closable: false,
								resizable: false,
								modal: true,
								content: '<div id="'+contentID+'" class="loading" style="width:100%;height:26px;line-height:26px;vertical-align:middle;text-indent:20px;border:0px gray solid;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"></div>'
							});
					}
				}
				if (this.maskObj) {
					if ($("#" + contentID)[0]) {
						var realLength = NPPUtils.GetStringRealLength(msg),
							originalLength = msg.length;
						$("#" + contentID).html(msg);
						this.maskObj.window("resize", {
							width: (45 + 6 * realLength - 0 * originalLength)
						});
					}
					this.maskObj.window("open").window("center");
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		
		Hide: function (remove) {
			try {
				var fn = "_be.Mask.Hide";
				
				if (this.maskObj) {
					if (remove === true) {
						this.maskObj.window("destroy");
						this.maskObj = null;
					}
					else {
						this.maskObj.window("close");
					}
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		
		end: true
	},
	
	// - 调试对象
	Debug: {
		domID: "debug-window-box",
		Init: function () {
			try {
				var fn = "_be.Debug.Init";
				
				if (GLOBALS.debug.active == false) {
					return false;
				}
				
				var domID = _be.Debug.domID;
				
				if (!$("#" + domID).get(0)) {
					var html = [];
					html.push('<div id="'+domID+'" class="easyui-window" data-options="">');
						html.push('<div id="'+domID+'-top" style="width:100%;height:80%;border:0px gray dashed;">'); 	
							html.push('<div id="'+domID+'-grid" class="easy-datagrid"></div>');
						html.push('</div>');
						html.push('<div id="'+domID+'-bottom" style="width:100%;height:50px;border-top:1px #DDDDDD solid;text-align:right;">');
							html.push('<a id="'+domID+'-clear" clsss="easyui-linkbutton" style="margin-top:10px;margin-right:10px;">清空</a>');
						html.push('</div>');
					html.push('</div>');
					
					$("body")
						.append(html.join(""))
						.find("#" + domID)
						.window({
							title: "调试信息",
							width: 450,
							height: 300,
							collapsible: true,
							minimizable: false,
							maximizable: false,
							onResize: function (w, h) {
								// logger(fn, $.stringFormatter("debug-window-box resizing of w={0}, h={1}", w, h));
								
								if ($("#" + domID + "-grid").attr("inited") == 1) {
									$("#" + domID + "-top")
										.css({
											height: (h - 90)
										});
									$("#" + domID + "-grid")
										.datagrid("resize", {
											height: (h - 92)
										});
								}
							},
							onClose: function () {
								$(this).attr("closed", 1);
							}							
						})
						.window("open");
					
					$("#" + domID + "-grid")
						.datagrid({
							width: 400,
							height: 200,
							frozenColumns: [[{field: "debug_time", title: "时间", width: 115}]],
							columns: [[{field: "debug_log", title: "描述", width: 200}]],
							fit: true,
							fitColumns: true,
							border: false,
							singleSelect: true,
							nowrap: false,
							rownumbers: true
						})
						.attr("inited", 1);
					
					$("#" + domID + "-clear")
						.linkbutton({
							iconCls: "icon-cancel",
							onClick: function () {
								$("#" + domID + "-grid")
									.datagrid("loadData", []);
							}
						});						
				}
			}
			catch (e) {
				excep(fn, e);
			}
		},
		
		Note: function (_msgStruct) {
			try {
				var fn = "_be.Debug.Note";
				
				if (GLOBALS.debug.active == false) {
					return false;
				}
				
				var domID = _be.Debug.domID;
				
				if ($("#" + domID + "-grid").attr("inited") == 1) {
					if ($("#" + domID).attr("closed") == 1) {
						$("#" + domID)
							.window("open")
							.attr("closed", 0);
					}
					
					var getData = $("#" + domID + "-grid")
									.datagrid("getData");
					var sml = GLOBALS.debug.showMaxLine;
					if (isNaN(sml) || sml < 10 || sml > 500) {
						sml = 10;
					}
					if (getData && getData.total >= sml) {
						$("#" + domID + "-grid")
							.datagrid("loadData", []);
					}
					$("#" + domID + "-grid")
						.datagrid("insertRow", {
							index: 0, 
							row: {
								debug_time: _msgStruct.time,
								debug_log: $.stringFormatter("[{0}]{1}", _msgStruct.fn, _msgStruct.msg)
							}
						});
				}
			}
			catch (e) {
				excep(fn, e);
			}			
		},
		
		end: true
	},
	
	Resize: function () {
		// Null
	}, 
	
	end: true
};

// - 抛出异常处理
var excep = function (fnStr, e, log) {
	var estr = e.name + "::" + e.message;
	logger(fnStr, log?("["+estr+"]"+log):estr);
};
// - 调试输出快捷函数
var logger = function (fnStr, log) {
	try {
		if (GLOBALS.debug.active == true) {
			if (NPPUtils && typeof NPPUtils.Log == "function") {
				NPPUtils.Log(fnStr, log);	
			}
			if (typeof console != "undefined") {
				console.log("[" + fnStr + "]" + log);	
			}
		}
	}
	catch (e) {
	}
	finally {	
		return true;	
	}
};