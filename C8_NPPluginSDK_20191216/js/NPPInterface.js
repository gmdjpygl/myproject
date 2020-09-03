/**
* --------------------------------------------------------------------------------------------------------
* Including Objects:) NPPIF & NPPUtils & NrcapError & MD5 & XML.ObjTree
* 	1. NPPIF >> NP插件底层封装对象
* 	2. NPPUtils >> NP初始化相关属性或方法
*	3. NrcapError >> 错误码对象
*	4. MD5 >> 字符MD5加密对象
*	5. XML.ObjTree >> XML<->JSON对象互转类
* --------------------------------------------------------------------------------------------------------
**/
/*
--- 
fn: NPPIF
desc: NP插件底层封装对象
project:
    - for NPPluginSDK
time: 2013.09.04 10:20:00
version: v2019.11.22.001
author:
    - zenghx
    - huzw
remark: 
    - for NPPInterface.js 
...
*/
var NPPIF = 
{
	agt : navigator.userAgent.toLowerCase(), 
	
    // - 初始化NC
    Initialize : function (nc) 
    {
        try 
        {
            if (nc && typeof nc.Initialize != "undefined") 
            {
                var operator = nc.Initialize();
                operator = eval("(" + operator + ")");
                if (operator.rv == 0 || operator.rv == 1) 
                {
                    return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS, operator.response);
                }
                else 
                {
                    return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_UNINITIALIZED);
                }
            }
            else 
            {
                return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_NC);
            }
        }
        catch (e) {
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
        }
    },
    // - 终止NC
    Terminate : function (nc) 
    {
        try 
        {
            if (nc && typeof nc.Terminate != "undefined") 
            {
                nc.Terminate();
                return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);
            }
            else 
            {
                return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_NC);
            }
        }
        catch (e) {
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
        }
    },
    // - 建立连接
    Connect : function (nc, connParam) 
    {
        try 
        {
            if (nc && typeof nc.Initialize != "undefined") 
            {
                if (!connParam || !connParam instanceof NPPIF.Struct.ConnParamStruct) {
                    var connParam = new NPPIF.Struct.ConnParamStruct();
                }
                var _bfix = connParam.bFixCUIAddress = !!(connParam.bFixCUIAddress == true) ? 1 : 0;
                var operator;
                if (_bfix == 0) 
                {
                    operator = nc.Open( connParam.path, connParam.username, connParam.password, connParam.epId );
                }
                else  
                {
                    operator = nc.OpenByGateway( connParam.path, connParam.username, connParam.password, connParam.epId );
                }
                operator = eval("(" + operator + ")") || {};
                return new NPPIF.Struct.ReturnValueStruct(Number(operator.rv), operator.response);
            }
            else 
            {
                return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_NC);
            }
        }
        catch (e) {
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
        }
    },
    // - 断开一个连接
    DisConnection : function (nc, session) 
    {
        try 
        {
            if (nc && typeof nc.Initialize != "undefined") 
            {
                if (session != "" && session != null && typeof session != "undefined") 
                {
                    nc.Close(session);
                    return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);
                }
                return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
            }
            else 
            {
                return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_NC);
            }
        }
        catch (e) {
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
        }
    },
    // - 公共方法
    Common : 
    {
		
		/*
        ---
        fn: CheckObjectInterface 
        desc: 判断接口是否未知
        author:  
            - huzw 
        time: 2014.05.29
        params:
			- objectType(NPPIF.Enum.ObjectType) 属于插件类型
            - object(object) 插件实例对象
            - _method(object methods) object方法名称
        ... 
        */
		CheckObjectInterface : function (objectType, object, _method)
		{
			try
			{
				var objectType = objectType || NPPIF.Enum.ObjectType.NC;
				if (!object)
				{
					switch (objectType)
					{
						case NPPIF.Enum.ObjectType.NC :
							return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_NC);
							break;
						case NPPIF.Enum.ObjectType.PW :
							return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_WND);
							break;
						case NPPIF.Enum.ObjectType.WA :
							return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_WA);
							break;
					}
					return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
				}
				if (typeof object[_method] == "undefined")
				{
					return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_INTERFACE_UNDEFINED || NrcapError.NRCAP_ERROR);	
				}
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);
			}
			catch (e) {
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
			}
		},
		
		__Response : function(_objType, _method, _obj)
		{
			try
			{
				var _minArgsCount = 3;
				switch(_objType)
				{
					case NPPIF.Enum.ObjectType.NC :
						_minArgsCount = 3;
						break;
					case NPPIF.Enum.ObjectType.PW :
						_minArgsCount = 2;
						break;
					case NPPIF.Enum.ObjectType.WA :
						_minArgsCount = 2;
						break;
				}
				  
				var _args = arguments,
					_argslen = _args.length;
					
				if (!_method || _argslen < (_minArgsCount + 1)) 
				{
                    return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
                }
				else {
					var _argsArr = new Array();
                    for (var i = 3; i < _argslen; i++) 
					{
                        _argsArr.push(_args[i]);
                    }
					
					var chk_operator = NPPIF.Common.CheckObjectInterface(_objType, _obj, _method);
					if (chk_operator.rv != NrcapError.NRCAP_SUCCESS)
					{
						return chk_operator;	
					}
					
					// executing...
					var operator = _obj[_method].apply(_obj[_method], _argsArr);
					//alert("NPPIF.Common._Response _method -> " + _method + ", operator -> " + operator);
					
					if (!operator || typeof operator == "undefined")
					{
						return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);	
					}
					
					switch(_objType)
					{
						case NPPIF.Enum.ObjectType.NC :
							operator = eval("(" + operator + ")") || {};
					
							if (operator.rv == NrcapError.NRCAP_SUCCESS) 
							{
								if (typeof operator.response == "string")
								{
									operator.response = NPPUtils.UTF8toUnicode(operator.response);	
								}
								return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS, operator.response);
							}
							else 
							{
								return new NPPIF.Struct.ReturnValueStruct(Number(operator.rv) || NrcapError.NRCAP_FAILED);
							} 
							break;
							
						case NPPIF.Enum.ObjectType.PW :
							return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS, operator);
							break;
						case NPPIF.Enum.ObjectType.WA :
							return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS, operator);
							break;
					}
				}
			}
			catch(e) {
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD); 	
			}
		},
        /*
        ---
        fn: GetNCResponse 
        desc: 获取NC响应
        author:  
            - huzw 
        time: 2013.09.04
		modifytime: 2013.09.25
        params: 
            - _method(nc methods) nc方法名称
            - nc(object) nc插件实例对象
            - handle(HANDLE) 句柄对象，可以为hSession或hRes等
        ... 
        */
        GetNCResponse : function(_method, nc, handle)
		{
			var _argsArr = [NPPIF.Enum.ObjectType.NC];
			for (var i = 0; i < arguments.length; i++) 
			{
				_argsArr.push(arguments[i]);
			}
			return NPPIF.Common.__Response.apply(this, _argsArr);
		},
		/*
        ---
        fn: GetPWResponse 
        desc: 获取PW响应
        author:  
            - huzw 
        time: 2013.09.25
		modifytime: 2013.09.25
        params: 
            - _method(pw methods) pw方法名称
            - pw(object) pw插件实例对象
        ... 
        */
        GetPWResponse : function(_method, pw)
		{
			var _argsArr = [NPPIF.Enum.ObjectType.PW];
			for (var i = 0; i < arguments.length; i++) 
			{
				_argsArr.push(arguments[i]);
			}
			return NPPIF.Common.__Response.apply(this, _argsArr);
		},
		/*
        ---
        fn: GetWAResponse 
        desc: 获取WA响应
        author:  
            - huzw 
        time: 2013.12.13
        params: 
            - _method(wa methods) wa方法名称
            - wa(object) wa插件实例对象
        ... 
        */
        GetWAResponse : function(_method, wa)
		{
			var _argsArr = [NPPIF.Enum.ObjectType.WA];
			for (var i = 0; i < arguments.length; i++) 
			{
				_argsArr.push(arguments[i]);
			}
			return NPPIF.Common.__Response.apply(this, _argsArr);
		},
		
        // - 设置
        SetNewValue : function () { }, end : true 
    },
	
    /**
    * --------------------------------------------------------------------------------------------------------
    *    remark: 获取平台相关信息
    * ........................................................................................................ 
    **/
    // - 获取连接ID
    GetCUSessionID : function (nc, session) 
    {
        return NPPIF.Common.GetNCResponse("GetSessionID", nc, session);
    },
    // - 获取平台系统名称
    GetSystemName : function (nc, session) 
    {
        return NPPIF.Common.GetNCResponse("GetSystemName", nc, session);
    },
    // - 获取平台描述
    GetSystemDes : function (nc, session) 
    {
        return NPPIF.Common.GetNCResponse("GetSystemDescription", nc, session);
    },
    // - 获取登录平台类型
    GetPlatformType : function (nc, session) 
    {
        return NPPIF.Common.GetNCResponse("GetPlatformType", nc, session);
    },
    // - 获取用户优先级
    GetUserPriority : function (nc, session) 
    {
        return NPPIF.Common.GetNCResponse("GetPriority", nc, session);
    },
    // - 获取平台的所有子域
    GetSubDomain : function (nc, session) 
    {
        return NPPIF.Common.GetNCResponse("GetSubDomain", nc, session);
    },
    // - 接收通知
    ReceiveNotify : function (nc, session) 
    {
        return NPPIF.Common.GetNCResponse("ReceiveNotify", nc, session);
    },
    /*
    --- 
    desc: 构建单一设备
    returns:
        - succ <response: puHandle>
    ... 
    */
    ForkOnePU : function (nc, session, puid) 
    {
        return NPPIF.Common.GetNCResponse("ForkOnePU", nc, session, puid);
    },
    /*
    --- 
    desc: 构建平台（子域）下的设备列表
    returns:
        - succ <response: Array(puHandle)>
    params:
        - subDomainName(string) 查询子域名（查询平台设备时为空字符串""）
    ... 
    */
    ForkPUList : function (nc, session, subDomainName, offset, count) 
    {
		var subDomainName = subDomainName || "";
        if (!subDomainName) {
            return NPPIF.Common.GetNCResponse("ForkPUList", nc, session, offset, count);
        }
        else {
            return NPPIF.Common.GetNCResponse("ForkSubDomainPUList", nc, session, subDomainName, offset, count);
        }
    },
	/*
	---
	desc: 复杂模式下构建平台（子域）下的设备列表
	returns:
		- succ <response: Array(object like {
			"PUID": "155740201384498699",
			"Type": "SELF",
			"Index": "SELF",
			"Name": "StorageUnit",
			"Description": "",
			"Enable": "1",
			"Online": "0",
			"Immitted": "1",
			"Model": "SU",
			"ModelType": "CSU",
			"ProducerID": "00001",
			"HardwareVersion": "",
			"SoftwareVersion": "7.1.14.401",
			"DeviceID": "0FB416EAFC0B",
			"Longitude": "0",
			"Latitude": "0",
			"Handle": "08051060",
			"ChildRes": "" 
		})>
	params:
        - subDomainName(string) 查询子域名（查询平台设备时为空字符串""）
	...
	*/
	ForkPUListEx : function (nc, session, subDomainName, offset, count)
	{
		var subDomainName = subDomainName || "";
		if (!subDomainName) {
            return NPPIF.Common.GetNCResponse("ForkPUListEx", nc, session, offset, count);
        }
        else {
            return NPPIF.Common.GetNCResponse("ForkSubDomainPUListEx", nc, session, subDomainName, offset, count);
        }
	},
    /**
    * --------------------------------------------------------------------------------------------------------
    *    remark: 设备或子模块操作
    * ........................................................................................................ 
    **/
    /*
    --- 
    desc: 构建设备下的资源
    returns:
        - succ <response: Array(resHandle)>
    ... 
    */
    ForkPUResource : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ForkPUResource", nc, puHandle);
    },
    /*
    --- 
    desc: 复杂模式下构建设备的子资源
	returns:
		- succ <response: Array(object like {
			"Type": "",
			"Idx": "",
			"Name": "",
			"Description": "",
			"Enable": "",
			"Handle": ""
		})>
    ... 
    */
    ForkPUResourceEx : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ForkPUResourceEx", nc, puHandle);
    },
    // - 通过资源句柄获得设备句柄
    GetPUHandleFromResHandle : function (nc, resHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetPUHandle", nc, GetPUHandle);
    },
    // - 通过设备句柄获得资源句柄
    GetResourceHandleFromPUHandle : function (nc, puHandle, resType, resIndex) 
    {
        return NPPIF.Common.GetNCResponse("GetResourceHandle", nc, puHandle, resType, resIndex);
    },
    // - 获取PUID
    GetPUID : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetResourcePUID", nc, puHandle);
    },
    // - 获取设备类型
    GetPUType : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetPUModelType", nc, puHandle);
    },
    // - 获取资源是否可用（在线）
    GetResourceUsable : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetResourceUsable", nc, puHandle);
    },
    // - 获取设备安装经度
    GetPULongitude : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetPULongitude", nc, puHandle);
    },
    // - 获取设备安装纬度
    GetPULatitude : function (nc, puHandle) 
    { 
        return NPPIF.Common.GetNCResponse("GetPULatitude", nc, puHandle);
    },
    // - 获取设备型号
    GetPUModel : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetModel", nc, puHandle);
    },
    // - 获取设备软件版本
    GetPUSoftwareVersion : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetSoftwareVersion", nc, puHandle);
    },
    // - 获取硬件型号
    GetPUHardwareModel : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetHardwareModel", nc, puHandle);
    },
    // - 获取硬件版本
    GetPUHardwareVersion : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetHardwareVersion", nc, puHandle);
    },
    // - 获取厂商ID
    GetPUProducerID : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetProducerID", nc, puHandle);
    },
    // - 获取设备ID
    GetPUDeviceID : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetDeviceID", nc, puHandle);
    }, 
    // - 获取资源PUID
    GetResourcePUID : function (nc, puresHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetResourcePUID", nc, puresHandle);
    }, 
    // - 获取资源类型
    GetResourceType : function (nc, puresHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetResourceType", nc, puresHandle);
    }, 
    // - 获取资源索引
    GetResourceIndex : function (nc, puresHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetResourceIndex", nc, puresHandle);
    },
    /* 获取/设置资源名称 */
    // - 获取资源名称 
    GetResourceName : function (nc, puresHandle) 
    {
        var operator = NPPIF.Common.GetNCResponse("GetResourceName", nc, puresHandle);
		return operator;
    },
    // - 设置资源名称 
    SetResourceName : function (nc, puresHandle, resName)
	{
		return NPPIF.Common.GetNCResponse("SetResourceName", nc, puresHandle, resName);
	}, 
	/* 获取/设置资源描述 */
    // - 获取资源描述
    GetResourceDesc : function (nc, puresHandle) 
    {
		var operator = NPPIF.Common.GetNCResponse("GetResourceDescription", nc, puresHandle);
		return operator;
    },
    // - 设置资源描述
    SetResourceDesc : function (nc, puresHandle, descName)
	{
		return NPPIF.Common.GetNCResponse("SetResourceDescription", nc, puresHandle, descName);
	}, 
	/* 获取/设置资源是否使能 */
    // - 获取资源是否使能
    GetResourceEnable : function (nc, puresHandle) 
    {
        return NPPIF.Common.GetNCResponse("GetResourceEnable", nc, puresHandle);
    },
    // - 设置资源是否使能
    SetResourceEnable : function (nc, puresHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("SetResourceEnable", nc, puresHandle, bValue);
	}, 
	/* 设备时区 */
    // - 获取时区
    GetTimeZone : function (nc, puHandle) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetTZ", nc, puHandle);
    },
    // - 设置时区
    SetTimeZone : function (nc, puHandle, timeZone) 
    {
        return NPPIF.Common.GetNCResponse("ST_GetTZ", nc, puHandle, timeZone);
    },
	
    /**
    * --------------------------------------------------------------------------------------------------------
    *    remark: 视频播放与控制相关
    * ........................................................................................................ 
    **/
    /*
    --- 
    desc: 启动视/音频流
    returns:
        - succ <response: streamHandle>
    params:
        - nc(object) NC插件实例
        - resHandle(HANDLE) 资源句柄
        - streamType(NPPIF.Enum.NrcapStreamType) 流类型
        - wndHandle(HANDLE) WND插件实例窗口句柄
    ... 
    */
    StartStreamPlay : function (nc, resHandle, streamType, wndHandle) 
    {
        return NPPIF.Common.GetNCResponse("StartStreamPlay", nc, resHandle, streamType, wndHandle);
    },
    /*
    --- 
    desc: 启动视/音频平台转码流
    returns:
        - succ <response: streamHandle>
    params:
        - nc(object) NC插件实例
        - resHandle(HANDLE) 资源句柄 
        - alg(string) 编码算法 
        - resolution(string) 分辨率 
        - bitRate(uint) 码率 
        - frameRate(uint) 帧率 
        - wndHandle(HANDLE) WND插件实例窗口句柄
    ... 
    */
    StartTranscodeStreamPlay : function (nc, resHandle, alg, resolution, bitRate, frameRate, wndHandle) 
    {
        return NPPIF.Common.GetNCResponse("StartTranscodeStreamPlay", nc, resHandle, alg, resolution, bitRate, 
        frameRate, wndHandle);
    },
	// - 开启喊话
	StartCallPlay : function (nc, oaResHandle) 
    {
        return NPPIF.Common.GetNCResponse("StartCallPlay", nc, oaResHandle);
    },
	// - 开启对讲
	StartTalkPlay : function (nc, oaResHandle) 
    {
        return NPPIF.Common.GetNCResponse("StartTalkPlay", nc, oaResHandle);
    },
    // - 停止流
    StopStreamPlay : function (nc, streamHandle) 
    {
		return NPPIF.Common.GetNCResponse("StopStreamPlay", nc, streamHandle);
    },
    // - 绑定事件
    AttachObjectEvent : function (obj, _name, _callback) 
    {
        try 
        {
			if (obj && _name) {
				if(typeof _callback != "function") {
					_callback = function() {};
				}
				 
				var is_ie_11 = (NPPIF.agt.search("msie") == -1 && NPPIF.agt.search("trident") != -1 ? true : false);
				
				if (obj.attachEvent && typeof obj.attachEvent == "function") {
					obj.attachEvent("on" + _name, _callback);
				}
				else if (obj.addEventListener && typeof obj.addEventListener == "function") {
					if (is_ie_11)
					{
						obj["on" + _name] = _callback;
					}
					else
					{
						obj.addEventListener(_name, _callback, false);
					}
				}
				else {
					obj["on" + _name] = _callback;
				}
			}
			else {
            	return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
			}
			 	
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS); 
        }
        catch (e) {
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
        }
    },
	// - 移除事件
	DetachObjectEvent : function (obj, _name, _callback) 
    {
        try 
        {
			if (obj && _name) {
				if(typeof _callback != "function") {
					_callback = function() {};
				}
				var is_ie_11 = (NPPIF.agt.search("msie") == -1 && NPPIF.agt.search("trident") != -1 ? true : false);
				 
				if (obj.detachEvent && typeof obj.detachEvent == "function") { 
					obj.detachEvent("on" + _name, _callback);
				}
				else if (obj.removeEventListener && typeof obj.removeEventListener == "function") {
					if (is_ie_11)
					{
						if (typeof obj["on" + _name] != "undefined") {
							obj["on" + _name] = "";
							delete obj["on" + _name];
						}
					}
					else
					{
						obj.removeEventListener(_name, _callback, false);
					}
				}
				else {
					if (typeof obj["on" + _name] != "undefined") {
						obj["on" + _name] = "";
						delete obj["on" + _name];
					}
				}
			}
			else {
            	return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
			}
			 	
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS); 
        }
        catch (e) {
            return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
        }
    },
	
	/*
	---
	fn : SC_VODFilePlay
	desc : 点播中心存储文件
	time : 2013.11.04
	params :
		- nc(object) NC插件对象
		- csuHandle(string) 中心存储单元资源句柄
		- fileFullPath(string) 中心存储文件路径
		- speed(uint) 播放速度
		- direction(uint) 播放时间轴方向，1正向，0倒向
		- relativeStartTime(UTC timestamp) 相对文件开始秒数
		- windowHandle(string) 视频窗口句柄
	...
	*/
	SC_VODFilePlay : function(nc, csuHandle, fileFullPath, speed, direction, relativeStartTime, windowHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_VODFilePlay", nc, csuHandle, fileFullPath, speed, direction, relativeStartTime, windowHandle);
	},
	/*
	---
	fn : SC_VODTimePlay
	desc : 按时间段点播中心存储文件
	time : 2013.11.04
	params :
		- nc(object) NC插件对象
		- csuHandle(string) 中心存储单元资源句柄
		- ivHandle(string) 摄像头资源索引
		- beginTime(UTC timestamp) 文件开始时间
		- endTime(UTC timestamp) 文件结束时间
		- speed(uint) 播放速度
		- direction(uint) 播放时间轴方向，1正向，0倒向
		- windowHandle(string) 视频窗口句柄
	...
	*/
	SC_VODTimePlay : function(nc, csuHandle, ivHandle, beginTime, endTime, speed, direction, windowHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_VODTimePlay", nc, csuHandle, ivHandle, beginTime, endTime, speed, direction, windowHandle);
	},
	/*
	---
	fn : SG_CEFSVODFilePlay
	desc : 点播CEFS文件系统的录像
	time : 2013.11.05
	params :
		- nc(object) NC插件对象
		- puHandle(string) 设备资源句柄
		- beginTime(UTC timestamp) 文件开始时间
		- endTime(UTC timestamp) 文件结束时间
		- ivIndex(uint) 视频资源索引
		- speed(uint) 播放速度
		- direction(uint) 播放时间轴方向，1正向，0倒向
		- windowHandle(string) 视频窗口句柄
	...
	*/
	SG_CEFSVODFilePlay : function(nc, puHandle, diskLetter, beginTime, endTime, ivIndex, speed, direction, windowHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_CEFSVODFilePlay", nc, puHandle, diskLetter, beginTime, endTime, ivIndex, speed, direction, windowHandle);
	},
	/*
	---
	fn : SG_FAT32VODFilePlay
	desc : 点播FAT32文件系统的文件
	time : 2013.11.05
	params :
		- nc(object) NC插件对象
		- sgHandle(string) 设备存储器资源句柄
		- filePath(string) 远程文件路径
		- speed(uint) 播放速度
		- direction(uint) 播放时间轴方向，1正向，0倒向
		- relativeStartTime(UTC timestamp) 相对开始时间秒
		- windowHandle(string) 视频窗口句柄
	...
	*/
	SG_FAT32VODFilePlay : function(nc, sgHandle, filePath, speed, direction, relativeStartTime, windowHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_FAT32VODFilePlay", nc, sgHandle, filePath, speed, direction, relativeStartTime, windowHandle);
	},
	
	// - @huzw 2013.09.25 add ---
	/*
	---
	fn: SetPlayWindow
	desc: 设置流绑定窗口
	params:
		- nc(object) NC插件对象
		- streamHandle(HANDLE) 流句柄
		- wndHandle(HANDLE) 窗口插件句柄
	...
	*/
	SetPlayWindow : function(nc, streamHandle, wndHandle)
	{
		return NPPIF.Common.GetNCResponse("SetPlayWindow", nc, streamHandle, wndHandle);
	},
	// - 重绘最后一帧图像
	RedrawLastImage : function(nc, streamHandle)
	{
		return NPPIF.Common.GetNCResponse("RedrawLastImage", nc, streamHandle);
	},
	
	/*
	---
	fn: StartRecord
	desc: 开始本地录像
	params:
		- nc(object) NC插件对象
		- streamHandle(HANDLE) 流句柄
		- localSaveFile(string) 本地保存全路径（如C://12345.avi）
	...
	*/
	StartRecord : function(nc, streamHandle, localSaveFile)
	{
		return NPPIF.Common.GetNCResponse("StartRecord", nc, streamHandle, localSaveFile);
	},
	/*
	---
	fn: StopRecord
	desc: 停止本地录像
	params:
		- nc(object) NC插件对象
		- streamHandle(HANDLE) 流句柄
	...
	*/
	StopRecord : function(nc, streamHandle)
	{
		return NPPIF.Common.GetNCResponse("StopRecord", nc, streamHandle);
	},
	/*
	---
	fn: StartRecord
	desc: 本地抓拍
	params:
		- nc(object) NC插件对象
		- streamHandle(HANDLE) 流句柄
		- localSaveFile(string) 本地保存全路径（如C://12345.bmp）
	...
	*/
	Snapshot : function(nc, streamHandle, localSaveFile)
	{
		return NPPIF.Common.GetNCResponse("Snapshot", nc, streamHandle, localSaveFile);
	},
	// - 是否DDraw模式浏览
	EnableDDraw : function(nc, streamHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("EnableDDraw", nc, streamHandle, !!(bValue == true) ? 1 : 0);
	},	
	// - 开启点播声音
	OpenAudio : function(nc, streamHandle)
	{
		return NPPIF.Common.GetNCResponse("OpenAudio", nc, streamHandle);
	},
	// - 停止点播声音
	CloseAudio : function(nc, streamHandle)
	{
		return NPPIF.Common.GetNCResponse("CloseAudio", nc, streamHandle);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: 窗口叠加字符控制
    * ........................................................................................................
    **/
	// - 是否使能窗口字符叠加
	EnableAddText : function(nc, streamHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("EnableAddText", nc, streamHandle, !!(bValue == true) ? 1 : 0);
	},
	// - 设置叠加的文字信息
	SetTextAdd : function(nc, streamHandle, wndBlockNo, left, top, width, height, color, enableTilt, enableUnderline, fontFamily, content)
	{
		return NPPIF.Common.GetNCResponse("SetTextAdd", nc, streamHandle, wndBlockNo, left, top, width, height, color, enableTilt, enableUnderline, fontFamily, content);
	},
	// - 删除叠加的文字信息
	DeleteTextAdd : function(nc, streamHandle, wndBlockNo)
	{
		return NPPIF.Common.GetNCResponse("DeleteTextAdd", nc, streamHandle, wndBlockNo);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: 窗口叠加字符控制
    * ........................................................................................................
    **/
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: GPS Modeless
    * ........................................................................................................
    **/
	// - 开启（注册）GPS信号接收通道
	StartGPSStream : function(nc, gpsHandle)
	{
		return NPPIF.Common.GetNCResponse("StartGPSStream", nc, gpsHandle);
	},
	// - 停止（卸载）GPS信号接收通道
	StopGPSStream : function(nc, gpsHandle)
	{
		return NPPIF.Common.GetNCResponse("StopGPSStream", nc, gpsHandle);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: GPS Modeless
    * ........................................................................................................
    **/
	/**
    * --------------------------------------------------------------------------------------------------------
    *    remark: 请求响应报文公共命令
    * ........................................................................................................ 
    **/
	/*
	---
	fn : TransCommonMessage
	desc : 处理设备命令
	author :
		- huzw
	time : 2013.10.15
	...
	*/
	TransCommonMessage : function(nc, session, puid, requestXML)
	{
		return NPPIF.Common.GetNCResponse("TransCommonMessage", nc, session, puid, requestXML);
	},
    // - 处理平台命令
	TransCustomMessage : function(nc, session, requestXML)
	{
		return NPPIF.Common.GetNCResponse("TransCustomMessage", nc, session, requestXML);
	},
    // - 处理其他网元命令
	TransNUCommonMessage : function(nc, session, nuType, nuid, requestXML)
	{
		return NPPIF.Common.GetNCResponse("TransNUCommonMessage", nc, session, nuType, nuid, requestXML);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: Mask Control
    * ........................................................................................................
    **/
	// - 使能掩码
	EnableMask : function (nc, streamHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("EnableMask", nc, streamHandle, (bValue?1:0));
	},
	// - 点击掩码
	MaskClick : function (nc, streamHandle, x, y)
	{
		return NPPIF.Common.GetNCResponse("MaskClick", nc, streamHandle, x, y);
	},
	// - 选择掩码区域
	MaskSelectRect : function (nc, streamHandle, bx, by, ex, ey)
	{
		return NPPIF.Common.GetNCResponse("MaskSelectRect", nc, streamHandle, bx, by, ex, ey);
	},
	// - 获取掩码，需要特殊处理
	GetMask : function (nc, streamHandle)
	{
		try {
			if (!nc || typeof nc.GetMask == "undefined" || !streamHandle) 
			{
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);	
			}
			return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS, (nc.GetMask(streamHandle) || []));	 
		}
		catch (e) {
			return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);	
		}
	},
	// - 设置掩码
	SetMask : function (nc, streamHandle, maskList)
	{
		return NPPIF.Common.GetNCResponse("SetMask", nc, streamHandle, maskList);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: Mask Control
    * ........................................................................................................
    **/
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: 获取特定PUID的资源信息 @huzw 2015.05.07 add
    * ........................................................................................................
    **/
	QueryPUIDRes : function (nc, session, puidSets/*puid1,puid2,...,puidn*/)
	{
		 return NPPIF.Common.GetNCResponse("QueryPUIDRes", nc, session, puidSets);
	}, 
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: 获取特定PUID的资源信息 @huzw 2015.05.07 add
    * ........................................................................................................
    **/
	/**
    * --------------------------------------------------------------------------------------------------------
    *    remark: 云台控制
    * ........................................................................................................ 
    **/
	/*
	---
	fn: PTZControl
	desc: 云台控制
	author: 
		- huzw
	time: 2013.09.06
	params: 
		- nc(object) NC插件对象
		- resPTZHandle(HANDLE) PTZ资源句柄
		- direction(NPPIF.Enum.PTZDirection)
		 ...
	remark:
		- 其他参数可传
		=> 	degree(unit) 转动角度，可不传，默认为0
		=> 	secondaryDevNo(uint) 辅助设备编号
		=> 	presetPosNo(unit) 预置位编号
			presetPosName(string) 预置位名称
	...
	*/
	PTZControl : function(nc, resPTZHandle, direction /* degree|secondaryDevNo|presetPosNo, presetPosName */)
	{
		try 
		{
			if (!nc || typeof nc.Initialize == "undefined") {
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_LOADPLUG_NC);
			}
			if (!resPTZHandle) { 
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
			}
			 
			var _args = arguments, _argslen = _args.length;
			if (_argslen < 3) {
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
			} 
			
			var _errorFlag = true;
			
			switch (direction)
			{
				case NPPIF.Enum.PTZDirection.turnleft :
				case NPPIF.Enum.PTZDirection.turnright :
				case NPPIF.Enum.PTZDirection.turnup :
				case NPPIF.Enum.PTZDirection.turndown : 
					_errorFlag = false;
					return NPPIF.Common.GetNCResponse(direction, nc, resPTZHandle, (_args[3] || 0));  
					break;
				case NPPIF.Enum.PTZDirection.startsecondarydev :
				case NPPIF.Enum.PTZDirection.stopsecondarydev : 
				case NPPIF.Enum.PTZDirection.movetopresetpos :
					if (_argslen < 4) {
						return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
					}
					else {
						_errorFlag = false;
						return NPPIF.Common.GetNCResponse(direction, nc, resPTZHandle, _args[3]); 
					} 
					break; 
				case NPPIF.Enum.PTZDirection.setpresetpos : 
					if (_argslen < 5) {
						return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR);
					}
					else {
						_errorFlag = false;
						return NPPIF.Common.GetNCResponse(direction, nc, resPTZHandle, _args[3], _args[4]); 
					}
					break;
				default:
					return NPPIF.Common.GetNCResponse(direction, nc, resPTZHandle); 
					break; 
			}
		}
		catch (e) {
			return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
		}
	},
	
	/* 设备命令 */
	// - 获取平台地址
	ST_GetPlatformAddr : function (nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetPlatformAddr", nc, puHandle);	
	},
	// - 设置平台地址
	ST_SetPlatformAddr : function (nc, puHandle, address)
	{
		return NPPIF.Common.GetNCResponse("ST_SetPlatformAddr", nc, puHandle, address);	
	},
	// - 设备接入密码
	ST_GetRegPsw : function (nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetRegPsw", nc, puHandle);	
	},
	ST_SetRegPsw : function (nc, puHandle, value)
	{
		return NPPIF.Common.GetNCResponse("ST_SetRegPsw", nc, puHandle, value);	
	},
	// - 设备型号
	ST_GetModel : function (nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetModel", nc, puHandle);	
	},
	// - 软件版本
	ST_GetSoftwareVersion : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetSoftwareVersion", nc, puHandle);
	},
	// - 硬件型号
	ST_GetHardwareModel : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetHardwareModel", nc, puHandle);
	},
	// - 硬件版本
	ST_GetHardwareVersion : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetHardwareVersion", nc, puHandle);
	},
	// - 厂商ID
	ST_GetProducerID : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetProducerID", nc, puHandle);
	},
	// - 设备ID
	ST_GetDeviceID : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetDeviceID", nc, puHandle);
	},
	// - 设备时区
	ST_GetTZ : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetTZ", nc, puHandle);
	},
	ST_SetTZ : function(nc, puHandle, timeZone)
	{
		return NPPIF.Common.GetNCResponse("ST_SetTZ", nc, puHandle, timeZone);
	},
	// - 设备与平台同步时间的间隔
	ST_GetTimeSyncInterval : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetTimeSyncInterval", nc, puHandle);
	},
	ST_SetTimeSyncInterval : function(nc, puHandle, value)
	{
		return NPPIF.Common.GetNCResponse("ST_SetTimeSyncInterval", nc, puHandle, value);
	},
	// - OEM数据
	ST_GetOEMData : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetOEMData", nc, puHandle);
	},
	ST_SetOEMData : function(nc, puHandle, value)
	{
		return NPPIF.Common.GetNCResponse("ST_SetOEMData", nc, puHandle, value);
	},
	// - 发送让视频服务器重启的命令
	ST_Reboot : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_Reboot", nc, puHandle);
	},
	// - 时间
	ST_GetTime : function(nc, puHandle)
	{
		return NPPIF.Common.GetNCResponse("ST_GetTime", nc, puHandle);
	},
	ST_SetTime : function(nc, puHandle, value)
	{
		return NPPIF.Common.GetNCResponse("ST_SetTime", nc, puHandle, value);
	},
	
	/* 视频命令 */
	// - 摄像头状态
	IV_GetCameraStatus : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetCameraStatus", nc, ivHandle);
	},
	// - 亮度（Get获取|Set设置|Preview预览，下同）
	IV_GetBrightness : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetBrightness", nc, ivHandle);
	},
	IV_SetBrightness : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetBrightness", nc, ivHandle, value);
	},
	IV_PreviewBrightness : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_PreviewBrightness", nc, ivHandle, value);
	},
	// - 对比度
	IV_GetContrast : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetContrast", nc, ivHandle);
	},
	IV_SetContrast : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetContrast", nc, ivHandle, value);
	},
	IV_PreviewContrast : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_PreviewContrast", nc, ivHandle, value);
	},
	// - 色调
	IV_GetHue : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetHue", nc, ivHandle);
	},
	IV_SetHue : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetHue", nc, ivHandle, value);
	},
	IV_PreviewHue : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_PreviewHue", nc, ivHandle, value);
	},
	// - 饱和度
	IV_GetSaturation : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetSaturation", nc, ivHandle);
	},
	IV_SetSaturation : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetSaturation", nc, ivHandle, value);
	},
	IV_PreviewSaturation : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_PreviewSaturation", nc, ivHandle, value);
	},
	// - 支持的编码算法
	IV_GetSupportedEncoderSets : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetSupportedEncoderSets", nc, ivHandle);
	},
	// - 编码算法
	IV_GetEncoder : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetEncoder", nc, ivHandle);
	},
	IV_SetEncoder : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetEncoder", nc, ivHandle, value);
	},
	// - 支持的流类型
	IV_GetSupportedStreamTypeSets : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetSupportedStreamTypeSets", nc, ivHandle);
	},
	// - 支持的编码分辨率
	IV_GetSupportedResolutionSets : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetSupportedResolutionSets", nc, ivHandle, streamType);
	},
	// - 编码分辨率
	IV_GetResolution : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetResolution", nc, ivHandle, streamType);
	},
	IV_SetResolution : function(nc, ivHandle, streamType, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetResolution", nc, ivHandle, streamType, value);
	},
	// - 支持的编码质量控制模式
	IV_GetSupportedQualityControlModeSets : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetSupportedQualityControlModeSets", nc, ivHandle, streamType);
	},
	// - 编码质量控制模式
	IV_GetQualityControlMode : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetQualityControlMode", nc, ivHandle, streamType);
	},
	IV_SetQualityControlMode : function(nc, ivHandle, streamType, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetQualityControlMode", nc, ivHandle, streamType, value);
	},
	// - 目标码率
	IV_GetBitRate : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetBitRate", nc, ivHandle, streamType);
	},
	IV_SetBitRate : function(nc, ivHandle, streamType, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetBitRate", nc, ivHandle, streamType, value);
	},
	// - 目标帧率
	IV_GetFrameRate : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetFrameRate", nc, ivHandle, streamType);
	},
	IV_SetFrameRate : function(nc, ivHandle, streamType, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetFrameRate", nc, ivHandle, streamType, value);
	},
	// - 目标清晰度
	IV_GetImageDefinition : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetImageDefinition", nc, ivHandle, streamType);
	},
	IV_SetImageDefinition : function(nc, ivHandle, streamType, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetImageDefinition", nc, ivHandle, streamType, value);
	},
	// - 是否叠加时间
	IV_GetAddTime : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetAddTime", nc, ivHandle, streamType);
	},
	IV_SetAddTime : function(nc, ivHandle, streamType, bValue)
	{
		return NPPIF.Common.GetNCResponse("IV_SetAddTime", nc, ivHandle, streamType, bValue);
	},
	// - 是否叠加文字
	IV_GetAddText : function(nc, ivHandle, streamType)
	{
		return NPPIF.Common.GetNCResponse("IV_GetAddText", nc, ivHandle, streamType);
	},
	IV_SetAddText : function(nc, ivHandle, streamType, bValue)
	{
		return NPPIF.Common.GetNCResponse("IV_SetAddText", nc, ivHandle, streamType, bValue);
	},
	// - 叠加的文字内容
	IV_GetTextAdd : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetTextAdd", nc, ivHandle);
	},
	IV_SetTextAdd : function(nc, ivHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IV_SetTextAdd", nc, ivHandle, value);
	},
	// - 屏蔽区域
	IV_GetCoverRegions : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetCoverRegions", nc, ivHandle);
	},
	IV_SetCoverRegions : function(nc, ivHandle, regions)
	{
		return NPPIF.Common.GetNCResponse("IV_SetCoverRegions", nc, ivHandle, regions);
	},
	// - 定时录像时间表
	IV_GetRecordSchedule : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetRecordSchedule", nc, ivHandle);
	},
	IV_SetRecordSchedule : function(nc, ivHandle, timeMap)
	{
		return NPPIF.Common.GetNCResponse("IV_SetRecordSchedule", nc, ivHandle, timeMap);
	},
	// - 是否录制对应音频
	IV_GetRecordAudio : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_GetRecordAudio", nc, ivHandle);
	},
	IV_SetRecordAudio : function(nc, ivHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("IV_SetRecordAudio", nc, ivHandle, bValue);
	},
	// - 请求发送I帧
	IV_StartKeyFrame : function(nc, ivHandle)
	{
		return NPPIF.Common.GetNCResponse("IV_StartKeyFrame", nc, ivHandle);
	},
	
	/* 输入音频 */
	// - 输入音量
	IA_GetVolume : function(nc, iaHandle)
	{
		return NPPIF.Common.GetNCResponse("IA_GetVolume", nc, iaHandle);
	},
	IA_SetVolume : function(nc, iaHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IA_SetVolume", nc, iaHandle, value);
	},
	IA_PreviewVolume : function(nc, iaHandle, value)
	{
		return NPPIF.Common.GetNCResponse("IA_PreviewVolume", nc, iaHandle, value);
	},
	// - 支持的编码算法
	IA_GetSupportedEncoderSets : function(nc, iaHandle)
	{
		return NPPIF.Common.GetNCResponse("IA_GetSupportedEncoderSets", nc, iaHandle);
	},
	// - 编码算法
	IA_GetEncoder : function(nc, iaHandle)
	{
		return NPPIF.Common.GetNCResponse("IA_GetEncoder", nc, iaHandle);
	},
	IA_SetEncoder : function(nc, iaHandle, encoder)
	{
		return NPPIF.Common.GetNCResponse("IA_SetEncoder", nc, iaHandle, encoder);
	},
	// - 支持的流类型
	IA_GetSupportedStreamTypeSets : function(nc, iaHandle)
	{
		return NPPIF.Common.GetNCResponse("IA_GetSupportedStreamTypeSets", nc, iaHandle);
	},
	/* 串口命令 */
	// - 串口模式
	SP_GetMode : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetMode", nc, spHandle);
	},
	// - 支持的波特率
	SP_GetSupportedBaudRateSets : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetSupportedBaudRateSets", nc, spHandle);
	},
	// - 波特率
	SP_GetBaudRate : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetBaudRate", nc, spHandle);
	},
	SP_SetBaudRate : function(nc, spHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SP_SetBaudRate", nc, spHandle);
	},
	// - 支持的数据位
	SP_GetSupportedDataBitsSets : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetSupportedDataBitsSets", nc, spHandle);
	},
	// - 数据位
	SP_GetDataBits : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetDataBits", nc, spHandle);
	},
	SP_SetDataBits : function(nc, spHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SP_SetDataBits", nc, spHandle, value);
	},
	// - 支持的校验位
	SP_GetSupportedParitySets : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetSupportedParitySets", nc, spHandle);
	},
	// - 校验位
	SP_GetParity : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetParity", nc, spHandle);
	},
	SP_SetParity : function(nc, spHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SP_SetParity", nc, spHandle, value);
	},
	// - 支持的停止位
	SP_GetSupportedStopBitsSets : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetSupportedStopBitsSets", nc, spHandle);
	},
	// - 停止位
	SP_GetStopBits : function(nc, spHandle)
	{
		return NPPIF.Common.GetNCResponse("SP_GetStopBits", nc, spHandle);
	},
	SP_SetStopBits : function(nc, spHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SP_SetStopBits", nc, spHandle, value);
	},
	// - 发送串口数据
	SP_WriteData : function(nc, spHandle, dataArr)
	{
		return NPPIF.Common.GetNCResponse("SP_WriteData", nc, spHandle, dataArr);
	},
	SP_WriteDataStr : function(nc, spHandle, dataStr)
	{
		return NPPIF.Common.GetNCResponse("SP_WriteDataStr", nc, spHandle, dataStr);
	},
	
	/* 云台命令 */
	// - 所接串口编号
	PTZ_GetConnectedSerialPort : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_GetConnectedSerialPort", nc, ptzHandle);
	},
	PTZ_SetConnectedSerialPort : function(nc, ptzHandle, value)
	{
		return NPPIF.Common.GetNCResponse("PTZ_SetConnectedSerialPort", nc, ptzHandle, value);
	},
	// - 所有预置位名称
	PTZ_GetPresetPositionSets : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_GetPresetPositionSets", nc, ptzHandle);
	},
	PTZ_SetPresetPositionSets : function(nc, ptzHandle, posMap)
	{
		return NPPIF.Common.GetNCResponse("PTZ_SetPresetPositionSets", nc, ptzHandle, posMap);
	},
	// - 所有辅助设备名称
	PTZ_GetSecondaryDeviceSets : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_GetSecondaryDeviceSets", nc, ptzHandle);
	},
	PTZ_SetSecondaryDeviceSets : function(nc, ptzHandle, devMap)
	{
		return NPPIF.Common.GetNCResponse("PTZ_SetSecondaryDeviceSets", nc, ptzHandle, devMap);
	},
	// - 支持的云台协议
	PTZ_GetSupportedProtocolSets : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_GetSupportedProtocolSets", nc, ptzHandle, ptzIndex);
	},
	// - 控制协议
	PTZ_GetProtocol : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_GetProtocol", nc, ptzHandle);
	},
	PTZ_SetProtocol : function(nc, ptzHandle, protocol)
	{
		return NPPIF.Common.GetNCResponse("PTZ_SetProtocol", nc, ptzHandle, protocol);
	},
	// - 解码器地址
	PTZ_GetDecoderAddress : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_GetDecoderAddress", nc, ptzHandle);
	},
	PTZ_SetDecoderAddress : function(nc, ptzHandle, decoderAddr)
	{
		return NPPIF.Common.GetNCResponse("PTZ_SetDecoderAddress", nc, ptzHandle, decoderAddr);
	},
	// - PTZ移动的速度
	PTZ_GetSpeed : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_GetSpeed", nc, ptzHandle);
	},
	PTZ_SetSpeed : function(nc, ptzHandle, value)
	{
		return NPPIF.Common.GetNCResponse("PTZ_SetSpeed", nc, ptzHandle, value);
	},
	// - 向左转（动）
	PTZ_StartTurnLeft : function(nc, ptzHandle, turnDegree)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StartTurnLeft", nc, ptzHandle, (turnDegree || 0));
	},
	// - 向右转（动）
	PTZ_StartTurnRight : function(nc, ptzHandle, turnDegree)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StartTurnRight", nc, ptzHandle, (turnDegree || 0));
	},
	// - 向上转（动）
	PTZ_StartTurnUp : function(nc, ptzHandle, turnDegree)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StartTurnUp", nc, ptzHandle, (turnDegree || 0));
	},
	// - 向下转（动）
	PTZ_StartTurnDown : function(nc, ptzHandle, turnDegree)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StartTurnDown", nc, ptzHandle, (turnDegree || 0));
	},
	// - 停止转动
	PTZ_StopTurn : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StopTurn", nc, ptzHandle);
	},
	// - 增大光圈
	PTZ_AugmentAperture : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_AugmentAperture", nc, ptzHandle);
	},
	// - 减小光圈
	PTZ_MinishAperture : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_MinishAperture", nc, ptzHandle);
	},
	// - 停止光圈缩放
	PTZ_StopApertureZoom : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StopApertureZoom", nc, ptzHandle);
	},
	// - 推远焦点
	PTZ_MakeFocusFar : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_MakeFocusFar", nc, ptzHandle);
	},
	// - 拉近焦点
	PTZ_MakeFocusNear : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_MakeFocusNear", nc, ptzHandle);
	},
	// - 停止焦点调整
	PTZ_StopFocusMove : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StopFocusMove", nc, ptzHandle);
	},
	// - 缩小图像
	PTZ_ZoomOutPicture : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_ZoomOutPicture", nc, ptzHandle);
	},
	// - 放大图像
	PTZ_ZoomInPicture : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_ZoomInPicture", nc, ptzHandle);
	},
	// - 停止图像缩放
	PTZ_StopPictureZoom : function(nc, ptzHandle)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StopPictureZoom", nc, ptzHandle);
	},
	// - 开启辅助设备
	PTZ_StartSecondaryDev : function(nc, ptzHandle, devNumber)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StartSecondaryDev", nc, ptzHandle, (devNumber || 0));
	},
	// - 关闭辅助设备
	PTZ_StopSecondaryDev : function(nc, ptzHandle, devNumber)
	{
		return NPPIF.Common.GetNCResponse("PTZ_StopSecondaryDev", nc, ptzHandle, (devNumber || 0));
	},
	// - 前往预置位
	PTZ_MoveToPresetPos : function(nc, ptzHandle, posNumber)
	{
		return NPPIF.Common.GetNCResponse("PTZ_MoveToPresetPos", nc, ptzHandle, (posNumber || 0));
	},
	// - 设置预置位
	PTZ_SetPresetPos : function(nc, ptzHandle, posNumber, posName)
	{
		return NPPIF.Common.GetNCResponse("PTZ_SetPresetPos", nc, ptzHandle, (posNumber || 0), (posName || ""));
	},
	
	/* 输入报警命令 */
	// - 支持的报警触发模式
	IDL_GetSupportedAlertInModeSets : function(nc, idlHandle)
	{
		return NPPIF.Common.GetNCResponse("IDL_GetSupportedAlertInModeSets", nc, idlHandle);
	},
	// - 报警触发模式
	IDL_GetAlertInMode : function(nc, idlHandle)
	{
		return NPPIF.Common.GetNCResponse("IDL_GetAlertInMode", nc, idlHandle);
	},
	IDL_SetAlertInMode : function(nc, idlHandle, mode)
	{
		return NPPIF.Common.GetNCResponse("IDL_SetAlertInMode", nc, idlHandle, mode);
	},
	// - 报警间隔
	IDL_GetAlertInDuration : function(nc, idlHandle)
	{
		return NPPIF.Common.GetNCResponse("IDL_GetAlertInDuration", nc, idlHandle);
	},
	IDL_SetAlertInDuration : function(nc, idlHandle, duration)
	{
		return NPPIF.Common.GetNCResponse("IDL_SetAlertInDuration", nc, idlHandle, duration);
	},
	// - 报警输入状态
	IDL_GetAlertInStatus : function(nc, idlHandle)
	{
		return NPPIF.Common.GetNCResponse("IDL_GetAlertInStatus", nc, idlHandle);
	},
	
	/* 输出报警命令 */
	// - 报警输出默认状态
	ODL_GetDefaultConnectStatus : function(nc, odlHandle)
	{
		return NPPIF.Common.GetNCResponse("ODL_GetDefaultConnectStatus", nc, odlHandle);
	},
	// - 报警输出当前状态
	ODL_GetConnectStatus : function(nc, odlHandle)
	{
		return NPPIF.Common.GetNCResponse("ODL_GetConnectStatus", nc, odlHandle);
	},
	// - 接通动作别名
	ODL_GetAliasConnect : function(nc, odlHandle)
	{
		return NPPIF.Common.GetNCResponse("ODL_GetAliasConnect", nc, odlHandle);
	},
	ODL_SetAliasConnect : function(nc, odlHandle, aliasName)
	{
		return NPPIF.Common.GetNCResponse("ODL_SetAliasConnect", nc, odlHandle, aliasName);
	},
	// - 断开动作别名
	ODL_GetAliasBreak : function(nc, odlHandle)
	{
		return NPPIF.Common.GetNCResponse("ODL_GetAliasBreak", nc, odlHandle);
	},
	ODL_SetAliasBreak : function(nc, odlHandle, aliasName)
	{
		return NPPIF.Common.GetNCResponse("ODL_SetAliasBreak", nc, odlHandle, aliasName);
	},
	// - 控制报警输出状态
	ODL_SetStatus : function(nc, odlHandle, value)
	{
		return NPPIF.Common.GetNCResponse("ODL_SetStatus", nc, odlHandle, value);
	},
	
	/* 前端存储配置 */
	// - 录像持续时间
	SG_GetRecordTimeSpan : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_GetRecordTimeSpan", nc, sgHandle);
	},
	SG_SetRecordTimeSpan : function(nc, sgHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SG_SetRecordTimeSpan", nc, sgHandle, value);
	},
	// - 磁盘状态
	SG_GetDiskStatus : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_GetDiskStatus", nc, sgHandle);
	},
	// - 磁盘空间不足时是否覆盖旧文件
	SG_GetCoverOldRecordFile : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_GetCoverOldRecordFile", nc, sgHandle);
	},
	SG_SetCoverOldRecordFile : function(nc, sgHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("SG_SetCoverOldRecordFile", nc, sgHandle, bValue);
	},
	// - 磁盘空间不足时的剩余空间门限
	SG_GetDiskInsufficientSpace : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_GetDiskInsufficientSpace", nc, sgHandle);
	},
	SG_SetDiskInsufficientSpace : function(nc, sgHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SG_SetDiskInsufficientSpace", nc, sgHandle, value);
	},
	// - 录像文件保留天数
	SG_GetRecordFileReserveDays : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_GetRecordFileReserveDays", nc, sgHandle);
	},
	SG_SetRecordFileReserveDays : function(nc, sgHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SG_SetRecordFileReserveDays", nc, sgHandle, value);
	},
	// - 文件系统类型
	SG_GetFileSystemType : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_GetFileSystemType", nc, sgHandle);
	},
	// - 获取磁盘信息
	SG_GetDiskInfo : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_GetDiskInfo", nc, sgHandle);
	},
	// - 开始初始化文件系统
	SG_StartInitFileSystem : function(nc, sgHandle, sgDiskNo)
	{
		return NPPIF.Common.GetNCResponse("SG_StartInitFileSystem", nc, sgHandle, sgDiskNo);
	},
	// - 查询初始化文件系统进度
	SG_QueryInitFileSystemProgress : function(nc, sgHandle)
	{
		return NPPIF.Common.GetNCResponse("SG_QueryInitFileSystemProgress", nc, sgHandle);
	},
	// - 手动启动存储
	SG_ManualStart : function(nc, sgHandle, ivType, ivIndex, ivStreamType, duration)
	{
		return NPPIF.Common.GetNCResponse("SG_ManualStart", nc, sgHandle, ivType, ivIndex, ivStreamType, duration);
	},
	// - 手动停止存储
	SG_ManualStop : function(nc, sgHandle, ivType, ivIndex, ivStreamType)
	{
		return NPPIF.Common.GetNCResponse("SG_ManualStop", nc, sgHandle, ivType, ivIndex, ivStreamType);
	},
	// - 下载CEFS文件系统的录像
	SG_CEFSDownLoadFile : function (nc, sgHandle, diskLetter, beginTime, endTime, ivIndex, localSaveAsPath)
	{
		return NPPIF.Common.GetNCResponse("SG_CEFSDownLoadFile", nc, sgHandle, diskLetter, beginTime, endTime, ivIndex, localSaveAsPath);
	},
	// - 下载CEFS文件系统的图片
	SG_CEFSDownLoadSnapshot : function (nc, sgHandle, diskLetter, snapshotTime, noInSecond, ivIndex, localSaveAsPath)
	{
		return NPPIF.Common.GetNCResponse("SG_CEFSDownLoadSnapshot", nc, sgHandle, diskLetter, snapshotTime, noInSecond, ivIndex, localSaveAsPath);
	},
	// @huzw 2015.05.04 add
	// - 查询前端存储日期
	SG_QueryCEFSRecordDate : function (nc, sgHandle, ivIndex)
	{
		return NPPIF.Common.GetNCResponse("SG_QueryCEFSRecordDate", nc, sgHandle, ivIndex);
	},
	// - 查询前端抓图日期
	SG_QueryCEFSSnapshotDate : function (nc, sgHandle, ivIndex)
	{
		return NPPIF.Common.GetNCResponse("SG_QueryCEFSSnapshotDate", nc, sgHandle, ivIndex);
	},
	// - 高级查询前端存储文件{适用CEFS文件格式}
	SG_CEFSQueryFilesEx : function (nc, sgHandle, ivIndex, intBeginTime, intEndTime, intReason, streamType)
	{
		return NPPIF.Common.GetNCResponse("SG_CEFSQueryFilesEx", nc, sgHandle, ivIndex, intBeginTime, intEndTime, intReason, streamType);
	},
	// @huzw 2019.11.20 add
	// - 高级查询前端存储文件{适用FAT32文件格式}
	SG_FAT32QueryFiles : function (nc, sgHandle, ivIndex, intBeginTime, intEndTime, streamType, intOffset, intCount)
	{
		return NPPIF.Common.GetNCResponse("SG_QueryRecordFiles", nc, sgHandle, ivIndex, intBeginTime, intEndTime, streamType, intOffset, intCount);
	},
	// - 下载FAT32前端存储文件
	SG_FAT32DownLoadFile : function (nc, sgHandle, remoteFilePath, localSaveAsPath)
	{
		return NPPIF.Common.GetNCResponse("SG_FAT32DownLoadFile", nc, sgHandle, remoteFilePath, localSaveAsPath);
	},

	/* 平台存储配置 */
	// - 录像时间
	SC_GetRecordTimeSpan : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetRecordTimeSpan", nc, csuHandle);
	},
	SC_SetRecordTimeSpan : function(nc, csuHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SC_SetRecordTimeSpan", nc, csuHandle, value);
	},
	// - 磁盘状态
	SC_GetDiskStatus : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetDiskStatus", nc, csuHandle);
	},
	// - 磁盘满时是否覆盖旧文件
	SC_GetCoverOldRecordFile : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetCoverOldRecordFile", nc, csuHandle);
	},
	SC_SetCoverOldRecordFile : function(nc, csuHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("SC_SetCoverOldRecordFile", nc, csuHandle, bValue);
	},
	// - 录像文件保存天数
	SC_GetRecordFileReserveDays : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetRecordFileReserveDays", nc, csuHandle);
	},
	SC_SetRecordFileReserveDays : function(nc, csuHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SC_SetRecordFileReserveDays", nc, csuHandle, value);
	},
	// - GPS数据保存天数
	SC_GetGPSReserveDays : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetGPSReserveDays", nc, csuHandle);
	},
	SC_SetGPSReserveDays : function(nc, csuHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SC_SetGPSReserveDays", nc, csuHandle, value);
	},
	// - 是否使能GPS存储
	SC_GetEnableGPSDataStorage : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetEnableGPSDataStorage", nc, csuHandle);
	},
	SC_SetEnableGPSDataStorage : function(nc, csuHandle, bValue)
	{
		return NPPIF.Common.GetNCResponse("SC_SetEnableGPSDataStorage", nc, csuHandle, bValue);
	},
	// - 抓拍文件保存天数
	SC_GetSnapshotReserveDays : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetSnapshotReserveDays", nc, csuHandle);
	},
	SC_SetSnapshotReserveDays : function(nc, csuHandle, value)
	{
		return NPPIF.Common.GetNCResponse("SC_SetSnapshotReserveDays", nc, csuHandle, value);
	},
	/* 平台存储控制 */
	// - 获取磁盘信息
	SC_GetDiskInfo : function(nc, csuHandle)
	{
		return NPPIF.Common.GetNCResponse("SC_GetDiskInfo", nc, csuHandle);
	},
	// - 手动启动存储
	SC_ManualStart : function(nc, csuHandle, rec_ivHandle, rec_streamType, rec_reason, rec_duration)
	{
		return NPPIF.Common.GetNCResponse("SC_ManualStart", nc, csuHandle, rec_ivHandle, rec_streamType, rec_reason, rec_duration);
	},
	// - 手动停止存储
	SC_ManualStop : function(nc, csuHandle, rec_ivHandle, rec_streamType)
	{
		return NPPIF.Common.GetNCResponse("SC_ManualStop", nc, csuHandle, rec_ivHandle, rec_streamType);
	},
	// - 查询录像/图片文件
	SC_QueryFiles : function(nc, csuHandle, rec_ivHandle, rec_beginTime, rec_endTime, rec_streamType, byOffset, byCount)
	{
		return NPPIF.Common.GetNCResponse("SC_QueryFiles", nc, csuHandle, rec_ivHandle, rec_beginTime, rec_endTime, rec_streamType, byOffset, byCount);
	},
	// - 删除录像/图片文件
	SC_DelFiles : function(nc, csuHandle, fileListArray)
	{
		return NPPIF.Common.GetNCResponse("SC_DelFiles", nc, csuHandle, fileListArray);
	},
	// - 下载录像、图片
	SC_DownLoadFile : function (nc, csuHandle, fileAllPath, localSaveAsPath)
	{
		return NPPIF.Common.GetNCResponse("SC_DownLoadFile", nc, csuHandle, fileAllPath, localSaveAsPath); 
	},
	// - 查询录像/图片文件
	SC_QueryGPSData : function(nc, csuHandle, rec_gpsHandle, rec_beginTime, rec_endTime, byOffset, byCount)
	{
		return NPPIF.Common.GetNCResponse("SC_QueryGPSData", nc, csuHandle, rec_gpsHandle, rec_beginTime, rec_endTime, byOffset, byCount);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: 获取发送接收流的总流量 2015.02.06
    * ........................................................................................................
    **/
	// 接收
	GetCurStreamsTotalRecvBytes : function (nc)
	{
		// 虚拟一个参数
		return NPPIF.Common.GetNCResponse("GetCurStreamsTotalRecvBytes", nc, "");
	},
	// 发送
	GetCurStreamsTotalSendBytes : function (nc)
	{
		// 虚拟一个参数
		return NPPIF.Common.GetNCResponse("GetCurStreamsTotalSendBytes", nc, "");
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: 获取发送接收流的总流量 2015.02.06
    * ........................................................................................................
    **/
	
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: 外接存储查询下载接口 2014.05.29
    * ........................................................................................................
    **/
	// 加载模块，与RecordQR_Cleanup互斥调用，不能只重复调用某个接口
	RecordQR_Startup : function (nc)
	{
		try
		{
			var operator = NPPIF.Common.CheckObjectInterface(NPPIF.Enum.ObjectType.NC, nc, "RecordQR_Startup");
			if (operator.rv != NrcapError.NRCAP_SUCCESS) return operator;
			
			var ops = nc.RecordQR_Startup();
			if (!ops || typeof ops == "undefined")
			{
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);	
			}
			var operator = eval("(" + ops + ")") || {};
			if (operator.rv == NrcapError.NRCAP_SUCCESS) 
			{
				if (typeof operator.response == "string")
				{
					operator.response = NPPUtils.UTF8toUnicode(operator.response);	
				}
			}
			return new NPPIF.Struct.ReturnValueStruct(Number(operator.rv), operator.response);
		}
		catch (e)
		{
			return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);	
		}
	},
	// 清理模块
	RecordQR_Cleanup : function (nc)
	{
		try
		{
			var operator = NPPIF.Common.CheckObjectInterface(NPPIF.Enum.ObjectType.NC, nc, "RecordQR_Cleanup");
			if (operator.rv != NrcapError.NRCAP_SUCCESS) return operator;
			
			nc.RecordQR_Cleanup();
			return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);
		}
		catch (e)
		{
			return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);	
		}
	},
	// 获得设备信息
	RecordQR_GetDeviceInfo : function (nc)
	{
		try
		{
			var operator = NPPIF.Common.CheckObjectInterface(NPPIF.Enum.ObjectType.NC, nc, "RecordQR_GetDeviceInfo");
			if (operator.rv != NrcapError.NRCAP_SUCCESS) return operator;
			
			var ops = nc.RecordQR_GetDeviceInfo();
			if (!ops || typeof ops == "undefined")
			{
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);	
			}
			var operator = eval("(" + ops + ")") || {};
			if (operator.rv == NrcapError.NRCAP_SUCCESS) 
			{
				if (typeof operator.response == "string")
				{
					operator.response = NPPUtils.UTF8toUnicode(operator.response);	
				}
			}
			return new NPPIF.Struct.ReturnValueStruct(Number(operator.rv), operator.response);
		}
		catch (e)
		{
			return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);	
		}
	},
	// 查询录像日期
	RecordQR_QueryRecordDate : function (nc, videoIndex, offset, count)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QueryRecordDate", nc, videoIndex, offset, count);
	},
	// 查询录像文件
	RecordQR_QueryRecordFiles : function (nc, videoIndex, offset, count, bUTCTime, eUTCTime)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QueryRecordFiles", nc, videoIndex, offset, count, bUTCTime, eUTCTime);
	},
	// 查询抓拍日期
	RecordQR_QuerySnapshotDate : function (nc, videoIndex, offset, count)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QuerySnapshotDate", nc, videoIndex, offset, count);
	},
	// 查询抓拍文件
	RecordQR_QuerySnapshotFiles : function (nc, videoIndex, offset, count, bUTCTime, eUTCTime)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QuerySnapshotFiles", nc, videoIndex, offset, count, bUTCTime, eUTCTime);
	},
	// 查询事件
	RecordQR_QueryEvent : function (nc, offset, count, bUTCTime, eUTCTime)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QueryEvent", nc, offset, count, bUTCTime, eUTCTime);
	},
	// 查询定位数据
	RecordQR_QueryGnssData : function (nc, offset, count, bUTCTime, eUTCTime)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QueryGnssData", nc, offset, count, bUTCTime, eUTCTime);
	},
	// 查询串口数据
	RecordQR_QuerySPData : function (nc, offset, count, bUTCTime, eUTCTime)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QuerySPData", nc, offset, count, bUTCTime, eUTCTime);
	},
	// 查询日志数据
	RecordQR_QueryLog : function (nc, offset, count, bUTCTime, eUTCTime)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_QueryLog", nc, offset, count, bUTCTime, eUTCTime);
	},
	// 下载抓拍文件
	RecordQR_CopySnapshot : function (nc, remoteFilePath, localFilePath)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_CopySnapshot", nc, remoteFilePath, localFilePath);
	},
	// 下载录像文件
	RecordQR_CopyRecord : function (nc, remoteFilePath, localFilePath)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_CopyRecord", nc, remoteFilePath, localFilePath);
	},
	// 取消下载
	RecordQR_CancelCopy : function (nc, localFilePath)
	{
		return NPPIF.Common.GetNCResponse("RecordQR_CancelCopy", nc, localFilePath);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: 外接存储查询下载接口 2014.05.29
    * ........................................................................................................
    **/
	
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: 会议室功能接口 2014.12.25
    * ........................................................................................................
    **/
	// 创建会议室
	CreateMeetingRoom : function (nc, hSession, szName, szPassword)
	{
		return NPPIF.Common.GetNCResponse("CreateMeetingRoom", nc, hSession, szName, MD5.Hex_MD5(szPassword || ""));
	},
	// 查询所有会议室信息
	QueryAllMeetingRoomInfo : function (nc, hSession, nCount)
	{
		return NPPIF.Common.GetNCResponse("QueryAllMeetingRoomInfo", nc, hSession, nCount);
	},
	// 申请加入会议室
	JoinMeetingRoom: function (nc, hSession, szID, szPassword)
	{
		return NPPIF.Common.GetNCResponse("JoinMeetingRoom", nc, hSession, szID, MD5.Hex_MD5(szPassword || ""));
	},
	// 修改会议室密码
	ModifyMeetingRoomPassword: function (nc, hSession, szID, new_szPassword)
	{
		return NPPIF.Common.GetNCResponse("ModifyMeetingRoomPassword", nc, hSession, szID, MD5.Hex_MD5(new_szPassword || ""));
	},
	// 从会议室中删除一个用户
	KickOutMemberCU: function (nc, hSession, hStreamHandle, szCUID)
	{
		return NPPIF.Common.GetNCResponse("KickOutMemberCU", nc, hSession, hStreamHandle, szCUID);
	},
	// 从会议室中删除一个设备
	KickOutMemberPU: function (nc, hSession, hStreamHandle, szPUID)
	{
		return NPPIF.Common.GetNCResponse("KickOutMemberPU", nc, hSession, hStreamHandle, szPUID);
	},
	// 添加一个设备入会议室
	AddPUMeetingRoom: function (nc, hSession, hStreamHandle, szPUID)
	{
		return NPPIF.Common.GetNCResponse("AddPUMeetingRoom", nc, hSession, hStreamHandle, szPUID);
	},
	// 获取在线用户
	GetOnlineUsers: function (nc, hSession, nCount)
	{
		return NPPIF.Common.GetNCResponse("GetOnlineUsers", nc, hSession, nCount);
	},
	
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: 会议室功能接口 2014.12.25
    * ........................................................................................................
    **/
	
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- s - remark: 集群功能接口 2016.06.29
    * ........................................................................................................
    **/
	/* 获取所有用户状态列表 */
	ECCGetUsersStatus: function (nc, hSession, nCount)
	{
		return NPPIF.Common.GetNCResponse("ECCGetUsersStatus", nc, hSession, nCount);
	},
	/* 创建会议 */
	ECCCreateConference: function (nc, hSession, strName, strPassword, nMaxDuration)
	{
		return NPPIF.Common.GetNCResponse("ECCCreateConference", nc, hSession, strName, strPassword, nMaxDuration);
	},
	/* 结束会议 */
	ECCCloseConference: function (nc, hSession, nConferenceIndex, strPassword)
	{
		return NPPIF.Common.GetNCResponse("ECCCloseConference", nc, hSession, nConferenceIndex, strPassword);
	},
	/* 邀请人员 */
	ECCInvite2Conference: function (nc, hSession, nConferenceIndex, strPassword, strUserName)
	{
		return NPPIF.Common.GetNCResponse("ECCInvite2Conference", nc, hSession, nConferenceIndex, strPassword, strUserName);
	},
	/* 移除会议人员 */
	ECCRemoveUserFromConference: function (nc, hSession, nConferenceIndex, strPassword, strUserName)
	{
		return NPPIF.Common.GetNCResponse("ECCRemoveUserFromConference", nc, hSession, nConferenceIndex, strPassword, strUserName);
	},
	/* 获取所有未结束会议列表 */
	ECCGetActiveConferenceList: function (nc, hSession, nCount)
	{
		return NPPIF.Common.GetNCResponse("ECCGetActiveConferenceList", nc, hSession, nCount);
	},
	/* 获取会议成员列表 */
	ECCGetConferenceUsers: function (nc, hSession, nConferenceIndex, nCount)
	{
		return NPPIF.Common.GetNCResponse("ECCGetConferenceUsers", nc, hSession, nConferenceIndex, nCount);
	},
	/**
    * --------------------------------------------------------------------------------------------------------
    *	- e - remark: 集群功能接口 2016.06.29
    * ........................................................................................................
    **/
	
	/**
    * --------------------------------------------------------------------------------------------------------
    *    remark: DW窗口插件方法
    * ........................................................................................................ 
    **/
	/*
	---
	fn: GetWindowHandle
	desc: 获取窗口句柄
	params:
		- pw(object) PW插件对象）
	...
	*/
	GetWindowHandle : function(pw)
	{
		return NPPIF.Common.GetPWResponse("GetWindow", pw);
	},
	// - 窗口全屏
	FullScreen : function(pw)
	{
		return NPPIF.Common.GetPWResponse("FullScreen", pw);
	},
	// - 退出全屏
	ExitFullScreen : function(pw)
	{
		return NPPIF.Common.GetPWResponse("ExitFullScreen", pw); 
	},
	// - 设置是否重绘背景标志，0为不重绘，1为重绘，当视频开始播放时应设为0，否则设为1
	SetEraseBkgndFlag : function(pw, bValue)
	{
		return NPPIF.Common.GetPWResponse("SetEraseBkgndFlag", pw, bValue);
	},
	// - 设置控制模式
	SetControlMode : function(pw, mode)
	{ 
		return NPPIF.Common.GetPWResponse("SetControlMode", pw, mode);
	},
	// - 添加右键菜单项
	AppendMenuItem : function(pw, mode, keyCode, key)
	{
		return NPPIF.Common.GetPWResponse("AppendMenuItem", pw, mode, keyCode, key);
	},
	// - 移除所有的右键菜单项
	DeleteAllMenuItem : function(pw)
	{
		return NPPIF.Common.GetPWResponse("DeleteAllMenuItem", pw);
	},
	
	/**
    * --------------------------------------------------------------------------------------------------------
    *    remark: WA文件操作辅助插件方法
    * ........................................................................................................ 
    **/
	/*
	---
	fn: Folder
	desc: 操作文件夹类
	params:
		- wa(object) WA文件操作辅助插件对象）
	...
	*/
	Folder : 
	{
		/*
		---
		desc: 切换WA调试
		remark:
			- bValue(boolean) 1/true开启，0/false关闭（缺省）
		...
		*/
		DebugSwitch : function (wa, bValue)
		{
			return NPPIF.Common.GetWAResponse("DebugSwitch", wa, bValue || 0);
		},
		// - 获取操作系统根目录
		GetSystemRoot : function (wa)
		{
			return NPPIF.Common.GetWAResponse("GetSystemRoot", wa);
		},
		/*
		---
		desc: 打开目录选择对话框
		remark:
			- dialogTitle(string) 对话框标题
		...
		*/
		GetFileFolder : function (wa, dialogTitle)
		{
			return NPPIF.Common.GetWAResponse("GetFileFolder", wa, (dialogTitle || ""));
		},
		// - 打开目录
		OpenFolder : function (wa, folderPath)
		{
			return NPPIF.Common.GetWAResponse("OpenFolder", wa, folderPath);
		},
		/*
		---
		desc: 检测是否允许文件操作
		time: 2015.04.03
		author: huzw
		returns: response : 0:正常， -1:异常
		...
		*/
		GetFileJurisdiction : function (wa, fildName)
		{
			return NPPIF.Common.GetWAResponse('GetFileJurisdiction', wa, fildName);
		},
		/*
		---
		desc: 创建文件夹
		remark:
			- folderPath(string) 需要创建的目录全路径
		...
		*/
		CreateDirectory : function (wa, folderPath)
		{
			return NPPIF.Common.GetWAResponse("CreateDirectory", wa, folderPath);
		},
		// - 删除文件夹
		DeleteDirectory : function (wa, folderPath)
		{
			return NPPIF.Common.GetWAResponse("DeleteDirectory", wa, folderPath);
		},
		/*
		---
		desc: 删除文件
		remark:
			- fileName(string) 需要删除的文件全路径名称
		...
		*/
		DeleteFile : function (wa, fileName)
		{
			return NPPIF.Common.GetWAResponse("DeleteFile", wa, fileName);
		},
		// - 检测文件是否存在，response=true存在，其他表示不存在
		FileExist : function (wa, fileName)
		{
			return NPPIF.Common.GetWAResponse("FileExist", wa, fileName);
		},
		// - 读文件内容
		ReadFile : function (wa, fileName)
		{
			return NPPIF.Common.GetWAResponse("ReadFile", wa, fileName);
		},
		/*
		---
		desc: 写文件内容
		remark:
			- 文件不存在可创建
			- fileName(string) 需要写文件的全路径名称
			- content(string) 写的具体内容
			- contentlength(number) 内容真实长度
			- bValue(boolean) 1/true写追加，0/false写覆盖（缺省）
		...
		*/
		WriteFile : function (wa, fileName, content, contentLength, bValue)
		{
			return NPPIF.Common.GetWAResponse("WriteFile", wa, fileName, content, contentLength, bValue || 0);
		},
		/*
		---
		desc: 按类型获取目录下的文件列表
		params:
			- folderPath(string) 全路径文件夹名称
			- fileType(string) 为文件的类型，如"avi/AVI", "jpg", "doc"等等
			- bValue(uint) 是否深度递归获取，缺省为0
			- bReturnFullPath(uint) 是否返回全路径，缺省为0否
		remark:
			- 当fileType传值为空时，会返回folderName下所有文件
			- 如果fileType为某个具体的类型时，理论上将返回此类型的全部文件
		...
		*/
		GetFolderFiles : function (wa, folderPath, fileType, bValue, bReturnFullPath)
		{
			var operator = NPPIF.Common.GetWAResponse("GetFolderFiles", wa, folderPath, fileType, (bValue || 0), (bReturnFullPath || 0));
			if (operator.rv == NrcapError.NRCAP_SUCCESS)
			{
				operator.response = eval('(' + operator.response + ')');
				if (typeof operator.response == "object" && typeof operator.response.rv != "undefined")
				{
					if (typeof operator.response.response == "string")
					{
						operator.response.response = NPPUtils.UTF8toUnicode(operator.response.response);	
					}
					return new NPPIF.Struct.ReturnValueStruct
					(
						operator.response.rv,
						operator.response.response
					);	
				}
				
				return operator;
			}
		},
		// - 获取目录下的文件夹列表
		GetFolders : function (wa, folderPath, bValue, bReturnFullPath)
		{
			var operator = NPPIF.Common.GetWAResponse("GetFolders", wa, folderPath, (bValue || 0), (bReturnFullPath || 0));
			if (operator.rv == NrcapError.NRCAP_SUCCESS)
			{
				operator.response = eval('(' + operator.response + ')');
				if (typeof operator.response == "object" && typeof operator.response.rv != "undefined")
				{
					if (typeof operator.response.response == "string")
					{
						operator.response.response = NPPUtils.UTF8toUnicode(operator.response.response);	
					}
					return new NPPIF.Struct.ReturnValueStruct
					(
						operator.response.rv,
						operator.response.response
					);	
				}
				
				return operator;
			}
		},
		/*
		---
		desc: 进行Base64编码
		params:
			- segment(string) 要编码的字符串
		...
		*/
		Base64Enc : function (wa, segment)
		{
			return NPPIF.Common.GetWAResponse("Base64Enc", wa, segment);
		},
		/*
		---
		desc: 进行Base64解码
		params:
			- base64EnStr(string) 要解码的字符串
			- 是否使用UTF8编码，缺省使用
		...
		*/
		Base64Dec : function (wa, base64EnStr, bUsingUTF8)
		{
			var bUsingUTF8 = typeof bUsingUTF8 == "undefined" ? 1 : (bUsingUTF8 == 1 ? 1 : 0);
			return NPPIF.Common.GetWAResponse("Base64Dec", wa, base64EnStr, bUsingUTF8);
		},
		// - Des编码
		DesEnc : function (wa, base64Raw, base64Key)
		{
			return NPPIF.Common.GetWAResponse("DesEnc", wa, base64Raw, base64Key);
		},
		// - Des解码
		DesDec : function (wa, base64EnStr, base64KeyStr)
		{
			return NPPIF.Common.GetWAResponse("DesDec", wa, base64EnStr, base64KeyStr);
		},
		GetRandTokenForUser : function (wa, base64EnStr, keyStr)
		{
			return NPPIF.Common.GetWAResponse("GetRandTokenForUser", wa, base64EnStr, keyStr);
		},
		SetRandTokenForUser : function (wa, rawData, keyStr)
		{
			return NPPIF.Common.GetWAResponse("SetRandTokenForUser", wa, rawData, keyStr);
		},
		/*
		---
		desc: 读取指定文件内容，经Base64编码后返回
		params:
			- fileName(string) 文件全路径，如图片C:/123.gif
		...
		*/
		ReadFileEx : function (wa, fileName)
		{
			return NPPIF.Common.GetWAResponse("ReadFileEx", wa, fileName);
		},
		/*
		---
		desc: 将文件复制到指定目录下，必须是个绝对路径（-1）， 且文件存在（-3），目录必须存在（-2）
		params:
			- srcFileName(string) 需要复制的文件全路径
			- dstFileName(string) 保存到目标目录下文件名，可以只是文件名，将放在srcFileName同一目录下
		...
		*/
		CopyFile : function (wa, srcFileName, dstFileName)
		{
			return NPPIF.Common.GetWAResponse("CopyFile", wa, srcFileName, dstFileName);
		},
		
		// - 网络下载
		HttpDownload : function (wa, url, saveAsPath, autoRun)
		{
			return NPPIF.Common.GetWAResponse("HttpDownload", wa, url, saveAsPath, autoRun);
		},
		// - 获取下载状态码
		GetStatus : function (wa)
		{
			return NPPIF.Common.GetWAResponse("GetStatus", wa);
		},
		// - 获取下载速度（Kbps）
		GetSpeed : function (wa)
		{
			return NPPIF.Common.GetWAResponse("GetSpeed", wa);
		},
		// - 获取下载文件的总字节长度
		GetTotalLength : function (wa)
		{
			return NPPIF.Common.GetWAResponse("GetTotalLength", wa);
		},
		// - 获取已经下载的字节长度
		GetDownloadLength : function (wa)
		{
			return NPPIF.Common.GetWAResponse("GetDownloadLength", wa);
		},
		// - 停止网络下载
		CloseHttpDownload : function (wa)
		{
			return NPPIF.Common.GetWAResponse("CloseHttpDownload", wa);
		},
		// - 获取解码插件版本
		GetPluginVersion : function (wa, pluginName)
		{
			return NPPIF.Common.GetWAResponse("GetPluginVersion", wa, pluginName);
		},
	
		/*
		---
		time: 2014.03.27 add
		author: 
			- huzw
		fn:
			- PUDetectStartup
			- PUDetectGetPUList
			- PUDetectCleanup
		remark:
			- 页面使用时请Startup后，周期获取GetPUList，终止使用使用Cleanup
			- NRCAP_ERROR_PUDETECTSTARTUP_FAILED : 0x0337, // - 启动设备搜索失败
			- NRCAP_ERROR_PUDETECTGETPULIST_FAILED : 0x0339, // - 搜索设备失败
			- NRCAP_ERROR_PUDETECTCLEANUP_FAILED : 0x033B, // - 关闭设备搜索失败
		...
		*/
		PUDetectStartup : function (wa)
		{
			try
			{
				var operator = NPPIF.Common.GetWAResponse("PUDetectStartup", wa);
				if (operator.rv == NrcapError.NRCAP_SUCCESS)
				{
					return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS);
				}
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_PUDETECTSTARTUP_FAILED);
			}
			catch (e)
			{
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
			}
		},
		PUDetectGetPUList : function (wa)
		{
			try
			{
				var operator = NPPIF.Common.GetWAResponse("PUDetectGetPUList", wa);
				if (operator.rv == NrcapError.NRCAP_SUCCESS)
				{
					operator.response = eval("(" + operator.response + ")");
					if (typeof operator.response.rv != "undefined")
					{
						if (typeof operator.response.response != "undefined")
						{
							var _response = operator.response.response || [];
							if (typeof _response == "object")
							{
								if (_response.constructor != Array)
								{
									_response = [_response];	
								}
								for (var i = 0; i < _response.length; i++)
								{
									_response[i].name = NPPUtils.UTF8toUnicode(_response[i].name);	
								}
							}
							return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS, _response);	
						}
					}
					return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_SUCCESS, []);	
				}
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_PUDETECTGETPULIST_FAILED);
			}
			catch (e)
			{
				return new NPPIF.Struct.ReturnValueStruct(NrcapError.NRCAP_ERROR_THREAD);
			}
		},
		PUDetectCleanup : function (wa)
		{
			return NPPIF.Common.GetWAResponse("PUDetectCleanup", wa);
		},
		
		end : true
	},	
	
	// - 结构体对象
    Struct : 
    {
        /*
        ---
        desc: 返回值结构
        ...
        */
        ReturnValueStruct : function (rv, response) 
        {
            this.rv = rv !== NrcapError.NRCAP_SUCCESS ? 
						(rv || NrcapError.NRCAP_ERROR) 
						: NrcapError.NRCAP_SUCCESS;
						
            this.response = typeof response != "undefined" ? response : "";
        },
        /*
        ---
        desc: 初始化连接服务器参数结构
        params:
            - path(string) IP:Port, 如127.0.0.1:8866
            - username(string) 用户名
            - epId(string) 企业ID
            - password(string) 用户密码
            - bFixCUIAddress(bool) 是否透过网闸（1/true是，0/false否）
        ...
        */
        ConnParamStruct : function (path, username, epId, password, bFixCUIAddress) 
        {
            this.path = path || "127.0.0.1:8866";
            this.username = (typeof username != "undefined" && username != null ? username : "");
            this.epId = (typeof epId != "undefined" && epId != null ? epId : "");
            this.password = (typeof password != "undefined" && password != null ? password : "");
            this.bFixCUIAddress = (typeof bFixCUIAddress != "undefined" && bFixCUIAddress != null ? bFixCUIAddress : 0);
        },
        
		
        end : true 
    },
	
	// - 枚举对象
    Enum : 
    {
        // - 流类型
        NrcapStreamType : 
        {
            "REALTIME" : "REALTIME", /* 实时流 */
            "STORAGE" : "STORAGE", /* 存储流 */
            "PICTURE" : "PICTURE", /* 图片流 */
            "MOBILE2G" : "MOBILE2G", /* 2G手机观看码流 */
            "MOBILE3G" : "MOBILE3G", /* 3G手机观看码流 */
            "TRANSCODE" : "TRANSCODE", /* 平台转码流 */
            "HD" : "HD" /* 高清流 */
        },
		
		// - 云台控制命令
		PTZDirection :
		{
			"turnleft" : "PTZ_StartTurnLeft", // - 向左转（动）
			"turnright" : "PTZ_StartTurnRight", // - 向右转
			"turnup" : "PTZ_StartTurnUp", // - 向上转
			"turndown" : "PTZ_StartTurnDown", // - 向下转
			"stopturn" : "PTZ_StopTurn", // - 停止转动
			"aperturea" : "PTZ_AugmentAperture", // - 增大光圈
			"aperturem" : "PTZ_MinishAperture", // - 减小光圈
			"stopaperture" : "PTZ_StopApertureZoom", // - 停止光圈缩放
			"focusfar" : "PTZ_MakeFocusFar", // - 推远焦点
			"focusnear" : "PTZ_MakeFocusNear", // - 拉近焦点
			"stopfocus" : "PTZ_StopFocusMove", // - 停止焦点调整
			"zoomout" : "PTZ_ZoomOutPicture", // - 缩小图像
			"zoomin" : "PTZ_ZoomInPicture", // - 放大图像
			"stopzoom" : "PTZ_StopPictureZoom", // - 停止图像缩放
			"startsecondarydev" : "PTZ_StartSecondaryDev", // - 开启辅助设备
			"stopsecondarydev" : "PTZ_StopSecondaryDev", // - 关闭辅助设备
			"movetopresetpos" : "PTZ_MoveToPresetPos", // - 前往预置位
			"setpresetpos" : "PTZ_SetPresetPos" // - 设置预置位
		},
		
		// - 插件类型
		ObjectType :
		{
			NC : "NC", // - NC插件
			PW : "PW", // - PW窗口插件
			WA : "WA"  // - WA文件操作辅助插件
		},
		
		// - NC对象方法列表
		NCObjectMethodList :
		{
			/* 平台命令 */
			GetResourceUsable : "GetResourceUsable", // - 获取资源是否可用
			GetResourceEnable : "GetResourceEnable", // - 获取资源是否使能
			
			/* 设备命令 */
			ST_GetPlatformAddr : "ST_GetPlatformAddr", // - 平台地址（Get获取|Set设置，下同）
			ST_SetPlatformAddr : "ST_SetPlatformAddr",
			ST_GetRegPsw : "ST_GetRegPsw", // - 设备接入密码
			ST_SetRegPsw : "ST_SetRegPsw",
			ST_GetModel : "ST_GetModel", // - 设备型号
			ST_GetSoftwareVersion : "ST_GetSoftwareVersion", // - 软件版本
			ST_GetHardwareModel : "ST_GetHardwareModel", // - 硬件型号
			ST_GetHardwareVersion : "ST_GetHardwareVersion", // - 硬件版本
			ST_GetProducerID : "ST_GetProducerID", // - 厂商ID
			ST_GetDeviceID : "ST_GetDeviceID", // - 设备ID
			ST_GetTZ : "ST_GetTZ", // - 设备时区
			ST_SetTZ : "ST_SetTZ",
			ST_GetTimeSyncInterval : "ST_GetTimeSyncInterval", // - 设备与平台同步时间的间隔
			ST_SetTimeSyncInterval : "ST_SetTimeSyncInterval",
			ST_GetOEMData : "ST_GetOEMData", // - OEM数据
			ST_SetOEMData : "ST_SetOEMData",
			ST_Reboot : "ST_Reboot", // - 发送让视频服务器重启的命令
			ST_GetTime : "ST_GetTime", // - 时间
			ST_SetTime : "ST_SetTime",
			
			/* 输入视频命令 */
			IV_GetCameraStatus : "IV_GetCameraStatus", // - 摄像头状态
			IV_GetBrightness : "IV_GetBrightness", // - 亮度（Get获取|Set设置|Preview预览，下同）
			IV_SetBrightness : "IV_SetBrightness",
			IV_PreviewBrightness : "IV_PreviewBrightness", 
			IV_GetContrast : "IV_GetContrast", // - 对比度
			IV_SetContrast : "IV_SetContrast",
			IV_PreviewContrast : "IV_PreviewContrast", 
			IV_GetHue : "IV_GetHue", // - 色调
			IV_SetHue : "IV_SetHue",
			IV_PreviewHue : "IV_PreviewHue", 
			IV_GetSaturation : "IV_GetSaturation", // - 饱和度
			IV_SetSaturation : "IV_SetSaturation",
			IV_PreviewSaturation : "IV_PreviewSaturation", 
			IV_GetSupportedEncoderSets : "IV_GetSupportedEncoderSets", // - 支持的编码算法
			IV_GetEncoder : "IV_GetEncoder", // - 编码算法
			IV_SetEncoder : "IV_SetEncoder",
			IV_GetSupportedStreamTypeSets : "IV_GetSupportedStreamTypeSets", // - 支持的流类型
			IV_GetSupportedResolutionSets : "IV_GetSupportedResolutionSets", // - 支持的编码分辨率
			IV_GetResolution : "IV_GetResolution", // - 编码分辨率
			IV_SetResolution : "IV_SetResolution",
			IV_GetSupportedQualityControlModeSets : "IV_GetSupportedQualityControlModeSets", // - 支持的编码质量控制模式
			IV_GetQualityControlMode : "IV_GetQualityControlMode", // - 编码质量控制模式
			IV_SetQualityControlMode : "IV_SetQualityControlMode",
			IV_GetBitRate : "IV_GetBitRate", // - 目标码率
			IV_SetBitRate : "IV_SetBitRate",
			IV_GetFrameRate : "IV_GetFrameRate", // - 目标帧率
			IV_SetFrameRate : "IV_SetFrameRate",
			IV_GetImageDefinition : "IV_GetImageDefinition", // - 目标清晰度
			IV_SetImageDefinition : "IV_SetImageDefinition",
			IV_GetAddTime : "IV_GetAddTime", // - 是否叠加时间
			IV_SetAddTime : "IV_SetAddTime",
			IV_GetAddText : "IV_GetAddText", // - 是否叠加文字
			IV_SetAddText : "IV_SetAddText",
			IV_GetTextAdd : "IV_GetTextAdd", // - 叠加的文字内容
			IV_SetTextAdd : "IV_SetTextAdd",
			IV_GetCoverRegions : "IV_GetCoverRegions", // - 屏蔽区域
			IV_SetCoverRegions : "IV_SetCoverRegions",
			IV_GetRecordSchedule : "IV_GetRecordSchedule", // - 定时录像时间表
			IV_SetRecordSchedule : "IV_SetRecordSchedule",
			IV_GetRecordAudio : "IV_GetRecordAudio", // - 是否录制对应音频
			IV_SetRecordAudio : "IV_SetRecordAudio",
			/* 输入视频控制 */
			IV_StartKeyFrame : "IV_StartKeyFrame", // - 请求发送I帧
			
			/* 输入音频命令 */
			IA_GetVolume : "IA_GetVolume", // - 输入音量（Get获取|Set设置|Preview预览，下同）
			IA_SetVolume : "IA_SetVolume",
			IA_PreviewVolume : "IA_PreviewVolume", 
			IA_GetSupportedEncoderSets : "IA_GetSupportedEncoderSets", // - 支持的编码算法
			IA_GetEncoder : "IA_GetEncoder", // - 编码算法
			IA_SetEncoder : "IA_SetEncoder",
			IA_GetSupportedStreamTypeSets : "IA_GetSupportedStreamTypeSets", // - 支持的流类型
			
			/* 串口命令 */
			SP_GetMode : "SP_GetMode", // - 串口模式 
			SP_GetSupportedBaudRateSets : "SP_GetSupportedBaudRateSets", // - 支持的波特率
			SP_GetBaudRate : "SP_GetBaudRate", // - 波特率
			SP_SetBaudRate : "SP_SetBaudRate",
			SP_GetSupportedDataBitsSets : "SP_GetSupportedDataBitsSets", // - 支持的数据位
			SP_GetDataBits : "SP_GetDataBits", // - 数据位
			SP_SetDataBits : "SP_SetDataBits",
			SP_GetSupportedParitySets : "SP_GetSupportedParitySets", // - 支持的校验位
			SP_GetParity : "SP_GetParity", // - 校验位
			SP_SetParity : "SP_SetParity",
			SP_GetSupportedStopBitsSets : "SP_GetSupportedStopBitsSets", // - 支持的停止位
			SP_GetStopBits : "SP_GetStopBits", // - 停止位
			SP_SetStopBits : "SP_SetStopBits",
			SP_WriteData : "SP_WriteData", // - 发送串口数据
			SP_WriteDataStr : "SP_WriteDataStr", // - 发送串口数据
			
			
			/* 云台命令 */
			PTZ_GetConnectedSerialPort : "PTZ_GetConnectedSerialPort", // - 所接串口编号
			PTZ_SetConnectedSerialPort : "PTZ_SetConnectedSerialPort",
			PTZ_GetPresetPositionSets : "PTZ_GetPresetPositionSets", // - 所有预置位名称
			PTZ_SetPresetPositionSets : "PTZ_SetPresetPositionSets",
			PTZ_GetSecondaryDeviceSets : "PTZ_GetSecondaryDeviceSets", // - 所有辅助设备名称
			PTZ_SetSecondaryDeviceSets : "PTZ_SetSecondaryDeviceSets",
			PTZ_GetSupportedProtocolSets : "PTZ_GetSupportedProtocolSets", // - 支持的云台协议
			PTZ_GetProtocol : "PTZ_GetProtocol", // - 控制协议
			PTZ_SetProtocol : "PTZ_SetProtocol",
			PTZ_GetDecoderAddress : "PTZ_GetDecoderAddress", // - 解码器地址
			PTZ_SetDecoderAddress : "PTZ_SetDecoderAddress",
			PTZ_GetSpeed : "PTZ_GetSpeed", // - PTZ移动的速度
			PTZ_SetSpeed : "PTZ_SetSpeed",
			PTZ_StartTurnLeft : "PTZ_StartTurnLeft", // - 向左转（动）
			PTZ_StartTurnRight : "PTZ_StartTurnRight", // - 向右转
			PTZ_StartTurnUp : "PTZ_StartTurnUp", // - 向上转
			PTZ_StartTurnDown : "PTZ_StartTurnDown", // - 向下转
			PTZ_StopTurn : "PTZ_StopTurn", // - 停止转动
			PTZ_AugmentAperture : "PTZ_AugmentAperture", // - 增大光圈
			PTZ_MinishAperture : "PTZ_MinishAperture", // - 减小光圈
			PTZ_StopApertureZoom : "PTZ_StopApertureZoom", // - 停止光圈缩放
			PTZ_MakeFocusFar : "PTZ_MakeFocusFar", // - 推远焦点
			PTZ_MakeFocusNear : "PTZ_MakeFocusNear", // - 拉近焦点
			PTZ_StopFocusMove : "PTZ_StopFocusMove", // - 停止焦点调整
			PTZ_ZoomOutPicture : "PTZ_ZoomOutPicture", // - 缩小图像
			PTZ_ZoomInPicture : "PTZ_ZoomInPicture", // - 放大图像
			PTZ_StopPictureZoom : "PTZ_StopPictureZoom", // - 停止图像缩放
			PTZ_StartSecondaryDev : "PTZ_StartSecondaryDev", // - 开启辅助设备
			PTZ_StopSecondaryDev : "PTZ_StopSecondaryDev", // - 关闭辅助设备
			PTZ_MoveToPresetPos : "PTZ_MoveToPresetPos", // - 前往预置位
			PTZ_SetPresetPos : "PTZ_SetPresetPos", // - 设置预置位
						
			/* 输入报警命令 */
			IDL_GetSupportedAlertInModeSets : "IDL_GetSupportedAlertInModeSets", // - 支持的报警触发模式
			IDL_GetAlertInMode : "IDL_GetAlertInMode", // - 报警触发模式
			IDL_SetAlertInMode : "IDL_SetAlertInMode",
			IDL_GetAlertInDuration : "IDL_GetAlertInDuration", // - 报警间隔
			IDL_SetAlertInDuration : "IDL_SetAlertInDuration",
			IDL_GetAlertInStatus : "IDL_GetAlertInStatus", // - 报警输入状态
			
			/* 输出报警命令 */
			ODL_GetDefaultConnectStatus : "ODL_GetDefaultConnectStatus", // - 报警输出默认状态
			ODL_GetConnectStatus : "ODL_GetConnectStatus", // - 报警输出当前状态
			ODL_GetAliasConnect : "ODL_GetAliasConnect", // - 接通动作别名
			ODL_SetAliasConnect : "ODL_SetAliasConnect",
			ODL_GetAliasBreak : "ODL_GetAliasBreak", // - 断开动作别名
			ODL_SetAliasBreak : "ODL_SetAliasBreak",
			ODL_SetStatus : "ODL_SetStatus", // - 控制报警输出状态
			
			/* 前端存储配置 */
			SG_GetRecordTimeSpan : "SG_GetRecordTimeSpan", // - 录像持续时间
			SG_SetRecordTimeSpan : "SG_SetRecordTimeSpan",
			SG_GetDiskStatus : "SG_GetDiskStatus", // - 磁盘状态
			SG_GetCoverOldRecordFile : "SG_GetCoverOldRecordFile", // - 磁盘空间不足时是否覆盖旧文件
			SG_SetCoverOldRecordFile : "SG_SetCoverOldRecordFile",
			SG_GetDiskInsufficientSpace : "SG_GetDiskInsufficientSpace", // - 磁盘空间不足时的剩余空间门限
			SG_SetDiskInsufficientSpace : "SG_SetDiskInsufficientSpace",
			SG_GetRecordFileReserveDays : "SG_GetRecordFileReserveDays", // - 录像文件保留天数
			SG_SetRecordFileReserveDays : "SG_SetRecordFileReserveDays",
			SG_GetFileSystemType : "SG_GetFileSystemType", // - 文件系统类型
			/* 前端存储控制 */
			SG_GetDiskInfo : "SG_GetDiskInfo", // - 获取磁盘信息
			SG_StartInitFileSystem : "SG_StartInitFileSystem", // - 开始初始化文件系统
			SG_QueryInitFileSystemProgress : "SG_QueryInitFileSystemProgress", // - 查询初始化文件系统进度
			SG_ManualStart : "SG_ManualStart", // - 手动启动存储
			SG_ManualStop : "SG_ManualStop", // - 手动停止存储
			SG_CEFSDownLoadFile : "SG_CEFSDownLoadFile", // - 下载CEFS文件系统的录像
			SG_CEFSDownLoadSnapshot : "SG_CEFSDownLoadSnapshot", // - 下载CEFS文件系统的图片
			SG_CEFSQueryFiles : "SG_CEFSQueryFiles", // - 查询CEFS文件系统录像或图片文件
			
			/* 平台存储配置 */
			SC_GetRecordTimeSpan : "SC_GetRecordTimeSpan", // - 录像时间
			SC_SetRecordTimeSpan : "SC_SetRecordTimeSpan",
			SC_GetDiskStatus : "SC_GetDiskStatus", // - 磁盘状态
			SC_GetCoverOldRecordFile : "SC_GetCoverOldRecordFile", // - 磁盘满时是否覆盖旧文件
			SC_SetCoverOldRecordFile : "SC_SetCoverOldRecordFile",
			SC_GetRecordFileReserveDays : "SC_GetRecordFileReserveDays", // - 录像文件保存天数
			SC_SetRecordFileReserveDays : "SC_SetRecordFileReserveDays",
			SC_GetGPSReserveDays : "SC_GetGPSReserveDays", // - GPS数据保存天数
			SC_SetGPSReserveDays : "SC_SetGPSReserveDays",
			SC_GetEnableGPSDataStorage : "SC_GetEnableGPSDataStorage", // - 是否使能GPS存储
			SC_SetEnableGPSDataStorage : "SC_SetEnableGPSDataStorage",
			SC_GetSnapshotReserveDays : "SC_GetSnapshotReserveDays", // - 抓拍文件保存天数
			SC_SetSnapshotReserveDays : "SC_SetSnapshotReserveDays",
			/* 平台存储控制 */
			SC_GetDiskInfo : "SC_GetDiskInfo", // - 获取磁盘信息
			SC_ManualStart : "SC_ManualStart", // - 手动启动存储
			SC_ManualStop : "SC_ManualStop", // - 手动停止存储
			SC_QueryFiles : "SC_QueryFiles", // - 查询录像/图片文件
			SC_DelFiles : "SC_DelFiles", // - 删除录像/图片文件
			SC_DownLoadFile : "SC_DownLoadFile", // - 下载文件（图片）
			SC_QueryGPSData : "SC_QueryGPSData" // - 查询历史GPS数据
		},
		
        end : true 
    },

    end : true
};
/* ------------------------------------------------------------------------------------------------------------- */
/*
---
[Public]
fn: NPPUtils 
desc: 初始化操作对象
time: 2013.09.03
author:
    - zenghx
    - huzw
remark:
    - 包含自有的属性和方法函数对象
...
*/
var NPPUtils = 
{
    /*
    ---
    [Public]
    fn: NPPUtils.Hash
    desc: 哈希表对象
    time: 2013.09.03
    author:
        - zenghx
        - huzw
    remark:
        - [Common Struct Method]
    ...
    */
    Hash : function () 
    {
        var size = 0;
        var entry = new Object();
        this.set = function (key, value) 
        {
            if (typeof key == "undefined" || key == null || key == "") {
                return false;
            }
            if (!this.containsKey(key)) {
                size++;
            }
            entry[key] = typeof value != "undefined" ? value : null;
        };
        this.unset = function (key) 
        {
            if (this.containsKey(key)) {
                this.remove(key);
            }
        };
        this.get = function (key) 
        {
            return this.containsKey(key) ? entry[key] : null;
        };
        this.remove = function (key) 
        {
            if (this.containsKey(key) && (delete entry[key])) {
                size--;
            }
        };
        this.containsKey = function (key)
        {
            return (key in entry);
        };
        this.containsValue = function (value)
        {
            for (var prop in entry) {
                if (entry[prop] == value) {
                    return true;
                }
            }
            return false;
        };
        this.keys = function () 
        {
            var _keys = new Array();
            for (var prop in entry) {
                _keys.push(prop);
            }
            return _keys;
        };
        this.values = function () 
        {
            var _values = new Array();
            for (var prop in entry) {
                _values.push(entry[prop]);
            }
            return _values;
        };
        this.size = function () 
        {
            return size || 0;
        };
        this.clear = function () 
        {
            size = 0;
            entry = new Object();
        };
        this.inf = this._self = function () 
        {
            return entry;
        };
        this.each = function (iterator, content) 
        {
            var iterator = iterator || function () {};
            var content = content || this;
            var i = 0;
            for (var prop in entry) {
                var item = {
                    key : prop, value : entry[prop] 
                };
                if (iterator.call(content, item, i++)) {
					break;	
				}
            }
            i = 0;
        };
		this.any = function (iterator, content) 
		{
			var iterator = iterator || function () {};
            var content = content || this;
			var i = 0;
			for (var prop in entry) {
				var item = {
                    key : prop, value : entry[prop] 
                };
				if (iterator.call(content, item, i++)) {
					return true;
					break;	
				}
			};
			return false;
		};
		this.all = function (iterator, content) 
		{
			var iterator = iterator || function () {};
            var content = content || this;
			var i = 0;
			for (var prop in entry) {
				var item = {
                    key : prop, value : entry[prop] 
                };
				if (!iterator.call(content, item, i++)) {
					return false;
					break;	
				}
			};
			return true;
		};
    },
    Array : 
    {
        // - 在数组中查找
        indexOf : function (array, value, from) 
        {
            try 
            {
                if (array && array.constructor == Array) 
                {
                    var from = Number(from) || 0;
                    from = ( from < 0 ? Math.ceil(from) : Math.floor(from) );
                    if ( from < 0 ) {
                        from += array.length;
                    }
                    var found = false;
                    for (; from < array.length; from++) {
                        if (from in array && array[from] === value) {
                            found = true;
                            break;
                        }
                    }
                    return found ? from : - 1;
                }
                else {
                    return - 1;
                }
            }
            catch (e) {
                return - 1;
            }
        },
		// - 查找最后匹配索引
		lastIndexOf : function (array, value, from)
		{
			try
			{
				if (array && array.constructor == Array) 
                {
                    var from = Number( from ) || 0;
                    from = ( from < 0 ? Math.ceil( from ) : Math.floor( from ) );
					
					if ( isNaN( from ) )
					{
						from = array.length - 1;
					}
					else
					{
						if (from < 0) 
							 from += array.length; 
						else if (from >= len) 
							 from = array.length - 1; 
					}
					
                    var found = false;
					for (; from > -1; from--) 
					{ 
					 	if (from in array && array[from] === value) 
						{
                            found = true;
                            break;
						} 
					}  
                  	
                    return found ? from : - 1;
                }
                else {
                    return - 1;
                }
			}
			catch (e) {
				return -1;	
			}
		},
        end : true 
    },
	/*
    ---
    [Public]
    fn: NPPUtils.Timer
    desc: 定时器对象
    time: 2013.09.24
    author:
        - huzw
    remark:
        - [Common Timer]
    ...
    */
	Timer :
	{
		interval : 100, count : 0, timer : null, events: null,

        Start : function () 
		{
			try
			{
				var fn = "NPPUtils.Timer.Start";
				
				if (NPPUtils.Timer.timer == null)
				{
					NPPUtils.Timer.timer = setInterval
					(
						NPPUtils.Timer.Call, 
						NPPUtils.Timer.interval
					);
				}
				
				return true;
			}
			catch(e) {
				if (NPPUtils.Log)
				{
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);	
				}
				return false;	
			}			
        },

        Stop : function () 
		{
			try
			{
				var fn = "NPPUtils.Timer.Stop";
				
				if (NPPUtils.Timer.timer != null)
				{
					clearInterval(NPPUtils.Timer.timer);
					NPPUtils.Timer.timer = null;
					NPPUtils.Timer.events = new NPPUtils.Hash();
					NPPUtils.Timer.count = 0;
				}
				
				return true;
			}
			catch(e) {
				if (NPPUtils.Log)
				{
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);	
				}
				return false;	
			}            
        },
		
		Set : function (ev, cb) 
		{
			try
			{
				var fn = "NPPUtils.Timer.Set";
				
				if (NPPUtils.Timer.events == null || !NPPUtils.Timer.events instanceof NPPUtils.Hash)
				{
					NPPUtils.Timer.events = new NPPUtils.Hash();
				}
				
				if (typeof NPPUtils.Timer.events == "undefined") 
				{
					if (NPPUtils.Log) NPPUtils.Log(fn, "NPPUtils.Timer.events undefined");
					return false;
				}
	
				if (typeof cb != "object" || typeof cb.name != "string" || typeof cb.fu != "function") 
				{
					if (NPPUtils.Log) NPPUtils.Log(fn, "cb struct error");
					return false;
				}
	
				if (!NPPUtils.Timer.events.get(ev)) 
				{
					NPPUtils.Timer.events.set(ev, new NPPUtils.Hash());
				}
				if (NPPUtils.Timer.events.get(ev)) 
				{
					NPPUtils.Timer.events.get(ev).set
					(
						cb.name, 
						{
							name : cb.name,
							fu : cb.fu,
							interval : cb.interval
						}
					);
				}
				
				return true;
			}
			catch(e) {
				if (NPPUtils.Log)
				{
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);	
				}
				return false;	
			}
        },
		ContainsKey : function (ev, cbName)
		{
			try
			{
				var fn = "NPPUtils.Timer.ContainsKey";
				
				if (NPPUtils.Timer.events == null || !NPPUtils.Timer.events instanceof NPPUtils.Hash)
				{
					NPPUtils.Timer.events = new NPPUtils.Hash();
				}
				
				if (typeof NPPUtils.Timer.events == "undefined") 
				{
					if (NPPUtils.Log) NPPUtils.Log(fn, "NPPUtils.Timer.events undefined");
					return false;
				}
	
				if (!NPPUtils.Timer.events.get(ev) 
					|| !cbName || !NPPUtils.Timer.events.get(ev).get(cbName)) 
				{
					if (NPPUtils.Log) NPPUtils.Log(fn, "ev or cbName not exists");
					return false;
				}
				
				return true;
			}
			catch(e) {
				if (NPPUtils.Log)
				{
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);	
				}
				return false;	
			}
		},
		UnSet : function (ev, cbName) 
		{
			try
			{
            	var fn = "NPPUtils.Timer.UnSet";
				
				if (typeof NPPUtils.Timer.events == "undefined") 
				{
					if (NPPUtils.Log) NPPUtils.Log(fn, "NPPUtils.Timer.events undefined");
					return false;
				}
	
				if (!NPPUtils.Timer.events.get(ev)) 
				{
					if (NPPUtils.Log) NPPUtils.Log(fn, "ev undefined");
					return false;
				}
	
				if (typeof cbName != "string") 
				{
					if (NPPUtils.Log) NPPUtils.Log(fn, "cb name undefined");
					return false;
				}
	
				NPPUtils.Timer.events.get(ev).unset(cbName);
				return true;
			}
			catch(e) {
				if (NPPUtils.Log)
				{
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);	
				}
				return false;	
			}
        },
		
		Call : function()
		{
			try
			{
            	var fn = "NPPUtils.Timer.Call";
				
				NPPUtils.Timer.count++;
				
				NPPUtils.Timer.events.each
				(
					function (item) 
					{
						var ev = item.value;
						if (ev && typeof ev.each == "function") 
						{
							ev.each
							(
								function (evItem) 
								{
									var evItemNode = evItem.value;
									if ((NPPUtils.Timer.count * NPPUtils.Timer.interval) % evItemNode.interval == 0) 
									{
										if (typeof evItemNode.fu == "function") 
										{
											evItemNode.fu();
										}
									}
								}
							)
						}
					}
				);
				
				if (NPPUtils.Timer.count == 100000000) 
				{
					NPPUtils.Timer.count = 0;
				}
				 
				return true;
			}
			catch(e) {
				if (NPPUtils.Log)
				{
					NPPUtils.Log(fn, "excp error = " + e.message + "::" + e.name);	
				}
				return false;	
			}
		},
		
		end : true
	},
    /*
    ---
    deac: 内部调试对象别名
    ...
    */
    Log : function () {}, /*
    *    函数名        ：DateFormat
    *    函数功能    ：格式化返回当前客户端系统时间  
    *    备注        ：无
    *    作者        ：Lingsen
    *    时间        ：2010年11月26日 
    *    返回值        ：无
    *    参数说明    ：1个参数.  
    *  string mask 时间样式
    */
    DateFormat : function (mask, d) 
    {
        if (typeof d == "undefined" || !d instanceof Date) {
            d = new Date();
        }
        if (typeof mask == "undefined" || mask == "" || mask == null) {
            mask = "yyyy-MM-dd HH:mm:ss";
        }
        return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|[m|M]{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, 
        function ($0) 
        {
            var _zeroize = NPPUtils.Zeroize || function (_me) 
            {
                return _me;
            };
            switch ($0) 
            {
                case 'd':
                    return d.getDate();
                case 'dd':
                    return _zeroize(d.getDate());
                case 'ddd':
                    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][d.getDay()];
                case 'dddd':
                    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
                case 'M':
                    return d.getMonth() + 1;
                case 'MM':
                    return _zeroize(d.getMonth() + 1);
                case 'MMM':
                    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
                case 'MMMM':
                    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
                    'October', 'November', 'December'][d.getMonth()];
                case 'yy':
                    return String(d.getFullYear()).substr(2);
                case 'yyyy':
                    return d.getFullYear();
                case 'h':
                    return d.getHours() % 12 || 12;
                case 'hh':
                    return _zeroize(d.getHours() % 12 || 12);
                case 'H':
                    return d.getHours();
                case 'HH':
                    return _zeroize(d.getHours());
                case 'm':
                    return d.getMinutes();
                case 'mm':
                    return _zeroize(d.getMinutes());
                case 's':
                    return d.getSeconds();
                case 'ss':
                    return _zeroize(d.getSeconds());
                case 'l':
                    return _zeroize(d.getMilliseconds(), 3);
                case 'L':
                    var m = d.getMilliseconds();
                    if (m > 99) {
                        m = Math.round(m  / 10);
                    }
                    return _zeroize(m);
                case 'tt':
                    return d.getHours() < 12 ? 'am' : 'pm';
                case 'TT':
                    return d.getHours() < 12 ? 'AM' : 'PM';
                case 'Z':
                    return d.toUTCString().match(/[A-Z]+$/);
                default:
                    return $0.substr(1, $0.length - 2);
            }
        });
    },
    GetDateTimeUTCSeconds : function (d) 
    {
        if (typeof d == "undefined" || !d instanceof Date) {
            d = new Date();
        }
        return d.getTime()  / 1000;
    },
    /* 标准的时间字符串转为时间戳 */
    DTStrToTimestamp : function (dateStr) 
    {
        dateStr = dateStr.strip();
        var d = new Date();
        var patn = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29)) (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$/;
        if (patn.test(dateStr)) 
        {
            return new Date(dateStr.substr(0, 4), (parseInt(dateStr.substr(5, 2), 10) - 1), dateStr.substr(8, 
            2), dateStr.substr(11, 2), dateStr.substr(14, 2), dateStr.substr(17, 2));
        }
        else {
            return d;
        }
    },
    /*
    *    函数名        ：Zeroize
    *    函数功能    ：根据长度左补零
    *    备注        ：无
    *    作者        ：Lingsen
    *    时间        ：2010年11月26日 
    *    返回值        ：无
    *    参数说明    ：2个参数 
    *  string value     需要补零的值 
    *  number length     需要补零的值的长度
    */
    Zeroize : function (value, length) 
    {
        if (!length) {
            length = 2;
        }
        value = String(value);
        for (var i = 0, zeros = ''; i < (length - value.length); i++) {
            zeros += '0';
        }
        return zeros + value;
    },
    NetToHost16 : function (u) 
    {
        u = parseInt(u, 10);
        return ((((u) << 8) & 0xFF00) | ((u) >> 8));
    },
    NetToHost32 : function (u) 
    {
        u = parseInt(u, 10);
        return (((u) << 24) | (((u) << 8) & 0x00FF0000) | (((u) >> 8) & 0x0000FF00) | (0x000000FF & ((u) >> 24)));
    },
    XML : function (type, xmlFile) 
    {
        try 
        {
			var xmlDoc,
				isLoadFile = typeof type != "undefined" && type == "path" ? true : false;
			
			if (isLoadFile) {
				if (window.XMLHttpRequest) {
					var xhr = new window.XMLHttpRequest();
					xhr.open("GET", xmlFile, false);
					xhr.send();
					xmlDoc = xhr.responseXML;
				}
				else if (document.implementation && document.implementation.craeteDocument) {
					xmlDoc = document.implementation.createDocument('', '', null);
					xmlDoc.load(xmlFile); 
				}
				else {
					xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
					xmlDoc.async = false;
					xmlDoc.load(xmlFile);
				}
			}
			else {
				if (window.DOMParser) {
					var parser = new window.DOMParser();
					xmlDoc = parser.parseFromString(xmlFile, "text/xml");
				}
				else {
					xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
					xmlDoc.async = false;
					xmlDoc.loadXML(xmlFile);
				}
			}
            return xmlDoc || null;
        }
        catch (e) { 
			return null;
		}
    },
    /*
    *    对象名        ：CheckByteLength
    *    功能        ：验证字串长度  
    *    备注        ：无
    *    作者        ：Lingsen
    *    时间        ：2011年04月10日 
    */
    CheckByteLength : function (value, minlen, maxlen) 
    {
        if (!value) {
            value = "";
        }
        var l = value.length;
        var blen = 0;
        for (i = 0; i < l; i++) {
            if ((value.charCodeAt(i) & 0xff00) != 0) {
                blen++;
            }
            blen++;
        }
        if (blen > maxlen || blen < minlen) {
            return false;
        }
        return true;
    },
    /*
    ---
    fn: GetStringRealLength
    time: 2013.01.30
    author: 
    - huzw
    returns:
    - succ length of source string
    params:
    - source(string) 源中英文混合字符串
    ...
    */
    GetStringRealLength : function (source) 
    {
        try 
        {
            var fn = "NPPUtils.GetStringRealLength";
            var source = source || "";
            var l = source.length;
            var blen = 0;
            for (i = 0; i < l; i++) {
                blen++;
                if ((source.charCodeAt(i) & 0xff00) != 0) {
                    blen++;
                }
            }
            return blen;
        }
        catch (e) 
        {
            if (NPPUtils.Log) {
                NPPUtils.Log(fn, "exception, error = " + e.name + "::" + e.message);
            }
            return "";
        }
    },
    /*
    *    对象名        ：Regexs
    *    功能        ：预定义正则式,   
    *    备注        ：无
    *    作者        ：Lingsen
    *    时间        ：2010年08月10日 
    */
    Regexs : 
    {
        "uint" : /^[0-9]*$/, "domain" : "^((https|http|ftp|rtsp|mms)?://)" + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" /*
        ftp的user@ */
         + "(([0-9]{1,3}\.){3}[0-9]{1,3}" /* IP形式的URL- 199.194.52.184 */
         + "|" /* 允许IP和DOMAIN（域名）*/
         + "([0-9a-z_!~*'()-]+\.)*" /* 域名- www. */
         + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." /* 二级域名 */
         + "[a-z]{2,6})" /* first level domain- .com or .museum */
         + "(:[0-9]{1,5})?" /* 端口- :80 */
         + "((/?)|" /* a slash isn't required if there is no file name */
         + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$", guid : /^0x[a-z0-9]{32}$/i, "puid" : /^[A-Za-z0-9]+$/i, 
        // puid reg
        strip : /(^\s*)|(\s*$)/g, end : true 
    },
	UnicodetoUTF8 : function (s) 
	{
		var c, d = "";
		for (var i = 0; i < s.length; i++) 
		{
			c = s.charCodeAt(i);
			if (c <= 0x7f) {
				d += s.charAt(i);
			}
			else if (c >= 0x80 && c <= 0x7ff) 
			{
				d += String.fromCharCode(((c >> 6) & 0x1f) | 0xc0);
				d += String.fromCharCode((c & 0x3f) | 0x80);
			}
			else 
			{
				d += String.fromCharCode((c >> 12) | 0xe0);
				d += String.fromCharCode(((c >> 6) & 0x3f) | 0x80);
				d += String.fromCharCode((c & 0x3f) | 0x80);
			}
		}
		return d;
	},
	UTF8toUnicode : function (s) 
	{
		var c, d = "", flag = 0, tmp;
		for (var i = 0; i < s.length; i++) 
		{
			c = s.charCodeAt(i);
			if (flag == 0) 
			{
				if ((c & 0xe0) == 0xe0) {
					flag = 2;
					tmp = (c & 0x0f) << 12;
				}
				else if ((c & 0xc0) == 0xc0) {
					flag = 1;
					tmp = (c & 0x1f) << 6;
				}
				else if ((c & 0x80) == 0) {
					d += s.charAt(i);
				}
				else {
					flag = 0;
				}
			}
			else if (flag == 1) {
				flag = 0;
				d += String.fromCharCode(tmp | (c & 0x3f));
			}
			else if (flag == 2) {
				flag = 3;
				tmp |= (c & 0x3f) << 6;
			}
			else if (flag == 3) {
				flag = 0;
				d += String.fromCharCode(tmp | (c & 0x3f));
			}
			else {
				flag = 0;
			}
		}
		return d;
	},
	UnicodetoGB2312 : function (str) 
	{
		return unescape(str.replace(/\\u/gi, '%u'));
	},
	GB2312toUnicode : function (str) 
	{
		return escape(str).toLocaleLowerCase().replace(/%u/gi, '\\u');
	},
    end : true
};
/* ------------------------------------------------------------------------------------------------------------- */
/*
---
fn : NrcapError
desc : 错误码对象
remark :
	- 语言风格上层需设定
...
*/
var NrcapError =
{
	language : "zh_CN", // - zh_CN | en
	
	NRCAP_SUCCESS : 0, // - 操作成功 
	NRCAP_FAILED : -1, // - 操作失败
	NRCAP_ERROR : 0x0201, // - 发生错误
	NRCAP_ERROR_THREAD : 0x0203, // - 抛出异常错误
	NRCAP_ERROR_NC_NOT_LAST_VERSION : 0x0300, // - NC插件不是当前匹配版本
	NRCAP_ERROR_INITIALIZED : 0x0301, // - NC插件已初始化
	NRCAP_ERROR_UNINITIALIZED : 0x0302, // - NC插件未初始化 
	NRCAP_ERROR_INIT_NRCAPPLUG_FAILED : 0x0304, // - SELF插件初始化失败
	NRCAP_ERROR_INIT_NRCAPPLUG_THREAD : 0x0305, // - SELF插件初始化抛出异常
	NRCAP_ERROR_UNLOAD_NRCAPPLUG_FAILED : 0x0307, // - SELF插件卸载失败
	NRCAP_ERROR_LOADPLUG_NC : 0x0309, // - NC未加载 
	NRCAP_ERROR_LOADPLUG_WND : 0x030B, // - WND未加载 
	NRCAP_ERROR_LOADPLUG_WA : 0x030C, // - WA未加载
	NRCAP_ERROR_CONNECT_FAILED : 0x030D, // - 建立连接失败
	NRCAP_ERROR_CONNECTIONID_ALREADY : 0x030F, // - 连接已经存在
	NRCAP_ERROR_CONNECTING : 0x0310, // - 正在建立连接中
	NRCAP_ERROR_CONNECTED : 0x0311, // - 连接已经建立
	NRCAP_ERROR_INTERFACE_UNDEFINED : 0x0315, // - 接口未定义错误
	
	NRCAP_ERROR_CONNECTID_ERROR : 0x0320, // - connectId错误
	NRCAP_ERROR_PUID_ERROR : 0x0321, // - PUID错误
	NRCAP_ERROR_CSU_PUID_ERROR : 0x0322, // - 中心存储器PUID错误
	NRCAP_ERROR_INDEX_ERROR : 0x0323, // - 索引错误
	NRCAP_ERROR_INIT_WINDOW_FAILED : 0x0325, // - 初始化窗口失败
	NRCAP_ERROR_WINDOW_NOTEXIST : 0x0327, // - 视频窗口不存在
	NRCAP_ERROR_PLAYVIDEO_FAILED : 0x0329, // - 播放失败
	NRCAP_ERROR_WINDOW_NOPLAY : 0x032A,	// - 窗口没有播放
	NRCAP_ERROR_PU_OFFLINE : 0x032C, // - 设备不在线
	NRCAP_ERROR_HANDLE_NOTEXIST : 0x032D, // - 资源句柄不存在
	NRCAP_ERROR_HANDLE_ERROR : 0x032F, // - 资源句柄错误
	NRCAP_ERROR_CALLTALK_EXISTED : 0x0330, // - 喊话或对讲已经存在
	NRCAP_ERROR_CALLTALK_INCOMPATIBLE : 0x0331, // - 喊话或对讲互斥存在
	NRCAP_ERROR_CALLTALK_OCCUPIED : 0x0333, // - 音频输出资源被占用
	NRCAP_ERROR_DOWNLOAD_EXISTED : 0x0335, // - 下载已经存在
	NRCAP_ERROR_PUDETECTSTARTUP_FAILED : 0x0337, // - 启动设备搜索失败
	NRCAP_ERROR_PUDETECTGETPULIST_FAILED : 0x0339, // - 搜索设备失败
	NRCAP_ERROR_PUDETECTCLEANUP_FAILED : 0x033B, // - 关闭设备搜索失败
	NRCAP_ERROR_RECORDQR_STARTUP_FAILED : 0x033D, // 外接磁盘模块未加载
	
	// - Nrcap7错误定义
	NRCAP_ERROR_NRCAP7_UNDEFINE : 0xFFFF, // - 未定义错误
	NRCAP_ERROR_NRCAP7_INITIALIZED : 0x0001, // - 已初始化
	NRCAP_ERROR_NRCAP7_UNINITIALIZED : 0x0002, // - 未初始化
	 
	// - 前端板卡返回的错误码
	NRCAP_ERROR_CONSISTENT : 0x1801, // - 设置值与实际值不匹配
	NRCAP_ERROR_UNSUPPORT : 0x1802, // - 属性不支持
	NRCAP_ERROR_READ : 0x1803, // - 没有读权限或者不支持读操作
	NRCAP_ERROR_AUTHORIZE : 0x1804, // - 没有控制权限
	NRCAP_ERROR_OVERLAP : 0x1805, // 不支持交叠，覆盖前面操作
	NRCAP_ERROR_OVERFLOW : 0x1806, // - 资源耗尽，操作失败
	NRCAP_ERROR_INVALID_RES : 0x1807, // - 非法的资源
	NRCAP_ERROR_INVALID_PARAM : 0x1808, // - 非法的参数（属性值）
	NRCAP_ERROR_INVALID_FORMAT : 0x1809, // - 非法的消息体格式
	
	// - 网元返回的错误码
	NRCAP_NU_ERROR_FORMAT : 0x2201, // - 错误的消息体格式
	NRCAP_NU_ERROR_PARAM : 0x2202, // - 错误的参数（属性值）
	NRCAP_NU_ERROR_UNSUPPORTOPERATION : 0x2203, // - 不支持的操作
	NRCAP_NU_ERROR_DESTINATION : 0x2204, // - 目标鉴权失败
	NRCAP_NU_ERROR_PRIORITY : 0x2205, // - 优先级鉴权失败
	NRCAP_NU_ERROR_EPID : 0x2206, // - EPID鉴权失败
	NRCAP_NU_ERROR_NOOPTPERMISSION : 0x2207, // - 操作鉴权失败
	NRCAP_NU_ERROR_NORESPERMISSION : 0x2208, // - 资源鉴权失败
	NRCAP_NU_ERROR_TIMEOUT : 0x2209, // - 命令超时
	NRCAP_NU_ERROR_ROUTEFAILED : 0x220A, // - 路由失败
	NRCAP_NU_ERROR_NOOBJPERMISSION : 0x2210, // - 没有对象操作权限
	NRCAP_NU_ERROR_OBJNOTEXIST : 0x2211, // - 对象不存在
	NRCAP_NU_ERROR_OBJALREADYEXIST : 0x2212, // - 对象已存在
	NRCAP_NU_ERROR_USERFULL : 0x2213, // - 超过支持的最大用户数
	NRCAP_NU_ERROR_USEROPTOVERFLOW : 0x2214, // - 目标用户支持的操作集过大
	NRCAP_NU_ERROR_TOKENNOTEXSIT : 0x2220, // - 请求的令牌不存在
	NRCAP_NU_ERROR_NOVALIDDISPATCHER : 0x2221, // - 没有可用的分发单元
	NRCAP_NU_ERROR_AUDIO_CHANNEL_OCCUPY : 0x2222, // - 音频输出通道已被占用
	NRCAP_NU_ERROR_INVALIDRES : 0x2230, // - 非法的资源
	NRCAP_NU_ERROR_STREAMOVERLOADED : 0x2231, // - 超过最大的流转发负荷
	
	// - 命令通道返回错误码
	NRCAP_ERROR_SOCKETCONNECT : 0x5FFE, // - 地址不可达
	NRCAP_ERROR_VERIFY_USERNOTEXIST : 0x5ED3, // - 用户名或EPID不存在
	NRCAP_ERROR_VERIFY_PSWERROR: 0x5ECE, // - 密码错误
	NRCAP_ERROR_VERIFY_ROUTEFAILED : 0x5ECC, // - 路由失败
	NRCAP_ERROR_VERIFY_REDIRECTCUIFAILED : 0x5E08, // - 没有支持重定向的用户接入服务
	NRCAP_ERROR_SYSMICROPHONE_FAILED: 0x5C00, // - 打开系统麦克风失败
	
	// - 数据通道返回错误码
    NRCAP_ERROR_CONNECT_TIMEOUT : 0x6FFB, // - 连接超时
	 
	Detail : function (code, mode)
	{
		try
		{
			var fn = "NrcapError.Detail";
			var detail = "";
			
			switch (Number(code))
			{
				case this.NRCAP_SUCCESS:
					detail = this.language == "zh_CN" ? "操作成功" : "Operator Success";
					break;
				case this.NRCAP_FAILED:
					detail = this.language == "zh_CN" ? "操作失败" : "Operator Failed";
					break;
				case this.NRCAP_ERROR:
					detail = this.language == "zh_CN" ? "发生错误" : "Operator Error";
					break;
				case this.NRCAP_ERROR_THREAD:
					detail = this.language == "zh_CN" ? "抛出异常错误" : "Threading Error";
					break;
				case this.NRCAP_ERROR_NC_NOT_LAST_VERSION:
					detail = this.language == 'zh_CN' ? '已安装插件非当前匹配版本' : 'Not Match NC Plug-in Version';
					break;
				case this.NRCAP_ERROR_INITIALIZED:
					detail = this.language == "zh_CN" ? "NC插件已初始化" : "NC Plug-in Init Success";
					break;
				case this.NRCAP_ERROR_UNINITIALIZED:
					detail = this.language == "zh_CN" ? "NC插件未初始化" : "NC Plug-in Init Failed";
					break;
				case this.NRCAP_ERROR_INIT_NRCAPPLUG_FAILED:
					detail = this.language == "zh_CN" ? "Nrcap插件初始化失败" : "Nrcap Plug-in Init Failed";
					break;
				case this.NRCAP_ERROR_INIT_NRCAPPLUG_THREAD:
					detail = this.language == "zh_CN" ? "Nrcap插件初始化抛出异常" : "Nrcap Plug-in Init Threading Error";
					break;
				case this.NRCAP_ERROR_UNLOAD_NRCAPPLUG_FAILED:
					detail = this.language == "zh_CN" ? "Nrcap插件卸载失败" : "Nrcap Plug-in UnLoad Failed";
					break;
				case this.NRCAP_ERROR_LOADPLUG_NC:
					detail = this.language == "zh_CN" ? "NC未加载" : "NC Plug-in Load Failed";
					break;
				case this.NRCAP_ERROR_LOADPLUG_WND:
					detail = this.language == "zh_CN" ? "WND未加载" : "WND Plug-in Load Failed";
					break;
				case this.NRCAP_ERROR_LOADPLUG_WA:
					detail = this.language == "zh_CN" ? "WA未加载" : "WA Plug-in Load Failed";
					break;
				case this.NRCAP_ERROR_CONNECT_FAILED:
					detail = this.language == "zh_CN" ? "建立连接失败" : "Create Connection Failed";
					break;
				case this.NRCAP_ERROR_CONNECTIONID_ALREADY:
					detail = this.language == "zh_CN" ? "连接已经存在" : "Connection Existed";
					break;
				case this.NRCAP_ERROR_CONNECTING:
					detail = this.language == "zh_CN" ? "正在建立连接中" : "Building Connection";
					break;
				case this.NRCAP_ERROR_CONNECTED:
					detail = this.language == "zh_CN" ? "连接已建立" : "Connection has Built";
					break;
				case this.NRCAP_ERROR_INTERFACE_UNDEFINED:
					detail = this.language == "zh_CN" ? "接口未定义错误" : "Interface Undefined Error";
					break;
				case this.NRCAP_ERROR_CONNECTID_ERROR:
					detail = this.language == "zh_CN" ? "连接ID错误" : "ConnectId Error";
					break;
				case this.NRCAP_ERROR_PUID_ERROR:
					detail = this.language == "zh_CN" ? "设备PUID错误" : "PUID Error";
					break;
				case this.NRCAP_ERROR_CSU_PUID_ERROR:
					detail = this.language == "zh_CN" ? "中心存储器PUID错误" : "CSU PUID Error";
					break;
				case this.NRCAP_ERROR_INDEX_ERROR:
					detail = this.language == "zh_CN" ? "资源索引错误" : "Res Index Error";
					break;
				case this.NRCAP_ERROR_INIT_WINDOW_FAILED:
					detail = this.language == "zh_CN" ? "初始化窗口失败" : "Initialize Window Failed";
					break;
				case this.NRCAP_ERROR_WINDOW_NOTEXIST:
					detail = this.language == "zh_CN" ? "视频窗口不存在" : "Video Playing Window Not Exist";
					break;
				case this.NRCAP_ERROR_PLAYVIDEO_FAILED:
					detail = this.language == "zh_CN" ? "播放视频失败" : "PlayVideo Error";
					break;
				case this.NRCAP_ERROR_WINDOW_NOPLAY:
					detail = this.language == "zh_CN" ? "没有正在播放窗口" : "No Player Window";
					break;
				case this.NRCAP_ERROR_PU_OFFLINE:
					detail = this.language == "zh_CN" ? "设备不在线" : "PU offline";
					break;
				case this.NRCAP_ERROR_HANDLE_NOTEXIST:
					detail = this.language == "zh_CN" ? "资源句柄不存在或为空" : "Resource Handle No Exists Or Null";
					break;
				case this.NRCAP_ERROR_HANDLE_ERROR:
					detail = this.language == "zh_CN" ? "资源句柄出错" : "Resource Handle Error";
					break; 
				case this.NRCAP_ERROR_CALLTALK_EXISTED:
					detail = this.language == "zh_CN" ? "喊话或对讲已经存在" : "Call or Talk Has Existed";
					break;
				case this.NRCAP_ERROR_CALLTALK_INCOMPATIBLE:
					detail = this.language == "zh_CN" ? "喊话或对讲互斥存在" : "Call or Talk Should Incompatible";
					break;
				case this.NRCAP_ERROR_CALLTALK_OCCUPIED:
					detail = this.language == "zh_CN" ? "音频输出资源被占用" : "Output Audio Resource Has Occupied";
					break; 
				case this.NRCAP_ERROR_DOWNLOAD_EXISTED:
					detail = this.language == "zh_CN" ? "下载已经存在" : "Download Has Existed";
					break;
				case this.NRCAP_ERROR_PUDETECTSTARTUP_FAILED:
					detail = this.language == "zh_CN" ? "启动设备搜索失败" : "Start up pu detection failed";
					break;
				case this.NRCAP_ERROR_PUDETECTGETPULIST_FAILED:
					detail = this.language == "zh_CN" ? "搜索设备失败" : "Get detection pu list failed";
					break;
				case this.NRCAP_ERROR_PUDETECTCLEANUP_FAILED:
					detail = this.language == "zh_CN" ? "关闭设备搜索失败" : "Clean up pu detection failed";
					break;
				case this.NRCAP_ERROR_RECORDQR_STARTUP_FAILED:
					detail = this.language == "zh_CN" ? "外接磁盘模块未加载" : "RecordQR Startup Failed";
					break;
				
					
				case this.NRCAP_ERROR_SOCKETCONNECT:
					detail = this.language == "zh_CN" ? "地址端口不可达" : "Server ip/port inaccessible";
					break;	
				case this.NRCAP_ERROR_VERIFY_USERNOTEXIST:
					detail = this.language == "zh_CN" ? "用户名或EPID不存在" : "User or epid noexist";
					break;
				case this.NRCAP_ERROR_VERIFY_PSWERROR:
					detail = this.language == "zh_CN" ? "密码错误" : "Password Error";
					break;
				case this.NRCAP_ERROR_VERIFY_ROUTEFAILED:
					detail = this.language == "zh_CN" ? "路由失败" : "Routing failure";
					break;
				case this.NRCAP_ERROR_VERIFY_REDIRECTCUIFAILED :
					detail = this.language == "zh_CN" ? "没有支持重定向的用户接入服务" : "No Redirection CUI Server"; 
					break;
				case this.NRCAP_ERROR_SYSMICROPHONE_FAILED:
					detail = this.language == "zh_CN" ? "打开系统麦克风失败" : "Open System Microphone Failed";
					break;
					
				// - 前端板卡返回的错误码
				case this.NRCAP_ERROR_CONSISTENT :
					detail = this.language == "zh_CN" ? "设置值与实际值不匹配" : "Setting&Actual Value No Match"; 
					break;
				case this.NRCAP_ERROR_UNSUPPORT :
					detail = this.language == "zh_CN" ? "属性不支持" : "Attribute Unsupport"; 
					break;
				case this.NRCAP_ERROR_READ :
					detail = this.language == "zh_CN" ? "没有读权限或者不支持读操作" : "No Reading Permission or Unsupport Reading Operation"; 
					break;
				case this.NRCAP_ERROR_AUTHORIZE :
					detail = this.language == "zh_CN" ? "没有控制权限" : "No Control Authority"; 
					break;
				case this.NRCAP_ERROR_OVERLAP :
					detail = this.language == "zh_CN" ? "不支持交叠，覆盖前面操作" : "Does not support overlap, cover the front operation"; 
					break;
				case this.NRCAP_ERROR_OVERFLOW :
					detail = this.language == "zh_CN" ? "资源耗尽，操作失败" : "Resource Exhausted, Operating Failed"; 
					break;
				case this.NRCAP_ERROR_INVALID_RES :
					detail = this.language == "zh_CN" ? "非法的资源" : "Illegal resources"; 
					break;
				case this.NRCAP_ERROR_INVALID_PARAM :
					detail = this.language == "zh_CN" ? "非法的参数（属性值）" : "Illegal parameter(attribute value)"; 
					break;
				case this.NRCAP_ERROR_INVALID_FORMAT :
					detail = this.language == "zh_CN" ? "非法的消息体格式" : "Illegal message body format"; 
					break;
				
				// - 网元返回的错误码
				case this.NRCAP_NU_ERROR_FORMAT :
					detail = this.language == "zh_CN" ? "错误的消息体格式" : "Error message body format"; 
					break;					
				case this.NRCAP_NU_ERROR_PARAM :
					detail = this.language == "zh_CN" ? "错误的参数（属性值）" : "Error parameter(attribute value)"; 
					break;					
				case this.NRCAP_NU_ERROR_UNSUPPORTOPERATION :
					detail = this.language == "zh_CN" ? "不支持的操作" : "Nonsupport Operation"; 
					break;					
				case this.NRCAP_NU_ERROR_DESTINATION :
					detail = this.language == "zh_CN" ? "目标鉴权失败" : "Target authentication failure"; 
					break;					
				case this.NRCAP_NU_ERROR_PRIORITY :
					detail = this.language == "zh_CN" ? "优先级鉴权失败" : "Priority authentication failure"; 
					break;					
				case this.NRCAP_NU_ERROR_EPID :
					detail = this.language == "zh_CN" ? "EPID鉴权失败" : "EPID authentication failure"; 
					break;					
				case this.NRCAP_NU_ERROR_NOOPTPERMISSION :
					detail = this.language == "zh_CN" ? "操作鉴权失败" : "Operation authentication failure"; 
					break;					
				case this.NRCAP_NU_ERROR_NORESPERMISSION :
					detail = this.language == "zh_CN" ? "资源鉴权失败" : "Resources authentication failure"; 
					break;					
				case this.NRCAP_NU_ERROR_TIMEOUT :
					detail = this.language == "zh_CN" ? "命令超时" : "Command timeout"; 
					break;					
				case this.NRCAP_NU_ERROR_ROUTEFAILED :
					detail = this.language == "zh_CN" ? "路由失败" : "Routing failure"; 
					break;					
				case this.NRCAP_NU_ERROR_NOOBJPERMISSION :
					detail = this.language == "zh_CN" ? "没有对象操作权限" : "No object permissions"; 
					break;					
				case this.NRCAP_NU_ERROR_OBJNOTEXIST :
					detail = this.language == "zh_CN" ? "对象或资源不存在" : "Object or Resource Not Exist"; 
					break;					
				case this.NRCAP_NU_ERROR_OBJALREADYEXIST :
					detail = this.language == "zh_CN" ? "对象已存在" : "Object has existed"; 
					break;				
				case this.NRCAP_NU_ERROR_USERFULL :
					detail = this.language == "zh_CN" ? "超过支持的最大用户数" : "More than the maximum number of user support"; 
					break;				
				case this.NRCAP_NU_ERROR_USEROPTOVERFLOW :
					detail = this.language == "zh_CN" ? "目标用户支持的操作集过大" : "Target user support operation set is too large"; 
					break;				
				case this.NRCAP_NU_ERROR_TOKENNOTEXSIT :
					detail = this.language == "zh_CN" ? "请求的令牌不存在" : "Request token not exist"; 
					break;				
				case this.NRCAP_NU_ERROR_NOVALIDDISPATCHER :
					detail = this.language == "zh_CN" ? "没有可用的分发单元" : "No distribute unit available"; 
					break;
				case this.NRCAP_NU_ERROR_AUDIO_CHANNEL_OCCUPY :
					detail = this.language == "zh_CN" ? "音频输出通道已被占用" : "Audio output channel is occupied"; 
					break;				
				case this.NRCAP_NU_ERROR_INVALIDRES :
					detail = this.language == "zh_CN" ? "非法的资源" : "Illegal resources"; 
					break;				
				case this.NRCAP_NU_ERROR_STREAMOVERLOADED :
					detail = this.language == "zh_CN" ? "超过最大的流转发负荷" : "Exceeding the maximum flow forwarding load"; 
					break;
					
				default:
					detail = (this.language == "zh_CN" ? "发生错误（" + (code) + "）" : " error(code:" + (code) + ")");
					break;
			} 
			
			if (typeof mode != "undefined" && mode === true) 
			{
				this.logger(fn, "code -> " + code + ", detail -> " + detail);
			}
			return detail;
		}
		catch (e) {
			this.logger(fn, "excp error = " + e.message + "::" + e.name);
			return "";
		}
	},
	
	logger : function (fn, log)
	{
		if (typeof NPPUtils != "undefined")
		{
			if ((log||"")) NPPUtils.Log((fn || "__NrcapError__"), log);	
		}
		return true;
	},
	
	end: true
};

