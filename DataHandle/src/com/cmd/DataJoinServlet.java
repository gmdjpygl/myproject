package com.cmd;
// 导入必需的 java 库
import java.io.*;
import java.util.Properties;

import javax.servlet.*;
import javax.servlet.http.*;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.cmd.service.DataJoinService;
// 扩展 HttpServlet 类
public class DataJoinServlet extends HttpServlet {

	private String message;
	
	private static Properties p =null;
	

	public void init() throws ServletException {
		// 执行必需的初始化
		message = "Hello World";
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		System.out.println(111);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// 设置响应内容类型
		String json = DataJoinService.acceptJSON(request);
		DataModel dataModel = JSON.parseObject(json, new TypeReference<DataModel>() {});
		String eventTime = dataModel.getService().getEventTime().replaceAll("T", "").replaceAll("Z", "");
		String dataStr = dataModel.getService().getData().getData();
		DataJoinService.saveMessage(dataModel.getDeviceId(),dataStr,json,eventTime);

		//如果是心跳就退出
		if(dataStr.startsWith("DC")){
			return;
		}
		if(dataStr.length()>20){
			// 保存IOT数据
			DataJoinService.saveIOTData(dataModel.getDeviceId(),dataStr,eventTime);
		}else{
			// 保存PLC数据
			DataJoinService.savePLCData(dataModel.getDeviceId(),dataStr,eventTime); 
		}
	}
	
	public void destroy() {
		// 什么也不做
	}
}