BuildEmap���ӵ�ͼҳ��ʹ��˵����

1��NPPluginSDK/build_emap������Web�������£���IIS��Apache�У���build_emap/index.htmlҳ�棨���BuildEmap��ҳ�������ļ��ṹ����

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
	
	ע�⣺ʹ��jQuery + EasyUI����ģʽ

2��BuildEmap��ҳ����js/globals.js�г�ʼ��������ز���
	var GLOBALS = {
		loginMode: "auto", // �Զ����ӵ�½���ǳ��ֵ�¼��? auto(default) | normal 
		path: "61.191.26.2:8866", // ���ӵĵ�ַ
		epId: "system", // ��ҵID
		username: "admin", // �û���
		password: "", // �û�����
		bfix: 1, // �Ƿ�͸��բ��½��1��0��
		debug: {
			active: true, // �Ƿ����ҳ��
			showMaxLine: 200, // ������Ϣ�����ʾ����10~500
			NCNotify: {
				enable_stream_status_notify: false, // ����ʱ�Ƿ����������״̬��Ϣ
				enable_event_notify: false, // ����ʱ�Ƿ������¼���Ϣ���
				enable_gps_data_notify: false // ����ʱ�Ƿ�����GPS������Ϣ���
			}, 
			end: true
		},
		defaultDDraw: true, // �Ƿ�Ĭ�Ͽ�����Ƶ��DDraw�ۿ�ģʽ
		pluginFile: "../../MediaPlugin7.exe", // ����ļ���·����֧�������ַ��
		map: {
			type: "baidumap", // baidumap(default) | googlemap | amap(�ߵµ�ͼ)
			values: [{
				id: "baidumap", name: "�ٶȵ�ͼ", enable: true
			}, {
				id: "amap", name: "�ߵµ�ͼ", enable: true
			}, {
				id: "googlemap", name: "�ȸ��ͼ", enable: false
			}],
			center: {
				latitude: 31.8639, // γ��
				longitude: 117.2808 // ����
			},
			zoom: 13, // ��ͼ��ʼ��ʾ����
			maxGPSData: 2000, // ÿ���豸�������洢��GPS����������0��ʾ�����ƣ��������Ϊ20��������0���߲�С��20��
			end: true
		},
		pop: {
			url: "../build_video/index.html?ip={0}&port={1}&username={2}&epId={3}&psw={4}&bfix={5}&puid={6}&_debug={7}&_console={8}",
			_debug: false, // �Ƿ���е���
			_console: true, // �Ƿ��п���̨����
			end: true
		},
		end: true
	};

3��BuildEmap��ҳͨ��Url���κ�����...?ip=..&port=..&...��
	loginMode ��¼ģʽ���Զ���¼���ǵ�����¼��
	ip ����C7ƽ̨��ֱ���豸IP��ַ
	port ����C7ƽ̨��ֱ���豸��ַ�˿�
	username ��¼�û���
	epId | epid ��ҵID�ţ�ֱ���豸ʱ����ʡ��
	psw | password ��¼����
	bfix �ǣ�1��true����0��false��͸����բ��¼������C7ƽ̨ʱ��ʹ��
	
	mapType | maptype ���ӵ�ͼ���ͣ�ȡbaidumap��googlemap��
	ZOOM | zoom ���ӵ�ͼ��ʼ��ʾ����
	lat | latitude ���ӵ�ͼ��ʼ��ʾ���ĵ�γ��
	lng | longitude	���ӵ�ͼ��ʼ��ʾ���ĵ㾭��

	_debug �ǣ�true��ͬ����false��ͬ��������ʾ�ڲ��������Դ��ڣ�ȱʡΪ�رյ�
	_pluginFile ����ļ�·���������������ϵĵ�ַ��ͬԴĿ¼�µ�ĳ�����·������Ҫʱʹ��encodeURIComponent���룬ȱʡΪ../../MediaPlugin7.exe

4��BuildEmap��ҳUrl����ʾ��
	
	1��http://192.168.43.98/npsdk/examples/build_emap/index.html?loginMode=auto&mapType=googlemap&ip=192.168.31.56&port=8866
	
	2��http://192.168.43.98/npsdk/examples/build_emap/index.html?loginMode=normal&mapType=baidumap&zoom=5&_debug=false
	
	...

	
5��Ϊ֧�ּ���ƽ̨����������һ��ҳ��build_emap/index-cascade.html