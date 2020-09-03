jQuery(document).ready(function(){
	var count=0;
	var index=0;
	var width=0;
	var height=0;
	var arr=[1,4,9,16,25,36];
	width=jQuery(window).width();
	height=jQuery(window).height();
	jQuery("#list_panel").css({
		height:(height-85)+"px"
	});
	jQuery("#tab_group").css({
		width:(width-251)+"px",
		height:(height-30)+"px"
	});
	WebClient.Load();
	var time;
	jQuery("#round_robin").off().on("click",function(){
		var val=jQuery(this)[0].innerHTML;
		if(val=="开始轮循"){
			var number=0;
			time=setInterval(function(){
				jQuery("#tab_group").tabs("select",number);
				if(number==WebClient.hash.size()){
					number=0;
				}else{
					number++;
				}
			},60000);
			jQuery(this).html("停止轮循");
		}else{
			clearInterval(time);
			jQuery(this).html("开始轮循");
		}	
	});
	jQuery("#add_group").off().on("click",function(){
		jQuery("#add_group").attr("disabled","disabled");
		if(WebClient.hash.size()>11){
			return;
		}
		if(index==6){
			index=0;
		}
		count++;
		var w=width-(251+index*2+1);
		var h=height-(61+index*2+1);
		var html="";
		html +="<div id='video"+count+"' style='width:auto;height:auto;'>";
		for(var i=0;i<arr[index];i++){
			html+="<div style='margin:1px;float:left;'>";
			html+="    <div class='video"+count+"child' id='video"+count+"child"+i+"'>";
			html+="    </div>";
			html+="    <div class='video"+count+"child-title' id='video"+count+"child"+i+"-title'>";
			html+="    </div>";
			html+="</div>";
		}
		html +="</div>";
		index++;
		jQuery('#tab_group').tabs({
		    onBeforeClose: function(title,index){
				var target = this;
				var r=confirm('你确定要关闭第'+index+"分组吗?");
				if (r){
					jQuery("#add_group").removeAttr("disabled");
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
					WebClient.hash.remove(key);
					var opts = jQuery(target).tabs('options');
					var bc = opts.onBeforeClose;
					opts.onBeforeClose = function(){};
					jQuery(target).tabs('close',index);
					opts.onBeforeClose = bc;
				}
				return false;
		    },
		    onSelect:function(title,index){
		    	var key=jQuery("#tab_group").tabs("getTab",index)[0].id;
		    	var obj=WebClient.hash.get(key);
		    	if(obj!=null){
			    		obj.each(function(item,index){
			    			(function () {
				    			var node=item.value;
					    		if (node && node.window) {
					    			// - 刷新窗口
					    			var Refresh=NPPILY.RefreshAttachWindow(node.window);
					    			if(Refresh.rv==0){
					    				var puid = node.window.params.puid;
										var idx=node.window.params.idx;
										var name=node.window.customParams.ivName;
										//播放视频
										var operator = NPPILY.PlayVideo
										(
											WebClient.connectId,
											node.window,
											puid,
											idx,
											NPPILY.Enum.NrcapStreamType.REALTIME // 这里默认播放实时流
										);
										if (operator.rv != 0) {
											if(operator.rv==812){
												NPPILY.StopVideo(node.window);
												// 把视频插件宽高置为0，注意本身及其所有祖先容器不可设置成隐藏（尤其在非IE浏览器中）
												NPPILY.ResizeWindowDimension(node.window, "0%", "0%");
												node.window=null;
										        jQuery("#"+item.key+"-title").html(NrcapError.Detail(operator.rv));
											}
										}
										else {
											// 视频名称
											node.window.customParams.ivName = name;
											// 把视频插件宽高置为100%自适应窗口容器
											NPPILY.ResizeWindowDimension(node.window, "100%", "100%");	
										}
					    			}else{
					    				jQuery("#"+item.key+"-title").html(NrcapError.Detail(Refresh.rv));
					    			}
								}
				    		}).delay(index);
				    	});	
		    	}
		    },
		    onUnselect:function(title,index){
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
		//动态添加视频分组
		jQuery('#tab_group').tabs('add',{
			id:"video"+count,
		    title:'视频分组',
		    content:html,
		    closable:true
		});
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
		//把视频窗口存入hash对象
		var obj=new NPPUtils.Hash();
		jQuery("#video"+count+" div").each(function(index,value){
			if(value.id.indexOf("child")>-1&&value.id.indexOf("title")<0){
				obj.set(
					value.id,
					new NPPILY.Struct.WindowContainerStruct(
						value.id,
						NPPILY.Enum.WindowType.VIDEO, // 实时视频
						false, // 只要一个窗口默认是激活的
						null, // 视频窗口对象开始为空
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
			}
		});
		WebClient.hash.set("video"+count,obj);//根据tab窗口id作为键存入hash对象
		WebClient.ActiveWindow("video"+count+"child0");
		setTimeout(function(){
			jQuery("#add_group").removeAttr("disabled");
		},500);
	});
	jQuery(window).resize(function(){
		width=jQuery(window).width();
		height=jQuery(window).height();
		jQuery("#list_panel").css({
			height:(height-85)+"px"
		});
		jQuery("#tab_group").css({
			width:(width-251)+"px",
			height:(height-30)+"px"
		});
		var w=width-(251+index*2+1);
		var h=height-(61+index*2+1);
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
	});
});
jQuery(window).unload(function () {
	WebClient.UnLoad();
});