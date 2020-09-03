var WebClient = {
	connectId : null,
	hash : new NPPUtils.Hash(),
	resource : new NPPUtils.Hash(),
	// - 创建连接，连接信息记录在NPPILY.Connections全局变量中
	Load:function(){
		try {
			// 首先初始化NPPILY，加载插件
			var operator = NPPILY.Init(new NPPILY.Struct.InitParamStruct(false, null, null));
			if (operator.rv != 0) {
				// 初始化不成功
				alert(NrcapError.Detail(operator.rv));
			}
			// 建立连接
			WebClient.Connect();
		}
		catch (e) {
			alert("excep error -> " + e.name + "::" + e.message);
			return false;
		}
	},
	Connect: function() {
		var path = _npc.connParams.path || "127.0.0.1:8866";
		var username = _npc.connParams.username || "admin";
		var password = _npc.connParams.password || "";
		var epId = _npc.connParams.epId || "system"; //登陆参数：企业id
		var bfix = _npc.connParams.bfix || 0;
		// 调用建立连接函数
		var operator = NPPILY.Connect
		(
			new NPPILY.Struct.ConnParamStruct
			(
				path,
				username,
				epId,
				password,
				bfix
			)　
		);
		if (operator.rv == 0) {
			// 此即是当前连接ID，记录下来
			WebClient.connectId = operator.response;
			WebClient.FetchResource();	
			NPPILY.NCNotifyManager.Add(
				NPPILY.Enum.NCObjectNotify.stream_status_notify,
				function (notify) {
				
					// 更新视频状态回调，等有视频播放的时候就会有调用
					WebClient.UpdateVideoStatus(notify);
				}
			);
		}
		else {
			alert("连接失败");
		}
	},
	
	/*	
		获取资源(FetchResource)
		connectId(string) 连接ID
		forkLevel(NPPILY.Enum.ForkResourceLevel) 构建资源级别
		offset(uint) 分页查询开始索引
		count(unit) 分页查询每次最大个数
	*/
	FetchResource: function () {
		try {
			var connectId = WebClient.connectId;
			if (!connectId || !NPPILY.Connections.get(connectId)) {
				alert("连接信息不存在，获取资源失败");
				return false;
			}
			var _connStruct = NPPILY.Connections.get(connectId),
				rootName = "",
				resource = [],
				style = "cr",
				offset = 0,
				count = 200,
				html = [];
			
			if (_connStruct.connType == NPPILY.Enum.ConnectionType.Server) {
				rootName = _connStruct.systemName || "网络视频监控系统";
				
				while(true) {
					// 分页获取所有设备资源
					var operator = NPPILY.ForkResource
					(
						connectId,
						NPPILY.Enum.ForkResourceLevel.nppForkPUInfo,
						offset,
						count,
						"" // 为空获取根平台的资源 
					);
					if (operator.rv == 0 && operator.response) {
						resource = resource.concat(operator.response);
						
						if (operator.response.length >= count) {
							// 继续获取
							offset = offset + count;
						}
						else {
							break;
						}
					}
					else {
						alert("获取设备" + NrcapError.Detail(operator.rv));
						// 其他错误跳出循环
						break;
					} 
				};
				// 进行在线排序
				var onlines = [], offlines = [];
				jQuery.each(resource, function (index, item) {
					if (item.online == 1 && item.enable == 1) {
						onlines.push(item);
					}
					else {
						offlines.push(item);
					}
				});
				resource = [];
				resource = resource.concat(onlines);
				resource = resource.concat(offlines);
			}
			else {
				// 直连设备
				var operator = NPPILY.ForkResource(connectId);
				if (operator.rv == 0 && operator.response) {
					resource = [operator.response];
					
					rootName = operator.response.name || "";
				}
			}
			// 记录资源信息
			WebClient.resource.set(connectId, resource);
			
			if (jQuery("#list_panel")[0]) {
				var lastnode = "",
					idRootPfx = style + '_cesSystemManagement';
				
				html.push('<div id="' + idRootPfx + '" style="white-space:nowrap;margin-top:2px !important; margin-top:2px;">');
					html.push('<input id="'+idRootPfx+'_img_title" type="button" class="minus" onfocus="this.blur();" onclick="WebClient.Expandsion(jQuery(\'#'+idRootPfx+'_childresourcebox\')[0], jQuery(\'#'+idRootPfx+'_img_title\')[0]);" />');
					html.push('<input id="'+idRootPfx+'_img_ico" type="button" class="root" onfocus="this.blur();" onclick="WebClient.Expandsion(jQuery(\'#'+idRootPfx+'_childresourcebox\')[0], jQuery(\'#'+idRootPfx+'_img_title\')[0]);" />'); 
					html.push('<label onclick="WebClient.Expandsion(jQuery(\'#'+idRootPfx+'_childresourcebox\')[0],jQuery(\'#'+idRootPfx+'_img_title\')[0]);" title="'+rootName+'">'+rootName+'</label>');
				html.push('</div>');
				
				html.push('<div id="'+idRootPfx+'_childresourcebox" class="childresourcebox_blankline" style="padding-left:15px;">');
				// 遍历资源
				jQuery.each(resource, function (index, item) {
					var prefix = "station", suffix = "_disabled", idPfx = style + "_" + item.puid;
					
					if (_connStruct.connType == NPPILY.Enum.ConnectionType.Server) {
						switch (item.modelType) {
							case NPPILY.Enum.PuModelType.ENC:
								prefix = "station";
								break;
							case NPPILY.Enum.PuModelType.WENC:
								prefix = "gateway";
								break;
							default:
								return true;
								break;
						}
					}
					
					if (item.online == 1 && item.enable == 1) {
						suffix = "";
					}
					var clsname = prefix + "" + suffix;
					
					html.push('<div style="white-space:nowrap;">');
						html.push('<input id="'+idPfx+'_img_title" type="button" class="plus" onfocus="this.blur();" onclick="WebClient.FetchChildResource(\'' + item.puid + '\', \'' + style + '\');" />');
						html.push('<input id="'+idPfx+'_img_ico" type="button" class="'+clsname+'" onfocus="this.blur();" onclick="WebClient.FetchChildResource(\'' + item.puid + '\', \'' + style + '\');" />');
						html.push('<label onclick="WebClient.FetchChildResource(\'' + item.puid + '\', \'' + style + '\');" title="'+item.name+'">'+item.name+'</label>');
					html.push('</div>');
					html.push('<div id="'+idPfx+'_childresourcebox" class="childresourcebox_directline" style="width:auto;height:auto;display:none;padding-left:15px;">');
					html.push('</div>');
					
					lastnode = idPfx + '_childresourcebox';
				});
				if (resource.length <= 0) {
					html.push('<div style="font-style:italic;">（无设备资源）</div>');
				}
				html.push('</div>');
				
				jQuery("#list_panel")
					.html(html.join(""))
					.find("#" + lastnode)
					.attr("class", "childresourcebox_blankline");
			}
		}
		catch (e) {
			alert("excep error -> " + e.name + "::" + e.message);
			return false;
		}
	},
	
	/*获取子资源(FetchChildResource)
	  puid(string) 设备PUID
	  connectId(string) 连接ID
	  forkLevel(NPPILY.Enum.ForkResourceLevel.nppForkPUResourceInfo) 构建资源级别
	*/
	FetchChildResource: function (puid, style) {
		try {
			var idPfx = style + "_" + puid,
				idChildresbox = idPfx + "_childresourcebox",
				idPUTitle = idPfx + "_img_title";
			
			var connectId = WebClient.connectId;
			if (!connectId || !NPPILY.Connections.get(connectId)) {
				alert("连接信息不存在，获取资源失败");
				return false;
			}
			var _connStruct = NPPILY.Connections.get(connectId);
			
			if (jQuery("#" + idChildresbox)[0]) {
				if (jQuery("#" + idChildresbox).html() == "") {
					// 是否存在相关子资源信息
					var puInfo, puChildres = [];
					jQuery.each(WebClient.resource.get(connectId), function(index, item) {
						if (item.puid == puid) {
							puInfo = item;
							puChildres = item.childResource || [];
							return false;
						}
					});
					// 为空就去获取子资源信息
					if (!puChildres || puChildres.length <= 0) {
						var operator = NPPILY.ForkResource
						(
							connectId,
							NPPILY.Enum.ForkResourceLevel.nppForkPUResourceInfo,
							null,
							null,
							null,
							{
								PUID: puid
							}
						);
						if (operator.rv == 0) {
							puChildres = operator.response;
						}else{
							alert("获取子设备" + NrcapError.Detail(operator.rv));
						}
					}
					
					var html = [],
						lastnode = "";
					
					if (puInfo && puChildres && puChildres.length > 0) {
						jQuery.each(puChildres, function (index, item) {
							var prefix = "inputvideo", suffix = "";
							
							if (item.type != NPPILY.Enum.PuResourceType.VideoIn) {
								return true;
							}
							
							if (puInfo.online == 0 || puInfo.enable == 0 || item.enable == 0) {
								suffix = "_disabled";
							}
							
							var clsname = prefix + "" + suffix;
							
							var idChildPfx = idPfx + "_" + item.type + "_" + item.idx;
							
							html.push('<div style="white-space:nowrap;">');
								html.push('<input id="'+idChildPfx+'_img_title" type="button" class="outline" onfocus="this.blur();" onclick="WebClient.treeCallBack(\'' + puid + '\',\'' + item.idx + '\',\'' + style + '\',\'' + item.name + '\');" />');
								html.push('<input id="'+idChildPfx+'_img_ico" type="button" class="'+clsname+'" onfocus="this.blur();" onclick="WebClient.treeCallBack(\'' + puid + '\',\'' + item.idx + '\',\'' + style + '\',\'' + item.name + '\');" />');
								html.push('<label onclick="WebClient.treeCallBack(\'' + puid + '\',\'' + item.idx + '\',\'' + style + '\',\'' + item.name + '\');" title="'+item.name+'">'+item.name+'</label>');
							html.push('</div>');
							
							lastnode = idChildPfx + "_img_title";
						});
					}
					else {
						html.push('<div style="font-style:italic;">（无视频资源）</div>');
					}
					
					jQuery("#" + idChildresbox)
						.html(html.join(""))
						.find("#" + lastnode)
						.attr("class", "endline");
						
				} // end if html()
				
				WebClient.Expandsion(jQuery("#" + idChildresbox)[0], jQuery("#" + idPUTitle)[0]);
			} 
		}
		catch (e) {
			alert("excep error -> " + e.name + "::" + e.message);
			return false;
		}
	},
	
	treeCallBack: function(puid, idx, type, name) {
		WebClient.PlayVideo(puid, idx, name);
	},
	
	/*
		创建窗口以及播放：
		connectId(string) 连接ID 
        containerOrId(dom element | dom id) 窗口插件容器或ID
		windowType(NPPILY.Enum.WindowType) 窗口类型
		windowAttachEvent(NPPILY.Struct.WindowEventStruct) 绑定窗口事件
		customParams(object) 自定义参数
		wnd 窗口对象
		puid (string) 设备ID 
		idx (string)  资源索引
		streamType (string)	流类型
	*/
	// - 激活窗口
	ActiveWindow: function(winkey) {
		try {
			
			if(winkey) {
				var key=jQuery("#tab_group").tabs("getSelected")[0].id;
				var obj=WebClient.hash.get(key);
				if(obj!=null)
				{
					obj.each
					(
						function(item) {
							var node = item.value;
							if(item.key == winkey) {
								node.active = true;
								jQuery("#" + item.key+"-title") 
									.css({
										"background":"#B9D0ED"
									});
							}
							else {
								node.active = false;
								
								jQuery("#" + item.key+"-title") 
									.css({
										"background":"#9DBDD8"
									});
							} 
						}	
					); 	
				}
			}
			
		}
		catch(e) {
			if (NPPUtils.Log) {
				NPPUtils.Log("excp error = " + e.message + "::" + e.name);
			}
			return false;
		}
	},
	PlayVideo: function (puid, idx, name) {
		try {
			if (!puid || typeof idx == "undefined") return false;
			
			// 只含有一个窗口信息
			var key=jQuery("#tab_group").tabs("getSelected")[0].id;
			var obj=WebClient.hash.get(key);
			obj.each(function(item){
				var node=item.value;
				if (node.active) {
	 				// 是否存在相同的视频在播放中，可以播放不同的视频流，同一流类型只允许播
					if (node.window && node.window.status.playvideoing) {
						if (node.window.params.puid == puid && node.window.params.idx == idx && node.window.params.streamType == NPPILY.Enum.NrcapStreamType.REALTIME) {
							alert("请注意该视频已经在播放中...");
							return false;
						}
					}
					
					// 播放视频
					var create = true;
					if (node.window&&node.window.status.playvideoing) {
						// 原先有播放的就先停止播放
						WebClient.StopVideo();
					}
					
					if (create&&node.window==null) {
						var winevt = new NPPILY.Struct.WindowEventStruct();
						// 单击事件
						winevt.lbtn_click.status = true;
						winevt.lbtn_click.callback = function () {
							WebClient.ResponseOperation("ActiveWindow",item.key);
						};
						// 视频窗口（退出）全屏回调
						winevt.fsw_show.callback = winevt.fsw_hide.callback = function () {
							WebClient.ResponseOperation("BackFullScreen");
						};
						// 窗口内云台控制允许
						winevt.ptz_control.status = true;
						// 右键菜单
						winevt.menu_command.status = true;
						winevt.menu_command.menu = [{
							key: "stopvideo", text: "停止视频"							
						},{
							key: "fullscreen", text: "全屏"		
						}];
						winevt.menu_command.callback = function (menukey) {
							WebClient.ResponseOperation("ActiveWindow",item.key);
							WebClient.ResponseOperation("menu_command", menukey,item.key);
						};
						
						// - 创建窗口
						var win_operator = NPPILY.CreateWindow
						(
							WebClient.connectId,
							node.container,
							NPPILY.Enum.WindowType.VIDEO,
							winevt
						);
						if (win_operator.rv == 0) {
							node.window = win_operator.response;
						}
						else {
							alert("创建窗口失败 -> " + NrcapError.Detail(win_operator.rv));
						}
					} // end create
					// 播放视频
					var operator = NPPILY.PlayVideo
					(
						WebClient.connectId,
						node.window,
						puid,
						idx,
						NPPILY.Enum.NrcapStreamType.REALTIME // 这里默认播放实时流
					);
					if (operator.rv != 0) {
						alert("播放视频失败 -> " + NrcapError.Detail(operator.rv));
					}
					else {
						// 视频名称
						node.window.customParams.ivName = name;
						// 把视频插件宽高置为100%自适应窗口容器
						NPPILY.ResizeWindowDimension(node.window, "100%", "100%");
					}
				}
			});
		}
		catch (e) {
			alert("excep error = " + e.name + "::" + e.message);
			return false;
		}
	},
	 
	// 响应窗口回调
	ResponseOperation: function (action) {
		try {
			switch (action) {
				case "ActiveWindow":
				    WebClient.ActiveWindow(arguments[1]);
					break;
				case "BackFullScreen":
					// （退出）全屏回调
					WebClient.BackFullScreen();
					break;
				case "menu_command":
					// 右键菜单项回调
					var menuKey = arguments[1];
					switch (menuKey) {
						case "stopvideo": // 停止视频
							WebClient.StopVideo();
							break;
						case "fullscreen": // （退出）全屏
							WebClient.FullScreen();
							break;
					};
					break;
			};
		}
		catch (e) {
			alert("excep error = " + e.name + "::" + e.message);
			return false;
		}
	},
	// 响应（退出）全屏事件
	BackFullScreen: function () {
		try {
			var fn = "WebClient.FullScreen";
			
			var key=jQuery("#tab_group").tabs("getSelected")[0].id;
			var obj=WebClient.hash.get(key);
			obj.each(function(item){
				var node=item.value;
				if (node && node.window) {
					if (node.window.status.playvideoing) {
						if (node.window.status.isfullscreening) {
							NPPILY.ExitFullScreen(node.window); // 退出全屏
						}
						else {
							NPPILY.FullScreen(node.window); // 全屏
						}
					}
				}
			});
		}
		catch (e) {
			alert("excep error = " + e.name + "::" + e.message);
			return false;
		}
	},
	
	// 停止视频
	StopVideo: function () {
		try {
			var key=jQuery("#tab_group").tabs("getSelected")[0].id;
			var obj=WebClient.hash.get(key);
			obj.each(function(item){
				var node=item.value;
				if (node &&node.active && node.window) {
					var puid = node.window.params.puid;
					// 然后停止视频
					NPPILY.StopVideo(node.window);
					jQuery("#"+item.key+"-title").html("");
					// 把视频插件宽高置为0，注意本身及其所有祖先容器不可设置成隐藏（尤其在非IE浏览器中）
					NPPILY.ResizeWindowDimension(node.window, 0, 0);
				}
			});
		}
		catch (e) {
			alert("excep error = " + e.name + "::" + e.message);
			return false;
		}
	},

	// （退出）全屏
	FullScreen: function (windowKey) {
		try {
			var fn = "WebClient.FullScreen";
			
			var key=jQuery("#tab_group").tabs("getSelected")[0].id;
			var obj=WebClient.hash.get(key);
			obj.each(function(item){
				var node=item.value;
				if (node && node.window&&node.active) {
					if (node.window.status.playvideoing) {
						if (node.window.status.isfullscreening) {
							NPPILY.ExitFullScreen(node.window); // 退出全屏
						}
						else {
							NPPILY.FullScreen(node.window); // 全屏
						}
					}
				}
			});
		}
		catch (e) {
			alert("excep error = " + e.name + "::" + e.message);
			return false;
		}
	},

	// 列表控制
	Expandsion: function (obj, title, ico) {
		if (obj) {
			if (obj.style.display == "none") {
				if (obj.innerHTML == "") return;
				obj.style.display = "block";
				if (title) title.className = "minus";
				if (ico) {
					ico.className = "stationmodel_expand";
				}
			}
			else {
				obj.style.display = "none";
				if (title) title.className = "plus";
				if (ico) {
					ico.className = "stationmodel_collapse";
				}
			}
		}
	},
	// 更新显示视频状态信息
	UpdateVideoStatus: function (notify) {
		try {
			if (notify && notify._HANDLE) {
			    var key=jQuery("#tab_group").tabs("getSelected")[0].id;
				var obj=WebClient.hash.get(key);
				if(obj!=null){
					obj.each(function (item) {
						var node = item.value;
						if (node.window && node.window.status.playvideoing) {
							// 根据句柄匹配
							if (node.window.params.ivStreamHandle == notify._HANDLE) {
								if (notify.errorCode == 0) {
									var html = [];
									// 视频名称
									html.push(node.window.customParams.ivName);
									if (typeof notify.statusDesc != "undefined" && notify.statusDesc != "") {
										html.push("&nbsp;");
										html.push(notify.statusDesc);
									}
									html.push(",帧率=" + (notify.keyData.frame_rate || 0));
									html.push(",码率=" + ((notify.keyData.bit_rate || 0)/1000).toFixed(0) + "kb");
									
									if (node.window.status.playaudioing) {
										html.push(",正在播放声音");
									}
									if (node.window.status.recording) {
										html.push(",正在录像");
									}
									// 是否有喊话对讲
									var oaStatus_operator = NPPILY.CallTalkControl.GetStatus(WebClient.connectId, node.window.params.puid, 0);
									if (oaStatus_operator.rv == 0) {
										var oaStatus = oaStatus_operator.response;
										if (oaStatus && oaStatus.oaStreamHandle) {
											html.push(",正在" + (oaStatus.call ? "喊话" : "对讲"));
										}
									}
									jQuery("#"+item.key+"-title")
										.html(html.join(""))
										.attr("title", html.join("").replace(/(\&nbsp;)/gm, ""));

								}
							}
						}
					});
				}
			}
		}
		catch (e) {
			return false;
		}
	},
	// - 卸载插件
	UnLoad:function() {
		NPPILY.UnLoad();
	},
	end:true
}