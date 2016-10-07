package com.thread;

class MyThread2 extends Thread {
	private  int ticket = 10;
	public MyThread2(){
		super();
	}
	public MyThread2(Thread t,String s){
		super(t,s);
	}
	public void run() {
		for (int i = 0; i < 20; i++) {
			if (this.ticket > 0) {
				System.out.println("��Ʊ��ticket" + this.ticket--);
			}
		}
	}
};