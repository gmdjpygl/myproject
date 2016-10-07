package com.thread;
class MyThread1 implements Runnable{
    private int ticket =15;
    public void run(){
        for(int i =0;i<15;i++){
            if(this.ticket>0){
            	try {
					Thread.sleep(1000);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
                System.out.println(Thread.currentThread().getName()+"��Ʊ---->"+(this.ticket--));
            }
        }
    }
}
