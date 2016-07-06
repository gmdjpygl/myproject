import java.io.IOException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.junit.Test;

import com.massclouds.cmobile.center.common.Constants;
import com.massclouds.cmobile.center.common.util.DateUtil;
import com.massclouds.cmobile.center.common.util.StringUtil;
import com.massclouds.cmobile.center.service.util.CollectionUtil;
import com.massclouds.cmobile.center.service.util.HttpsRequestUtil;


public class testXml {
	
	@Test
	public void parseState() {
		
		
		
		String account = "sysadmin@internal";
		String pwd = "admin==1";
		String param = "<action><status></status><fault><reason></reason><detail></detail></fault></action>";
		//String url = "https://192.168.102.38/api/vms/76037c77-0d70-410c-af75-a6b0005fcfe4/start";
		String url = "https://192.168.102.38/api/vms/76037c77-0d70-410c-af75-a6b0005fcfe4/suspend";
		String reback;
		try {
			reback = HttpsRequestUtil.sendHttpsPost(url, param, account, pwd);
		SAXReader reader = new SAXReader();
		// 通过read方法读取一个文件 转换成Document对象
		Document document =  DocumentHelper.parseText(reback.trim()); 
		//获取根节点元素对象
		Element node = document.getRootElement();
		Element stateNode = (Element)node.selectSingleNode("//status//state");
		System.out.println(stateNode.getTextTrim());
		System.out.println(reback);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 

	}
	
	/**
	 * 解析xml,返回日志列表
	 * @param fStr
	 * @param key 取属性key值
	 * @return
	 */
	public static List<String> parseXMLLogList(String fStr, String key) {
		List<String> logList = new ArrayList<String>();
		try {
			Document doc;
			doc = DocumentHelper.parseText(fStr);
			Element root = doc.getRootElement();
			String logFiles = root.attribute(key).getValue();
			logList = StringUtil.isNull(logFiles) ? null : Arrays.asList(logFiles.split("\\|"));
		} catch (DocumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return logList;
	}

	/**
	 * 解析xml,返回日志列表
	 * @param fStr
	 * @param key 取属性key值
	 * @return
	 */
	public static String parseXMLLogString(String fStr, String key) {
		String logFiles = "";
		try {
			Document doc;
			System.out.println(fStr);
			doc = DocumentHelper.parseText(fStr);
			Element root = doc.getRootElement();
			logFiles = root.attribute(key).getValue();
		} catch (DocumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return logFiles;
	}
}