/* ------------------------------------------------------------------------------------------------------------- */

// - 注册一个_bind方法
if(Function.prototype && typeof Function.prototype._bind == "undefined") { 
	if(typeof Function.prototype.bind != "undefined") {
		Function.prototype._bind = Function.prototype.bind;
	}
	else {
		Function.prototype._bind = function() {
			try {  
				if(arguments.length <= 2 && arguments[0] === undefined) {
					return this;	
				}
				
				var _method = this,
					args = [];
			   
				for(var i = 0; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				
				// - 返回第一个参数（arguments[0]）
				var redirectObj = args.shift() || arguments[0];
				
				return function() {
					var _args = [],
						_arglen = arguments.length;
					while(_arglen--) {
						_args[_arglen] = arguments[_arglen];
					} 
					return _method.apply(redirectObj, args.concat(_args));
				};
			}
			catch(e) {
				return this;
			}
		};
	} 
}


// ========================================================================
// 	- MD5 code ---
// ========================================================================
var MD5 = {
	hexcase : 0,  /* hex output format. 0 - lowercase; 1 - uppercase        */
	b64pad  : "", /* base-64 pad character. "=" for strict RFC compliance   */
	chrsz   : 8,  /* bits per input character. 8 - ASCII; 16 - Unicode      */
	
	Hex_MD5:function (s)
	{
		return MD5.BinlToHex(MD5.Core_MD5(MD5.StrToBinl(s), s.length * MD5.chrsz));
	},
	
	B64_MD5:function(s){ return MD5.BinlToB64(MD5.Core_MD5(MD5.StrToBinl(s), s.length * MD5.chrsz));},
	Str_MD5:function(s){ return MD5.BinlToStr(MD5.Core_MD5(MD5.StrToBinl(s), s.length * MD5.chrsz));},
	Hex_HMac_MD5:function(key, data) { return MD5.BinlToHex(MD5.Core_HMac_MD5(key, data)); },
	B64_HMac_MD5:function(key, data) { return MD5.BinlToB64(MD5.core_HMac_MD5(key, data)); },
	Str_HMac_MD5:function(key, data) { return MD5.BinlToStr(MD5.core_HMac_MD5(key, data)); },
	
	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	MD5_VM_Test:function()
	{
	  return MD5.Hex_MD5("abc") + "==900150983cd24fb0d6963f7d28e17f72";
	},

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	Core_MD5:function(x, len)
	{
	  /* append padding */
		x[len >> 5] |= 0x80 << ((len) % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;
		
		var a =  1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d =  271733878;
		
		for(var i = 0,max = x.length; i < max; i += 16)
		{
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			
			a = MD5.MD5_FF(a, b, c, d, x[i+ 0], 7 , -680876936);
			d = MD5.MD5_FF(d, a, b, c, x[i+ 1], 12, -389564586);
			c = MD5.MD5_FF(c, d, a, b, x[i+ 2], 17,  606105819);
			b = MD5.MD5_FF(b, c, d, a, x[i+ 3], 22, -1044525330);
			a = MD5.MD5_FF(a, b, c, d, x[i+ 4], 7 , -176418897);
			d = MD5.MD5_FF(d, a, b, c, x[i+ 5], 12,  1200080426);
			c = MD5.MD5_FF(c, d, a, b, x[i+ 6], 17, -1473231341);
			b = MD5.MD5_FF(b, c, d, a, x[i+ 7], 22, -45705983);
			a = MD5.MD5_FF(a, b, c, d, x[i+ 8], 7 ,  1770035416);
			d = MD5.MD5_FF(d, a, b, c, x[i+ 9], 12, -1958414417);
			c = MD5.MD5_FF(c, d, a, b, x[i+10], 17, -42063);
			b = MD5.MD5_FF(b, c, d, a, x[i+11], 22, -1990404162);
			a = MD5.MD5_FF(a, b, c, d, x[i+12], 7 ,  1804603682);
			d = MD5.MD5_FF(d, a, b, c, x[i+13], 12, -40341101);
			c = MD5.MD5_FF(c, d, a, b, x[i+14], 17, -1502002290);
			b = MD5.MD5_FF(b, c, d, a, x[i+15], 22,  1236535329);
			
			a = MD5.MD5_GG(a, b, c, d, x[i+ 1], 5 , -165796510);
			d = MD5.MD5_GG(d, a, b, c, x[i+ 6], 9 , -1069501632);
			c = MD5.MD5_GG(c, d, a, b, x[i+11], 14,  643717713);
			b = MD5.MD5_GG(b, c, d, a, x[i+ 0], 20, -373897302);
			a = MD5.MD5_GG(a, b, c, d, x[i+ 5], 5 , -701558691);
			d = MD5.MD5_GG(d, a, b, c, x[i+10], 9 ,  38016083);
			c = MD5.MD5_GG(c, d, a, b, x[i+15], 14, -660478335);
			b = MD5.MD5_GG(b, c, d, a, x[i+ 4], 20, -405537848);
			a = MD5.MD5_GG(a, b, c, d, x[i+ 9], 5 ,  568446438);
			d = MD5.MD5_GG(d, a, b, c, x[i+14], 9 , -1019803690);
			c = MD5.MD5_GG(c, d, a, b, x[i+ 3], 14, -187363961);
			b = MD5.MD5_GG(b, c, d, a, x[i+ 8], 20,  1163531501);
			a = MD5.MD5_GG(a, b, c, d, x[i+13], 5 , -1444681467);
			d = MD5.MD5_GG(d, a, b, c, x[i+ 2], 9 , -51403784);
			c = MD5.MD5_GG(c, d, a, b, x[i+ 7], 14,  1735328473);
			b = MD5.MD5_GG(b, c, d, a, x[i+12], 20, -1926607734);
			
			a = MD5.MD5_HH(a, b, c, d, x[i+ 5], 4 , -378558);
			d = MD5.MD5_HH(d, a, b, c, x[i+ 8], 11, -2022574463);
			c = MD5.MD5_HH(c, d, a, b, x[i+11], 16,  1839030562);
			b = MD5.MD5_HH(b, c, d, a, x[i+14], 23, -35309556);
			a = MD5.MD5_HH(a, b, c, d, x[i+ 1], 4 , -1530992060);
			d = MD5.MD5_HH(d, a, b, c, x[i+ 4], 11,  1272893353);
			c = MD5.MD5_HH(c, d, a, b, x[i+ 7], 16, -155497632);
			b = MD5.MD5_HH(b, c, d, a, x[i+10], 23, -1094730640);
			a = MD5.MD5_HH(a, b, c, d, x[i+13], 4 ,  681279174);
			d = MD5.MD5_HH(d, a, b, c, x[i+ 0], 11, -358537222);
			c = MD5.MD5_HH(c, d, a, b, x[i+ 3], 16, -722521979);
			b = MD5.MD5_HH(b, c, d, a, x[i+ 6], 23,  76029189);
			a = MD5.MD5_HH(a, b, c, d, x[i+ 9], 4 , -640364487);
			d = MD5.MD5_HH(d, a, b, c, x[i+12], 11, -421815835);
			c = MD5.MD5_HH(c, d, a, b, x[i+15], 16,  530742520);
			b = MD5.MD5_HH(b, c, d, a, x[i+ 2], 23, -995338651);
			
			a = MD5.MD5_II(a, b, c, d, x[i+ 0], 6 , -198630844);
			d = MD5.MD5_II(d, a, b, c, x[i+ 7], 10,  1126891415);
			c = MD5.MD5_II(c, d, a, b, x[i+14], 15, -1416354905);
			b = MD5.MD5_II(b, c, d, a, x[i+ 5], 21, -57434055);
			a = MD5.MD5_II(a, b, c, d, x[i+12], 6 ,  1700485571);
			d = MD5.MD5_II(d, a, b, c, x[i+ 3], 10, -1894986606);
			c = MD5.MD5_II(c, d, a, b, x[i+10], 15, -1051523);
			b = MD5.MD5_II(b, c, d, a, x[i+ 1], 21, -2054922799);
			a = MD5.MD5_II(a, b, c, d, x[i+ 8], 6 ,  1873313359);
			d = MD5.MD5_II(d, a, b, c, x[i+15], 10, -30611744);
			c = MD5.MD5_II(c, d, a, b, x[i+ 6], 15, -1560198380);
			b = MD5.MD5_II(b, c, d, a, x[i+13], 21,  1309151649);
			a = MD5.MD5_II(a, b, c, d, x[i+ 4], 6 , -145523070);
			d = MD5.MD5_II(d, a, b, c, x[i+11], 10, -1120210379);
			c = MD5.MD5_II(c, d, a, b, x[i+ 2], 15,  718787259);
			b = MD5.MD5_II(b, c, d, a, x[i+ 9], 21, -343485551);
			
			a = MD5.Safe_Add(a, olda);
			b = MD5.Safe_Add(b, oldb);
			c = MD5.Safe_Add(c, oldc);
			d = MD5.Safe_Add(d, oldd);
		}
		return Array(a, b, c, d);
	},
	
	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	MD5_CMN:function(q, a, b, x, s, t)
	{
	  return MD5.Safe_Add(MD5.Bit_Rol(MD5.Safe_Add(MD5.Safe_Add(a, q), MD5.Safe_Add(x, t)), s),b);
	},
	MD5_FF:function(a, b, c, d, x, s, t)
	{
	  return MD5.MD5_CMN((b & c) | ((~b) & d), a, b, x, s, t);
	},
	MD5_GG:function(a, b, c, d, x, s, t)
	{
	  return MD5.MD5_CMN((b & d) | (c & (~d)), a, b, x, s, t);
	},
	MD5_HH:function(a, b, c, d, x, s, t)
	{
	  return MD5.MD5_CMN(b ^ c ^ d, a, b, x, s, t);
	},
	MD5_II:function(a, b, c, d, x, s, t)
	{
	  return MD5.MD5_CMN(c ^ (b | (~d)), a, b, x, s, t);
	},
	
	/*
	 * Calculate the HMAC-MD5, of a key and some data
	 */
	Core_HMac_MD5:function(key, data)
	{
	  var bkey = MD5.StrToBinl(key);
	  if(bkey.length > 16) bkey = MD5.Core_MD5(bkey, key.length * MD5.chrsz);
	
	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
		ipad[i] = bkey[i] ^ 0x36363636;
		opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }
	
	  var hash = MD5.Core_MD5(ipad.concat(MD5.StrToBinl(data)), 512 + data.length * MD5.chrsz);
	  return MD5.Core_MD5(opad.concat(hash), 512 + 128);
	},
	
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	Safe_Add:function(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	},
	
	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	Bit_Rol:function(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	},
	

	/*
	 * Convert a string to an array of little-endian words
	 * If MD5.chrsz is ASCII, characters >255 have their hi-byte silently ignored.
	 */
	StrToBinl:function(str)
	{
	  var bin = Array();
	  var mask = (1 << MD5.chrsz) - 1;
	  for(var i = 0,max = str.length * MD5.chrsz; i < max; i += MD5.chrsz)
		bin[i>>5] |= (str.charCodeAt(i / MD5.chrsz) & mask) << (i%32);
	  return bin;
	},
	
	/*
	 * Convert an array of little-endian words to a string
	 */
	BinlToStr:function(bin)
	{
	  var str = "";
	  var mask = (1 << MD5.chrsz) - 1;
	  for(var i = 0,max = bin.length * 32; i < max; i += MD5.chrsz)
		str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
	  return str;
	},
	
	/*
	 * Convert an array of little-endian words to a hex string.
	 */
	BinlToHex:function(binarray)
	{
	  var hex_tab = MD5.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i++)
	  {
		str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
			   hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
	  }
	  return str;
	},

	/*
	 * Convert an array of little-endian words to a base-64 string
	 */
	BinlToB64:function(binarray)
	{
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3)
	  {
		var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
					| (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
					|  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
		for(var j = 0; j < 4; j++)
		{
		  if(i * 8 + j * 6 > binarray.length * 32) str += MD5.b64pad;
		  else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
		}
	  }
	  return str;
	},

	end:true
};

