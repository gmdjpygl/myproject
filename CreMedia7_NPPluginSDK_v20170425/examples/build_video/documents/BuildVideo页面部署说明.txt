BuildVideo多视频窗口部署网页使用说明：

1、NPPluginSDK/build_video包部署到Web服务器下（如IIS或Apache中），build_video/index.html页面（简称BuildVideo网页）引入文件结构如下
	../../js/jquery/themes/base/jquery.ui.all.css
	../../js/jquery/jquery-1.9.1.js
	../../js/jquery/lib/jquery.cookie.js
	../../js/jquery/lib/jquery.json-2.4.js
	../../js/jquery/ui/jquery-ui.js
	
	../../js/NPPInterface.js
	../../js/NPPInterlayer.js
	
	css/main.css
	js/buildvideo.js	
	
	注意：
		- BuildVideo网页使用JQuery及自带UI开发
		- NP SDK本身不依赖于具体的Javascript开发库，页面引用时NPPInterface.js必须早于NPPInterlayer.js
		- js/buildvideo.js为主体功能实现文件
	
2、BuildVideo网页内容界面自适应页面可视窗体大小，拖放时随之变动大小；呼出的页面亦可根据需要自行固定大小

3、BuildVideo网页可根据需要在页面中初始配置相关参数，但理论上都是可用Url传参的形式进行设定；js/buildvideo.js中初始化参数配置项如下
	var _bv = BuildVideo = {
		version: "v1.0.1",
	
		// - 是否开启调试窗口
		debug: false,
	
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
			path: "192.168.43.98:8866", // - 连接地址
			epId: "system",	// - 企业ID
			username: "admin", // - 用户名
			password: "", // - 用户密码
			bFixCUIAddress: 0 // - 是否透过网闸（1/true是，0/false否）
		},
	
		...
	};
	
	注意：
		- enableDWPTZCtl在console为true的时候视为false
		- enable_autorc设置为true，页面在连接失败或侦测到断开事件后有自动连接字符
		- loginParams.path为默认登录的C7平台或直连设备地址，ip与端口之间用英文冒号连接
		- pluginFile为插件文件路径，可以是网络上的地址或同源目录下的某个相对路径
	
4、BuildVideo网页调用Url具体传参（...?ip=..&port=..&...）说明
	ip 连接C7平台或直连设备IP地址
	port 连接C7平台或直连设备地址端口
	username 登录用户名
	epId | epid 企业ID号，直连设备时可以省略
	psw | password 登录密码
	bfix 是（1或true）否（0或false）透过网闸登录，连接C7平台时可使用
	
	puid 视频所属的设备PUID
	ivIndex 视频资源索引，同一个puid可以传多路视频，如取值0或0,1或1,2,3，之间用英文逗号连接
	videos 视频资源集合
		- 在puid与ivIndex都不正确存在时，会检测此videos参数，结构为puid_ivIndex,puid_ivIndex,...
		- 多个节点puid_ivIndex之间使用英文逗号连接，多个节点中的puid可以不同，即支持不同的设备PUID
		- 每一节点puid_ivIndex中puid与ivIndex用英文下划线连接，且ivIndex只能为单一值（如0或1或...）
		- 对若干节点puid_ivIndex最多会截取的有效个数为16个，由于Url传参浏览器可能限制字符个数，故节点数不要传太多，以免影响效果 
	winNumber 页面的视频窗口个数，1, 4, 6, 9, 16之一，可省略
	playAudio | playaudio | enableAudio | enablaudio 是否默认允许打开音频，缺省为关闭的（暂时不启用）
	
	_debug 是（true下同）否（false下同）开启显示内部开发调试窗口，缺省为关闭的
	_ddraw | _enableDDraw 是否默认开启DDraw模式浏览视频，缺省为开启的
	_autorc | _autoReConnect 是否默认允许自动重连功能，缺省为开启的
	_autorcinterval | _autoReConnectInterval 自动重连间隔（单位毫秒），缺省为10000（代表10秒）
	_console 是否开启显示控制台，缺省为开启的
	_consoledc | _consoleDisplayContent 是否默认开启控制台主体内容区，缺省为关闭的
	
	_pluginFile 插件文件路径，可以是网络上的地址或同源目录下的某个相对路径，必要时使用encodeURIComponent编码，缺省为../../MediaPlugin7.exe
	
	注意：
		- 连接C7平台时，puid、ivIndex或videos必须存在，网页会进行验证并过滤资源信息，否则会有相应提示
		- 直连设备时，可以省略puid、ivIndex或videos等信息，此时会播放直连设备的所有视频
		- winNumber建议省略，winNumber取值为1, 4, 6, 9, 16分屏之一，在视频数多于winNumber时会自行显示适合的窗口数
		- 对用户权限过滤掉的视频资源不进行播放
		- 所传的视频资源不在线或未使能时，将不会播放，但是会预留视频窗口，按传参的顺序分配
		- 设备下线时会停止相应正在播放的视频，设备上线时会打开相应的视频播放

