package com.cmd;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.net.ssl.SSLContext;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.ParseException;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContexts;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.junit.Test;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

public class HttpClientUtil {

	/**
	 * ���� get����
	 */
	public static String doHttpGet(String url) throws Exception {
		String msg = "";
		CloseableHttpClient httpclient = HttpClients.createDefault();
		try {
			HttpGet httpGet = new HttpGet(url);
			RequestConfig requestConfig=RequestConfig.custom()
					.setConnectTimeout(30000)
					.setConnectionRequestTimeout(10000)
					.setSocketTimeout(30000).build();
			httpGet.setConfig(requestConfig);
			System.out.println("httpGet url:" + httpGet.getURI());
			CloseableHttpResponse response = httpclient.execute(httpGet);
			try {
				HttpEntity entity = response.getEntity();
				if (entity != null) {
					msg = EntityUtils.toString(entity);
				}
			} finally {
				response.close();
			}
		} finally {
			httpclient.close();
		}
		System.out.println("returnHttpGet msg:"+msg);
		return msg;
	}

	public  static Map<String,Object> doHttpPost(String url, String msg) throws Exception {
		CloseableHttpClient httpclient = HttpClients.createDefault();

		try {
			HttpPost post = new HttpPost(url);
			ResponseHandler<?> responseHandler = new BasicResponseHandler();
			// ���÷�����Ϣ�Ĳ���
			StringEntity entity;
			entity = new StringEntity(msg, Charset.forName("utf-8"));
			// ����������������
			//entity.setContentEncoding("UTF-8");
			//entity.setContentType("application/json");
			entity.setContentType("application/json; charset=UTF-8");
			entity.setContentEncoding("utf-8");
			post.setEntity(entity);
			//post.setHeader("Content-Type", "application/json; charset=UTF-8");  
			//Object response =  httpclient.execute(post, responseHandler);
			CloseableHttpResponse httpResponse = httpclient.execute(post);
			RequestConfig requestConfig=RequestConfig.custom()
					.setConnectTimeout(30000)
					.setConnectionRequestTimeout(10000)
					.setSocketTimeout(30000).build();
			post.setConfig(requestConfig);
			
			Map<String,Object> map = new HashMap<String, Object>();
			int status=0;
			if(  httpResponse.getStatusLine() !=null ){					       
				status=httpResponse.getStatusLine().getStatusCode();
            }
			String content = "";
			HttpEntity e = httpResponse.getEntity();
			if(  e !=null ){					       
				content=EntityUtils.toString(e,"UTF-8");
            }
			map.put("status", status);
			map.put("content", content);
			return map;
		} finally {
			httpclient.close();
		}
	}
	public  static Map<String,Object> doHttpPost(String url, Map<String,String> params) throws Exception {
		CloseableHttpClient httpclient = HttpClients.createDefault();
		
		try {
		    HttpClient client = (HttpClient)HttpClients.createDefault(); //��ȡ���Ӷ���.
		    ArrayList<BasicNameValuePair> pairs = new ArrayList<BasicNameValuePair>();//���ڴ�ű�����.
	       //����map �����е�����ת��Ϊ������
	        for (Map.Entry<String,String> entry:  params.entrySet()) {
	         pairs.add(new BasicNameValuePair(entry.getKey(),entry.getValue()));
	       }
	        //�Ա����ݽ���url����
	       UrlEncodedFormEntity urlEncodedFormEntity = new UrlEncodedFormEntity(pairs);
		         
			
			
			
			HttpPost post = new HttpPost(url);
			post.setEntity(urlEncodedFormEntity);
			ResponseHandler<?> responseHandler = new BasicResponseHandler();
			// ���÷�����Ϣ�Ĳ���
			CloseableHttpResponse httpResponse = httpclient.execute(post);
			
			Map<String,Object> map = new HashMap<String, Object>();
			int status=0;
			if(  httpResponse.getStatusLine() !=null ){					       
				status=httpResponse.getStatusLine().getStatusCode();
			}
			String content = "";
			HttpEntity e = httpResponse.getEntity();
			if(  e !=null ){					       
				content=EntityUtils.toString(e,"UTF-8");
			}
			map.put("status", status);
			map.put("content", content);
			return map;
		} finally {
			httpclient.close();
		}
	}
}