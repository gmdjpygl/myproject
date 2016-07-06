import java.net.URL;
import java.net.URLConnection;
import java.util.Date;

import org.junit.Test;

import com.massclouds.cmobile.center.common.util.DateUtil;
import com.massclouds.cmobile.center.service.domain.VMModule;
import com.massclouds.cmobile.center.service.util.HttpsRequestUtil;
import com.massclouds.cmobile.center.service.util.HttpsUnmarshallerUtil;

public class TestHttp {
	@Test
	public void sendHttpsByPutTest() {
		String url = "https://192.168.102.38/api/vms/997f3b37-b6c5-498c-81b5-c124469f97ad";
		String param = "<vm><name>testgg</name><memory>1147483648</memory><cpu><topology cores=\"5\" /></cpu></vm>";
		String userName = "sysadmin@internal";
		String password = "admin==1";
		try {
			
			VMModule v = HttpsUnmarshallerUtil.sendHttpsByPut(VMModule.class,url, param, userName, password);
			System.out.println("11");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	@Test
	public void testTimeOut() {
		try {
			String url = "https://192.168.105.51/api";
			System.out.println(DateUtil.formatDateToStr(new Date(), "hh:MM:ss"));
			System.out.println(HttpsRequestUtil.checkOnline(url, "sysadmin@internall", "admin==1"));
			System.out.println(DateUtil.formatDateToStr(new Date(), "hh:MM:ss"));
		} catch (Exception e) {
			System.out.println(DateUtil.formatDateToStr(new Date(), "hh:MM:ss"));
			e.printStackTrace();
		}
	}
}
