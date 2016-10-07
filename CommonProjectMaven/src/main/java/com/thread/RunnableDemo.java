package com.thread;

public class RunnableDemo {
	public static void main(String[] args) {
		/*// TODO Auto-generated method stub
		// �������߳�
		MyThread1 mt = new MyThread1();
		MyThread1 mt2 = new MyThread1();
		Thread t1 = new Thread(mt, "һ�Ŵ���");
		Thread t2 = new Thread(mt, "���Ŵ���");
		Thread t3 = new Thread(mt2, "��Ŵ���");
		// MyThread1 mt2 = new MyThread1();
		// MyThread1 mt3 = new MyThread1();
		t1.start();
		t2.start();
		t3.start();*/
		MyThread2 m = new MyThread2();
		MyThread2 m1 = new MyThread2(m,"aa");
		MyThread2 m2 = new MyThread2(m,"ss");
		m1.start();
		m2.start();
	}
}
