package com.genericity;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class GenericDemo {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		List<String> li = new ArrayList<String>();
		li.add("java");
		// li.add(100);如果插入的元素师int型，就会出现添加类型错误，因为已经定义了li集合对象是String类型的
		li.add("C++");
		li.add("php");
		// 迭代器也必须指定String泛型，这样避免了迭代出来的数据后，还得进行强转。
		Iterator<String> it = li.iterator();
		while (it.hasNext()) {
			// 此处在没有定义泛型之前必须进行强转，因为iterator的next方法迭代出来的数据是不确定的类型
			String string = it.next();
			System.out.println(string);

		}
	}

}