import java.util.concurrent.Executors;  
import java.util.concurrent.ScheduledExecutorService;  
import java.util.concurrent.TimeUnit;  
  
public class TestTimer {  
    //�̳߳��ܰ�ʱ��ƻ���ִ�����������û��趨�ƻ�ִ�������ʱ�䣬int���͵Ĳ������趨  
    //�̳߳����̵߳���С��Ŀ��������϶�ʱ���̳߳ؿ��ܻ��Զ���������Ĺ����߳���ִ������  
    //�˴���Executors.newSingleThreadScheduledExecutor()���ѡ�
    public ScheduledExecutorService scheduExec = Executors.newScheduledThreadPool(1);  
    //������ʱ��  
    public void lanuchTimer(){  
        Runnable task = new Runnable() {  
            public void run() {  
            	try {
					System.err.println("----------------");
					throw new RuntimeException();
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}  
            }  
        };  
        scheduExec.scheduleWithFixedDelay(task, 1000*5, 1000*2, TimeUnit.MILLISECONDS);  
    }  
    //���������  
    public void addOneTask(){  
        Runnable task = new Runnable() {  
            public void run() {  
                System.out.println("welcome to china");  
            }  
        };  
        scheduExec.scheduleWithFixedDelay(task, 1000*1, 1000, TimeUnit.MILLISECONDS);  
    }  
      
    public static void main(String[] args) throws Exception {  
    	TestTimer test = new TestTimer();  
        test.lanuchTimer();  
        //Thread.sleep(1000*5);//5����֮�����������  
       // test.addOneTask();  
    }  
}