jQuery(document).ready(function(){
	WebClient.Load();  //一开始获取所有在线设备
	var count=0;    //记录创建的tab数量
	var interval=0;  //画面轮训时间
	var frame_number=0;   //初始化时创建视频窗口数量
	var index_puid=0;  //全局索引，记录播放设备索引
	/*
	 * css样式
	 */
	var width=jQuery(window).width();
	var height=jQuery(window).height();
	jQuery("#list_panel").css({
		height:"300px"
	});
	jQuery("#control_panel").css({
		height:(height-330)+"px"
	});
	jQuery("#tab_group").css({
		width:(width-251)+"px",
		height:(height-30)+"px"
	});
	var time; //记录时间轮循
	jQuery("#start").bind("click",function(){
		if(jQuery("#start").linkbutton('options').disabled == false){
			var num=jQuery("#frame_number").combobox("getValue"); //当前视频窗口数量
			if(num<WebClient.puidList.length){ //如果窗口数量小于设备总量，则进行轮序。否则不会轮循
				var callfunc = function () {
					var store=new Array(); 
					for(var i=0;i<num;i++){  //取出和视频窗口等量的设备
						var obj=WebClient.puidList[index_puid+i];
						if(obj!=undefined){
							store.push(WebClient.puidList[index_puid+i])
						}else{
							index_puid=0;
							return;
						}
					}
					
					WebClient.PlayVideo(store); //进行顺序播放
					index_puid+=parseInt(num); //记录播放索引
				}
				
				time=setInterval(function () { //进行轮序播放
					callfunc();
				}, interval*1000*60);
				
				callfunc(); //初次开始轮循调用
			}else{
				WebClient.PlayVideo(WebClient.puidList);
			}
			
		}else{
			return;
		}
	});
	jQuery("#stop").bind("click",function(){
		if(jQuery("#stop").linkbutton('options').disabled == false){
			clearInterval(time); //清除轮循
		}else{
			return;
		}
	});
	jQuery("#create").bind("click",function(){
		if(jQuery("#create").linkbutton('options').disabled == false){
			/*
			 * 按键逻辑控制
			 */
			jQuery('#frame_number').combobox("enable");
			jQuery('#create').linkbutton('disable');
			jQuery('#save').linkbutton('enable');
			jQuery('#start').linkbutton('disable');
			jQuery('#stop').linkbutton('disable');
			CreateWindow(frame_number); //初始化视频窗口数量
		}else{
			return;
		}
	});
	jQuery("#save").bind("click",function(){
		if(jQuery("#save").linkbutton('options').disabled == false){
			/*
			 * 按键逻辑控制
			 */
			jQuery('#frame_number').combobox("disable");
			jQuery('#create').linkbutton('enable');
			jQuery('#start').linkbutton('enable');
		    jQuery('#stop').linkbutton('enable');
		    jQuery('#save').linkbutton('disable');
			SaveWindow(); //保存视频窗口
		}else{
			return;
		}
	});
	/*
	 * 创建视频窗口方法
	 */
	var CreateWindow=function(index){
		count++;
		var html="";
		html +="<div id='video"+count+"' attributes='"+index+"' style='width:auto;height:auto;'>";
		for(var i=0;i<index;i++){
			html+="<div style='margin:1px;float:left;'>";
			html+="    <div class='video"+count+"child' id='video"+count+"child"+i+"'>";
			html+="    </div>";
			html+="    <div class='video"+count+"child-title' id='video"+count+"child"+i+"-title'>";
			html+="    </div>";
			html+="</div>";
		}
		html +="</div>";
		//动态添加视频分组
		jQuery('#tab_group').tabs('add',{
			id:"video"+count,
		    title:'视频分组',
		    content:html,
		    closable:true
		});
		var index=Math.sqrt(index,2);
		var w=width-(251+index*2+1);
		var h=height-(61+index*2+1);
		//设置样式
		jQuery(".video"+count+"child").css({
			"width":w/index+"px",
			"height":(h/index-20)+"px",
			"background":"black",
			"overflow":"hidden"
		});
		jQuery(".video"+count+"child-title").css({
			"width":w/index+"px",
			"height":"20px",
			"background":"#9DBDD8",
			"overflow":"hidden"
		});
	};
	/*
	 * 根据需要切换视频窗口数量
	 */
	var SelectWindow=function(index){
		var html="";
		html +="<div id='video"+count+"' attributes='"+index+"' style='width:auto;height:auto;'>";
		for(var i=0;i<index;i++){
			html+="<div style='margin:1px;float:left;'>";
			html+="    <div class='video"+count+"child' id='video"+count+"child"+i+"'>";
			html+="    </div>";
			html+="    <div class='video"+count+"child-title' id='video"+count+"child"+i+"-title'>";
			html+="    </div>";
			html+="</div>";
		}
		html +="</div>";
		var tab = jQuery('#tab_group').tabs('getSelected');  // get selected panel
		jQuery('#tab_group').tabs('update', {
			tab: tab,
			options: {
				content:html
			}
		});
		var index=Math.sqrt(index,2);
		var w=width-(251+index*2+1);
		var h=height-(61+index*2+1);
		//设置样式
		jQuery(".video"+count+"child").css({
			"width":w/index+"px",
			"height":(h/index-20)+"px",
			"background":"black",
			"overflow":"hidden"
		});
		jQuery(".video"+count+"child-title").css({
			"width":w/index+"px",
			"height":"20px",
			"background":"#9DBDD8",
			"overflow":"hidden"
		});
	};
	/*
	 * 保存窗口并初始化视频窗口
	 */
	var SaveWindow=function(){
		//把视频窗口存入hash对象
		var obj=new NPPUtils.Hash(); 
		/*
		 * 取出当前tab的id作为键,当前视频窗口存入新的hash对象作为值。存储全局变量WebClient.hash中。
		 */
		jQuery("#video"+count+" div").each(function(index,value){
			if(value.id.indexOf("child")>-1&&value.id.indexOf("title")<0){
				var winevt = new NPPILY.Struct.WindowEventStruct();
				// 单击事件
				winevt.lbtn_click.status = true;
				winevt.lbtn_click.callback = function () {
					WebClient.ResponseOperation("ActiveWindow",value.id);
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
					WebClient.ResponseOperation("ActiveWindow",value.id);
					WebClient.ResponseOperation("menu_command", menukey,value.id);
				};
				
				// - 创建窗口
				var win_operator = NPPILY.CreateWindow
				(
					WebClient.connectId,
					value.id,
					NPPILY.Enum.WindowType.VIDEO,
					winevt
				);
				if (win_operator.rv == 0) {
					obj.set(
						value.id,
						new NPPILY.Struct.WindowContainerStruct(
							value.id,
							NPPILY.Enum.WindowType.VIDEO, // 实时视频
							false, // 只要一个窗口默认是激活的
							win_operator.response, // 视频窗口对象开始为空
							null
						)
					);
					// - 绑定点击事件
					jQuery(value).click
					(
						function(event) 
						{
							WebClient.ActiveWindow(this.id); 
						}
					);
					NPPILY.ResizeWindowDimension(win_operator.response, "0%", "0%");
				}
				else {
					alert("创建窗口失败 -> " + NrcapError.Detail(win_operator.rv));
				}	
			}
		});
		WebClient.hash.set("video"+count,obj);//根据tab窗口id作为键存入hash对象
	};
	jQuery('#tab_group').tabs({
	    onBeforeClose: function(title,index){
			var target = this;
			var r=confirm('你确定要关闭第'+index+"分组吗?");
			if (r){
				var key=jQuery("#tab_group").tabs("getTab",index)[0].id;
				var obj=WebClient.hash.get(key);
		    	if(obj!=null){
		    		obj.each(function(item){
		    			var node=item.value;
			    		if (node && node.window) {
							// 然后停止视频
							var operator=NPPILY.StopVideo(node.window);
							// 把视频插件宽高置为0，注意本身及其所有祖先容器不可设置成隐藏（尤其在非IE浏览器中）
							NPPILY.ResizeWindowDimension(node.window, "0%", "0%");
						}
			    	});
		    	}
		    	clearInterval(time);
				WebClient.hash.remove(key);
				var opts = jQuery(target).tabs('options');
				var bc = opts.onBeforeClose;
				opts.onBeforeClose = function(){};
				jQuery(target).tabs('close',index);
				opts.onBeforeClose = bc;
			}
			return false;
	    },
	    onUnselect:function(title,index){
	    	clearInterval(time);
	    	var key=jQuery("#tab_group").tabs("getTab",index)[0].id;//获取当前tab页Id
	    	var obj=WebClient.hash.get(key);//根据id获取窗口对象
	    	if(obj!=null){
	    		(function () {
		    		obj.each(function(item){
		    			var node=item.value;
			    		if (node && node.window) {
			    			var puid = node.window.params.puid;
			    			var idx=node.window.params.idx;
							// 然后停止视频
							var operator=NPPILY.StopVideo(node.window);
							node.window.params.puid=puid;
							node.window.params.idx=idx;
							// 把视频插件宽高置为0，注意本身及其所有祖先容器不可设置成隐藏（尤其在非IE浏览器中）
							NPPILY.ResizeWindowDimension(node.window, "0%", "0%");
							jQuery("#"+item.key+"-title").html("");
						}
			    	});
		    	}).delay(0.01);
	    	}
	    }
	});
	/*
	 * 控制当前视频窗口数量
	 */
	jQuery('#frame_number').combobox({
		disabled:true,
		editable:false,
		onSelect:function(record){
			var number=record.value;
			frame_number=number;
			var tab = jQuery('#tab_group').tabs('getSelected');
			if(tab==null){
				return;
			}else{
				SelectWindow(number);
			}
		}
	});
	/*
	 * 控制轮循的间隔时间
	 */
	jQuery('#time_interval').combobox({
		editable:false,
		onSelect:function(record){
			var numbuer=record.value;
			interval=numbuer;
		}
	});
});
jQuery(window).unload(function () {
	WebClient.UnLoad();
});