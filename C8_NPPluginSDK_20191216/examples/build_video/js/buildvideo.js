/*
---
fn: BuildVideo
time: 2013.09.11
author:
	- huzw
remark:
	- 视频播放部署
...
*/
var _bv = BuildVideo = {
	version: "v1.0.1",
	
	// - 是否开启调试窗口
	debug: true,
	
	// - 是否允许底部控制台可视
	console: false,
	// - 是否默认显示主体内容区
	console_content: false,
	
	// - 是否允许自动重连
	enable_autorc: true,
	
	// - 默认开启DDraw模式观看
	enableDDraw: true, 
	
	// - 是否允许窗口中云台控制
	enableDWPTZCtl: false,
	
	// - 插件文件
	pluginFile: "../../MediaPlugin7.exe",
	
	// - 默认登录参数
	loginParams: {
		path: "192.168.42.118:8866", // - 连接地址
		epId: "system",	// - 企业ID
		username: "admin", // - 用户名
		password: "", // - 用户密码
		bFixCUIAddress: 1 // - 是否透过网闸（1/true是，0/false否）
	},
	
	// - 是否允许浏览器控制台输出
	bbrowserConsole: true,
	
	// - 语言风格 zh_CN | en
	lang: "zh_CN",
	
	// - 连接ID
	connectId: null,
	
	// - 装载
	Load: function() {
		try {
			var fn = "_bv.Load";
			
			_bv.Url.Init(); // - 初始化Url对象
				
			_bv.Mask.Init(); // - 初始化蒙板对象
			
			_bv.Debug.Init(); // - 初始化调试对象
			
			_bv.Debug.logger = new NPPILY.Struct.InitParamStruct
			(
				_bv.debug,
				_bv.Debug.Note,
				{
					language: _bv.lang,
					warmTip : {
						active : true,
						pluginFile : _bv.pluginFile
					}
				}
			);
			
			var operator = NPPILY.Init(_bv.Debug.logger); // - 初始化NPPILY
			
			if (operator.rv == NrcapError.NRCAP_SUCCESS) {
				
				_bv.Mask.Show("正在建立连接，请稍候~");
				
				/*_bv.Mask.Show({
					text:"正在建立连接，请稍候~",
					color: "blue",
					family: "楷体",
					style: "italic",
					size: 14
				});*/
				
				window.setTimeout
				(
					function() 
					{
						_bv.Login.Init(); // - 初始化登录对象 
					}
					, 100
				);
				
				return true;
			}
			else {
				var detail = NrcapError.Detail(operator.rv);
				
				if (detail) {
					if (NPPUtils.Log) {
						NPPUtils.Log(fn, detail);
					}
					// alert("插件初始化失败【" + detail + "】~");
				}
				return false;
			} 
		}
		catch(e) {
			if (NPPUtils.Log) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
			}
			return false;	
		} 
	},
	
	// - 卸载
	UnLoad: function() {
		try {
			var fn = "_bv.UnLoad";
			
			_bv.Video.Clear();
			
			_bv.Resource.Clear();
			
			_bv.Frame.Clear();
			
			NPPILY.UnLoad();
			
			_bv.connectId = null;
		}
		catch(e) {
			if (NPPUtils.Log) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
			}
			return false;	
		} 
	},
	
	// - 改变大小
	Resize: function() {
		try {
			var fn = "_bv.Resize";
			
			var vp_width = $(window).width(),
				vp_height = $(window).height();
			
			if(vp_width <= 300) vp_width = 300;
			if(vp_height <= 220) vp_height = 220;
			
			$("body")
				.css({
					"font-size": ""
				});
				
			if($("#topframe")[0]) {
				var bottomheight = 0;
				
				if($("#bottomframe")[0]) {
					bottomheight = $("#bottomframe").height();
				}
				
				$("#topframe")
					.css({
						height: (vp_height - bottomheight - 4) + "px"
					});
					
				// - 改变窗口区大小
				_bv.Frame.ResizeWindows();
			}
		}
		catch(e) {
			if (NPPUtils.Log) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
			}
			return false;	
		}	 
	},
	
	// - URL对象
	Url: {
		options: {
			ip: null,
			port: null,
			username: null,
			epId: null,
			password: null,
			bfix: null,
			puid: null,
			ivIndex: null,
			videos: null,
			winNumber: 1,
			playAudio: false 
		},
		
		Init: function() {
			try {
				var fn = "_bv.Url.Init";
				
				var orgUrl = window.location.search.replace("\?", "") || "";
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "orgUrl -> " + orgUrl);
				}
				
				var arrayUrl = orgUrl.split("\&");
				if (NPPUtils.Log) {
					if(_bv.debug) NPPUtils.Log(fn, "arrayUrl -> " + $.toJSON(arrayUrl));
				}
				
				_bv.Url.options.ip = _bv.loginParams.path.split(":")[0] || "127.0.0.1";
				_bv.Url.options.port = _bv.loginParams.path.split(":")[1] || "8866";
				_bv.Url.options.username = _bv.loginParams.username || "admin";
				_bv.Url.options.epId = _bv.loginParams.epId || "system";
				_bv.Url.options.password = _bv.loginParams.password || "";
				_bv.Url.options.bfix = _bv.loginParams.bFixCUIAddress || "0";
				
				$.each(arrayUrl, function(index, item) {
					if (!item || typeof item == "undefined") {
						return true;
					}
					
					var node = item.split("="),
						key = node[0],
						value = node.length >= 2 ? decodeURIComponent(node[1]) : null;
					
					switch(key) {
						case "ip":
							_bv.Url.options.ip = value || _bv.loginParams.path.split(":")[0] || "127.0.0.1";
							break;
						case "port":
							_bv.Url.options.port = value || _bv.loginParams.path.split(":")[1] || "8866";
							break;
						case "username":
							_bv.Url.options.username = value || _bv.loginParams.username || "admin";
							break;
						case "epId":
						case "epid":
							_bv.Url.options.epId = value || _bv.loginParams.epId || "system";
							break;
						case "psw":
						case "password":
							_bv.Url.options.password = value || _bv.loginParams.password || "";
							break;
						case "bfix":
							_bv.Url.options.bfix = value || _bv.loginParams.bFixCUIAddress || "0";
							break;
						case "puid":
							_bv.Url.options.puid = value || null;
							break;
						case "ivIndex":
							_bv.Url.options.ivIndex = value != null ? value : null;
							break;
						case "videos":
							_bv.Url.options.videos = value || null;
							break;
						case "winNumber":
							var winNumber = value != null && !isNaN(value) ? value : null;
							if($.inArray(parseInt(winNumber), [1, 4, 6, 9, 16]) == -1) {
								winNumber = null;
							}
							_bv.Url.options.winNumber = winNumber || _bv.Url.options.winNumber || 1;
							break;
						case "playAudio":
						case "playaudio":
						case "enableAudio":
						case "enableaudio":
							_bv.Url.options.playAudio = !!(value == true);
							break;
						
						case "_debug": // - 是否开启调试参数（保留）
							_bv.debug = value !== true && value !== "true" ? false : true;
							break;
						case "_enableDDraw":
						case "_ddraw":
							_bv.enableDDraw = value !== true && value !== "true" ? false : true; 
							break;
						
						case "_autoReConnect": // - 允许自动重连
						case "_autorc":
							_bv.enable_autorc = value !== true && value !== "true" ? false : true; 
							break;
						case "_autoReConnectInterval": // - 自动重连间隔（单位毫秒）
						case "_autorcinterval":
							_bv.NCEvent.Broken.brcInterval = typeof value != "undefined" && !isNaN(value) ? Number(value) : 10000; 
							break;
						case "_console": // - 是否创建控制台
							_bv.console = value !== true && value !== "true" ? false : true;
							break;
						case "_consoleDisplayContent": // - 是否默认开启控制台主体内容区
						case "_consoledc":
							_bv.console_content = value !== true && value !== "true" ? false : true; 
							break;
							
						case "_pluginFile": // - 插件路径，需要encodeURIComponent编码
							_bv.pluginFile = decodeURIComponent(value) || _bv.pluginFile || "../MediaPlugin7.exe";
							break; 
					}
				});
				
				if (NPPUtils.Log) {
					if(_bv.debug) NPPUtils.Log(fn, "_bv.Url.options -> " + $.toJSON(_bv.Url.options));
				}
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
			}
		}, 
		
		end: true
	},
	
	// - 登录对象
	Login: {
		
		Init: function() {
			try {
				var fn = "_bv.Login.Init";
				
				var options = _bv.Url.options || {};
				var connParams = new NPPILY.Struct.ConnParamStruct
				(
					options.ip + ":" + options.port,
					options.username,
					options.epId,
					options.password,
					options.bfix
				);
				// - 建立连接
				var operator = NPPILY.Connect(connParams);
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "Connect operator -> " + $.toJSON(operator));
				} 
				if (operator.rv == NrcapError.NRCAP_SUCCESS) {
					// - 记录连接ID
					_bv.connectId = operator.response || null;
					
					if(_bv.connectId && NPPILY.Connections.get(_bv.connectId)) { 
						var _connStruct = NPPILY.Connections.get(_bv.connectId); 
						// - 已经连接
						if (_connStruct.status == NPPILY.Enum.ConnectionStatus.Connected) {
							
						 	// - 登录成功 
							_bv.NCEvent.Init(); // - 初始化NC事件
							
							_bv.Mask.Show("正在解析参数，过滤资源信息~");
							
							window.setTimeout
							(
								function() 
								{								
									var rv = _bv.Resource.Init(); // - 初始化资源对象
									// alert($.toJSON(_bv.Resource.store) || {});
							  		
									// - 发生错误
									if(_bv.Resource.store.error != null) {
										_bv.Mask.Show(_bv.Resource.store.error);
									}
									else {
										if (rv === true) {
											_bv.Mask.Hide(); // - 隐藏Mask 
											
											_bv.Frame.Init(); // - 初始化页面元素
											
											_bv.Resize(); // - 改变页面大小
											
											_bv.Video.Init(); // - 初始化播放视频
											
										}
									} 
								}
								, 100
							); // end timeout  
						} 
					} 
				}
				else {
					// - 登录失败 
					var detail = NrcapError.Detail(operator.rv, true);
					
					_bv.NCEvent.Broken.Init("建立连接失败" + (detail ? "【"+detail+"】~" : "~"));
					
					return false;
				} 
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			} 	
		},
		
		end: true 
	},
	
	// - 页面元素对象
	Frame: {
		
		curwindownumber: 1,
		
		curactivewindowkey: null,
		
		curwindowkeys: [],
		
		Init: function() {
			try { 
				var fn = "_bv.Frame.Init";
 				
				var html = _bv.Frame.Html("mainframe");
				if($("body")[0]) {
					$("body").append(html);
					
					if($("#topframe")[0]) {					
						var options = _bv.Url.options || {};
						// - 切换窗口
						_bv.Frame.ChangeWindow(options._VIDEOS.winNumber || options.winNumber || 1); 
					}
					
					// - 控制台初始化
					_bv.Frame.Console.Init();
				}
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		
		// - 清空框架
		Clear: function() {
			try {
				var fn = "_bv.Frame.Clear";
				
				if ($("#topframe")[0]) {
					$("#topframe").empty();
					$("#topframe")[0].parentNode.removeChild($("#topframe")[0]);
				}
				if ($("#bottomframe")[0]) {
					$("#bottomframe").empty();
					$("#bottomframe")[0].parentNode.removeChild($("#bottomframe")[0]);
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - @huzw 2013.10.31 add ---
		// - 控制台对象
		Console: {
			Init: function () {
				try {
					var fn = "_bv.Frame.Console.Init";
					
					if($("#console_tab_body")[0]) {
						var connectId = _bv.connectId;
						if(!connectId || !NPPILY.Connections.get(connectId)) {
							NPPUtils.Log(fn, "connectId error~");
							return false;
						}
						
						var _connStruct = NPPILY.Connections.get(connectId);
						
						$("#console_tab_body")
							.html(_bv.Frame.Html("console"))
							.css({
								"overflow": "auto"
							});
						
						$("#console_tab_body")
							.find("[crtype=_videoctl], [crtype=_ptz], [crtype=_video]")
							.bind("mousedown mouseup", function(event) {
								if ($(this).attr("crtype") == "_video" || $(this).attr("type") == "speed") {
									return true;	
								}
								_bv.Frame.Console.Operator(this.id, (event.type == "mouseup" ? "up" : "down"));					  
							})
							.each(function(i, dom) {
								if ($(dom).attr("crtype") == "_videoctl") {
									if ($(dom).attr("type") == "text") {
										$(dom)
											.css("margin-top", "3px")
											.button()
											.bind("blur dblclick", function(event) {
												if (event.type == "blur") {
													if ($(this).val() == "") {
														$(this).val($(this).attr("_dftVal") || "C:/");	
													}
												}
												else if (event.type == "dblclick") {
													// - @huzw  2013.12.23 add
													_bv.Frame.Console.Operator(this.id, "dblclick");
												} 
											});
									}
									else {
										$(dom)
											.css("margin-top", "3px")
											.button({
												icons: {
													primary: $(dom).attr("_infor") || "" 	
												}
											});	
									}
								}
								else if ($(dom).attr("crtype") == "_video") {
									$(dom).slider({
										range: "min",
										slide: function(event, ui) {
											$(this).attr("title", ui.value);	
										},
										change: function(event, ui) {
											if (typeof $(this).attr("_orgVal") != "undefined" && ui.value != $(this).attr("_orgVal")) {
												_bv.Frame.Console.Operator(this.id, "slider_change");
											}	
										}
									});
								}
								else if ($(dom).attr("type") == "speed") {
									$(dom).slider({
										range: "min",
										change: function(event, ui) {
											_bv.Frame.Console.Operator(this.id, "slider_change");
										},
										slide: function(event, ui) {
											if ($("#ptzspeed-text")[0]) {
												$("#ptzspeed-text")
													.spinner("value", ui.value);
											}
										}
									});
									if ($("#ptzspeed-text")[0]) {
										$("#ptzspeed-text")
											.spinner({
												stop: function(event, ui) {
													var value = $(this).spinner("value");
													if (typeof value != "undefined") {
														$(dom).slider("value", value);
													}
												}
											});
									}
								}
								else if ($(dom).attr("type") == "text") {
									$(dom).spinner({
										spin: function(event, ui) {
											var _min = $(this).attr("_min"),
												_max = $(this).attr("_max");
											if (ui.value < _min) {
												$(this).spinner("value", _max);	
											}
											else if (ui.value > _max) {
												$(this).spinner("value", _min);		
											}
											else {
												return true;	
											}
											return false;
										}
									});
								}
								else {
									$(dom)
										.css("margin-top", "3px")
										.button({
											icons: {
												primary: $(dom).attr("_infor") || "" 	
											},
											// disabled: true,
											text: false
										});
								}
							});
						
						if($("#console_tab")[0]) {
							$("#console_tab")
								.tabs({
									collapsible: true
								})
								.delegate("ul > li[crtype=_tab]", "click", function() {
									var options = $( "#console_tab" ).tabs( "option" );
									if(_bv.debug) {
										NPPUtils.Log(fn, "console_tab options -> " + $.toJSON(options));
									}
									
									if(options) {
										// - 折叠了
										if(options.active === false) {
											$(".console_tab-spacer").hide();
											
											if($("#bottomframe")[0]) {
												$("#bottomframe")
													.css({
														height: "45px"
													});
											}
										}
										else {
											$(".console_tab-spacer").show();
											
											if($("#bottomframe")[0]) {
												$("#bottomframe")
													.css({
														height: "180px"
													});
											}
										}
										
										_bv.Resize(); // - 改变大小
									}
								});
						 	
							$(".console_tab-bottom .ui-tabs-nav, .console_tab-bottom .ui-tabs-nav > *")
								.removeClass("ui-corner-all ui-corner-top")
								.addClass("ui-corner-bottom");
							
							$( ".console_tab-bottom .ui-tabs-nav" )
								.appendTo(".console_tab-bottom");  
								
							// - 默认不显示控制台主体内容区
							if (_bv.console_content == false) {
								$("#console_tab ul > li[crtype=_tab]:first A").trigger("click");
							}
						
							// - 底部系统相关信息
							var _syspans = $("#console_tab li._system span[crtype]");
							$.each(_syspans, function(i, spanDom) {
								switch($(spanDom).attr("crtype")) {
									case "_welcome":
										var html = "";
										if (_connStruct.connParam) {
											html = (_connStruct.connParam.username || "") + "@" + (_connStruct.connParam.epId || "");
										}
										$(spanDom)
											.html("欢迎您&nbsp;" + html); 
										break;
									case "_sysTime":
										// - 注册一个定时器
										if(typeof NPPUtils.Timer != "undefined") {
											NPPUtils.Timer.Set(
												"system", {
													name: "sysTime",
													fu: function() {
														// NPPUtils.Log(fn, new Date());
														_bv.time = new Date();
														
														var _weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
														$(spanDom)
															.html(NPPUtils.DateFormat("yyyy-MM-dd HH:mm:ss", _bv.time) + "&nbsp;" + _weeks[_bv.time.getDay()]);
													},
													interval: 1000
												}
											);
											
											NPPUtils.Timer.Start(); 
										}	
										break;
									case "_plugin":
									case "_sysAbout":
										$(spanDom).on("mouseover mouseout click", function(event) {
											
											switch(event.type) {
												case "mouseover":
													$(this).attr("class", "_mousehover"); 
													break;
												case "mouseout":
													$(this).attr("class", "_mouseleave"); 
													break;
												case "click":
													var html = [];	
													if($(this).attr("crtype") == "_plugin") {
														if(!$("#_sys_plugin_dlhelper")[0]) {
															html.push('<span style="display:none;"><a id="_sys_plugin_dlhelper" href="#"></a></span>'); 
															$(html.join(""))
																.insertAfter($(this));
														}
														
														if($("#_sys_plugin_dlhelper")[0]) {
															$("#_sys_plugin_dlhelper")
																.attr("href", (_bv.pluginFile || "MediaPlugin7.exe"))
																.get(0)
																.click();
														} 
													}
													else { 
														html.push("版本：" + (_bv.version || "v1.0.1"));
														html.push("\r\n作者：" + (_bv.authors ? _bv.authors.join(",") : "huzw"));
														html.push("\r\n时间：2013.09.11");
														
														alert(html.join(""));
													} 
													break;
											} 
										});		
										break; 
								} 
							});
							
						} // end console_tab	
					
					} // end console_tab_body
					
					// - 置为不可用
					_bv.Frame.Console.Disabled(); 
				}
				catch (e) {
					if (NPPUtils.Log) {
						NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					}
					return false;	
				}
			},
			// - 处理实际命令
			Operator: function(domid, mouseAction) {
				try {
					var fn = "_bv.Frame.Console.Operator";
					
					if (domid && $("#" + domid)[0]) {
						var connectId = _bv.connectId;
						if(!connectId || !NPPILY.Connections.get(connectId)) {
							NPPUtils.Log(fn, "connectId error~");
							return false;
						}
						
						var curwinkey = _bv.Frame.curactivewindowkey;
						if (!curwinkey || !NPPILY.WindowContainers.get(curwinkey)) {
							_bv.Frame.Console.Disabled();	
							return false;
						}
							
						var _connStruct = NPPILY.Connections.get(connectId);
						var winContainer = NPPILY.WindowContainers.get(curwinkey);
						
						switch (domid) {
							case "stopvideo":
								if (mouseAction === "up") {
									return true;	
								}
								_bv.Video.StopVideo(curwinkey);
								_bv.Frame.Console.Disabled();
								// - 触发失去焦点
								$("#" + domid).trigger("blur");
								break;
							case "audio":
								if (mouseAction === "up") {
									return true;	
								}
								if (winContainer.window && winContainer.window.status.playvideoing) {
									_bv.Video.PlayAudio(curwinkey);
									
									var label = winContainer.window.status.playaudioing ? "停止音频" : "开启音频";
									$("#" + domid)
										.button("option", "label", label)
										.attr("title", label);
										
									// - 刷新窗口右键菜单
									_bv.Video.UpdateWindowMenus(curwinkey);
									// - 刷新视频状态图标
									_bv.Video.UpdateStatusIcon(curwinkey);
								}
								break;
							case "DDrawSwitch":
								if (mouseAction === "up") {
									return true;	
								}
								// - 切换DDraw模式
								_bv.Video.DDrawSwitch(curwinkey);
								// - 刷新视频状态图标
								_bv.Video.UpdateStatusIcon(curwinkey);
								break;
							case "fullScreen": // 窗口全屏
								if (mouseAction === "up") {
									return true;	
								}
								_bv.Video.FullScreen(curwinkey);
								break;
							case "startCall":
							case "startTalk":
								if (mouseAction == "up") {
									return true;	
								}
								// - 喊话对讲控制
								_bv.Frame.CallTalkControl(curwinkey, domid);
								break;
							case "snapshot-text":
							case "record-text":
								if (mouseAction == "dblclick") {
									// - 打开选择存储路径
									var operator = NPPILY.Folder.GetFileFolder();
									if (operator.rv == NrcapError.NRCAP_SUCCESS) {
										var path = operator.response || "C:/";
										path = path.replace(/(\/)|(\\)/gm, "/");
										if ($("#" + domid)[0]) {
											$("#" + domid)	
												.button("option", "label", path)
										}
									}
								}
								break;
							case "snapshot":
								if (mouseAction === "up") {
									return true;	
								}
								_bv.Video.LocalSnapshot(curwinkey);
									// - 刷新视频状态图标
									_bv.Video.UpdateStatusIcon(curwinkey);
								break;
							case "record":
								if (mouseAction === "up") {
									return true;	
								}
								if (winContainer.window && winContainer.window.status.playvideoing) {
									_bv.Video.LocalRecord(curwinkey);
									
									var label = winContainer.window.status.recording ? "停止本地录像" : "开始本地录像";
									$("#" + domid)
										.button("option", "label", label)
										.attr("title", label);
										
									// - 刷新窗口右键菜单
									_bv.Video.UpdateWindowMenus(curwinkey);
									// - 刷新视频状态图标
									_bv.Video.UpdateStatusIcon(curwinkey);
								}
								break;
								
							case "ptzspeed":
								if (mouseAction == "slider_change") {
									if (winContainer.window && winContainer.window.status.playvideoing) {
										var operator = NPPILY.PTZ_SetSpeed
										(
										 	connectId,
											winContainer.window.params.puid,
											winContainer.window.params.idx,
											$("#" + domid).slider("value")
										);
										if (operator.rv != NrcapError.NRCAP_SUCCESS) {
											$("#" + domid).slider("value", $("#" + domid).attr("_orgVal"));	
										}
									}
								}
								break;
							case "brightness":
							case "contrast":
							case "hue":
							case "saturation":
								if (mouseAction == "slider_change") {
									if (winContainer.window && winContainer.window.status.playvideoing) {
										var _method = "";
										if (domid == "brightness") {
											_method = "IV_SetBrightness";
										}
										else if (domid == "contrast") {
											_method = "IV_SetContrast";
										}
										else if (domid == "hue") {
											_method = "IV_SetHue";
										}
										else {
											_method = "IV_SetSaturation";	
										}
										var operator = NPPILY[_method]
										(
										 	connectId,
											winContainer.window.params.puid,
											winContainer.window.params.idx,
											$("#" + domid).slider("value")
										);
										if (operator.rv != NrcapError.NRCAP_SUCCESS) {
											$("#" + domid).slider("value", $("#" + domid).attr("_orgVal"));	
										}
									}
								}
								break;
							
							default:
								if (winContainer.window && winContainer.window.status.playvideoing) {
									if($("#" + domid)[0] && $("#" + domid).attr("crtype") == "_ptz") {
										var direction = "",
											action = true,
											options = {};
										
										if (mouseAction === "up") {
											action = false;	
										}
										
										// - 云台控制										
										switch (domid) { 
											case "turnleft":
											case "turnright":
											case "turntop":
											case "turnbottom":
												if (domid == "turnleft") {
													direction = NPPILY.Enum.PTZDirection.turnleft;
												}
												else if (domid == "turnright") {
													direction = NPPILY.Enum.PTZDirection.turnright;
												}
												else if (domid == "turntop") {
													direction = NPPILY.Enum.PTZDirection.turnup;
												}
												else if (domid == "turnbottom") {
													direction = NPPILY.Enum.PTZDirection.turndown;
												}
												
												if (action == false) {
													direction = NPPILY.Enum.PTZDirection.stopturn;	
												}
												break;
											case "zoomin":
											case "zoomout":
												if (domid == "zoomin") {
													direction = NPPILY.Enum.PTZDirection.zoomin;
												}
												else if (domid == "zoomout") {
													direction = NPPILY.Enum.PTZDirection.zoomout;
												}
												if (action == false) {
													direction = NPPILY.Enum.PTZDirection.stopzoom;	
												}
												break;
											case "aperturea":
											case "aperturem":
												if (domid == "aperturea") {
													direction = NPPILY.Enum.PTZDirection.aperturea;
												}
												else if (domid == "aperturem") {
													direction = NPPILY.Enum.PTZDirection.aperturem;
												}
												if (action == false) {
													direction = NPPILY.Enum.PTZDirection.stopaperture;	
												}
												break;
											case "focusfar":
											case "focusnear":
												if (domid == "focusfar") {
													direction = NPPILY.Enum.PTZDirection.focusfar;
												}
												else if (domid == "focusnear") {
													direction = NPPILY.Enum.PTZDirection.focusnear;
												}
												if (action == false) {
													direction = NPPILY.Enum.PTZDirection.stopfocus;	
												}
												break;
											case "moveToPPos":
												direction = NPPILY.Enum.PTZDirection.movetopresetpos;
												if (action == false) {
													return true;	
												}
												if ($("#presetpos")[0]) {
													options.presetPosNo	= $("#presetpos").val();
												}
												break;
											case "setPPos":
												direction = NPPILY.Enum.PTZDirection.setpresetpos;
												if (action == false) {
													return true;	
												}
												if ($("#presetpos")[0]) {
													options.presetPosNo	= $("#presetpos").val();
													options.presetPosName = "";
													var ptzSets_operator = NPPILY.PTZ_GetPresetPositionSets
													(
													 	connectId,
														winContainer.window.params.puid, 
														winContainer.window.params.idx
													);
													if (ptzSets_operator.rv == NrcapError.NRCAP_SUCCESS) {
														// alert($.toJSON(ptzSets_operator.response)); return false;
														if (typeof ptzSets_operator.response == "object" && ptzSets_operator.response) {
															if (ptzSets_operator.response.constructor != Array) {
																ptzSets_operator.response = [ptzSets_operator.response];	
															}
															$.each(ptzSets_operator.response, function(i, ppos) {
																if (ppos.number == options.presetPosNo) {
																	options.presetPosName = ppos.desc;
																	return false;
																}
															});
														}
														options.presetPosName = options.presetPosName || ("PresetPosition" + options.presetPosNo);	
													}
												}
												break;
											case "startSDev":
												direction = NPPILY.Enum.PTZDirection.startsecondarydev;
												if (action == false) {
													return true;	
												}
												if ($("#secondarydev")[0]) {
													options.secondaryDevNo	= $("#secondarydev").val(); 
												}
												break;
											case "stopSDev":
												direction = NPPILY.Enum.PTZDirection.stopsecondarydev;
												if (action == false) {
													return true;	
												}
												if ($("#secondarydev")[0]) {
													options.secondaryDevNo	= $("#secondarydev").val();
												}
												break;
										}
										
										if (direction) {
											var operator = NPPILY.PTZ.Control
											(
												 connectId, 
												 winContainer.window.params.puid, 
												 winContainer.window.params.idx, 
												 direction,
												 options
											);
										}
										
									} // end if #domid
									
								} // end winContainer.window ...
										 
								break; 
								
						} // end switch
					} 
				}
				catch (e) {
					if (NPPUtils.Log) {
						NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					}
					return false;	
				}
			},
			
			Enabled: function() {
				try {
					var fn = "_bv.Frame.Console.Enabled";
					
					var curwinkey = _bv.Frame.curactivewindowkey;
					
					if (!curwinkey || !NPPILY.WindowContainers.get(curwinkey)) {
						_bv.Frame.Console.Disabled();	
						return false;
					}
					
					var winContainer = NPPILY.WindowContainers.get(curwinkey);
					if (winContainer instanceof NPPILY.Struct.WindowContainerStruct) {
						var winObj = winContainer.window;
						if (winObj && winObj instanceof NPPILY.Struct.WindowStruct && winObj.status.playvideoing) {
							if($("#console_tab_body")[0]) {
								// - 由于云台资源可能不存在，可以单独获取云台速度
								var speed_operator = NPPILY.Config.GetSimple
								(
									_bv.connectId, 
									winObj.params.puid, 
									NPPILY.Enum.PuResourceType.PTZ, 
									winObj.params.idx, 
									"CFG_PTZ_Speed"
								);
								// alert($.toJSON(speed_operator));
								
								$("#console_tab_body")
									.find("[crtype=_videoctl], [crtype=_ptz], [crtype=_video], legend, label")
									.each(function(i, dom) {
										// alert($(dom).get(0).id); 		   
										switch ($(dom).attr("crtype")) {
											case "_videoctl":
												$(dom).button("enable");
												
												if (dom.id == "audio") {
													var label = winObj.status.playaudioing ? "停止音频" : "开启音频";
													$(dom)
														.button("option", "label", label)
														.attr("title", label);
												}
												else if (dom.id == "record") {
													var label = winObj.status.recording ? "停止本地录像" : "开始本地录像";
													$(dom)
														.button("option", "label", label)
														.attr("title", label);	
												}
												break;
											case "_ptz":
												if ($(dom).attr("type") == "speed") {
													$(dom).slider("enable");
													
													if (speed_operator.rv == NrcapError.NRCAP_SUCCESS) {
														$(dom)
															.attr("_orgVal", speed_operator.response)
															.slider("value", speed_operator.response);
													}
													else {
														$(dom).slider("disable");
													}
												}
												else if ($(dom).attr("type") == "text") {
													$(dom).spinner("enable"); 
													if (speed_operator.rv == NrcapError.NRCAP_SUCCESS) {
														if ($("#ptzspeed-text")[0]) {
															$("#ptzspeed-text")
																.spinner("value", speed_operator.response);
														}
													}
													else {
														$(dom).spinner("disable");
													}
												}
												else {
													$(dom).button("enable");
												}
												break;
											case "_video":
												$(dom).slider("enable");
												$(dom)
													.attr("_orgVal", 0)
													.slider("value", 0);	
												break;
												
											default:
												$(dom).css({
													color: "#000000"	 
												}); 
												break;
										} 
									});
								
								// - 更新喊话或对讲图标状态 2013.12.02
								if ($("#startCall") && $("#startTalk")) {
									var oaStatus_operator = NPPILY.CallTalkControl.GetStatus
									(
										_bv.connectId,
										winObj.params.puid,
										0
									);
									if (oaStatus_operator.rv == NrcapError.NRCAP_SUCCESS && oaStatus_operator.response != null) {
										var label_1, label_2;
										if (oaStatus_operator.response.call) {
											label_1 = "停止喊话";
											label_2 = "开启对讲";
										}
										else if (oaStatus_operator.response.talk) {
											label_1 = "开启喊话";
											label_2 = "停止对讲";
										}
										else {
											label_1 = "开启喊话";
											label_2 = "开启对讲";
										}
										$("#startCall").button("option", "label", label_1).attr("title", label_1);
										$("#startTalk").button("option", "label", label_2).attr("title", label_2);
									}
								} 
									
								// - 获取视频参数信息等
								var video_operator = NPPILY.CommonRequest
								(
									_bv.connectId,
									{
										cmdType: NPPILY.Enum.CmdType.GET,
										puid: winObj.params.puid,
										xmlDstRes: (function(_type, _idx) {
											var _xmldr = "";
											$.each(["CFG_IV_Brightness", "CFG_IV_Contrast", "CFG_IV_Hue", "CFG_IV_Saturation"], function(i, optid) {
												_xmldr += '<DstRes Type="'+_type+'" Idx="'+_idx+'" OptID="'+optid+'" ></DstRes>';					
											});	
											return _xmldr;
										})(NPPILY.Enum.PuResourceType.VideoIn, winObj.params.idx)
									}
								);
								// alert($.toJSON(video_operator));
								if (video_operator.rv == NrcapError.NRCAP_SUCCESS) {
									window.setTimeout
									(
										function () {
											var _response = video_operator.response;
											$.each(_response, function(i, item) {
												if (item && item.ErrorCode == "0") {
													var _videodomid = "";
													switch (item.OptID) {
														case "CFG_IV_Brightness":
															_videodomid = "brightness";
															break;
														case "CFG_IV_Contrast":
															_videodomid = "contrast";
															break;
														case "CFG_IV_Hue":
															_videodomid = "hue";
															break;
														case "CFG_IV_Saturation":
															_videodomid = "saturation";
															break;
													}
													if (_videodomid && $("#" + _videodomid)[0]) {
														if (typeof item.Param != "undefined" && typeof item.Param.Value != "undefined") {
															$("#" + _videodomid)
																.attr("_orgVal", item.Param.Value)
																.slider("value", item.Param.Value);	
														}
														else {
															$("#" + _videodomid).slider("disable");
														}
													}
												}
											});
											
										}, 100
									);
									
								} // end if video_operator
								
							}
						}
						else {
							_bv.Frame.Console.Disabled();	
							return false; 
						} 	
					}
				}
				catch (e) {
					if (NPPUtils.Log) {
						NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					}
					return false;
				} 
			},
			
			Disabled: function() {
				try {
					var fn = "_bv.Frame.Console.Disabled";
					
					if($("#console_tab_body")[0]) {
						$("#console_tab_body")
							.find("[crtype=_videoctl], [crtype=_ptz], [crtype=_video], legend, label")
							.each(function(i, dom) {
								// alert($(dom).get(0).id); 		   
								switch ($(dom).attr("crtype")) {
									case "_videoctl":
										$(dom).button("disable"); 
										if ($(dom).attr("type") == "text") {
											// $(dom).button("enable"); 
										}
										break;
									case "_ptz":
										if ($(dom).attr("type") == "speed") {
											$(dom).slider("disable");	
										}
										else if ($(dom).attr("type") == "text") {
											$(dom).spinner("disable"); 
										}
										else {
											$(dom).button("disable"); 
										}
										break;
									case "_video":
										$(dom).slider("disable"); 
										break;
										
									default:
										$(dom).css({
											color: "#C3C3C3"	 
										}); 
										break;
								} 
							});
					}
				}
				catch (e) {
					if (NPPUtils.Log) {
						NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					}
					return false;
				} 	
			},
			
			end: true
		},

		// - 喊话对讲控制
		CallTalkControl: function(winkey, domid) {
			try {
				var fn = "_bv.Frame.CallTalkControl";
				
				var connectId = _bv.connectId;
				if (!connectId || !NPPILY.Connections.get(connectId)) {
					return false;	
				}
				
				var _connStruct = NPPILY.Connections.get(connectId);
				 
				var _winContainer = NPPILY.WindowContainers.get(winkey);
				
				if (_winContainer && _winContainer instanceof NPPILY.Struct.WindowContainerStruct && _winContainer.window) {
					var puid = _winContainer.window.params.puid;
					if (puid) {
						var oaIndex = 0, operator;
						
						var status_operator = NPPILY.CallTalkControl.GetStatus
						(
							connectId,
							puid,
							oaIndex
						);
						
						if (status_operator.rv == NrcapError.NRCAP_SUCCESS)
						{
							if (!status_operator.response.call && !status_operator.response.talk) {
								if (domid == "startCall") {
									operator = NPPILY.CallTalkControl.StartCall
									(
										connectId,
										puid,
										oaIndex
									);
								}
								else if (domid == "startTalk") {
									operator = NPPILY.CallTalkControl.StartTalk
									(
										connectId,
										puid,
										oaIndex
									);		
								}
								
								switch (Number(operator.rv)) {
									case NrcapError.NRCAP_SUCCESS:
										var label = "";
										if (domid == "startCall") {
											label = "停止喊话";
											$("#startCall")
												.button("option", "label", label)
												.attr("title", label);
										}
										else if (domid == "startTalk") {
											label = "停止对讲";
											$("#startTalk")
												.button("option", "label", label)
												.attr("title", label);
										}
										break;
									case NrcapError.NRCAP_ERROR:
									case NrcapError.NRCAP_FAILED:
										alert("喊话或对讲失败~");
										break;
									case NrcapError.NRCAP_ERROR_PU_OFFLINE:
										alert("设备不在线，喊话或对讲失败~");
										break;
									case NrcapError.NRCAP_ERROR_HANDLE_ERROR:
										alert("未知的设备，喊话或对讲失败~");
										break;
									case NrcapError.NRCAP_ERROR_UNSUPPORT:
										alert("属性不支持，喊话或对讲失败~");
										break;
									case NrcapError.NRCAP_ERROR_CALLTALK_OCCUPIED:
									case NrcapError.NRCAP_NU_ERROR_AUDIO_CHANNEL_OCCUPY:
										alert("音频输出资源被占用，可稍候重试~");
										break;
									case NrcapError.NRCAP_ERROR_CALLTALK_INCOMPATIBLE:
										alert("喊话与对讲应互斥操作~");
										break;
									case NrcapError.NRCAP_ERROR_CALLTALK_EXISTED:
										alert("喊话或对讲已经开启~");
										break;
									case NrcapError.NRCAP_ERROR_OVERLAP:
										alert("不支持交叠，覆盖前面操作~");
										break;
								}
								
								return true; 
							}
							else {
								var incompatible = false, kontinue = true;
								if (domid == "startCall") {
									if (status_operator.response.talk == true) {
										incompatible = true;
										if (!confirm("开启喊话前请关闭双向对讲，是否立即关闭？")) {
											kontinue = false;	
											return false;
										}	
									}
								}
								else if (domid == "startTalk") {
									if (status_operator.response.call == true) {
										incompatible = true;
										if (!confirm("开启双向对讲前请关闭喊话，是否立即关闭？")) {
											kontinue = false;
											return false;	
										}
									}
								}
								
								operator = NPPILY.CallTalkControl.Stop
								(
									connectId,
									puid,
									oaIndex
								);
								switch (operator.rv) {
									case NrcapError.NRCAP_SUCCESS:
										var label = "开启喊话";
										$("#startCall")
											.button("option", "label", label)
											.attr("title", label);
									
										label = "开启对讲";
										$("#startTalk")
											.button("option", "label", label)
											.attr("title", label);
										
										break;
								}
								
								if (incompatible == true && kontinue == true) {
									// - 开启喊话或对讲
									_bv.Frame.CallTalkControl(winkey, domid);
								} 
							}
						} 
					}
				}
			}
			catch (e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
			
			// - 最后更新设备喊话对讲状态，在视频窗口中体现出来
			finally {
				if (puid) {
					$('#topframe div[crtype^=windowbox][_infor^="'+puid+'"]')
						.each(function(index, dom) {
							var oaStatus_operator = NPPILY.CallTalkControl.GetStatus(_bv.connectId, puid, 0);
							
							// - 刷新视频状态图标
							_bv.Video.UpdateStatusIcon(dom.id, {oaStatus_operator: oaStatus_operator});			   
						});	
						
				}
			}
		},
								
		// - 初始化窗口
		InitWindows: function() {
			try {
				var fn = "_bv.Frame.InitWindows";
				
				if (NPPILY.WindowContainers.constructor == NPPUtils.Hash) { 
					NPPILY.WindowContainers.clear();
				}
				else {
					NPPILY.WindowContainers = new NPPUtils.Hash();
				}
				
				var windows = $("#topframe div[crtype=windowbox]");
				
				$.each(windows, function(i, dom) {
					// alert(dom.id);
					NPPILY.WindowContainers.set
					(
						dom.id,
						new NPPILY.Struct.WindowContainerStruct
						(
							dom,
							NPPILY.Enum.WindowType.VIDEO,
							false,
							null,
							null
						)
					);
					
					_bv.Frame.curwindowkeys.push(dom.id);
					
					// - 绑定点击事件
					$(dom).click
					(
						function(event) 
						{
							_bv.Frame.ActiveWindow(this.id); 
						}
					);
				});
				
				// alert($.toJSON(NPPILY.WindowContainers._self()));
				
				// - 激活第一个窗口
				_bv.Frame.ActiveWindow(_bv.Frame.curwindowkeys[0]); 
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		// - 激活窗口
		ActiveWindow: function(winkey) {
			try {
				var fn = "_bv.Frame.ActiveWindow";
				
				if(winkey && $.inArray(winkey, _bv.Frame.curwindowkeys) != -1) {
					if (NPPILY.WindowContainers.constructor == NPPUtils.Hash) { 
						NPPILY.WindowContainers.each
						(
							function(item) {
								var node = item.value;
								if(item.key == winkey) {
									node.active = true;
									
									$("#" + item.key) 
										.css({
											"background-color": "#65A3E5"
										})
										.find(".windowtitle")
										.css({
											"color": "#FFFFFF"
										}); 
									
									// - 记录当前被激活的key
									_bv.Frame.curactivewindowkey = item.key;
									
									// - do other things
									
									
								}
								else {
									node.active = false;
									
									$("#" + item.key) 
										.css({
											"background-color": "#9DBDD8" // "#9BCAF3"
										})
										.find(".windowtitle")
										.css({
											"color": "#15428B"
										}); 
								} 
							}	
						); 
					} 	
				}
				
				// - 激活控制台 
				_bv.Frame.Console.Enabled();
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		
		// - 改变窗口区大小
		ResizeWindows: function() {
			try {
				var fn = "_bv.Frame.ResizeWindows";
				
				if($("#topframe")[0]) {
					var winnum = _bv.Frame.curwindownumber || 1,
						winkeys = _bv.Frame.curwindowkeys;
					
					var tf_width = $("#topframe").width(),
						tf_height = $("#topframe").height(),
						spliter = Math.sqrt(winnum); 
					
					switch(winnum) {
						case 1:
						case 4:
						case 9:
						case 16: 
							var each_width = (tf_width - (spliter * 3) - 1) / spliter,
								each_height = (tf_height - (spliter * 2) - 1) / spliter;
							
							NPPILY.WindowContainers.each
							(
								function(item) {
									var node = item.value;
									
									if($("#" + item.key)[0]) {
										$("#" + item.key)
											.css({
												width: each_width + "px",
												height: each_height + "px",
												"border-bottom": "0px #FFFFFF solid"
											});
										
										// - window
										if($("#" + item.key + " .window")[0]) {
											$("#" + item.key + " .window")
												.css({
													width: each_width + "px",
													height: (each_height - 18) + "px"
												});
										}
										
										// - windowtitle
										if($("#" + item.key + " .windowtitle")[0]) {
											$("#" + item.key + " .windowtitle")
												.css({
													width: each_width + "px",
													height: 16 + "px"
												});
										}
									} 
								}	
							); 
							
							break;
						
						case 6:
							var spliter = 3,
								each_width = Math.floor( (tf_width - (spliter * 3) - 1) / spliter ),
								each_height = Math.floor( (tf_height - (spliter * 2) - 1) / spliter ),
								big_width = 2 * each_width + 3,
								big_height = 2 * each_height + 1;
							
							NPPILY.WindowContainers.each
							(
								function(item) {
									var node = item.value;
									
									var is_big = item.key.search("windowbox0") != -1 
													? true : false;
									
									if($("#" + item.key)[0]) {
										$("#" + item.key)
											.css({
												width: (is_big ? big_width : each_width) + "px",
												height: (is_big ? big_height : each_height) + "px",
												"border-bottom": "0px #FFFFFF solid"
											});
										
										// - window
										if($("#" + item.key + " .window")[0]) {
											$("#" + item.key + " .window")
												.css({
													width: (is_big ? big_width : each_width) + "px",
													height: ((is_big ? big_height : each_height) - 18) + "px"
												});
										}
										
										// - windowtitle
										if($("#" + item.key + " .windowtitle")[0]) {
											$("#" + item.key + " .windowtitle")
												.css({
													width: (is_big ? big_width : each_width) + "px",
													height: 16 + "px"
												});
										}
									} 
								}	
							); 
							
							break;
					} 
				}
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		// - 切换窗口
		ChangeWindow: function(winNumber) {
			try {
				var fn = "_bv.Frame.ChangeWindow";
 				
				if($("#topframe")[0]) {
					winNumber = parseInt(winNumber);
					
					var html = _bv.Frame.Html("changewindow", winNumber); // alert(html); 
							
					$("#topframe").html(html); 
					
					_bv.Frame.curwindownumber = winNumber; // - 记录当前窗口数
					
					_bv.Frame.InitWindows();
				} 
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		 		
		Html: function(mode) {
			try { 
				var fn = "_bv.Frame.Html";
				
				var html = [];
				
				switch(mode) {
					case "mainframe":
						html.push('<div id="topframe" class="topframe"></div>');
						
						if (_bv.console == true) {
							html.push('<div id="bottomframe" class="bottomframe">');
						
							// - bottom tab
							html.push('<div id="console_tab" class="console_tab-bottom">');	
							html.push('<ul>');
							html.push('<li crtype="_tab"><a href="#console_tab_body">控制台</a></li>');
							// html.push('<li><a href="#console_tab_body_2">控制台2</a></li>');
							
							// - system about
							html.push('<li crtype="_system" class="_system">');
							// html.push('<span>欢迎您 admin | 2013-09-22 17:50:00 星期日 | 插件下载 | 关于</span>');
							html.push('<span class="welcome" crtype="_welcome">欢迎您</span><span>&nbsp;|&nbsp;</span>');
							html.push('<span class="sysTime" crtype="_sysTime">日期时间</span><span>&nbsp;|&nbsp;</span>');
							html.push('<span class="plugin" crtype="_plugin">插件下载</span><span>&nbsp;|&nbsp;</span>');
							html.push('<span class="sysAbout" crtype="_sysAbout">关于</span>');
							html.push('</li>');
							
							html.push('</ul>');	
							html.push('<div class="console_tab-spacer" ></div>');
							html.push('<div id="console_tab_body"></div>'); 
							// html.push('<div id="console_tab_body_2">Hello world~</div>'); 
							html.push('</div>');
							
							html.push('</div>');		
						}
						 	
						break;
					
					case "console":
						html.push('<div style="float:left;width:100%;height:110px;overflow-x:hidden;overflow-y:auto;border:0px gray solid;">');
						
						// - video control zone (1)
						html.push('<div style="float:left;width:435px;height:105px;border-right:0px gray dotted;">');
						html.push('<div style="height:32px;border-bottom:0px red solid;">');
						html.push('<button id="stopvideo" crtype="_videoctl" _infor="ui-icon-stop" title="停止视频">停止视频</button>');
						html.push('<button id="audio" crtype="_videoctl" _infor="ui-icon-volume-on" title="开启音频">开启音频</button>');
						html.push('<button id="DDrawSwitch" crtype="_videoctl" _infor="ui-icon-extlink" title="切换DDraw模式观看">切换DDraw模式</button>');
						html.push('<button id="fullScreen" crtype="_videoctl" _infor="ui-icon-arrow-4-diag" title="窗口全屏">窗口全屏</button>');
						html.push('</div>');
						html.push('<div style="height:32px;border-bottom:0px red solid;">');
						html.push('<button id="startCall" crtype="_videoctl" _infor="ui-icon-signal-diag" title="开启喊话">开启喊话</button>');
						html.push('<input id="snapshot-text" crtype="_videoctl" type="text" value="C:/" title="本地抓拍存储路径（请务必保证本地硬盘存在此目录）" style="width:168px;" _status="static" />');
						html.push('<button id="snapshot" crtype="_videoctl" _infor="ui-icon-image" title="本地抓拍">本地抓拍</button>');
						html.push('</div>');
						html.push('<div style="height:32px;border-bottom:0px red solid;">');
						html.push('<button id="startTalk" crtype="_videoctl" _infor="ui-icon-transferthick-e-w ui-icon-refresh" title="开启对讲">开启对讲</button>');
						html.push('<input id="record-text" crtype="_videoctl" type="text" value="C:/" title="本地录像存储路径（请务必保证本地硬盘存在此目录）" style="width:168px;" _status="static" />');
						html.push('<button id="record" crtype="_videoctl" _infor="ui-icon-video" title="开始本地录像">开始本地录像</button>'); 
						html.push('</div>');
						
						html.push('</div>'); // end (1)
						
						// - ptz control zone (2)
						html.push('<div style="float:left;width:385px;border-right:0px gray dotted;">');
						
						// - left
						html.push('<div style="float:left;width:85px;height:105px;margin-left:8px;border:0px gray solid;">');
						html.push('<button id="turntop" crtype="_ptz" _infor="ui-icon-carat-1-n" style="margin-left:25px;">向上</button>');	
						html.push('<button id="turnleft" crtype="_ptz" _infor="ui-icon-carat-1-w">向左</button>');	
						html.push('<button id="turnright" crtype="_ptz" _infor="ui-icon-carat-1-e" style="margin-left:15px;">向右</button>');	
						html.push('<button id="turnbottom" crtype="_ptz" _infor="ui-icon-carat-1-s" style="margin-left:25px;">向下</button>');	
						html.push('</div>');
						// - center
						html.push('<div style="float:left;width:100px;height:105px;border:0px gray solid;">');
						html.push('<span style="vertical-align:middle;">');
						html.push('<label>缩放&nbsp;</label>');
						html.push('<button id="zoomin" crtype="_ptz" _infor="ui-icon-zoomin" >放大</button>');	
						html.push('<button id="zoomout" crtype="_ptz" _infor="ui-icon-zoomout" >缩小</button>');	
						html.push('</span>');
						html.push('<span style="vertical-align:middle;">');
						html.push('<label>光圈&nbsp;</label>');
						html.push('<button id="aperturea" crtype="_ptz" _infor="ui-icon-gear" >增大</button>');	
						html.push('<button id="aperturem" crtype="_ptz" _infor="ui-icon-radio-off" >减小</button>');	
						html.push('</span>');
						html.push('<span style="vertical-align:middle;">');
						html.push('<label>聚焦&nbsp;</label>');
						html.push('<button id="focusfar" crtype="_ptz" _infor="ui-icon-arrow-4-diag" >推远焦点</button>');	
						html.push('<button id="focusnear" crtype="_ptz" _infor="ui-icon-arrow-4" >拉近焦点</button>');	
						html.push('</span>');
						html.push('</div>');
						// - right
						html.push('<div style="float:left;width:185px;height:105px;border:0px gray solid;">');
						html.push('<div title="云台转动速度（0~100）"  style="width:100%;height:32px;line-height:32px;vertical-align:middle;">');	
						// - speed control -
						html.push('<div style="float:left;width:120px;">');
						html.push('<div id="ptzspeed" crtype="_ptz" type="speed" style="width:90px;margin:5px auto;"></div>');
						html.push('</div>');
						html.push('<div style="float:left;width:50px;display:block;"><input id="ptzspeed-text" crtype="_ptz" type="text" value=0 _min=0 _max=100 style="width:25px;"/></div>');
						
						html.push('</div>');
						html.push('<div style="vertical-align:middle;">');
						html.push('<button id="moveToPPos" crtype="_ptz" style="width:60px;" >前往</button>');	
						html.push('<input id="presetpos" crtype="_ptz" type="text" value=1 _min=0 _max=255 style="width:25px;" title="预置位编号（0~255）" />');
						html.push('<button id="setPPos" crtype="_ptz" style="width:60px;margin-left:1px;" >设置</button>');
						html.push('</div>');
						html.push('<div style="vertical-align:middle;">');
						html.push('<button id="startSDev" crtype="_ptz" style="width:60px;" >启</button>');	
						html.push('<input id="secondarydev" crtype="_ptz" type="text" value=1 _min=1 _max=4 style="width:25px;" title="辅助设备编号（1~4）" />');
						html.push('<button id="stopSDev" crtype="_ptz" style="width:60px;margin-left:1px;" >停</button>');
						html.push('</div>');
						html.push('</div>');
						
						html.push('</div>'); // end (2)
						
						// - video params config zone (3)
						html.push('<div style="float:left;width:350px;height:110px;border:0px gray solid;">');
						
						html.push('<div style="float:left;width:165px;height:55px;">');
						html.push('<fieldset><legend>亮度</legend><div id="brightness" crtype="_video" type="_video" style="width:100px;margin:5px auto;"></div></fieldset>');
						html.push('</div>');
						html.push('<div style="float:left;width:165px;height:55px;margin-left:5px;">');
						html.push('<fieldset><legend>对比度</legend><div id="contrast" crtype="_video" type="_video" style="width:100px;margin:5px auto;"></div></fieldset>');
						html.push('</div>');
						html.push('<div style="float:left;width:165px;height:55px;">');
						html.push('<fieldset><legend>色调</legend><div id="hue" crtype="_video" type="_video" style="width:100px;margin:5px auto;"></div></fieldset>');
						html.push('</div>');
						html.push('<div style="float:left;width:165px;height:55px;margin-left:5px;">');
						html.push('<fieldset><legend>饱和度</legend><div id="saturation" crtype="_video" type="speed" style="width:100px;margin:5px auto;"></div></fieldset>');
						html.push('</div>');
						
						html.push('</div>'); // end (3)
						
						html.push('</div>'); 
						break;
					
					case "changewindow":
						var winNumber = arguments.length >= 2 ? arguments[1] : 1;
						
						switch(parseInt(winNumber)) {
							case 1:
							case 4:
							case 9:
							case 16:
								for(var i = 0; i < parseInt(winNumber); i++) {
									html.push('<div id="windowbox'+i+'" class="windowbox'+winNumber+'" crtype="windowbox">'); 
									html.push('<div id="window'+i+'" class="window"></div>'); 
									html.push('<div id="windowtitle'+i+'" class="windowtitle">');
									html.push('<div class="title1">&nbsp;无视频</div><div class="title2"></div>');
									html.push('</div>'); 
									html.push('</div>');  
								} 
								break;
							
							case 6:
								for(var i = 0; i < parseInt(winNumber); i++) {
									if(i == 0) {
										html.push('<div id="windowbox0" class="windowbox6" crtype="windowbox">');
										html.push('<div id="window0" class="window"></div>'); 
										html.push('<div id="windowtitle0" class="windowtitle">'); 
										html.push('<div class="title1">&nbsp;无视频</div><div class="title2"></div>');
										html.push('</div>'); 
										html.push('</div>');  
									}
									else {
										html.push('<div id="windowbox'+i+'" class="windowbox9" crtype="windowbox">'); 
										html.push('<div id="window'+i+'" class="window"></div>'); 
										html.push('<div id="windowtitle'+i+'" class="windowtitle">'); 
										html.push('<div class="title1">&nbsp;无视频</div><div class="title2"></div>');
										html.push('</div>'); 
										html.push('</div>');  
									}
								}
								break; 
						}	
						
						break; 
				} 	
				
				return html.join("");  
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return "";
			}
		},
		
		end: true
	},
	
	// - NC事件对象
	NCEvent: {
		mapSessionConnectId : {},
		
		Init: function() {
			try {
				var fn = "_bv.NCEvent.Init";
				
				// - 注册接收平台或设备事件
				NPPILY.NCNotifyManager.Update
				(
					NPPILY.Enum.NCObjectNotify.event_notify,
					_bv.NCEvent.ReceiveEventNotify
				);
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return "";
			}	
		},
		
		ReceiveEventNotify: function(_ncnStruct) {
			try
			{
				var fn = "_bv.NCEvent.ReceiveEventNotify";
				
				if(typeof _ncnStruct != "undefined" && _ncnStruct instanceof NPPILY.Struct.NCObjectNotifyStruct) { 
				 	// NPPUtils.Log(fn, "_ncnStruct -> " + $.toJSON(_ncnStruct));
					
					if (_ncnStruct.eventName == "event_notify" && _ncnStruct.errorCode == "0") {
						 if (typeof _ncnStruct.keyData != "undefined") {
						 	var eventItem = _ncnStruct.keyData.event || {};
						 	switch (eventItem.id) {
								case "EVT_PU_Online": // - 设备上线
									var puItem = _bv.Resource.GetCoreInfoByPuid(_bv.connectId, eventItem.src_id);
									// alert($.toJSON(puItem));
									if (puItem && puItem instanceof NPPILY.Struct.PUNodeStruct) {
										puItem.online = "1";
										
										var options = _bv.Url.options || {}; // alert($.toJSON(options));
										if($.isArray(options._VIDEOS.videos)) {
											var childres = puItem.childResource || [];
											if (!$.isArray(childres)) {
												return false;	
											}
											if (typeof options._VIDEOS.disables[puItem.puid] != "undefined") {
												
												var _ivIndexs = options._VIDEOS.disables[puItem.puid].ivIndexs || [];
													
												$.each(childres, function(i, _child) {
													if (_child.type == NPPILY.Enum.PuResourceType.VideoIn && $.inArray(_child.idx, _ivIndexs) != -1) {
														var _infor = puItem.puid + "_" + _child.idx;
														if ($('div[crtype^=windowbox][_infor="'+_infor+'"]')[0]) {
															var winkey = $('div[crtype^=windowbox][_infor="'+_infor+'"]')[0].id;
															_bv.Video.PlayVideo
															(
																puItem.puid,
																_child.idx,
																_child,
																winkey
															); 
														}
													} 
												});
												var _video = options._VIDEOS.disables[puItem.puid];
												options._VIDEOS.enables[puItem.puid] = _video;
												delete options._VIDEOS.disables[puItem.puid];
											} 
										} 
									}
									break;
									
								case "EVT_PU_Offline": // - 设备下线
									var puItem = _bv.Resource.GetCoreInfoByPuid(_bv.connectId, eventItem.src_id);
									// alert($.toJSON(puItem));
									if (puItem && puItem instanceof NPPILY.Struct.PUNodeStruct) {
										puItem.online = "0";
										
										var options = _bv.Url.options || {}; // alert($.toJSON(options));
										if($.isArray(options._VIDEOS.videos)) {
											var childres = puItem.childResource || [];
											if (!$.isArray(childres)) {
												return false;	
											}
											if (typeof options._VIDEOS.enables[puItem.puid] != "undefined") {
												
												var _ivIndexs = options._VIDEOS.enables[puItem.puid].ivIndexs || [];
													
												$.each(childres, function(i, _child) {
													if (_child.type == NPPILY.Enum.PuResourceType.VideoIn && $.inArray(_child.idx, _ivIndexs) != -1) {
														var _infor = puItem.puid + "_" + _child.idx;
														if ($('div[crtype^=windowbox][_infor="'+_infor+'"]')[0]) {
															var winkey = $('div[crtype^=windowbox][_infor="'+_infor+'"]')[0].id;
															_bv.Video.StopVideo(winkey); 
														}
													} 
												});
												var _video = options._VIDEOS.enables[puItem.puid];
												options._VIDEOS.disables[puItem.puid] = _video;
												delete options._VIDEOS.enables[puItem.puid];
											} 
										} 	
									}
									break; 
							} 
						 }
					}
					else {
						if (_ncnStruct.errorCode != "0") {
							_bv.NCEvent.Broken.Init();
						} 	
					}
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 连接已断开
		Broken: {
			brcInterval: 10000,
			
			Init: function(message) {
				try {
					var fn = "_bv.NCEvent.Broken.Init";
					
					_bv.UnLoad(); 
					
					_bv.NCEvent.Broken.CreateReConnectTimer(message);
				}
				catch(e) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
							
			},
			// - 立即重连
			ImmediateConnect: function() {
				try {
					var fn = "_bv.NCEvent.Broken.ImmediateConnect";
					
					_bv.Mask.Hide();
					
					if (NPPUtils.Timer.ContainsKey("NCEvent", "brokenReConnect")) {
						NPPUtils.Timer.UnSet("NCEvent", "brokenReConnect");
					}
					 		
					_bv.Load(); 
				}
				catch(e) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
			},
			// - 侦测重连
			CreateReConnectTimer: function(message) {
				try {
					var fn = "_bv.NCEvent.Broken.BrokenReConnect";
					
					if (!NPPUtils.Timer.ContainsKey("NCEvent", "brokenReConnect")) {
						var _totalcount = (_bv.NCEvent.Broken.brcInterval || 10000) / 1000,
							_count = 0,
							_showMask = function(_second) {
								if (_second == 0) {
									return true;	
								}
								
								var width = 230,
									height = 45;
								var html = [];
								if (message) {
									html.push('<div>'+message+'</div>');
									
									var realLen = NPPUtils.GetStringRealLength(message);
									if (realLen == "") realLen = 0;
									
									width = realLen * 6.5 || 280;
										
									if (_bv.enable_autorc) {
										html.push('<div>'+_second +'秒后将尝试重连~</div>');
										height = 65;
									}
									else {
										height = 45;
									}
								}
								else {
									html.push('<div style="height:20px;line-height:20px;font-size:13px;">侦测到连接已断开');
									if (_bv.enable_autorc) {
										html.push('，' + _second +'秒后将尝试重连');
									}
									html.push('~</div>');
								}
								
								html.push('<div>');
								html.push('<input type=button value="'+(_bv.enable_autorc?"立即重连":"点击重连")+'" onclick="_bv.NCEvent.Broken.ImmediateConnect();" />&nbsp;');
								html.push('<input type=button value="关闭网页" onclick="_bv.NCEvent.Broken.CloseWindow();" />');
								html.push('</div>');
								
								var options = {
									mode: "code",
									html: html.join(""),
									width: width || 230,
									height: height || 45
								};
								_bv.Mask.Show(options);
							};
						
						if (_bv.enable_autorc) {
							NPPUtils.Timer.Set
							(
								"NCEvent", 
								{
									name: "brokenReConnect",
									fu: function() { 
										_showMask(_totalcount - _count);
										
										if (_count++ >= _totalcount) {
											_count = 0;
											
											// - 建立重连
											_bv.NCEvent.Broken.ImmediateConnect();
											
											return true;
										}
									},
									interval: 1000
								}
							); 
							
							NPPUtils.Timer.Start();
						}
						else {
							_showMask();	
						}
					}
				}
				catch(e) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
			},
			// - 关闭网页
			CloseWindow: function() {
				try {
					var fn = "_bv.NCEvent.Broken.CloseWindow";
					
   					window.open("", "_parent", "");
					
					window.close();
				}
				catch(e) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
			},　
			
			end: true
		},
		
		end: true
	},
	
	// - 视频对象
	Video: {
		// - 流句柄与窗口key映射表
		mapStreamWinkey: {},
		// - 窗口key与流句柄映射表
		mapWinkeyStream: {},
		
		Init: function() {
			try { 
				var fn = "_bv.Video.Init";
			 	
				var connectId = _bv.connectId;
				
				var options = _bv.Url.options || {}; // alert($.toJSON(options));
				
				var store = _bv.Resource.store || {},
					resource = store.resource || {};
				
				if(store.error == null) {
					if($.isArray(options._VIDEOS.videos)) {
						options._VIDEOS.enables = {};
						options._VIDEOS.disables = {};
						
						var _playedIndex = 0,
							_winkeys = _bv.Frame.curwindowkeys || [];
						
						$.each(options._VIDEOS.videos, function(i, _video) {
							if(_bv.debug) NPPUtils.Log(fn, "_video -> " + $.toJSON(_video));
							
							if(typeof _video.correct != "undefined" || _video.correct === true) { 
								var _pu,
									_puid = _video.puid,
									_ivIndexs = _video.ivIndexs || [];
									
								// - 直连
								if(store.mode == 2) {
									_pu = resource;
									
									_puid = _puid || "15100123"; // - virtual a puid
								}
								else { 
									_pu = resource.get(_puid) ? resource.get(_puid) : {};
								}
								if(_bv.debug) NPPUtils.Log(fn, "_pu -> " + $.toJSON(_pu));
								
								var childres = _pu.childResource = _pu.childResource || [];
								if(!$.isArray(childres)) {
									childres = [childres];
								}
								
								// - 过滤摄像头
								$.each(
									childres, 
									function(ii, _child) 
									{ 
										if(_child.type == NPPILY.Enum.PuResourceType.VideoIn && $.inArray(_child.idx, _ivIndexs) != -1) 
										{
											if(_playedIndex <= _winkeys.length - 1) {
												// - 激活窗口
												var _needactivewinkey = _winkeys[_playedIndex++]; 
												_bv.Frame.ActiveWindow(_needactivewinkey);
												
												// - 把播放信息与winkey对应起来
												if ($("#" + _needactivewinkey)[0]) {
													$("#" + _needactivewinkey)
														.attr("_infor", _puid + "_" + _child.idx);	
												}
												
												if(_pu.online == "1" && (store.mode == 2 || _pu.enable == "1") && _child.enable == "1") {	
													// - 播放视频
													_bv.Video.PlayVideo(_puid, _child.idx, _child); 
													
													// - 在线使能的
													if (typeof options._VIDEOS.enables[_puid] == "undefined") {
														options._VIDEOS.enables[_puid] = _video;
													}
												}
												else {
													// - 标记不在线或未使能
													if($("#" + _needactivewinkey + " .windowtitle .title1")[0]) {
														var note = "";
														if (_pu.online != "1" || _pu.enable != "1") {
															note = "&nbsp;设备" + (_pu.name || "") + "（" + (_child.name || "") + "）不在线或未使能";
														}
														else if (_child.enable != "1") {
															note = "&nbsp;摄像头" + (_child.name || "") + "未使能";
														}
														if($("#" + _needactivewinkey + " .windowtitle .title2")[0]) {
															$("#" + _needactivewinkey + " .windowtitle .title2")
																.html("")
																.css({
																	width: "1%"
																});
														}
														$("#" + _needactivewinkey + " .windowtitle .title1")
															.html(note)
															.attr("title", note.replace(/(\&nbsp;)/, ""))
															.css({
																width: "98%"
															});
															
														// - 把不在线或下线的都记录下来
														if (_pu.online != "1") {
															if (typeof options._VIDEOS.disables[_puid] == "undefined") {
																options._VIDEOS.disables[_puid] = _video;
															}
														}
													}
												}
											} 
										} 	
									}
								); // end childres
								
							}
						}); // end options._VIDEOS.videos
						
						// - 激活第一个视频窗口
						_playedIndex = 0;
						_bv.Frame.ActiveWindow(_winkeys[_playedIndex]);
						
						if(_bv.debug) NPPUtils.Log(fn, "_bv.Video.mapStreamWinkey -> " + $.toJSON(_bv.Video.mapStreamWinkey));
					}
				} 
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		
		// - 清空视频
		Clear: function() {
			try {
				var fn = "_bv.Video.Clear";
				
				_bv.Video.BrokenUpServer.Clear();
				
				_bv.Video.mapStreamWinkey = {};
				 
				_bv.Video.mapWinkeyStream = {};
				
				NPPILY.DisConnection(_bv.connectId);
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}	
		},
		
		// - 播放视频
		PlayVideo: function(puid, ivIndex, _childResNode, _winkey) {
			try {
				var fn = "_bv.Video.PlayVideo";
				
				if(NPPILY.WindowContainers instanceof NPPUtils.Hash) {
				
					var connectId = _bv.connectId;
					if(!connectId || !NPPILY.Connections.get(connectId)) {
						NPPUtils.Log(fn, "connectId error~");
						return false;
					}
					
					var _ivHanlde = _childResNode._HANDLE,
						_streamType = NPPILY.Enum.NrcapStreamType.REALTIME;
					
					// NPPUtils.Log(fn, puid + "::" + ivIndex + "::" + _ivHanlde); 
					
					var _playSucc = false;
					
					NPPILY.WindowContainers.each
					(
						function(item) 
						{
							var node = item.value;
							
							if((typeof _winkey != "undefined" && item.key == _winkey) 
								|| (typeof _winkey == "undefined" && node.active == true)) {
								
								var create = true;
								
								if(node.window && node.window.wnd) {
									create = false;
									
									if(node.window.status.playvideoing) {
										if(node.window.params.puid == puid && node.window.params.idx == ivIndex) {
											NPPUtils.Log(fn, "Has played -> " + puid + "::" + ivIndex);
											
											_playSucc = true; 
											return false;
										} 	
										// - need stop video
										_bv.Video.StopVideo(item.key);
									} 
								}
								
								if(create) {
									// - 绑定事件
									{
										var _windowEvent = new NPPILY.Struct.WindowEventStruct(); // alert($.toJSON(_windowEvent));
										// - 鼠标左键单击事件
										_windowEvent.lbtn_click.status = true;
										_windowEvent.lbtn_click.callback = function(x, y) {
											_bv.Video.ResponseWindowEventCallback(item.key, "ActiveWindow", x, y);
										}; 
										// - 开启窗口云台控制
										_windowEvent.ptz_control.status = _bv.console != true ? true : (!!(_bv.enableDWPTZCtl == true) ? true : false);
										// - 全屏事件回调函数
										_windowEvent.fsw_show.callback = function(_newWinHandle) {
											_bv.Video.ResponseWindowEventCallback(item.key, "ShowFullScreen", _newWinHandle);
										};
										_windowEvent.fsw_hide.callback = function(_oldWinHandle) {
											_bv.Video.ResponseWindowEventCallback(item.key, "HideFullScreen", _oldWinHandle);
										};
										 
										// - 自定义右键菜单
										_windowEvent.menu_command.status = true;
										_windowEvent.menu_command.menu = [{
											key: "-", text: "first"
										}, {
											key: "stopVideo", text: "停止播放"
										}, {
											key: "startAudio", text: "开启音频"
										}, {
											key: "-", text: "second"
										}, {
											key: "snapshot", text: "本地抓拍"
										}, {
											key: "open_snapshot_folder", text: "打开本地抓拍所在目录"
										}, {
											key: "startRecord", text: "开始本地录像"
										}, {
											key: "open_record_folder", text: "打开本地录像所在目录"
										}, {
											key: "-", text: "third"
										}, {
											key: "DDrawSwitch", text: "切换DDraw模式"
										}, {
											key: "-", text: "four"
										}, {
											key: "fullScreen", text: "全屏"
										}];
										_windowEvent.menu_command.callback = function(action) {
											_bv.Video.ResponseWindowEventCallback(item.key, "menu_command", action);
										};
									} 
									
									var operator = NPPILY.CreateWindow
									(
										connectId, 
										$("#" + item.key.replace("windowbox", "window"))[0], 
										// item.key.replace("windowbox", "window"),
										NPPILY.Enum.WindowType.VIDEO,
										_windowEvent
									);
									
									if(operator.rv == NrcapError.NRCAP_SUCCESS) {
										node.window = operator.response;
										
										// - 记录自定义相关信息项
										node.window.customParams._customMenus = _windowEvent.menu_command.menu; 
										node.window.customParams._dftCustomMenus = $.parseJSON($.toJSON(_windowEvent.menu_command.menu)); 
									}
									else {
										NPPUtils.Log(fn, "Create window failed -> " + NrcapError.Detail(operator.rv));
										return false;
									}
								}
								
								// - 使窗口可见
								if($(node.window.wnd)) {
									$(node.window.wnd)
										.css({
											"visibility": "visible",
											width: "100%",
											height: "100%",
											border: "0px #FFFFFF solid"
										});
								}
								
								// - 开始播放实时视频
								var operator = NPPILY.PlayVideo
								(
									connectId, 
									node.window, 
									puid, 
									ivIndex, 
									_streamType, 
									{
										_HANDLE: _ivHanlde
									}
								);
								
								if(operator.rv == NrcapError.NRCAP_SUCCESS) {
									// - 切换DDraw模式观看
									_bv.Video.DDrawSwitch(item.key, true);
									
									if(true) 
									{
										// - 把蒙板隐藏或移除
										if($("#" + item.key.replace("windowbox", "window") + "_mask")[0]) {
											$("#" + item.key.replace("windowbox", "window") + "_mask")
												.hide();	
										}
									}
									
									if(true)
									{
										// - 记录播放参数（使用深拷贝）
										node.window.customParams.orgParams = {};
										$.extend(true, node.window.customParams.orgParams, node.window.params);
										
										// - 把流类型（以及名称描述）记录下来
										node.window.customParams.ivStreamType = _streamType;
										node.window.customParams.ivStreamTypeName = _bv.Video.GetStreamTypeName(_streamType);
										// - 记录播放的录像信息
										node.description = _childResNode || {};
									}
									if(true)
									{
										// - 把旧有的流句柄删除掉
										/*var _oldivStreamHandle = _bv.Video.mapWinkeyStream[item.key];
										if(typeof _oldivStreamHandle != "undefined") {
											if(typeof _bv.Video.mapStreamWinkey[_oldivStreamHandle] != "undefined") {
												delete _bv.Video.mapStreamWinkey[_oldivStreamHandle];
											}
										}*/
										// - 记录新的映射关系
										var _newivStreamHandle = node.window.params.ivStreamHandle;   
										_bv.Video.mapWinkeyStream[item.key] = _newivStreamHandle;
										_bv.Video.mapStreamWinkey[_newivStreamHandle] = item.key;
									}
									
									// - 注册侦测视频状态事件
									NPPILY.NCNotifyManager.Add
									(
										NPPILY.Enum.NCObjectNotify.stream_status_notify,
										_bv.Video.RefGetStreamStatus
									); 
									
									NPPUtils.Log(fn, "Play video success -> " + puid + "::" + ivIndex);
									
									_playSucc = true; 
								}
								else {
									if($(node.window.wnd)) {
										$(node.window.wnd)
											.css({
												width: "0px",
												height: "0px",
												border: "0px #FFFFFF solid"
											});
									} 
									NPPUtils.Log(fn, "Play video failed -> " + NrcapError.Detail(operator.rv, true));
									
									if (true)
									{
										// - 播放失败也要记录相关参数
										node.window.customParams.orgParams = {
											puid: puid,
											idx: ivIndex,
											streamType: _streamType
										};
										node.window.customParams.ivStreamType = _streamType;
										node.window.customParams.ivStreamTypeName = _bv.Video.GetStreamTypeName(_streamType);
										// - 记录播放的录像信息
										node.description = _childResNode || {};
									}
									
										
									// - 播放视频失败，停止
									_bv.Video.StopVideo(item.key);
								
									_playSucc = false;
								} 
								
								// - 更新视频状态图标
								_bv.Video.UpdateStatusIcon(item.key);
								
							} // end node.active	 
						} 
					); 
				}
				
				return _playSucc ? true : false;
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		/*
		---
		fn : ResponseWindowEventCallback
		desc : 响应窗口事件回调函数
		time : 2013.10.09
		author : 
			- huzw
		...
		*/
		ResponseWindowEventCallback: function(winkey, mode) {
			try {
				var fn = "_bv.Video.ResponseWindowEventCallback";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					switch(mode) {
						case "ActiveWindow":
							_bv.Frame.ActiveWindow(winkey); // - 激活窗口
							break;
						
						case "ShowFullScreen": 
							_bv.Video.UpdateFullScreenStatus(winkey, "show", arguments[0]); // - 显示全屏窗口
							break;
						case "HideFullScreen": 
							_bv.Video.UpdateFullScreenStatus(winkey, "hide", arguments[0]); // - 隐藏全屏窗口
							break;
							
						case "menu_command":
							if (arguments.length >= 3) {
								var action = arguments[2];
								// alert(winkey+ " -> " + action);
								var _stopRefIcon = false;
								
								switch(action) {
									case "stopVideo":
										_bv.Video.StopVideo(winkey); // - 停止视频
										_stopRefIcon = true;
										break;
									case "startAudio":
									case "stopAudio":
										_bv.Video.PlayAudio(winkey); // - 播放或停止音频
										break;
									case "DDrawSwitch":
										_bv.Video.DDrawSwitch(winkey); // - 切换DDraw模式
										break;
									case "snapshot":
										_bv.Video.LocalSnapshot(winkey); // - 本地抓拍
										break;
									case "startRecord":
									case "stopRecord":
										_bv.Video.LocalRecord(winkey); // - 开始或停止本地录像
										break;
									case "fullScreen":
										_bv.Video.FullScreen(winkey); // - 全屏
										break;
									case "exitFullScreen":
										_bv.Video.ExitFullScreen(winkey); // - 退出全屏
										break;
									case "open_snapshot_folder": // - 打开图片存储路径
										NPPILY.Folder.OpenFolder(($("#snapshot-text").val() || "C://"));
										return false;
										break;
									case "open_record_folder": // - 打开录像存储路径
										NPPILY.Folder.OpenFolder(($("#record-text").val() || "C://"));
										return false;
										break;
								}
								// - 刷新窗口右键菜单
								_bv.Video.UpdateWindowMenus(winkey); 
								
								if (!_stopRefIcon) {
									// - 更新视频状态图标
									_bv.Video.UpdateStatusIcon(winkey);
								}
								
								// - 如果是激活的窗口
								if (_bv.Frame.curactivewindowkey == winkey) {
									_bv.Frame.ActiveWindow(winkey);	
								}
							}
							break; 
					} 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			} 
		},
		
		// - 停止视频
		StopVideo: function(winkey) {
			try {
				var fn = "_bv.Video.StopVideo";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.status && node.window.status.playvideoing) {
									var puid = node.window.params.puid;
									var ivStreamHandle = node.window.params.ivStreamHandle; 
														
									var operator = NPPILY.StopVideo(node.window);
									if (operator.rv == NrcapError.NRCAP_SUCCESS) {
										if (ivStreamHandle && typeof _bv.Video.mapStreamWinkey[ivStreamHandle] != "undefined") {
											_bv.Video.mapStreamWinkey[ivStreamHandle] = ""; 	
										}
										
										if($(node.window.wnd)) {
											$(node.window.wnd)
												.css({
													width: "0px",
													height: "0px",
													border: "0px #FFFFFF solid"
												});
										}
									}
									
									// - 获取正在喊话或对讲的相同设备的视频窗口数
									if (_bv.Video.GetOAWindowCount(puid) <= 0) {
										// - 停止喊话或对讲
										NPPILY.CallTalkControl.Stop(_bv.connectId, puid, 0);
									}
									// - 更新视频状态图标
									_bv.Video.UpdateStatusIcon(winkey);
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 获取正在喊话或对讲的相同设备的视频窗口数 2013.12.02
		GetOAWindowCount: function (puid) {
			try {
				var fn = "_bv.Video.GetOAWindowCount";
				
				var oawin_count = 0;
				NPPILY.WindowContainers.each(
					function (item) {
						var node = item.value;
						if (node.window && node.window.status.playvideoing && node.window.params.puid == puid) {
							oawin_count++;	
						}
					} 						 
				); 
				return oawin_count || 0;
			}
			catch (e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 播放或停止音频
		PlayAudio: function(winkey) {
			try {
				var fn = "_bv.Video.PlayAudio";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.status && node.window.status.playvideoing) {					
									var operator = NPPILY.PlayAudio(node.window);
									if (operator.rv != NrcapError.NRCAP_SUCCESS) {
										NPPUtils.Log(fn, "winkey -> " + winkey + ", error code -> " + NrcapError.Detail(operator.rv));
										alert("开启或停止音频失败，可稍候重试~");
									} 
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 切换DDraw模式
		DDrawSwitch: function(winkey, initCall) {
			try {
				var fn = "_bv.Video.DDrawSwitch";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					// - 先判断对于win7系统低版本ie无效
					if (navigator.platform == "Win32" || navigator.platform == "Windows") {
						var agt = navigator.userAgent.toLowerCase();
						if (agt.indexOf("windows nt 6.1") > -1 || agt.indexOf("windows 7") > -1) {
							if (agt.search("msie") != -1) {
								var _IEVNO = $.trim(agt.substr(agt.search("msie") + 5, 3));
								if(!isNaN(_IEVNO) && Number(_IEVNO) < 10) {
									NPPUtils.Log(fn, "DDrawSwitch nonsupport, _IEVNO -> " + _IEVNO);
									return false;
								}
							}
						}
					}
					
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								if (node.window && node.window.status && node.window.status.playvideoing) {
									if (initCall === true) {
										// - 是否默认开启DDraw模式观看
										NPPILY.EnableDDraw(node.window, (_bv.enableDDraw !== false ? 1 : 0));	
									}
									else {
										var isddraw_operator = NPPILY.IsDDrawing(node.window);
										NPPILY.EnableDDraw(node.window, !!(isddraw_operator.response == false));	
									}
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 本地抓拍
		LocalSnapshot: function(winkey) {
			try {
				var fn = "_bv.Video.LocalSnapshot";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.status && node.window.status.playvideoing) {
									var _DIRPATH = $("#snapshot-text")[0] ? ($("#snapshot-text").val() || "C:/") : "C:/";
									var _FILENAME = (node.description && node.description.name ? (node.description.name + "_") : "") 
													+ NPPUtils.DateFormat("yyyy#MM#dd#_#HH#mm#ss#_#l").replace(/#/g, "") + ".bmp";
												
									var operator = NPPILY.Snapshot(node.window, _DIRPATH, _FILENAME);
									if (operator.rv != NrcapError.NRCAP_SUCCESS) {
										NPPUtils.Log(fn, "winkey -> " + winkey + ", error code -> " + NrcapError.Detail(operator.rv));
										alert("本地抓拍失败，可稍候重试~");
									} 
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		// - 本地录像
		LocalRecord: function(winkey) {
			try {
				var fn = "_bv.Video.LocalRecord";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.status && node.window.status.playvideoing) {	
									var _DIRPATH = $("#record-text")[0] ? ($("#record-text").val() || "C:/") : "C:/";
									var _FILENAME = (node.description && node.description.name ? (node.description.name + "_") : "") 
													+ NPPUtils.DateFormat("yyyy#MM#dd#_#HH#mm#ss#_#l").replace(/#/g, "") + ".avi";
												
									var operator = NPPILY.LocalRecord(node.window, _DIRPATH, _FILENAME);
									if (operator.rv != NrcapError.NRCAP_SUCCESS) {
										NPPUtils.Log(fn, "winkey -> " + winkey + ", error code -> " + NrcapError.Detail(operator.rv));
										alert("开始或停止本地录像失败，可稍候重试~");
									}
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 窗口全屏
		FullScreen: function(winkey) {
			try {
				var fn = "_bv.Video.FullScreen";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.status && node.window.status.playvideoing) {					
									NPPILY.FullScreen(node.window); 
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		// - 退出窗口全屏
		ExitFullScreen: function(winkey) {
			try {
				var fn = "_bv.Video.ExitFullScreen";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.status && node.window.status.playvideoing) {					
									NPPILY.ExitFullScreen(node.window); 
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		// - 刷新窗口全屏状态
		UpdateFullScreenStatus: function(winkey, action, _wndHandle) {
			try {
				var fn = "_bv.Video.FullScreen";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.customParams) {
									switch(action) {
										case "show":
											node.window.customParams.isfullscreening = true;
											break;
										case "hide":
											node.window.customParams.isfullscreening = false;
											break;
									}
								}
							} 
						} 
					); 
					
					_bv.Video.UpdateWindowMenus(winkey); // - 刷新窗口右键菜单
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 刷新窗口右键菜单
		UpdateWindowMenus: function(winkey) {
			try {
				var fn = "_bv.Video.UpdateWindowMenus";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					NPPILY.WindowContainers.each(
						function(item) {
							if(item.key == winkey) {
								var node = item.value;
								
								if (node.window && node.window.customParams && node.window.customParams._customMenus) {
									var _customMenusArrayCache = [];
									var _customMenus = node.window.customParams._customMenus;
									 
									if (node.window.status.playvideoing) {				
									 
									 	for(var i = 0; i < _customMenus.length; i++) {
											var _menuItem = _customMenus[i];
											
											switch(_menuItem.key) {
												case "startAudio":
												case "stopAudio":
													if (node.window.status.playvideoing) {
														if (node.window.status.playaudioing) {
															_menuItem.key = "stopAudio";
															_menuItem.text = "停止音频";
														}
														else {
															_menuItem.key = "startAudio";
															_menuItem.text = "开启音频";
														}
													} 
													break;
												case "startRecord":
												case "stopRecord":
													if (node.window.status.playvideoing) {
														if (node.window.status.recording) {
															_menuItem.key = "stopRecord";
															_menuItem.text = "停止本地录像";
														}
														else {
															_menuItem.key = "startRecord";
															_menuItem.text = "开始本地录像";
														}
													} 
													break;
												case "-":
												case "separator":
												case "split":
													
													break;
												case "fullScreen":
												case "exitFullScreen":
													if (node.window.status.playvideoing) {
														if (node.window.status.isfullscreening) {
															_menuItem.key = "exitFullScreen";
															_menuItem.text = "退出全屏";
														}
														else {
															_menuItem.key = "fullScreen";
															_menuItem.text = "全屏";
														}
													}
													break;
											}
											
											_customMenusArrayCache.push(_menuItem);
										}
										
										if (node.window.customParams.isfullscreening !== true) {
											_customMenusArrayCache.push({key: "fullScreen", text: "全屏"});
										}
									}
									else {
									 	_customMenusArrayCache = node.window.customParams._dftCustomMenus || _customMenus;
									} 
									 
									var operator = NPPILY.WindowAttachEvent.UpdateMenuCommand
									(
									 	node.window, 
										_customMenusArrayCache, 
										true
									);
									if (operator.rv == NrcapError.NRCAP_SUCCESS) {
										node.window.customParams._customMenus = _customMenusArrayCache;
									}
									 
								}
							} 
						} 
					); 
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - @huzw 2013.10.23 add ---
		// - 更新视频状态栏图标
		UpdateStatusIcon: function(winkey, extraParams) {
			try {
				var fn = "_bv.Video.UpdateStatusIcon";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					var html = [];
					var ep = extraParams = extraParams || {};
					
					var winNode = NPPILY.WindowContainers.get(winkey);
					if (winNode && winNode.window && winNode.window instanceof NPPILY.Struct.WindowStruct) {
						if (winNode.window.type == NPPILY.Enum.WindowType.VIDEO) {
							if (winNode.window.status.playvideoing) {
								// - ddraw
								if (winNode.window.status.isddrawing) {
									html.push('<button class="video_ddrawing" onfocus="this.blur();" title="您正在使用DDraw模式观看"></button>');	
								}
								else {
									html.push('<button class="video_ddraw_disabled" onfocus="this.blur();" title="您正在使用非DDraw模式观看"></button>');
								}
								// - recording
								if (winNode.window.status.recording) {
									html.push('<button class="video_recording" onfocus="this.blur();" title="正在本地录像"></button>');	
								} 
								// - playaudioing
								if (winNode.window.status.playaudioing) {
									html.push('<button class="video_playaudioing" onfocus="this.blur();" title="正在播放音频"></button>');
								} 
								
								// - 是否在喊话对讲
								var oaStatus_operator = ep.oaStatus_operator || NPPILY.CallTalkControl.GetStatus
																		(
																			_bv.connectId,
																			winNode.window.params.puid,
																			0
																		);
								
								if (_bv.debug) NPPUtils.Log(fn, "Checking oaStatus -> " + $.toJSON(oaStatus_operator));
								
								if (oaStatus_operator.rv == NrcapError.NRCAP_SUCCESS) {
									if (oaStatus_operator.response != null && typeof oaStatus_operator.response.puid != "undefined" && oaStatus_operator.response.oaStreamHandle != null) {
										if (oaStatus_operator.response.call) {
											html.push('<button class="oa_calling" onfocus="this.blur();" title="设备音频输出资源正在喊话中"></button>');
										}
										else if (oaStatus_operator.response.talk) {
											html.push('<button class="oa_talking" onfocus="this.blur();" title="设备音频输出资源正在双向对讲中"></button>');	
										}
									}
								}
								
								if($("#" + winkey + " .windowtitle .title2")[0]) {
									$("#" + winkey + " .windowtitle .title2")
										.html(html.join(""))
										.css("width", "30%"); 
								}
							}
							else {
								// - 已停止播放
								html.push("&nbsp;");
								if (winNode.description != null) {
									html.push((winNode.description.name || ""));
								}
								html.push("&nbsp;已停止播放");
								if($("#" + winkey + " .windowtitle .title2")[0]) {
									$("#" + winkey + " .windowtitle .title2")
										.html("")
										.css("width", "1%"); 
								}	
								if($("#" + winkey + " .windowtitle .title1")[0]) {
									$("#" + winkey + " .windowtitle .title1")
										.html(html.join(""))
										.css("width", "98%");
								}
								 
								// - 创建窗口恢复播放蒙板
								_bv.Video.CreateWindowMask(winkey);
							}
						} 	
					} 
				}
			}
			catch (e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		}, 
		
		// - @huzw 2013.10.14 add ---
		// - 创建窗口蒙板
		CreateWindowMask : function(winkey) {
			try {
				var fn = "_bv.Video.CreateWidnowMask";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					var winNode = NPPILY.WindowContainers.get(winkey);
					if (winNode && winNode.window && winNode.window instanceof NPPILY.Struct.WindowStruct) {
						if (winNode.window.type == NPPILY.Enum.WindowType.VIDEO) {
							
							// - 窗口容器
							var winContainer = winNode.window.container;
							if (!winContainer) {
								if ($("#" + winNode.window.container.id)[0]) {
									winContainer = $("#" + winNode.window.container.id).get(0);	
								}
							}
								
							if (winContainer && $(winContainer)) {
								if (!$("#" + winContainer.id + "_mask")[0]) {
									var maskHtml = [];
									maskHtml.push('<div id="'+winContainer.id+'_mask" crtype="mask" style="position:absolute;top:0px;left:0px;width:100%;height:100%;background-color:transparent;">');
									
									maskHtml.push('<button class="window_mask" _winkey="'+winkey+'"></button>');
									
									maskHtml.push('</div>');
									
									$(winContainer)
										.append(maskHtml.join(""))
										.attr("_orgPos", ($(winContainer).css("position") || ""))
										.css("position", "relative");
										
									$("#" + winContainer.id + "_mask")
										.on("click mouseover mouseout", function(event) {
											switch(event.type) {
												case "click":
													
													break;
												case "mouseover":
													$(this).css("background-color", "#6e6e6e");
													$(this)
														.find("button:first")
														.show();
													break;
												case "mouseout":
													$(this).css("background-color", "transparent");
													$(this)
														.find("button:first")
														.hide();
													break; 
											}
										})
										.find("button:first")
										.hide()
										.attr("title", "点击恢复播放~")
										.click(function() {
											// alert("Starting restore play video~");
											_bv.Video.RestorePlayVideo
											(
												$(this)
													.attr("_winkey") 
												|| $(this)
													.parent("[crtype=mask]")
													.attr("id")
													.replace("_mask", "")
													.replace("window", "windowbox")
												|| ""
											);
										});
								}
								if ($("#" + winContainer.id + "_mask")[0]) {
									$("#" + winContainer.id + "_mask")
										.show();
								}
							} 
						} 
					}
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - @huzw 2013.10.14 add ---
		// - 恢复视频播放
		RestorePlayVideo: function(winkey) {
			try {
				var fn = "_bv.Video.RestorePlayVideo";
				
				if (winkey && NPPILY.WindowContainers.get(winkey)) {
					var winNode = NPPILY.WindowContainers.get(winkey);
					if (winNode && winNode.window && winNode.window instanceof NPPILY.Struct.WindowStruct) {
						if (winNode.window.type == NPPILY.Enum.WindowType.VIDEO) {
							var _orgParams = winNode.window.customParams.orgParams;
							if ($.isPlainObject(_orgParams)) {
								var rv = _bv.Video.PlayVideo
								(
									_orgParams.puid, 
									_orgParams.idx, 
									winNode.description,
									winkey
								);
								if (rv !== true) {
									alert("恢复视频播放失败，可能是设备不在线或摄像头未使能，可稍候重试~");
									return false;	
								}
							} 			
						}
					}
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 设置视频状态
		RefGetStreamStatus: function(_ncnStruct) {
			try
			{
				var fn = "_bv.Video.RefGetStreamStatus";
				 
				if(typeof _ncnStruct != "undefined" && _ncnStruct instanceof NPPILY.Struct.NCObjectNotifyStruct) { 
				 	if (_bv.debug) NPPUtils.Log(fn, "_ncnStruct -> " + $.toJSON(_ncnStruct));
					var _mapswkey = _bv.Video.mapStreamWinkey;
					var _winkey = _mapswkey[_ncnStruct._HANDLE];
					
					if(_winkey && $("#" + _winkey + " .windowtitle")[0]) {
						if(NPPILY.WindowContainers.get(_winkey)) {
							var _winContainer = NPPILY.WindowContainers.get(_winkey);
							 
							var html = [];
							html.push("&nbsp;");
							if (_winContainer.description != null) {
								html.push((_winContainer.description.name || ""));
							}
							if (typeof _ncnStruct.statusDesc != "undefined" && _ncnStruct.statusDesc != "") {
								html.push("&nbsp;");
								html.push(_ncnStruct.statusDesc);
								html.push(",");
							}
							if (_winContainer.window && _winContainer.window.customParams.ivStreamTypeName) {
								html.push(_winContainer.window.customParams.ivStreamTypeName);
							}
							html.push(",");
							html.push("帧率=" + (_ncnStruct.keyData.frame_rate || 0));
							html.push(",");
							html.push("码率=" + ((_ncnStruct.keyData.bit_rate || 0)/1000).toFixed(0) + "kb");
							
							if (_ncnStruct.status == -1)
							{
								_bv.Video.BrokenUpServer.busPause = true;
								
								// - 停止视频之前把已断流的信息记录下来
								_bv.Video.BrokenUpServer.Register(_winkey);
								
								// - 流已断开时需停止视频
								_bv.Video.StopVideo(_winkey);
								// - 刷新窗口右键菜单
								_bv.Video.UpdateWindowMenus(_winkey); 
								
								_bv.Video.BrokenUpServer.busPause = false;
							}
							
							var _hasOperator = false; 
							if($("#" + _winkey + " .windowtitle .title2")[0]) {
								
								if ($("#" + _winkey + " .windowtitle .title2").html() != "") {
									_hasOperator = true;
								}
								$("#" + _winkey + " .windowtitle .title2")
									.css({
										width: (_hasOperator ? "30%" : "1%")
									});
							}
							if($("#" + _winkey + " .windowtitle .title1")[0]) {
								
								$("#" + _winkey + " .windowtitle .title1")
									.html(html.join(""))
									.attr("title", html.join("").replace(/(\&nbsp;)/g, ""))
									.css({
										width: (_hasOperator ? "69%" : "98%")
									});
							}
						}
					}
				}
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		// - 断流恢复侦测对象
		BrokenUpServer: {
			store: new NPPUtils.Hash(),
			
			busInterval: 5000, // - 侦测周期
			
			busPause: false, // - 是否暂停一下
			
			// - 注册断流信息
			Register: function(winkey) {
				try {
					var fn = "_bv.Video.BrokenUpServer.Register";
					
					if (winkey && NPPILY.WindowContainers.get(winkey)) {
						NPPILY.WindowContainers.each(
							function(item) {
								if(item.key == winkey) {
									var node = item.value;
									
									if (node.window && node.window.status && node.window.status.playvideoing) {					
										_bv.Video.BrokenUpServer.store.set
										(
											winkey, 
											{
												key: winkey,
												active: true,
												params: {
													puid: node.window.params.puid,
													idx: node.window.params.idx,
													ivStreamType: node.window.params.streamType,
													ivStreamTypeName: (node.window.customParams.ivStreamTypeName || ""),
													ivChildres: node.description || {}
												}
											}
										); 
										
										// - 定时侦测
										if (typeof NPPUtils.Timer != "undefined") {
											if (!NPPUtils.Timer.ContainsKey("video", "BrokenUpServer")) {
												NPPUtils.Timer.Start();
												NPPUtils.Timer.Set
												(
													"video",
													{
														name: "BrokenUpServer",
														fu: function() {
															if (!_bv.Video.BrokenUpServer.busPause) {
																_bv.Video.BrokenUpServer.RefCheck();
															}
														},
														interval: (_bv.Video.BrokenUpServer.busInterval || 5000)
													}
												);
											} 
										} 
									}
								} 
							} 
						);
					}
					
					return true;
				}
				catch(e) {
					_bv.Video.BrokenUpServer.busPause = false;
						
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
			},
			
			RefCheck: function() {
				try {
					var fn = "_bv.Video.BrokenUpServer.RefCheck";
					
					if (_bv.Video.BrokenUpServer.store) {
						// NPPUtils.Log(fn, "bus store -> " + $.toJSON(_bv.Video.BrokenUpServer.store._self()));
						
						// var _curwinkey = _bv.Frame.curactivewindowkey;
						
						_bv.Video.BrokenUpServer.store.each(
							function(item) {
								var node = item.value;
								if (node.active == true) {
									
									// - 播放视频
									var _playSucc = _bv.Video.PlayVideo
									(
										node.params.puid,
										node.params.idx,
										node.params.ivChildres,
										item.key // - 恢复的窗口播放
									); 
									
									// NPPUtils.Log(fn, "restore operator -> " + _playSucc);
									
									if (_playSucc == true) {
										node.active = false;
										_bv.Video.BrokenUpServer.store.unset(item.key);
									}
								}
							}
						);
						
						// _bv.Frame.ActiveWindow(_curwinkey);
					}  
				} 
				catch(e) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
			},
			
			UnRegister: function(winkey) {
				try {
					var fn = "_bv.Video.BrokenUpServer.UnRegister";
					
					if (_bv.Video.BrokenUpServer.store) {
						if (winkey && _bv.Video.BrokenUpServer.store.get(winkey)) {
							_bv.Video.BrokenUpServer.store.unset(winkey);
						}
						
						NPPUtils.Log(fn, "bus store -> " + $.toJSON(_bv.Video.BrokenUpServer.store._self()));
					} 
				}
				catch(e) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
			},
			
			Clear: function() {
				try {
					var fn = "_bv.Video.BrokenUpServer.Clear";
					
					if (_bv.Video.BrokenUpServer.store) {
						_bv.Video.BrokenUpServer.store.clear();
					}
				}
				catch(e) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
					return false;
				}
			},
			
			end: true 
		},
		
		// - 获取流类型的描述
		GetStreamTypeName: function(streamType) {
			try {
				var fn = "_bv.Video.GetStreamTypeName";
				
				var streamTypeName = "";
				 
				switch(streamType) { 
					case NPPILY.Enum.NrcapStreamType.REALTIME:
						streamTypeName = "实时流";
						break;
					case NPPILY.Enum.NrcapStreamType.STORAGE:
						streamTypeName = "存储流";
						break;
					case NPPILY.Enum.NrcapStreamType.PICTURE:
						streamTypeName = "图片流";
						break;
					case NPPILY.Enum.NrcapStreamType.MOBILE2G:
						streamTypeName = "2G手机码流";
						break;
					case NPPILY.Enum.NrcapStreamType.MOBILE3G:
						streamTypeName = "3G手机码流";
						break;
					case NPPILY.Enum.NrcapStreamType.TRANSCODE:
						streamTypeName = "平台转码流";
						break;
					case NPPILY.Enum.NrcapStreamType.HD:
						streamTypeName = "高清流";
						break;
				}
				return streamTypeName || streamType || "";
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return (streamType || "");
			}
		},
		
		end: true
	},
	
	// - 资源对象
	Resource: {
		store: {
			mode: 0, // - 0 | 1 | 2
			
			error: null,
			
			// mapHandlePuid: {}, // - 设备句柄与PUID映射（？暂不启用）
			
			resource: null
		},
		
		Clear: function() {
			try {
				var fn = "_bv.Resource.Clear";
				
				this.store = {
					mode: 0,
					error: null,
					resource: null
				};
			}
			catch (e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		GetCoreInfoByPuid: function(connectId, puid) {
			try {
				var fn = "_bv.Resource.GetCoreInfoByPuid";
				
				if(!connectId || !NPPILY.Connections.get(connectId) || !puid) {
					NPPUtils.Log(fn, "connectId or puid error~");
					return false;
				}
				
				var store = _bv.Resource.store || {};
				
				if(store.error != null) {
					NPPUtils.Log(fn, "store.error not null~");
					return false;
				}
				
				switch(store.mode) {
					case 1: 
						return store.resource.get(puid) ? store.resource.get(puid) : {}; 
						break;
					
					case 2:
						return store.resource || {};
						break; 
				} 
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
		GetCoreInfoByPUHandle: function(connectId, _puHandle) {
			try {
				var fn = "_bv.Resource.GetCoreInfoByPUHandle";
				
				if(!connectId || !NPPILY.Connections.get(connectId) || !_puHandle) {
					NPPUtils.Log(fn, "connectId or puid error~");
					return false;
				}
				var store = _bv.Resource.store || {};
				
				if(store.error != null) {
					NPPUtils.Log(fn, "store.error not null~");
					return false;
				}
				switch(store.mode) {
					case 1: 
						var pu = null;
						store.resource.each(
							function(item) {
								if (pu == null && item.value && item.value._HANDLE == _puHandle) {
									pu = item.value;
									return true; // - 返回true确保跳出循环	
								}
							}
						);
						return pu;
						break;
					
					case 2:
						return store.resource || {};
						break; 
				} 
			}
			catch(e) {
				NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				return false;
			}
		},
		
 		Init: function() {
			try { 
				var fn = "_bv.Resource.Init";
				 
				var options = _bv.Url.options || {};
				
				if(_bv.connectId && NPPILY.Connections.get(_bv.connectId)) { 
					var _connStruct = NPPILY.Connections.get(_bv.connectId); 
					 
					if (_connStruct.status == NPPILY.Enum.ConnectionStatus.Connected) {
						
						switch(_connStruct.connType) {
							case NPPILY.Enum.ConnectionType.Server: // - 连接C7服务器
								_bv.Resource.store.mode = 1;
								
								var resource = null;
								
								if (options.puid != null) {
									// - 获取或构建一个设备信息
									var operator = NPPILY.ForkResource
									(
										_bv.connectId,
										NPPILY.Enum.ForkResourceLevel.nppForkOnePUInfo,
										null,
										null,
										null, {
											PUID: options.puid
										} 
									);
									if(operator.rv == NrcapError.NRCAP_SUCCESS) {
										resource = resource || new NPPUtils.Hash();
										
										// - 记录设备资源信息
										resource.set(operator.response.puid, operator.response);
										
										var ivCount = 0,
											ivIndexs = new Array();
										
										if (options.ivIndex == null) {
											var childres = operator.response.childResource || [];
											 
											$.each(childres, function(i, item) {
												if (item.type == NPPILY.Enum.PuResourceType.VideoIn) {
													if($.inArray(item.idx, ivIndexs) == -1) {
														ivIndexs.push(item.idx);
														ivCount++; 
													} 
												}	
											});
										}
										else {
											$.each(options.ivIndex.split(","), function(i, _ivIndex) {
												if($.inArray(_ivIndex, ivIndexs) == -1) {
													ivIndexs.push(_ivIndex);
												} 
											}); 
											ivCount = ivIndexs.length;  
										}	
											
										if (ivCount < 0 || ivCount > 16) {
											ivCount = 16;
										}
										else if (1 < ivCount && ivCount <= 4) {
											ivCount = 4; 
										}
										else if (4 < ivCount && ivCount <= 6) {
											ivCount = 6; 
										}
										else if (6 < ivCount && ivCount <= 9) {
											ivCount = 9; 
										}
										else if (9 < ivCount && ivCount <= 16) {
											ivCount = 16; 
										}
										else {
											ivCount = 1;
										}
										
										if (!isNaN(options.winNumber) && options.winNumber < ivCount) {
											options.winNumber = ivCount; 
										}
										 
										options._VIDEOS = {
											winNumber: options.winNumber,
											videos: [{
												puid: options.puid,
												ivIndexs: (ivIndexs || []).sort(),
												correct: true
											}]
										};
									}
									else { 
										_bv.Resource.store.error = "设备信息验证失败，无法完成播放~";
										NPPUtils.Log(fn, "设备信息验证失败，无法完成播放~");
										return false; 
									} 
								}
								else {
									// - 检测options.videos
									// - 最大16个有效的，puid_ivIndex,puid_ivIndex,...
									var _hasVideos = false;	
									if(options.videos != null) {
										var _orgVideos = options.videos.split(",");
										if($.isArray(_orgVideos)) { 
											_hasVideos = true;
											
											var _PUIDSets = [],
												_videos = [],
												ivCount = 0;
											
											$.each(_orgVideos, function(i, item) {
												if(item.indexOf("_") != -1 && item.split("_").length >= 2) {
													var _puid = $.trim(item.split("_")[0]),
														_ivIndex = $.trim(item.split("_")[1]);
													
													if(!_puid || typeof _ivIndex == "undefined" || _ivIndex == "" || isNaN(_ivIndex)) {
														return true;
													}
													
													var _exist = false;
													$.each(_videos, function(_i, _item) {
														if(_item.puid == _puid) {
															_exist = true;
															if($.inArray(_ivIndex, _item.ivIndexs) == -1) {
																_item.ivIndexs.push(_ivIndex);
															}
															return false;
														}
													});	
													
													if(!_exist) {
														_videos.push({
															puid: _puid,
															ivIndexs: [_ivIndex],
															correct: false
														});
														
														_PUIDSets.push(_puid);
													}
													
													// - 大于16个节点，截断
													if(i > 16) {
														return false;
													}
													
													ivCount++; 
												} 
											}); 
											  
											// - 获取构建资源
											var operator = NPPILY.ForkResource
											(
												_bv.connectId,
												NPPILY.Enum.ForkResourceLevel.nppForkPUResourceInfo,
												null,
												null,
												null, {
													PUIDSets: _PUIDSets,
													_returnMode: "whole" // - 返回设备全部（子资源）信息
												} 
											);
											if(operator.rv == NrcapError.NRCAP_SUCCESS) {
												var _errVideos = [],
													_succCount = 0;
												 
												if (operator.response == "" || operator.response.length <= 0) {
													_bv.Resource.store.error = "设备信息验证失败，无法完成播放~";
													NPPUtils.Log(fn, "设备信息验证失败，无法完成播放~");
												 
													_errVideos = _videos;
													_videos = [];
												}
												else { 
													resource = resource || new NPPUtils.Hash();
													 
													$.each(operator.response, function(i, item) {
														resource.set(item.puid, item);
														 
														// - 过滤播放视频
														$.each(_videos, function(_i, _video) {
															if(_video.puid == item.puid) { 
																var _succIndexs = [];
														
																$.each(item.childResource, function(_ii, _child) {
																	if(_child.type == NPPILY.Enum.PuResourceType.VideoIn) {
																		var _pos = $.inArray(_child.idx, _video.ivIndexs);
																		if(_pos != -1) {
																			_succIndexs.push(_child.idx);
																			_video.ivIndexs.splice(_pos, 1);
																			
																			_succCount++;
																		}
																	} 
																}); 
																
																if(_video.ivIndexs.length > 0) {
																	_errVideos.push({
																		puid: _video.puid,
																		ivIndexs: (_video.ivIndexs || []).sort()
																	});
																}
																
																// - 标记合法
																_video.correct = true;
																
																if(_succIndexs.length > 0) {
																	_video.ivIndexs = (_succIndexs || []).sort()
																} 
																else {
																	_videos.splice(_i--, 1);
																}
																
																return false;
															}
														}); 
													}); 
													
													// - 过滤不合法的PUID
													for (var _i = 0; _i < _videos.lgenth; _i++) {
														var _video = _videos[_i];
														
														if(typeof _video.correct == "undefined" || _video.correct !== true) {
															_videos.splice(_i--, 1);
															
															_errVideos.push({
																puid: _video.puid,
																ivIndexs: (_video.ivIndexs || []).sort(),
																correct: false
															});
														}
													}
												}
												 
												ivCount = _succCount;
												
												if (ivCount < 0 || ivCount > 16) {
													ivCount = 16;
												}
												else if (1 < ivCount && ivCount <= 4) {
													ivCount = 4; 
												}
												else if (4 < ivCount && ivCount <= 6) {
													ivCount = 6; 
												}
												else if (6 < ivCount && ivCount <= 9) {
													ivCount = 9; 
												}
												else if (9 < ivCount && ivCount <= 16) {
													ivCount = 16; 
												}
												else {
													ivCount = 1;
												}
												if (!isNaN(options.winNumber) && options.winNumber < ivCount) {
													options.winNumber = ivCount; 
												}
												
												options._VIDEOS = {
													winNumber: options.winNumber,
													videos: _videos || [],
													errVideos: _errVideos || []
												};
											}
											else {
												_bv.Resource.store.error = "设备信息验证失败，无法完成播放~";
												NPPUtils.Log(fn, "设备信息验证失败，无法完成播放~");
												return false; 
											} 
											
										} // end _orgVideos
									}
									
									if(!_hasVideos) {
										_bv.Resource.store.error = "未传设备信息，无法完成播放~";
										NPPUtils.Log(fn, "未传设备信息，无法完成播放~");
										return false; 
									}
								}
								
								_bv.Resource.store.resource = resource || null;
								
								break;
								
							case NPPILY.Enum.ConnectionType.Device: // - 直连设备
								_bv.Resource.store.mode = 2;
								
								var resource = new Object();
								
								var operator = NPPILY.ForkResource(_bv.connectId);
								
								if (operator.rv == NrcapError.NRCAP_SUCCESS) {
									resource = operator.response;
								}
								else {
									_bv.Resource.store.error = "获取或构建直连设备资源失败~"; 
									NPPUtils.Log(fn, "获取或构建直连设备资源失败~");
									return false;  
								} 
								
								if(_bv.debug) NPPUtils.Log(fn, "resource -> " + $.toJSON(resource));
								
								var ivCount = 0,
									ivIndexs = new Array();
								
								if (options.ivIndex == null) {
									var childres = resource.childResource || [];
									 
									$.each(childres, function(i, item) {
										if (item.type == NPPILY.Enum.PuResourceType.VideoIn) {
											if($.inArray(item.idx, ivIndexs) == -1) {
												ivIndexs.push(item.idx);
												ivCount++; 
											} 
										}	
									});
								}
								else {
									$.each(options.ivIndex.split(","), function(i, _ivIndex) {
										if($.inArray(_ivIndex, ivIndexs) == -1) {
											ivIndexs.push(_ivIndex);
										} 
									}); 
									ivCount = ivIndexs.length;  
								}	
									
								if (ivCount < 0 || ivCount > 16) {
									ivCount = 16;
								}
								else if (1 < ivCount && ivCount <= 4) {
									ivCount = 4; 
								}
								else if (4 < ivCount && ivCount <= 6) {
									ivCount = 6; 
								}
								else if (6 < ivCount && ivCount <= 9) {
									ivCount = 9; 
								}
								else if (9 < ivCount && ivCount <= 16) {
									ivCount = 16; 
								}
								else {
									ivCount = 1;
								}
								
								if (!isNaN(options.winNumber) && options.winNumber < ivCount) {
									options.winNumber = ivCount; 
								}
								 
								options._VIDEOS = {
									winNumber: options.winNumber,
									videos: [{
										puid: resource.puid || "",
										ivIndexs: (ivIndexs || []).sort(),
										correct: true
									}] 
								};
								
								_bv.Resource.store.resource = resource || null;
								
								break;
						} 
					}
					else {
						_bv.Resource.store.error = "建立连接失败~";
						NPPUtils.Log(fn, "建立连接失败~");
						return false;  
					} 
				} 
				
				NPPUtils.Log(fn, "Real _bv.Url.options -> " + $.toJSON(options));
				
				return true;
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		
		end: true
	},
	
	// - 页面蒙板对象
	Mask: {
		objboxid: "_buildvideo_masker",
		
		Init: function() {
			try {
				var fn = "_bv.Mask.Init";
				
				if(!$("#" + this.objboxid)[0]) {
					var html = [];
					html.push('<div id="'+this.objboxid+'_bgbox" crtype="_bgbox" style="position:absolute;width:100%;height:100%;top:0px;left:0px;background-color:#D7DDE3;filter:Alpha(Opacity=75);display:;">');
					html.push('<div id="'+this.objboxid+'" style="position:absolute;z-index:10;top:40%;left:40%;width:auto;height:16px;line-height:16px;vertical-align:middle;padding:5px 10px 5px 5px;padding:5px 10px 5px 5px !important;background-color:#E5E3D8;border:1px #DED8C9 solid;">');
					html.push('<div style="float:left;width:16px;height:16px;background:url(images/h1A.png) no-repeat center;border:0px solid red;"></div>');
					// 正在解析参数，请稍候...
					html.push('<div style="float:left;width:165px;height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-o-text-overflow:ellipsis;background-color:#E5E3D8;border:0px solid red;" crtype="msg"></div>'); 
					html.push('</div>');
					html.push('</div>'); 
					
					if($("body")) {
						$("body")
							.append(html.join(""));
					}
				} 
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}	
		}, 
		
		Show: function(/* text | options */) {
			try {
				var fn = "_bv.Mask.Show";
				
				if (arguments.length <= 0) {
					NPPUtils.Log(fn, "msak tip error~");
					return false;
				}
				
				if(!$("#" + this.objboxid)[0]) {
					this.Init();
				}
				
				if($("#" + this.objboxid)[0]) {
					if($("#" + this.objboxid).parent()) {
						$("#" + this.objboxid)
							.css({	
								height: "16px",
								top: "40%",
								left: "40%"
							})
							.parent()
							.show();
					}
					$("#" + this.objboxid)
						.show();
					
					if ($.type(arguments[0]) == "string") {
						if(arguments[0] != "") {
							if($("#" + this.objboxid + " div[crtype=msg]")[0]) {
								$("#" + this.objboxid + " div[crtype=msg]")
									.html(arguments[0]);
							}
						}
					}
					else if($.type(arguments[0]) == "object") {
						if($.type(arguments[0].mode) != "undefined" && arguments[0].mode === "code") {
							if($("#" + this.objboxid + " div[crtype=msg]")[0]) {
								var viewport_width = $(window).width(),
									viewport_height = $(window).height(),
									box_width = arguments[0].width,
									box_height = arguments[0].height,
									top = (viewport_height - box_height) * 50 / viewport_height + "%", 
									left = (viewport_width - box_width) * 50 / viewport_width + "%";
														
								$("#" + this.objboxid + " div[crtype=msg]")
									.html(arguments[0].html)
									.css({
										width: arguments[0].width + "px",
										height: arguments[0].height + "px"
									});
								
								$("#" + this.objboxid)
									.css({
										height: arguments[0].height + "px",
										top: (top || "40%"),
										left: (left || "40%")
									});
							}
							var html = $("#" + this.objboxid + " div[crtype=msg]")
									.html();
									
							if (html.length <= 0) { 
								this.Hide(); 
							}
							return true;
						}
						
						
						if(arguments[0].text != "") {
							if($("#" + this.objboxid + " div[crtype=msg]")[0]) {
								$("#" + this.objboxid + " div[crtype=msg]")
									.html(arguments[0].text || "")
									.css({
										"font-family": (arguments[0].family || ""),
										"font-style": (arguments[0].style || "normal"),
										"font-size": (arguments[0].size || 12) + "px",
										"font-weight": (arguments[0].weight || "normal"),
										"color": (arguments[0].color || "")
									});
							}
						} 
					}
					
					var html = $("#" + this.objboxid + " div[crtype=msg]")
									.html();
					
					if (html.length > 0) {
									
						var viewport_width = $(window).width(),
							viewport_height = $(window).height(),
							box_width = $("#" + this.objboxid)
												.width(),
							box_height = $("#" + this.objboxid)
												.height();
						 
						var realLength = NPPUtils.GetStringRealLength(html),
							realWidth = realLength * 6.5,
							orgWidth = $("#" + this.objboxid + " div[crtype=msg]")
											.width(),
							top = (viewport_height - box_height) * 50 / viewport_height + "%", 
							left = (viewport_width - box_width) * 50 / viewport_width + "%";
						
						$("#" + this.objboxid + " div[crtype=msg]")
							.css({
								width: (realWidth || orgWidth || 165),
								height: "16px"
							});
						$("#" + this.objboxid)
							.css({
								top: (top || "40%"),
								left: (left || "40%")
							});
					} 
					else {
						this.Hide();
					}
				}
				
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		
		Hide: function() {
			try {
				var fn = "_bv.Mask.Hide";
				
				if($("#" + this.objboxid)[0]) {
					if($("#" + this.objboxid).parent().attr("crtype") == "_bgbox") {
						$("#" + this.objboxid)
							.parent()
							.hide();
					}
					$("#" + this.objboxid).hide();
					
					if($("#" + this.objboxid + " div[crtype=msg]")[0]) {
						$("#" + this.objboxid + " div[crtype=msg]")
							.empty();
					}
				}
			}
			catch(e) {
				if (NPPUtils.Log) {
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);
				}
				return false;
			}
		},
		
		end: true
	},
	
	// - 系统调试对象
	Debug: {
		logger: null,
		
		objboxid: "_buildvideo_debugger",
		
		limit: {
			minHeight: 215,
			maxHeight: 475
		},
		
		Init: function() {
			try {
				if (!_bv.debug) {
					return false;
				}
				
				if (!$("#" + _bv.Debug.objboxid)[0]) {
					var html = [];
					html.push('<div id="'+_bv.Debug.objboxid+'" title="调试信息">');
					html.push('<textarea style="width:100%;height:160px;display:block;margin:0px auto;">&lt;&lt;&lt; --- Debug Messages --- </textarea>');
					html.push('</div>');
					
					if ($("body")[0]) {
						$("body")
							.append(html.join(""));
					}
					
					if ($("#" + _bv.Debug.objboxid)[0]) {
						$("#" + _bv.Debug.objboxid)
							.css({
								overflow: "hidden"
							})
							.dialog({
								width: 600,
								height: 215,
								minHeight: _bv.Debug.limit.minHeight || 215,
								maxHeight: _bv.Debug.limit.maxHeight || 335,
								resize: function(event, ui) {
									//if ((typeof console != "undefined")) {
									 	// (typeof console != "undefined").log(" id->" + $(this).attr("id") + ", ui->" + $.toJSON(ui));
										
									//}
									
									var _width = ui.size.width || ($(this).width()+35),
										_height = ui.size.height || ($(this).height()+50);
									
									if ($("#" + _bv.Debug.objboxid + " textarea")[0]) {
										$("#" + _bv.Debug.objboxid + " textarea")
											.css({
												width: (_width - 35) + "px",
												height: (_height - 50) + "px"
											});
									}
								},
								modal: false
							})
							// .dialog('close');
						 
					}
				}  
			}
			catch(e) { 
			}
		},
		
		Note: function(_msgStruct) {
			try {
				if(_msgStruct) {
					
					if (!$("#" + _bv.Debug.objboxid)[0]) {
						_bv.Debug.Init();
					} 
					 
					if ($("#" + _bv.Debug.objboxid)[0]) {
						$("#" + _bv.Debug.objboxid)
							.dialog("open");
					}
					
					var _time = _msgStruct.time || NPPUtils.DateFormat(), 
						_fn = _msgStruct.fn || "_bvLogger_", 
						_log = _msgStruct.msg || "";
					
					if ($("#" + _bv.Debug.objboxid + " textarea")[0]) {
						var _output = "[" + _time + "][" + _fn + "]" + _log;
						
						$("#" + _bv.Debug.objboxid + " textarea")
							.prepend(_output.replace(/\</g, "&lt;").replace(/\>/g, "&gt;") + "\r\n");
							
						if (_bv.bbrowserConsole && typeof console != "undefined" && typeof console.log == "function") {
							console.log(_output);
						}
					}
				} 
			}
			catch(e) {
				// alert(e.message + "::" + e.name);
			}
		},
		
		end: true
	},
	
	end: true
}; 
