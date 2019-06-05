package com.cmd.task;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimerTask;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.log4j.Logger;

import com.cmd.ConfigUtil;
import com.cmd.DateUtil;
import com.cmd.HttpClientUtil;
import com.cmd.JDBCC3p0Util;
import com.cmd.service.DataJoinService;

public class DealTableTimerTask extends TimerTask {
    public Logger logger= Logger.getLogger(DataJoinService.class);
	public static ExecutorService fixedThreadPool;
	static {
			fixedThreadPool = Executors.newFixedThreadPool(100);
	}

	@Override
	public void run() {
		String sbUrl = ConfigUtil.getPropertyValue("sbUrl");
		logger.info("-------task run:" + DateUtil.getDateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));
		try {
			String querySql = "select t.device_id,t.coding from device_send_coding t order by t.site_item";
			List<Map<String, Object>> deviceList = JDBCC3p0Util.query(querySql,null);
			
			int step =30;
			int num = deviceList.size()/step;
			Object[][] arr = new Object[num+1][step];
			for(int i=0;i<deviceList.size();i++){
				int x = i/step;
				int y= i%step;
				arr[x][y] = deviceList.get(i);
			}
			for(int y=0;y<step;y++){
				int n=y;
				Thread.sleep(1000*1);
				for(int x=0;x<=num;x++){
					// 如果空就退出
					if(arr[x][y]==null) continue;
					
					Map<String, Object> obj = (Map<String, Object>)arr[x][y];
					String deviceId = (String) obj.get("DEVICE_ID");
					String coding = (String) obj.get("CODING");
					String msg = "{\"deviceId\":\"" + deviceId + "\",\"data\":\"" + coding + "\"}";
					
					fixedThreadPool.execute(new Runnable() {
						@Override
						public void run() {
							try {
								Map<String,Object> map = HttpClientUtil.doHttpPost(sbUrl,msg);
								int status =(int)map.get("status");
								if(status!=200){
									logger.error(msg+":"+status+":"+(String)map.get("content"));
								}
							} catch (Exception e) {
								logger.error(msg);
								e.printStackTrace();
							}
						}
					});
				}
			}
			logger.info("-------task end:" + DateUtil.getDateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