// ========================================================================
//  XML.ObjTree -- XML source code from/to JavaScript object like E4X
// ========================================================================

if ( typeof(XML) == 'undefined' ) XML = function() {};

//  constructor

XML.ObjTree = function () {
    return this;
};

//  class variables

XML.ObjTree.VERSION = "0.24";

//  object prototype

XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
XML.ObjTree.prototype.attr_prefix = '';
XML.ObjTree.prototype.overrideMimeType = 'text/xml';

//  method: parseXML( xmlsource )

XML.ObjTree.prototype.parseXML = function ( xml ) {
    var root;
    if ( window.DOMParser ) {
        var xmldom = new DOMParser();
//      xmldom.async = false;           // DOMParser is always sync-mode
        var dom = xmldom.parseFromString( xml, "application/xml" );
        if ( ! dom ) return;
        root = dom.documentElement;
    } else if ( window.ActiveXObject ) {
        xmldom = new ActiveXObject('Microsoft.XMLDOM');
        xmldom.async = false;
        xmldom.loadXML( xml );
        root = xmldom.documentElement;
    }
    if ( ! root ) return;
    return this.parseDOM( root );
};

//  method: parseHTTP( url, options, callback )

XML.ObjTree.prototype.parseHTTP = function ( url, options, callback ) {
    var myopt = {};
    for( var key in options ) {
        myopt[key] = options[key];                  // copy object
    }
    if ( ! myopt.method ) {
        if ( typeof(myopt.postBody) == "undefined" &&
             typeof(myopt.postbody) == "undefined" &&
             typeof(myopt.parameters) == "undefined" ) {
            myopt.method = "get";
        } else {
            myopt.method = "post";
        }
    }
    if ( callback ) {
        myopt.asynchronous = true;                  // async-mode
        var __this = this;
        var __func = callback;
        var __save = myopt.onComplete;
        myopt.onComplete = function ( trans ) {
            var tree;
            if ( trans && trans.responseXML && trans.responseXML.documentElement ) {
                tree = __this.parseDOM( trans.responseXML.documentElement );
            } else if ( trans && trans.responseText ) {
                tree = __this.parseXML( trans.responseText );
            }
            __func( tree, trans );
            if ( __save ) __save( trans );
        };
    } else {
        myopt.asynchronous = false;                 // sync-mode
    }
    var trans;
    if ( typeof(HTTP) != "undefined" && HTTP.Request ) {
        myopt.uri = url;
        var req = new HTTP.Request( myopt );        // JSAN
        if ( req ) trans = req.transport;
    } else if ( typeof(Ajax) != "undefined" && Ajax.Request ) {
        var req = new Ajax.Request( url, myopt );   // ptorotype.js
        if ( req ) trans = req.transport;
    }
//  if ( trans && typeof(trans.overrideMimeType) != "undefined" ) {
//      trans.overrideMimeType( this.overrideMimeType );
//  }
    if ( callback ) return trans;
    if ( trans && trans.responseXML && trans.responseXML.documentElement ) {
        return this.parseDOM( trans.responseXML.documentElement );
    } else if ( trans && trans.responseText ) {
        return this.parseXML( trans.responseText );
    }
}

