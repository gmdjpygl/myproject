BuildVideo����Ƶ���ڲ�����ҳʹ��˵����

1��NPPluginSDK/build_video������Web�������£���IIS��Apache�У���build_video/index.htmlҳ�棨���BuildVideo��ҳ�������ļ��ṹ����
	../../js/jquery/themes/base/jquery.ui.all.css
	../../js/jquery/jquery-1.9.1.js
	../../js/jquery/lib/jquery.cookie.js
	../../js/jquery/lib/jquery.json-2.4.js
	../../js/jquery/ui/jquery-ui.js
	
	../../js/NPPInterface.js
	../../js/NPPInterlayer.js
	
	css/main.css
	js/buildvideo.js	
	
	ע�⣺
		- BuildVideo��ҳʹ��JQuery���Դ�UI����
		- NP SDK���������ھ����Javascript�����⣬ҳ������ʱNPPInterface.js��������NPPInterlayer.js
		- js/buildvideo.jsΪ���幦��ʵ���ļ�
	
2��BuildVideo��ҳ���ݽ�������Ӧҳ����Ӵ����С���Ϸ�ʱ��֮�䶯��С��������ҳ����ɸ�����Ҫ���й̶���С

3��BuildVideo��ҳ�ɸ�����Ҫ��ҳ���г�ʼ������ز������������϶��ǿ���Url���ε���ʽ�����趨��js/buildvideo.js�г�ʼ����������������
	var _bv = BuildVideo = {
		version: "v1.0.1",
	
		// - �Ƿ������Դ���
		debug: false,
	
		// - �Ƿ�����ײ�����̨����
		console: false,
		// - �Ƿ�Ĭ����ʾ����������
		console_content: false,
	
		// - �Ƿ������Զ�����
		enable_autorc: true,
	
		// - Ĭ�Ͽ���DDrawģʽ�ۿ�
		enableDDraw: true, 
	
		// - �Ƿ�����������̨����
		enableDWPTZCtl: false,
	
		// - ����ļ�
		pluginFile: "../../MediaPlugin7.exe",
		
		// - Ĭ�ϵ�¼����
		loginParams: {
			path: "192.168.43.98:8866", // - ���ӵ�ַ
			epId: "system",	// - ��ҵID
			username: "admin", // - �û���
			password: "", // - �û�����
			bFixCUIAddress: 0 // - �Ƿ�͸����բ��1/true�ǣ�0/false��
		},
	
		...
	};
	
	ע�⣺
		- enableDWPTZCtl��consoleΪtrue��ʱ����Ϊfalse
		- enable_autorc����Ϊtrue��ҳ��������ʧ�ܻ���⵽�Ͽ��¼������Զ������ַ�
		- loginParams.pathΪĬ�ϵ�¼��C7ƽ̨��ֱ���豸��ַ��ip��˿�֮����Ӣ��ð������
		- pluginFileΪ����ļ�·���������������ϵĵ�ַ��ͬԴĿ¼�µ�ĳ�����·��
	
4��BuildVideo��ҳ����Url���崫�Σ�...?ip=..&port=..&...��˵��
	ip ����C7ƽ̨��ֱ���豸IP��ַ
	port ����C7ƽ̨��ֱ���豸��ַ�˿�
	username ��¼�û���
	epId | epid ��ҵID�ţ�ֱ���豸ʱ����ʡ��
	psw | password ��¼����
	bfix �ǣ�1��true����0��false��͸����բ��¼������C7ƽ̨ʱ��ʹ��
	
	puid ��Ƶ�������豸PUID
	ivIndex ��Ƶ��Դ������ͬһ��puid���Դ���·��Ƶ����ȡֵ0��0,1��1,2,3��֮����Ӣ�Ķ�������
	videos ��Ƶ��Դ����
		- ��puid��ivIndex������ȷ����ʱ�������videos�������ṹΪpuid_ivIndex,puid_ivIndex,...
		- ����ڵ�puid_ivIndex֮��ʹ��Ӣ�Ķ������ӣ�����ڵ��е�puid���Բ�ͬ����֧�ֲ�ͬ���豸PUID
		- ÿһ�ڵ�puid_ivIndex��puid��ivIndex��Ӣ���»������ӣ���ivIndexֻ��Ϊ��һֵ����0��1��...��
		- �����ɽڵ�puid_ivIndex�����ȡ����Ч����Ϊ16��������Url������������������ַ��������ʽڵ�����Ҫ��̫�࣬����Ӱ��Ч�� 
	winNumber ҳ�����Ƶ���ڸ�����1, 4, 6, 9, 16֮һ����ʡ��
	playAudio | playaudio | enableAudio | enablaudio �Ƿ�Ĭ���������Ƶ��ȱʡΪ�رյģ���ʱ�����ã�
	
	_debug �ǣ�true��ͬ����false��ͬ��������ʾ�ڲ��������Դ��ڣ�ȱʡΪ�رյ�
	_ddraw | _enableDDraw �Ƿ�Ĭ�Ͽ���DDrawģʽ�����Ƶ��ȱʡΪ������
	_autorc | _autoReConnect �Ƿ�Ĭ�������Զ��������ܣ�ȱʡΪ������
	_autorcinterval | _autoReConnectInterval �Զ������������λ���룩��ȱʡΪ10000������10�룩
	_console �Ƿ�����ʾ����̨��ȱʡΪ������
	_consoledc | _consoleDisplayContent �Ƿ�Ĭ�Ͽ�������̨������������ȱʡΪ�رյ�
	
	_pluginFile ����ļ�·���������������ϵĵ�ַ��ͬԴĿ¼�µ�ĳ�����·������Ҫʱʹ��encodeURIComponent���룬ȱʡΪ../../MediaPlugin7.exe
	
	ע�⣺
		- ����C7ƽ̨ʱ��puid��ivIndex��videos������ڣ���ҳ�������֤��������Դ��Ϣ�����������Ӧ��ʾ
		- ֱ���豸ʱ������ʡ��puid��ivIndex��videos����Ϣ����ʱ�Ქ��ֱ���豸��������Ƶ
		- winNumber����ʡ�ԣ�winNumberȡֵΪ1, 4, 6, 9, 16����֮һ������Ƶ������winNumberʱ��������ʾ�ʺϵĴ�����
		- ���û�Ȩ�޹��˵�����Ƶ��Դ�����в���
		- ��������Ƶ��Դ�����߻�δʹ��ʱ�������Ქ�ţ����ǻ�Ԥ����Ƶ���ڣ������ε�˳�����
		- �豸����ʱ��ֹͣ��Ӧ���ڲ��ŵ���Ƶ���豸����ʱ�����Ӧ����Ƶ����

