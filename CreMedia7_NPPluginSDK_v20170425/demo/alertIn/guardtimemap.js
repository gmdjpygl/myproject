// - 布防时间对象
var GuardTimeMap =
{
	version: "v2014.01.03",
	
	author: "@huzw",
	
	_mapType: {
		'min': 0, 
		'wek': 1
	},
	_flag: 0, // -  0(default) | 1
	_$: function (obj) {
		return document.getElementById(obj);
	},
	_minutes: ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
	_weeks: ['周日','周一','周二','周三','周四','周五','周六'],
	_hours: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
	
	inited: false,
	
	errorcontainertip: "布防时间图容器未知！",
	errormaptypetip: "布防时间图类型未知！",
	inversetdtip: "表格反选",
 
	Create: function (objId, mapType, objW, objH) {
		try { 
			if(!objId || !this._$(objId)) { 
				if(this.errorcontainertip) {
					alert(this.errorcontainertip); 
				}
				return false;
			}
			
			if(!mapType || typeof this._mapType[mapType] == "undefined") { 
				if(this.errorcontainertip) {
					alert(this.errormaptypetip); 
				}
				return false;
			}
			var horizontal  = this._hours; // - 水平的
			
			var vertical = ""; // - 竖直的 
			
			if(this._mapType[mapType] == 0)
			{
				vertical = this._minutes; 
				this._flag = 0;
			}
			else {
				vertical = this._weeks; 
				this._flag = 1;
			}
			
			var htmlstr = "", topbar = "", leftbar = "", bodystr = "";
			
			var width = 600, height = 168; 
			
			if(this._flag == 0)
			{
				width = 425; height = 240; 
			}
			else
			{
				if(objW && !isNaN(objW)) width = objW;
				if(objH && !isNaN(objH) && objH >= 170) height = objH;
			}
			
			var tdw = Math.floor((width - 13) / 26) ;
			var tdh = Math.floor((height - vertical.length)  / (vertical.length + 1)); 
			
			// top hours
			topbar += "<div style=\"width:"+width+"px;height:18px; float:left; border-bottom:1px solid #000000; \">";
				topbar += "<div type=\"gtm_corner_select\" title=\""+this.inversetdtip+"\" style=\"cursor:pointer;width:"+(tdw*2)+"px;height:"+tdh+"px;text-align:center; float:left;line-height:20px; vertical-align:middle;\">&lt;&gt;</div>";
				if(horizontal.length > 0)
				{
					for(var i = 0; i < horizontal.length; i++)
					{
						var item = horizontal[i];
						topbar += "<div type=\"gtm_hoz_" + i + "\" style=\" cursor:default; width:"+tdw+"px;height:"+tdh+"px;text-align:center;line-height:20px; vertical-align:middle; float:left; border-left:1px solid #000000;\" >" + item + "</div>";
					} 
				} 
			topbar += "</div>";
			
			// left minutes/weeks
			leftbar += "<div style=\"width:"+(tdw*2)+"px;height:"+(height-tdh)+"px;float:left; border-right:1px solid #000000;\">"; 
				if(vertical.length > 0)
				{
					for(var i = 0; i < vertical.length; i++)
					{
						var item = vertical[i];
						leftbar += "<div type=\"gtm_ver_" + i + "\"  style=\" cursor:default; width:"+(tdw*2)+"px;height:"+tdh+"px;text-align:center; line-height:20px; vertical-align:middle; float:left; border-top:1px solid #000000;\" >" + item + "</div>";
					} 
				} 
			leftbar += "</div>";
			
			  // body tds
			bodystr += "<div style=\" width:"+(width- tdw*2 - 2)+"px;height:"+(height-tdh )+"px;text-align:center; background-color:#ffffff; float:left; border:0px solid #000000;\"><table style=\"width:"+(width-tdw*2 - 2)+"px;height:"+(height-tdh)+"px;border-collapse:separate;\" cellspacing=\"1\" cellpadding=\"0\" border=\"0\" >"; 
			for(var j = 0; j < vertical.length; j++)
			{
				bodystr += "<tr style=\"width:auto;height:18px;line-height:18px;\" >";
				for(var k = 0; k < horizontal.length * (this._flag == 0 ? 1 : 2); k++)
				{ 
					bodystr += "<td style=\"cursor:default; border:1px solid #000000;background-color:#00ff00;\">&nbsp;</td>"; 
				}
				bodystr += "</tr>";
			}
			bodystr += "</table></div>";
			
			htmlstr += "<div id=\""+objId+"-inner\" style=\"float:center;width:"+width+"px;height:"+height+"px;color:#000000;background-color:Transparent;border:1px solid #8EB9E5;\">"; // background-color:#f5f5f5;
			
				htmlstr += topbar;
				htmlstr += leftbar;
				htmlstr += bodystr;
	
			htmlstr += "</div>";
			
			this._$(objId).innerHTML = htmlstr;	
			
			this.Event(objId, mapType); 
		}
		catch (e) {
			return false;
		}
	},
	// - 是否使能
	DisabledMap: function (objId, disabled) { 
		try {
			if(!objId || !this._$(objId)) { 
				if(this.errorcontainertip) {
					alert(this.errorcontainertip); 
				}
				return false;
			}
			this._$(objId).disabled = disabled;
			var eles = this._$(objId).getElementsByTagName("*");
			for(var i = 0; i < eles.length; i++)
			{
				 eles[i].disabled = disabled; 
			}
		}
		catch (e) {
			return false;
		}
	},
	
	Event: function(objId, mapType) {
		try {
			if(!objId || !this._$(objId)) { 
				if(this.errorcontainertip) {
					alert(this.errorcontainertip); 
				}
				return false;
			}
			
			if(!mapType || typeof this._mapType[mapType] == "undefined") { 
				if(this.errorcontainertip) {
					alert(this.errormaptypetip); 
				}
				return false;
			} 
			
			var horizontal  = this._hours; // - 水平的
			
			var vertical = ""; // - 竖直的 
			
			if(this._mapType[mapType] == 0)
			{
				vertical = this._minutes; 
				this._flag = 0;
			}
			else {
				vertical = this._weeks; 
				this._flag = 1;
			}
			
			var _SELF = this;
			
			var maptitledivs = this._$(objId).getElementsByTagName("DIV");
			for(var i = 0; i < maptitledivs.length; i++)
			{
				var maptitlediv = maptitledivs[i]; 
				if(maptitlediv && maptitlediv.getAttribute("type") && maptitlediv.getAttribute("type").search("gtm_") != -1)
				{ 
					maptitlediv.onclick = function(e) {
						var _event = typeof e != "undefined" ? e : event;
						
						if(this.getAttribute("type").search("_hoz_") != -1) {
							_SELF.SetStatus(objId, mapType, "hoz", this.getAttribute("type").replace("gtm_hoz_",""), this, _event);
						}
						else if(this.getAttribute("type").search("_ver_") != -1) {
							_SELF.SetStatus(objId, mapType, "ver", this.getAttribute("type").replace("gtm_ver_",""), this, _event);
						}  
						else if(this.getAttribute("type").search("_corner_select") != -1) {
							_SELF.SetStatus(objId, mapType);	
						}
					}; 
				}				
			}
			
			var maptds = this._$(objId).getElementsByTagName("TD");
			for(var j = 0; j < maptds.length; j++)
			{
				var maptd = maptds[j];
				maptd.onclick = function() {
					_SELF.ColorTD(this);
				};
			}
		}
		catch (e) {
			return false;
		}
	},
	
	// - 获取坐标
	positionedOffset: function (element) {
		var valueT = 0, valueL = 0;
		if (element) {
			do {
			  valueT += element.offsetTop  || 0;
			  valueL += element.offsetLeft || 0;
			  element = element.offsetParent;
			  if (element) {
				if (element.tagName == 'BODY') break;
				var p = element.style.position;
				if (p == 'relative' || p == 'absolute') break;
			  }
			} while (element);
		}
		var position = [valueL, valueT];
		position.left = valueL;
		position.top = valueT;
		return position;
	},
	// - 获取滚动条叠加偏移
	scrollOffset: function (element) {
		var t = 0, l = 0;
		if (element) {
			do {
				l += element.scrollLeft || 0;
				t += element.scrollTop || 0;
				element = element.parentNode;
				if (element) {
					if (element.tagName == 'BODY') break;
					var p = element.style.position;
					if (p == 'relative' || p == 'absolute') break;
				}
			}
			while(element);
		}
		var scrollpos = [l, t];
		scrollpos.left = l;
		scrollpos.top = t;
		return scrollpos;
	},
	
	// - 设置状态
	SetStatus: function(objId, mapType, flag, index, obj, _event) {
		try {
			if(!objId || !this._$(objId)) { 
				if(this.errorcontainertip) {
					alert(this.errorcontainertip); 
				}
				return false;
			}
			
			if(!mapType || typeof this._mapType[mapType] == "undefined") { 
				if(this.errorcontainertip) {
					alert(this.errormaptypetip); 
				}
				return false;
			} 
			
			var horizontal  = this._hours; // - 水平的
			
			var vertical = ""; // - 竖直的 
			
			if(this._mapType[mapType] == 0)
			{
				vertical = this._minutes; 
				this._flag = 0;
			}
			else {
				vertical = this._weeks; 
				this._flag = 1;
			}
			
			var maptds = this._$(objId).getElementsByTagName("TD");
	
			index = parseInt(index);
			
			if(flag == "ver")
			{ 
				for(var i = index * horizontal.length * (this._flag == 0 ? 1 : 2); i < (index + 1) * horizontal.length * (this._flag == 0 ? 1 : 2); i++)
				{ 
					this.ColorTD(maptds[i]);
				}	
			}
			else if(flag == "hoz")
			{ 
				switch(this._flag)
				{
					case 0:
						var tdcolumnIdx = index;
						for(var m = 0; m < vertical.length; m++)
						{
							this.ColorTD(maptds[(m * horizontal.length) + tdcolumnIdx]); 
						}
						break;
					case 1:
						if(arguments[4]) {
							var obj = arguments[4];
							var _event = _event || event;
						}
						else { 
							return false; 
						}
						
						var posOffset = this.positionedOffset(obj);
						var scolOffset = this.scrollOffset(obj);
						
						// alert(Lx); 相对于所在触发事件的x坐标
						var Lx = _event.offsetX || (_event.pageX + scolOffset.left - posOffset.left); 
						var ty = _event.offsetY || (_event.pageY - posOffset.top);  
						
						// alert(Lx + "::" + _event.pageX + "::" + scolOffset.left + "::" + posOffset.left);
						
						var objW = obj.offsetWidth;
						var objH = obj.offsetHeight; 
						
						if(0 <= Lx && Lx <= Math.ceil(objW/2) )
						{ 
							var tdcolumnIdx = index * 2;
						} 
						else if( Math.ceil(objW/2) < Lx && Lx <= objW )
						{ 
							var tdcolumnIdx = index * 2 + 1;
						}
						
						for(var m = 0; m < vertical.length; m++)
						{
							this.ColorTD(maptds[(m * horizontal.length * 2 ) + tdcolumnIdx]); 
						}
						break;
				}
			} 
			else if(flag == "all")
			{
				for(var r = 0; r < maptds.length; r++)
				{
					maptds[r].style.backgroundColor = "#00ff00";
				}
			}
			else if(flag == "clear")
			{
				for(var s = 0; s < maptds.length; s++)
				{
					maptds[s].style.backgroundColor = "#ffffff";
				}
			}
			else
			{
				for(var t = 0; t < maptds.length; t++)
				{
					this.ColorTD(maptds[t]);
				}
			}		
		}
		catch (e) {
			return false;
		}
	},
	
	// - 获取十六进制字符串
	GetHexMapStr: function (objId, mapType, bstr) {	
		try {
			if(!objId || !this._$(objId)) { 
				if(this.errorcontainertip) {
					alert(this.errorcontainertip); 
				}
				return false;
			}
			if(!mapType || typeof this._mapType[mapType] == "undefined") { 
				if(this.errorcontainertip) {
					alert(this.errormaptypetip); 
				}
				return false;
			} 
			
			var horizontal  = this._hours; // - 水平的
			
			var vertical = ""; // - 竖直的 
			
			if(this._mapType[mapType] == 0)
			{
				vertical = this._minutes; 
				this._flag = 0;
			}
			else {
				vertical = this._weeks; 
				this._flag = 1;
			}
			
			var hex = "";
		
			if(!bstr || typeof bstr == "undefined")
			{ 
				bstr = "";
				bstr = this.GetBinaryMapStr(objId, mapType);
				if(bstr.length != vertical.length * horizontal.length * (this._flag == 0 ? 1 : 2))
				{
					return false;
				}
			}
			 
			if(bstr.length % 4 != 0) 
			{
				for(var r = 0; r < bstr.length % 4; r++)
				{
					bstr += "0";
				}
			}
			
			for(var i = 0; i < bstr.length; i+=4)
			{
				var splitstr = bstr.substr(i, 4);
				hex += this.SwitchHexBinary(16, splitstr);
			}
			// alert(hex);
			 
			return hex;
		}
		catch (e) {
			return false;
		}
	},
	// - 获取二进制格式字符串
	GetBinaryMapStr: function (objId, mapType, hstr) {
		try {
			if(!objId || !this._$(objId)) { 
				if(this.errorcontainertip) {
					alert(this.errorcontainertip); 
				}
				return false;
			}
			if(!mapType || typeof this._mapType[mapType] == "undefined") { 
				if(this.errorcontainertip) {
					alert(this.errormaptypetip); 
				}
				return false;
			} 
			
			var horizontal  = this._hours; // - 水平的
			
			var vertical = ""; // - 竖直的 
			
			if(this._mapType[mapType] == 0)
			{
				vertical = this._minutes; 
				this._flag = 0;
			}
			else {
				vertical = this._weeks; 
				this._flag = 1;
			}
			
			var bina = ""; 
	
			if(!hstr || typeof hstr == "undefined")
			{ 
				hstr = ""; 
				var maptds = this._$(objId).getElementsByTagName("TD");
				
				switch(this._flag)
				{
					case 0: 
						var vertstr = "";
						var per = horizontal.length;
						
						for(var m = 0; m < per; m++)
						{ 
							for(var n = 0; n < vertical.length; n++)
							{
								vertstr += maptds[m + n * per].style.backgroundColor != "#00ff00" && maptds[m + n * per].style.backgroundColor.replace(/\s+/g, "") != "rgb(0,255,0)" ? "0" : "1"; 
							}
						}
						// alert(vertstr); 
						bina += vertstr;
						break;
					case 1:
						for(var i = 0; i < maptds.length; i++)
						{ 
							var maptd = maptds[i];
							bina += maptd.style.backgroundColor != "#00ff00" && maptd.style.backgroundColor.replace(/\s+/g, "") != "rgb(0,255,0)" ? "0" : "1";
						} 
						break;
				}   
			}
			else
			{  
				for(var i = 0; i < hstr.length; i++)
				{
					var splitstr = hstr.charAt(i).toUpperCase();
					bina += WebClient.GuardTimeMap.SwitchHexBinary(2, splitstr);
				}
			} 
		 
			if(bina.length != vertical.length * horizontal.length * (this._flag == 0 ? 1 : 2))
			{
				return false;
			}
			
			// alert(bina);
					
			return bina;
		}
		catch (e) {
			return false;	
		}
	},
	
	ColorMapByHexBinaryStr: function(objId, mapType, type, v) {
		try {
			if(!objId || !this._$(objId)) { 
				if(this.errorcontainertip) {
					alert(this.errorcontainertip); 
				}
				return false;
			}
			if(!mapType || typeof this._mapType[mapType] == "undefined") { 
				if(this.errorcontainertip) {
					alert(this.errormaptypetip); 
				}
				return false;
			} 
			
			var horizontal  = this._hours; // - 水平的
			
			var vertical = ""; // - 竖直的 
			
			if(this._mapType[mapType] == 0)
			{
				vertical = this._minutes; 
				this._flag = 0;
			}
			else {
				vertical = this._weeks; 
				this._flag = 1;
			}  
			
			if(!v || typeof v == "undefined") return false;
	
			var bstr = v;
	 
			if(type == 16)
			{
				bstr = this.GetBinaryMapStr(objId, mapType, v);	
			}
		   
			var maptds = this._$(objId).getElementsByTagName("TD");
	
			if(bstr.length != maptds.length) return false;
			
			switch(this._flag)
			{
				case 0: 
					var vertstr = "";
					var per = horizontal.length; 
					
					for(var i = 0; i < bstr.length && i < maptds.length; i++)
					{
						var splitstr = bstr.charAt(i);
						maptds[Math.floor(i/12) + Math.floor(i % 12) * per].style.backgroundColor = splitstr == "1" ? "#00ff00" : "#ffffff";  
					} 
					// alert(vertstr);  
					break;
				case 1:
					for(var i = 0; i < bstr.length && i < maptds.length; i++)
					{
						var splitstr = bstr.charAt(i);
						maptds[i].style.backgroundColor = splitstr == "1" ? "#00ff00" : "#ffffff";
					} 
					break;
			}  
		}
		catch (e) {
			return false;	
		}
	},
	
	// - 区块着色
	ColorTD: function(obj) { 
		if(obj) {
			obj.style.backgroundColor = obj.style.backgroundColor != "#00ff00" && obj.style.backgroundColor.replace(/\s+/g, "") != "rgb(0,255,0)" ? "#00FF00" : "#FFFFFF";
		} 
	},
	
	// - 十六&二进制转字符
	SwitchHexBinary: function (type, v) {
		if(type == 16)
		{
			switch(v.toString()){
				case "0000":return "0";break;
				case "0001":return "1";break;
				case "0010":return "2";break;
				case "0011":return "3";break;
				case "0100":return "4";break;
				case "0101":return "5";break;
				case "0110":return "6";break;
				case "0111":return "7";break;
				case "1000":return "8";break;
				case "1001":return "9";break;
				case "1010":return "A";break;
				case "1011":return "B";break;
				case "1100":return "C";break;
				case "1101":return "D";break;
				case "1110":return "E";break;
				case "1111":return "F";break;
				default:return "0";break;
			}
		}
		else
		{
			switch(v) {
				case "0":return "0000";break;
				case "1":return "0001";break;
				case "2":return "0010";break;
				case "3":return "0011";break;
				case "4":return "0100";break;
				case "5":return "0101";break;
				case "6":return "0110";break;
				case "7":return "0111";break;
				case "8":return "1000";break;
				case "9":return "1001";break;
				case "A":return "1010";break;
				case "B":return "1011";break;
				case "C":return "1100";break;
				case "D":return "1101";break;
				case "E":return "1110";break;
				case "F":return "1111";break;
				default:return "0000";break;
			}
		}	
	}, 
	
	end: true
};