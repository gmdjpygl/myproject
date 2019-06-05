package com.cmd;
// �������� java ��
import java.io.*;
import java.util.Properties;

import javax.servlet.*;
import javax.servlet.http.*;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.cmd.service.DataJoinService;
// ��չ HttpServlet ��
public class DataJoinServlet extends HttpServlet {

	private String message;
	
	private static Properties p =null;
	

	public void init() throws ServletException {
		// ִ�б���ĳ�ʼ��
		message = "Hello World";
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		System.out.println(111);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// ������Ӧ��������
		String json = DataJoinService.acceptJSON(request);
		DataModel dataModel = JSON.parseObject(json, new TypeReference<DataModel>() {});
		String eventTime = dataModel.getService().getEventTime().replaceAll("T", "").replaceAll("Z", "");
		String dataStr = dataModel.getService().getData().getData();
		DataJoinService.saveMessage(dataModel.getDeviceId(),dataStr,json,eventTime);

		//������������˳�
		if(dataStr.startsWith("DC")){
			return;
		}
		if(dataStr.length()>20){
			// ����IOT����
			DataJoinService.saveIOTData(dataModel.getDeviceId(),dataStr,eventTime);
		}else{
			// ����PLC����
			DataJoinService.savePLCData(dataModel.getDeviceId(),dataStr,eventTime); 
		}
	}
	
	public void destroy() {
		// ʲôҲ����
	}
}