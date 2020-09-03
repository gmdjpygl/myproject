var WebClient = {
	connectId : null,
	hash : new NPPUtils.Hash(),
	resource : new NPPUtils.Hash(),
	puidList:[],
	puidHtml:"",
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
				var onlines = [];
				jQuery.each(resource, function (index, item) {
					if (item.online == 1 && item.enable == 1) {
						onlines.push(item);
					}
				});
				resource = [];
				resource = resource.concat(onlines);
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
				// 遍历获取子资源资源
				jQuery.each(resource, function (index, item) {
					if (item.online == 1 && item.enable == 1) {
						WebClient.FetchChildResource(item.puid,style);
					}
				});
				jQuery("#list_panel").html(WebClient.puidHtml);
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
			var connectId = WebClient.connectId;
			if (!connectId || !NPPILY.Connections.get(connectId)) {
				alert("连接信息不存在，获取资源失败");
				return false;
			}
			var _connStruct = NPPILY.Connections.get(connectId);
			
			
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
					if(item.type=="IV"){
						/*
						 * 把所有子设备存入全局变量中
						 */
						WebClient.puidList.push({
							puid:puid,
							idx:item.idx,
							name:item.name
						});
						var html="";
						html +="<div style='width:100%;height:25px;'>";
						html +="  设备:"+puid+"索引:"+item.idx+"";
						html +="</div>";
						WebClient.puidHtml+=html;
					}
				});
			}
						
				
		}
		catch (e) {
			alert("excep error -> " + e.name + "::" + e.message);
			return false;
		}
	},
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
	PlayVideo: function (puidList) {
		try {
			// 只含有一个窗口信息
			var key=jQuery("#tab_group").tabs("getSelected")[0].id;
			var obj=WebClient.hash.get(key);
				obj.each(function(item,index){
					(function () {
						var node=item.value;
		 				// 是否存在相同的视频在播放中，可以播放不同的视频流，同一流类型只允许播
						if (node.window && node.window.status.playvideoing) {
							if (node.window.params.puid == puidList[index].puid && node.window.params.idx == puidList[index].idx && node.window.params.streamType == NPPILY.Enum.NrcapStreamType.REALTIME) {
								return false;
							}
						}
						if (node.window&&node.window.status.playvideoing) {
							// 原先有播放的就先停止播放
							NPPILY.StopVideo(node.window);
							jQuery("#"+item.key+"-title").html("");
							// 把视频插件宽高置为0，注意本身及其所有祖先容器不可设置成隐藏（尤其在非IE浏览器中）
							NPPILY.ResizeWindowDimension(node.window, 0, 0);
						}
						// 播放视频
						var operator = NPPILY.PlayVideo
						(
							WebClient.connectId,
							node.window,
							puidList[index].puid,
							puidList[index].idx,
							NPPILY.Enum.NrcapStreamType.REALTIME // 这里默认播放实时流
						);
						if (operator.rv != 0) {
							jQuery("#"+item.key+"-title").html("");
							// 把视频插件宽高置为0，注意本身及其所有祖先容器不可设置成隐藏（尤其在非IE浏览器中）
							NPPILY.ResizeWindowDimension(node.window, 0, 0);
						}
						else {
							// 视频名称
							node.window.customParams.ivName = puidList[index].name;
							// 把视频插件宽高置为100%自适应窗口容器
							NPPILY.ResizeWindowDimension(node.window, "100%", "100%");
						}
					}).delay(2*index); //每一秒播放一个,可以根据需要酌情修改
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
			var key=jQuery("#tab_group").tabs("getSelected")[0].id;
			var obj=WebClient.hash.get(key);
			obj.each(function(item){
				var node=item.value;
				if (node && node.window) {
					var customMenus = [];
					if (node.window.status.isfullscreening) {
						customMenus.push({key: "fullscreen", text: "退出全屏"});
					}
					else {
						customMenus.push({key: "fullscreen", text: "全屏"});
					}
					// 更新菜单项
					NPPILY.WindowAttachEvent.UpdateMenuCommand(node.window, customMenus);
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