//  method: parseDOM( documentroot )

XML.ObjTree.prototype.parseDOM = function ( root ) {
    if ( ! root ) return;

    this.__force_array = {};
    if ( this.force_array ) {
        for( var i=0; i<this.force_array.length; i++ ) {
            this.__force_array[this.force_array[i]] = 1;
        }
    }

    var json = this.parseElement( root );   // parse root node
    if ( this.__force_array[root.nodeName] ) {
        json = [ json ];
    }
    if ( root.nodeType != 11 ) {            // DOCUMENT_FRAGMENT_NODE
        var tmp = {};
        tmp[root.nodeName] = json;          // root nodeName
        json = tmp;
    }
    return json;
};

//  method: parseElement( element )

XML.ObjTree.prototype.parseElement = function ( elem ) {
    //  COMMENT_NODE
    if ( elem.nodeType == 7 ) {
        return;
    }

    //  TEXT_NODE CDATA_SECTION_NODE
    if ( elem.nodeType == 3 || elem.nodeType == 4 ) {
        var bool = elem.nodeValue.match( /[^\x00-\x20]/ );
        if ( bool == null ) return;     // ignore white spaces
        return elem.nodeValue;
    }

    var retval;
    var cnt = {};

    //  parse attributes
    if ( elem.attributes && elem.attributes.length ) {
        retval = {};
        for ( var i=0; i<elem.attributes.length; i++ ) {
            var key = elem.attributes[i].nodeName;
			
            if ( typeof(key) != "string" ) continue;
            var val = elem.attributes[i].nodeValue;
            //if ( ! val ) continue;
			if (typeof val == "undefined" || val == null ) continue;
			
            key = this.attr_prefix + key;
			
			
			if ( typeof(cnt[key]) == "undefined" )
			{
				cnt[key] = 0;
			}
            cnt[key] ++;
            this.addNode( retval, key, cnt[key], val );
        }
    }

    //  parse child nodes (recursive)
    if ( elem.childNodes && elem.childNodes.length ) {
        var textonly = true;
        if ( retval ) textonly = false;        // some attributes exists
        for ( var i=0; i<elem.childNodes.length && textonly; i++ ) {
            var ntype = elem.childNodes[i].nodeType;
            if ( ntype == 3 || ntype == 4 ) continue;
            textonly = false;
        }
        if ( textonly ) {
            if ( ! retval ) retval = "";
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                retval += elem.childNodes[i].nodeValue;
            }
        } else {
            if ( ! retval ) retval = {};
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                var key = elem.childNodes[i].nodeName;
                if ( typeof(key) != "string" ) continue;
                var val = this.parseElement( elem.childNodes[i] );
                if ( ! val ) continue;
                if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
                cnt[key] ++;
                this.addNode( retval, key, cnt[key], val );
            }
        }
    }
    return retval;
};

