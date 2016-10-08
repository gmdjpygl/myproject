package com.practice.innerClass;

public class C {
	class D {
		private int a = 20;

		private void a() {
			System.out.println("D.A:" + a);
		}
	}

	void show() {
		D d = new D();
		d.a();

		System.out.println("D.A:" + d.a);
	}

	public static void main(String[] args) {
		new C().show();
	}
}