5��BuildVideo��ҳUrl����ʾ��
	1������C7ƽ̨������ƽ̨��ַΪ192.168.43.98:8866�û���admin����Ϊ�գ������豸��PUID�ֱ�Ϊ151087211716864051��151087211750418483�������ĸ�����ͷ��
		- .../build_video/index.html?puid=151087211716864051&ivIndex=0,1,2,3
			loginParams.pathΪ192.168.43.98:8866
			���ӳɹ��󲥷�PUIDΪ151087211716864051����·��Ƶ

		- .../build_video/index.html?ip=192.168.43.98&port=8866&username=admin&epId=system&psw=&videos=151087211716864051_0,151087211716864051_1,151087211750418483_0,151087211750418483_1,151087211750418483_2
			���ӳɹ��󲥷�PUIDΪ151087211716864051�ĵ�һ·�͵ڶ�·��Ƶ�Լ�151087211750418483��ǰ��·��Ƶ����Ƶ���ڸ�����ʾΪ��������һ������û��ʹ��
		
		- 	 .../build_video/index.html?ip=192.168.43.98&port=8866&username=admin&epId=system&psw=&videos=151087211716864051_0,151087211716864051_1,151087211750418483_0,151087211750418483_1,151087211750418483_2&_console=true&_ddraw=true&_autorc=true&_autorcinterval=30000
			���ӳɹ��󲥷���·��Ƶ����ʾ����̨���֣�����DDrawģʽ�ۿ�������ʧ�ܻ����Ͽ����Ӻ��Զ��������������Ϊ30��
		
		...
	2��ֱ���豸�������ַ�˿�Ϊ192.168.43.98:30001�û���admin����Ϊ�գ��豸PUIDΪ151087211716864051��ֱ��ʱPUID����Ҫ����ƥ�䣩���ĸ�����ͷ������Ϊ0,1,2,3��
		- .../build_video/index.html
			loginParams.pathΪ192.168.43.98:30001
			���ӳɹ���Ქ����·��Ƶ���������Ქ��

		- .../build_video/index.html?ivIndex=0,2&_console=true&_consoledc=false
			loginParams.pathΪ192.168.43.98:30001
			���ӳɹ���Ქ�ŵ�һ·�͵���·��Ƶ����ʾ����̨���ֲ��ҿ���̨�������Ǳպ�״̬

		- .../build_video/index.html?ip=192.168.43.98&port=30001&username=admin&psw=
			���ӳɹ���Ქ����·��Ƶ���������Ქ��

		- .../build_video/index.html?ip=192.168.43.98&port=30001&username=admin&psw=&ivIndex=0,2
			���ӳɹ���Ქ�ŵ�һ·�͵���·��Ƶ���������Ქ��

		- .../build_video/index.html?ip=192.168.43.98&port=30001&username=admin&psw=&_console=true&_ddraw=false&_autorc=false
			���ӳɹ���Ქ����·��Ƶ����ʾ����̨���֣���Ƶ������DDrawģʽ�ۿ�������ʧ�ܻ�Ͽ������Ӳ����Զ�����
		
		...

6��BuildVideo��ҳ���ʱ��ҪBug�������޸Ľ���ˣ�������jQuery�����й�ϵ�����Ծ�������ʹ���������������
	1��IE�����
		- IE6����ǰ�汾������������Σ�Ӧ����ʹ��
		
		- IE7��8��10��11��������������ֻ�ǽ�������΢��Щ��𣬽���IE10�������

		- IE9��������ʿ�����ɱ����������������
 
	2��Chrome�ȸ������
		- _debug=true����£������
		
		- �����Ϸ�������ı�ҳ���Сʱ��������ױ�����
	
	3��FireFox�����������°汾�����������û���ر���������
	