//  method: addNode( hash, key, count, value )

XML.ObjTree.prototype.addNode = function ( hash, key, cnts, val ) {
    if ( this.__force_array[key] ) {
        if ( cnts == 1 ) hash[key] = [];
        hash[key][hash[key].length] = val;      // push
    } else if ( cnts == 1 ) {                   // 1st sibling
        hash[key] = val;
    } else if ( cnts == 2 ) {                   // 2nd sibling
        hash[key] = [ hash[key], val ];
    } else {                                    // 3rd sibling and more
        hash[key][hash[key].length] = val;
    }
};

//  method: writeXML( tree )

XML.ObjTree.prototype.writeXML = function ( tree ) {
    var xml = this.hash_to_xml( null, tree );
    return this.xmlDecl + xml;
};

//  method: hash_to_xml( tagName, tree )

XML.ObjTree.prototype.hash_to_xml = function ( name, tree ) {
    var elem = [];
    var attr = [];
    for( var key in tree ) {
        if ( ! tree.hasOwnProperty(key) ) continue;
        var val = tree[key];
        if ( key.charAt(0) != this.attr_prefix ) {
            if ( typeof(val) == "undefined" || val == null ) {
                elem[elem.length] = "<"+key+" />";
            } else if ( typeof(val) == "object" && val.constructor == Array ) {
                elem[elem.length] = this.array_to_xml( key, val );
            } else if ( typeof(val) == "object" ) {
                elem[elem.length] = this.hash_to_xml( key, val );
            } else {
                elem[elem.length] = this.scalar_to_xml( key, val );
            }
        } else {
            attr[attr.length] = " "+(key.substring(1))+'="'+(this.xml_escape( val ))+'"';
        }
    }
    var jattr = attr.join("");
    var jelem = elem.join("");
    if ( typeof(name) == "undefined" || name == null ) {
        // no tag
    } else if ( elem.length > 0 ) {
        if ( jelem.match( /\n/ )) {
            jelem = "<"+name+jattr+">\n"+jelem+"</"+name+">\n";
        } else {
            jelem = "<"+name+jattr+">"  +jelem+"</"+name+">\n";
        }
    } else {
        jelem = "<"+name+jattr+" />\n";
    }
    return jelem;
};

