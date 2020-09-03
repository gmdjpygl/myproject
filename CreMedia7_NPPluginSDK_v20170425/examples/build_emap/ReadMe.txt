BuildEmap电子地图页面使用说明：

1、NPPluginSDK/build_emap包部署到Web服务器下（如IIS或Apache中），build_emap/index.html页面（简称BuildEmap网页）引入文件结构如下

	js/globals.js
	
	../../js/jquery/jquery-1.9.1.js
	../../js/jquery/lib/jquery.cookie.js
	../../js/jquery/lib/jquery.json-2.4.js

	../../js/jquery/easyui/themes/default/easyui.css
	../../js/jquery/easyui/themes/icon.css
	../../js/jquery/easyui/jquery.easyui.min.js
	../../js/jquery/easyui/locale/easyui-lang-zh_CN.js
	../../js/jquery/lib/jquery.easyui.datagrid-detailview.js

	../../js/NPPInterface.js
	../../js/NPPInterlayer.js
	
	css/main.css
	js/buildemap.js
	
	注意：使用jQuery + EasyUI开发模式

2、BuildEmap网页可在js/globals.js中初始化配置相关参数
	var GLOBALS = {
		loginMode: "auto", // 自动连接登陆还是出现登录框? auto(default) | normal 
		path: "61.191.26.2:8866", // 连接的地址
		epId: "system", // 企业ID
		username: "admin", // 用户名
		password: "", // 用户密码
		bfix: 1, // 是否穿透网闸登陆（1是0否）
		debug: {
			active: true, // 是否调试页面
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
			zoom: 13, // 地图初始显示级别
			maxGPSData: 2000, // 每个设备本地最多存储的GPS数据条数，0表示不限制，最低限制为20（即等于0或者不小于20）
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

3、BuildEmap网页通过Url传参呼出（...?ip=..&port=..&...）
	loginMode 登录模式，自动登录还是弹出登录框
	ip 连接C7平台或直连设备IP地址
	port 连接C7平台或直连设备地址端口
	username 登录用户名
	epId | epid 企业ID号，直连设备时可以省略
	psw | password 登录密码
	bfix 是（1或true）否（0或false）透过网闸登录，连接C7平台时可使用
	
	mapType | maptype 电子地图类型（取baidumap或googlemap）
	ZOOM | zoom 电子地图初始显示级别
	lat | latitude 电子地图初始显示中心点纬度
	lng | longitude	电子地图初始显示中心点经度

	_debug 是（true下同）否（false下同）开启显示内部开发调试窗口，缺省为关闭的
	_pluginFile 插件文件路径，可以是网络上的地址或同源目录下的某个相对路径，必要时使用encodeURIComponent编码，缺省为../../MediaPlugin7.exe

4、BuildEmap网页Url调用示例
	
	1）http://192.168.43.98/npsdk/examples/build_emap/index.html?loginMode=auto&mapType=googlemap&ip=192.168.31.56&port=8866
	
	2）http://192.168.43.98/npsdk/examples/build_emap/index.html?loginMode=normal&mapType=baidumap&zoom=5&_debug=false
	
	...

	
5、为支持级联平台，另增加了一个页面build_emap/index-cascade.html