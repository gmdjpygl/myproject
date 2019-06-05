package com.cmd;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TimerTask;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.util.EntityUtils;

public class ConfigUtil  {
	private static Properties p = null;
	// ��ȡ�����ļ��Ҽ������ݿ�����
	static {
		// ʵ����һ��properties���������������ǵ������ļ�
		p = new Properties();
		// ͨ�������������ȡ���ǵ������ļ������ֽ�������ʽ��ȡ
		InputStream in = JDBCUtil.class.getClassLoader().getResourceAsStream(
				"config.properties");
		try {
			// �������ļ����絽Propreties���������н���
			p.load(in);
			// ��ȡ�����ļ�
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}
	public static String getPropertyValue(String key){
		return p.getProperty(key);
	}
}
