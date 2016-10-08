package com.practice.innerClass;

public class H {
	int a = 1;

	public class A {
		public void Show() {
			System.out.print("a:" + a);
		}
	}

	public static class B {
		public void Show(H h) {
			System.out.print("a:" + h.a);
		}
	}

	public static void main(String[] args) {
		H h = new H();
		// A a = new A();
		A a1 = h.new A();
		B b = new B();
		// B b1 = h.new B();
		B b3 = new H.B();
	}
	public class I extends H.A{
		public I(H h){
			h.super();
		}
	}
	public class J extends H.B{

	}
}