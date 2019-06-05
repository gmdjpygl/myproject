package com.cmd.task;


import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import com.cmd.ConfigUtil;
import com.cmd.HttpClientUtil;


public class DataSubListener implements HttpSessionListener {
	static{
		String subFSUrl = ConfigUtil.getPropertyValue("subFSUrl");
		String subUrl = ConfigUtil.getPropertyValue("subUrl");
		String msg = "{\"notifyType\":\"deviceDataChanged\",\"callbackurl\":\"" + subUrl + "\"}";
		try {
			HttpClientUtil.doHttpPost(subFSUrl,msg);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
		
	
	@Override
	public void sessionCreated(HttpSessionEvent arg0) {
		System.out.println("0");
		
	}

	@Override
	public void sessionDestroyed(HttpSessionEvent arg0) {
		System.out.println("1");
	}

}
