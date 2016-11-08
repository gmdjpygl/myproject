package com.entity;

import java.util.ArrayList;

import org.junit.Test;

public class FanXingTest {
	@Test
	public void a() {
		Integer[] a = { 9, 5, 1, 2, 3, 4 };
		Pair<Integer> pair = ArrayAlg.minmax(a);
		System.out.println("最小值为：" + pair.getFirst());
		System.out.println("最大值为：" + pair.getSecond());
	}

/*	@Test
	public void a2() {

		Student zhangsan = new Student("张三", 11);
		Student lisi = new Student("李四", 12);
		Student wangwu = new Student("王五", 13);
		Student[] arr = { zhangsan, lisi, wangwu };
		Pair<Student> pair = ArrayAlg.minmax(arr);
	}*/
}