5、BuildVideo网页Url调用示例
	1）连接C7平台【比如平台地址为192.168.43.98:8866用户名admin密码为空，两个设备，PUID分别为151087211716864051、151087211750418483，各有四个摄像头】
		- .../build_video/index.html?puid=151087211716864051&ivIndex=0,1,2,3
			loginParams.path为192.168.43.98:8866
			连接成功后播放PUID为151087211716864051的四路视频

		- .../build_video/index.html?ip=192.168.43.98&port=8866&username=admin&epId=system&psw=&videos=151087211716864051_0,151087211716864051_1,151087211750418483_0,151087211750418483_1,151087211750418483_2
			连接成功后播放PUID为151087211716864051的第一路和第二路视频以及151087211750418483的前三路视频，视频窗口个数显示为六个，余一个窗口没有使用
		
		- 	 .../build_video/index.html?ip=192.168.43.98&port=8866&username=admin&epId=system&psw=&videos=151087211716864051_0,151087211716864051_1,151087211750418483_0,151087211750418483_1,151087211750418483_2&_console=true&_ddraw=true&_autorc=true&_autorcinterval=30000
			连接成功后播放五路视频，显示控制台部分，开启DDraw模式观看，连接失败或侦测断开连接后自动重连，重连间隔为30秒
		
		...
	2）直连设备【比如地址端口为192.168.43.98:30001用户名admin密码为空，设备PUID为151087211716864051（直连时PUID不重要，不匹配），四个摄像头，索引为0,1,2,3】
		- .../build_video/index.html
			loginParams.path为192.168.43.98:30001
			连接成功后会播放四路视频，其他不会播放

		- .../build_video/index.html?ivIndex=0,2&_console=true&_consoledc=false
			loginParams.path为192.168.43.98:30001
			连接成功后会播放第一路和第三路视频，显示控制台部分并且控制台主界面是闭合状态

		- .../build_video/index.html?ip=192.168.43.98&port=30001&username=admin&psw=
			连接成功后会播放四路视频，其他不会播放

		- .../build_video/index.html?ip=192.168.43.98&port=30001&username=admin&psw=&ivIndex=0,2
			连接成功后会播放第一路和第三路视频，其他不会播放

		- .../build_video/index.html?ip=192.168.43.98&port=30001&username=admin&psw=&_console=true&_ddraw=false&_autorc=false
			连接成功后会播放四路视频，显示控制台部分，视频开启非DDraw模式观看，连接失败或断开了连接不会自动重连
		
		...

6、BuildVideo网页浏览时重要Bug（不好修改解决了，可能与jQuery开发有关系，可以尽量避免使用相关浏览器浏览）
	1）IE浏览器
		- IE6及以前版本浏览器界面会变形，应抛弃使用
		
		- IE7、8、10、11浏览器浏览正常，只是界面上稍微有些差别，建议IE10体验更好

		- IE9浏览器访问可能造成崩溃，可以摒弃浏览
 
	2）Chrome谷歌浏览器
		- _debug=true情况下，会崩溃
		
		- 连续拖放浏览器改变页面大小时，亦会容易崩溃掉
	
	3）FireFox火狐浏览器最新版本的浏览正常，没有特别严重问题
	