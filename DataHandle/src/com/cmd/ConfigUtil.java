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
	// 读取配置文件且加载数据库驱动
	static {
		// 实例化一个properties对象用来解析我们的配置文件
		p = new Properties();
		// 通过类加载器来读取我们的配置文件，以字节流的形式读取
		InputStream in = JDBCUtil.class.getClassLoader().getResourceAsStream(
				"config.properties");
		try {
			// 将配置文件自如到Propreties对象，来进行解析
			p.load(in);
			// 读取配置文件
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}
	public static String getPropertyValue(String key){
		return p.getProperty(key);
	}
}
