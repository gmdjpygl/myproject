import java.util.Date;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.util.EntityUtils;

import com.cmd.HttpClientUtil;


public class FixedThreadPoolDemo {
	 public static void main(String[] args) {
		 ExecutorService fixedThreadPool = Executors.newFixedThreadPool(10);
		 for(int j=0;j<1;j++){
			for (int i = 0; i < 2; i++) {
				int n = i;
				int s=j;
			    fixedThreadPool.execute(new Runnable() {
			        @Override
			        public void run() {
			            try {
			            	    Thread.sleep(1000*(n%10));
			            	    System.out.println(n);
			            	    Map<String,Object> map = HttpClientUtil.doHttpPost("http://fanyi.baidu.com/v2transapi","{}");
								System.out.println(map.get("content"));
			            } catch (Exception e) {
			                e.printStackTrace();
			            }
			        }
			    });
			}
		 }
	 }
}
