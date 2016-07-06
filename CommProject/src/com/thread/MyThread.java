package com.thread;

import java.util.Timer;

public class MyThread extends Thread {
	private String name;

	public MyThread(String name) {
		super();
		this.name = name;
	}

	public void run() {
		for (int i = 0; i < 5; i++) {
			try {
				if(name.equals("�߳�a")){
					Thread.sleep(3000);
				}else{
					Thread.sleep(2000);
				}
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			System.out.println(currentThread().getName());
			System.out.println(ThreadDemo.i++);
			System.out.println("�߳̿�ʼ��" + this.name + ",i=" + i);
		}
	}
}