//  method: array_to_xml( tagName, array )

XML.ObjTree.prototype.array_to_xml = function ( name, array ) {
    var out = [];
    for( var i=0; i<array.length; i++ ) {
        var val = array[i];
        if ( typeof(val) == "undefined" || val == null ) {
            out[out.length] = "<"+name+" />";
        } else if ( typeof(val) == "object" && val.constructor == Array ) {
            out[out.length] = this.array_to_xml( name, val );
        } else if ( typeof(val) == "object" ) {
            out[out.length] = this.hash_to_xml( name, val );
        } else {
            out[out.length] = this.scalar_to_xml( name, val );
        }
    }
    return out.join("");
};

//  method: scalar_to_xml( tagName, text )

XML.ObjTree.prototype.scalar_to_xml = function ( name, text ) {
    if ( name == "#text" ) {
        return this.xml_escape(text);
    } else {
        return "<"+name+">"+this.xml_escape(text)+"</"+name+">\n";
    }
};

//  method: xml_escape( text )

XML.ObjTree.prototype.xml_escape = function ( text ) {
    return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

/*
// ========================================================================

=head1 NAME

XML.ObjTree -- XML source code from/to JavaScript object like E4X

=head1 SYNOPSIS

    var xotree = new XML.ObjTree();
    var tree1 = {
        root: {
            node: "Hello, World!"
        }
    };
    var xml1 = xotree.writeXML( tree1 );        // object tree to XML source
    alert( "xml1: "+xml1 );

    var xml2 = '<?xml version="1.0"?><response><error>0</error></response>';
    var tree2 = xotree.parseXML( xml2 );        // XML source to object tree
    alert( "error: "+tree2.response.error );

=head1 DESCRIPTION

XML.ObjTree class is a parser/generater between XML source code
and JavaScript object like E4X, ECMAScript for XML.
This is a JavaScript version of the XML::TreePP module for Perl.
This also works as a wrapper for XMLHTTPRequest and successor to JKL.ParseXML class
when this is used with prototype.js or JSAN's HTTP.Request class.

=head2 JavaScript object tree format

A sample XML source:

    <?xml version="1.0" encoding="UTF-8"?>
    <family name="Kawasaki">
        <father>Yasuhisa</father>
        <mother>Chizuko</mother>
        <children>
            <girl>Shiori</girl>
            <boy>Yusuke</boy>
            <boy>Kairi</boy>
        </children>
    </family>

Its JavaScript object tree like JSON/E4X:

    {
        'family': {
            '-name':    'Kawasaki',
            'father':   'Yasuhisa',
            'mother':   'Chizuko',
            'children': {
                'girl': 'Shiori'
                'boy': [
                    'Yusuke',
                    'Kairi'
                ]
            }
        }
    };

Each elements are parsed into objects:

    tree.family.father;             # the father's given name.

Prefix '-' is inserted before every attributes' name.

    tree.family["-name"];           # this family's family name

A array is used because this family has two boys.

    tree.family.children.boy[0];    # first boy's name
    tree.family.children.boy[1];    # second boy's name
    tree.family.children.girl;      # (girl has no other sisiters)

=head1 METHODS

=head2 xotree = new XML.ObjTree()

This constructor method returns a new XML.ObjTree object.

=head2 xotree.force_array = [ "rdf:li", "item", "-xmlns" ];

This property allows you to specify a list of element names
which should always be forced into an array representation.
The default value is null, it means that context of the elements
will determine to make array or to keep it scalar.

=head2 xotree.attr_prefix = '@';

This property allows you to specify a prefix character which is
inserted before each attribute names.
Instead of default prefix '-', E4X-style prefix '@' is also available.
The default character is '-'.
Or set '@' to access attribute values like E4X, ECMAScript for XML.
The length of attr_prefix must be just one character and not be empty.

=head2 xotree.xmlDecl = '';

This library generates an XML declaration on writing an XML code per default.
This property forces to change or leave it empty.

=head2 tree = xotree.parseXML( xmlsrc );

This method loads an XML document using the supplied string
and returns its JavaScript object converted.

=head2 tree = xotree.parseDOM( domnode );

This method parses a DOM tree (ex. responseXML.documentElement)
and returns its JavaScript object converted.

=head2 tree = xotree.parseHTTP( url, options );

This method loads a XML file from remote web server
and returns its JavaScript object converted.
XMLHTTPRequest's synchronous mode is always used.
This mode blocks the process until the response is completed.

First argument is a XML file's URL
which must exist in the same domain as parent HTML file's.
Cross-domain loading is not available for security reasons.

Second argument is options' object which can contains some parameters:
method, postBody, parameters, onLoading, etc.

This method requires JSAN's L<HTTP.Request> class or prototype.js's Ajax.Request class.

=head2 xotree.parseHTTP( url, options, callback );

If a callback function is set as third argument,
XMLHTTPRequest's asynchronous mode is used.

This mode calls a callback function with XML file's JavaScript object converted
after the response is completed.

=head2 xmlsrc = xotree.writeXML( tree );

This method parses a JavaScript object tree
and returns its XML source generated.

=head1 EXAMPLES

=head2 Text node and attributes

If a element has both of a text node and attributes
or both of a text node and other child nodes,
text node's value is moved to a special node named "#text".

    var xotree = new XML.ObjTree();
    var xmlsrc = '<span class="author">Kawasaki Yusuke</span>';
    var tree = xotree.parseXML( xmlsrc );
    var class = tree.span["-class"];        # attribute
    var name  = tree.span["#text"];         # text node

=head2 parseHTTP() method with HTTP-GET and sync-mode

HTTP/Request.js or prototype.js must be loaded before calling this method.

    var xotree = new XML.ObjTree();
    var url = "http://example.com/index.html";
    var tree = xotree.parseHTTP( url );
    xotree.attr_prefix = '@';                   // E4X-style
    alert( tree.html["@lang"] );

This code shows C<lang=""> attribute from a X-HTML source code.

=head2 parseHTTP() method with HTTP-POST and async-mode

Third argument is a callback function which is called on onComplete.

    var xotree = new XML.ObjTree();
    var url = "http://example.com/mt-tb.cgi";
    var opts = {
        postBody:   "title=...&excerpt=...&url=...&blog_name=..."
    };
    var func = function ( tree ) {
        alert( tree.response.error );
    };
    xotree.parseHTTP( url, opts, func );

This code send a trackback ping and shows its response code.

=head2 Simple RSS reader

This is a RSS reader which loads RDF file and displays all items.

    var xotree = new XML.ObjTree();
    xotree.force_array = [ "rdf:li", "item" ];
    var url = "http://example.com/news-rdf.xml";
    var func = function( tree ) {
        var elem = document.getElementById("rss_here");
        for( var i=0; i<tree["rdf:RDF"].item.length; i++ ) {
            var divtag = document.createElement( "div" );
            var atag = document.createElement( "a" );
            atag.href = tree["rdf:RDF"].item[i].link;
            var title = tree["rdf:RDF"].item[i].title;
            var tnode = document.createTextNode( title );
            atag.appendChild( tnode );
            divtag.appendChild( atag );
            elem.appendChild( divtag );
        }
    };
    xotree.parseHTTP( url, {}, func );

=head2  XML-RPC using writeXML, prototype.js and parseDOM

If you wish to use prototype.js's Ajax.Request class by yourself:

    var xotree = new XML.ObjTree();
    var reqtree = {
        methodCall: {
            methodName: "weblogUpdates.ping",
            params: {
                param: [
                    { value: "Kawa.net xp top page" },  // 1st param
                    { value: "http://www.kawa.net/" }   // 2nd param
                ]
            }
        }
    };
    var reqxml = xotree.writeXML( reqtree );       // JS-Object to XML code
    var url = "http://example.com/xmlrpc";
    var func = function( req ) {
        var resdom = req.responseXML.documentElement;
        xotree.force_array = [ "member" ];
        var restree = xotree.parseDOM( resdom );   // XML-DOM to JS-Object
        alert( restree.methodResponse.params.param.value.struct.member[0].value.string );
    };
    var opt = {
        method:         "post",
        postBody:       reqxml,
        asynchronous:   true,
        onComplete:     func
    };
    new Ajax.Request( url, opt );

=head1 AUTHOR

Yusuke Kawasaki http://www.kawa.net/

=head1 COPYRIGHT AND LICENSE

Copyright (c) 2005-2006 Yusuke Kawasaki. All rights reserved.
This program is free software; you can redistribute it and/or
modify it under the Artistic license. Or whatever license I choose,
which I will do instead of keeping this documentation like it is.

=cut
// ========================================================================
*/