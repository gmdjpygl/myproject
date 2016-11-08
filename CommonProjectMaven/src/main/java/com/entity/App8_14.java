package com.entity;

public class App8_14 {
	public static void main(String[] args) {
		// 创建匿名内部类Inner的对象
		(new Inner() {
			void setName(String n) {
				name = n;
				System.out.println("姓名：" + name);// 以上三句是为弥补内部
			} // 类Inner里没有定义到的方法
		} // 创建匿名内部类Inner的对象
		).setName("张  华"); // 执行匿名内部类里所定义的方法
	}

	// 定义内部类
	static class Inner {
		String name;
		int age;
	}
}
