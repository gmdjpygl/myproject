import java.util.Date;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.catalina.connector.InputBuffer;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.util.EntityUtils;
import org.junit.Test;

import com.cmd.HttpClientUtil;


public class TestUtil {
	@Test
	public void t(){
		
		System.out.println("大".startsWith("DC"));
		double v = (double)Integer.parseInt("1d89",16);
		System.out.println(v);
    }
	@Test
	public void tThread2(){
		ExecutorService fixedThreadPool = Executors.newFixedThreadPool(3);
		for (int i = 0; i < 10; i++) {
		    final int index = i;
		    System.out.println(index);
		    fixedThreadPool.execute(new Runnable() {
		        @Override
		        public void run() {
		            try {
		                System.out.println("--------"+index);
		                System.out.println(new Date());
		                System.out.println("---------"); 
		                Thread.sleep(1);
		                System.out.println(new Date());
		            } catch (InterruptedException e) {
		                // TODO Auto-generated catch block
		                e.printStackTrace();
		            }
		        }
		    });
		}
	}
	@Test
	public void tUrl(){
		HttpResponse httpResponse;
		try {
			Map<String,Object> map = HttpClientUtil.doHttpPost("http://ahw.zetadata.com.cn/mobile/index.php?act=login&op=register","{}");
			
			System.out.println(map.get("content"));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
}	

