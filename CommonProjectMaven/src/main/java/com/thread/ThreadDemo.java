package com.thread;

import org.junit.Test;

public class ThreadDemo {
	public static int i=0;
	public static void main(String[] args) {
		MyThread mt1 = new MyThread("�߳�a");
		MyThread mt2 = new MyThread("�߳�b");
		
		//mt1.start();
		//mt2.start();
		mt1.run();
		mt2.run();
	}
	@Test
	public void t(){
		MyThread mt1 = new MyThread("�߳�a");
		MyThread mt2 = new MyThread("�߳�b");
		
		//mt1.start();
		//mt2.start();
		mt1.run();
		mt2.run();
	}
}
/*public class ThreadDemo extends Thread {
	public void run() {
		for (int i = 0; i <= 5; i++) {
			try {
				System.out.println(currentThread().getName() + "---" + i);
				sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

	public static void main(String[] args) {
		ThreadDemo t = new ThreadDemo();
		t.start();
		t.run();
	}
}*/