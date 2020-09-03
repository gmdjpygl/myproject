var GLOBALS = {
	loginMode: "auto", // 自动连接登陆还是出现登录框? auto(default) | normal 
	path: "192.168.42.118:8866", // 连接的地址
	epId: "system", // 企业ID
	username: "admin", // 用户名
	password: "", // 用户密码
	bfix: 1, // 是否穿透网闸登陆（1是0否）
	debug: {
		active: false, // 是否调试页面
		showMaxLine: 200, // 调试信息最多显示条数10~500
		NCNotify: {
			enable_stream_status_notify: false, // 调试时是否允许输出流状态信息
			enable_event_notify: false, // 调试时是否允许事件信息输出
			enable_gps_data_notify: false // 调试时是否允许GPS数据信息输出
		}, 
		end: true
	},
	defaultDDraw: true, // 是否默认开启视频的DDraw观看模式
	pluginFile: "../../MediaPlugin7.exe", // 插件文件的路径（支持网络地址）
	map: {
		type: "baidumap", // baidumap(default) | googlemap | amap(高德地图)
		values: [{
			id: "baidumap", name: "百度地图", enable: true
		}, {
			id: "amap", name: "高德地图", enable: true
		}, {
			id: "googlemap", name: "谷歌地图", enable: false
		}],
		center: {
			latitude: 31.8639, // 纬度
			longitude: 117.2808 // 经度
		},
		zoom: 12, // 地图初始显示级别
		maxGPSData: 2000, // 每个设备本地最多存储的GPS数据条数，0表示不限制，最低限制为20
		end: true
	},
	pop: {
		url: "../build_video/index.html?ip={0}&port={1}&username={2}&epId={3}&psw={4}&bfix={5}&puid={6}&_debug={7}&_console={8}",
		_debug: false, // 是否进行调试
		_console: true, // 是否有控制台区域
		end: true
	},
	end: true
};