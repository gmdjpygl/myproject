package com.cmd.task;

import java.util.TimerTask;
import com.cmd.ConfigUtil;
import com.cmd.HttpClientUtil;
public class DataSubTimerTask extends TimerTask {

	@Override
	public void run() {
		try {
			String subFSUrl = ConfigUtil.getPropertyValue("subFSUrl");
			String subUrl = ConfigUtil.getPropertyValue("subUrl");
			String msg = "{\"notifyType\":\"deviceDataChanged\",\"callbackurl\":\"" + subUrl + "\"}";
			try {
				HttpClientUtil.doHttpPost(subFSUrl,msg);
			} catch (Exception e) {
				e.printStackTrace();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
