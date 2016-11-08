package com.genericity;

import java.util.ArrayList;
import java.util.List;

public class GenericDemo1 {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		List<? extends Object> li = new ArrayList<String>();
		/*
		 * 这样添加是错误的，String虽然是Object的子类，但是Object的子类非常多，
		 * 你不确定它是哪个？既然不确定，又怎么添加具体类型的对象呢？
		 */
		//li.add("abc");
		List<? super String> lia = new ArrayList<Object>();
		/*
		 * 这样是可以的，下限。因为"abc"是字符串对象，而lia的集合规定了，只能添加String类型或者它的父类对象 ，所以是可以的
		 */
		lia.add("123");
		// 不可以在new的时候使用通配符。因为创建的时候，必须明确它的类型
		// ArrayList lib = new ArrayList<? extends Object>();
		List<?> list1 = new ArrayList();
		List<?> list2 = new ArrayList<String>();
		List<? extends Object> pList = new ArrayList<Object>();
		List<? super String> sList = new ArrayList<String>();
		List<?> list3 = sList;
		//list1.add("abc");//error，因为list不确定是什么类型的集合。
		list1.isEmpty();
		list2.isEmpty();// 这个可以是因为使用Object引用来指向isEmpty()方法的返回值了
		// list3.add(123);// 它是不确定的类型集合，既然不确定就不能添加具体的对象，而默认的是Object的类型。
	}

	// 可以在定义的时候使用通配符。因为你在给它传入参数的时候，指定了它的一个范围。
	public static void fun(List<? extends Object> list, String str) {
		// 只能对集合中的元素调用Object类中的方法，具体子类型的方法都不能用，因为子类型不确定。
		// 用Object的get方法引用指向了它的返回值
		System.out.println(list.get(0));
	}
}