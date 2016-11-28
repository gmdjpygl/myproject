package com.javaUtil;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import org.junit.Test;

import com.Comparator.Paixu;
import com.entity.Student;

public class TestListUitl {
	@Test
	public void a() {
		List<Integer> l = null;
		//System.out.println(l.isEmpty());
		l = new ArrayList<Integer>();
		l.add(10);
		l.add(4);
		l.add(8);
		l.add(12);
		Collections.sort(l);
		for(Integer i:l){
			System.out.println(i);
		}
		System.out.println(l.isEmpty());
	}
	@Test
	public void sortTest(){
		ArrayList<Student> list = new ArrayList<Student>();
        Student zhangsan= new Student("张三", 11);
        Student lisi= new Student("李四", 12);
        Student wangwu= new Student("王五", 13);
        list.add(zhangsan);
        list.add(lisi);
        list.add(lisi);
        list.add(lisi);
        list.add(lisi);
        list.add(wangwu);
        list.add(1, wangwu);
        list.get(3).setName("我换了个名字");
        System.out.println(list.size());
        Collections.sort(list, new Paixu());//排序
        for(Student s:list){ //foreach语句
            System.out.println(s.getName()+":"+s.getage());
        }   
        Random random = new Random();

	}
	@Test
	public void addTest(){
		try {
			List<Integer> l = new ArrayList<Integer>();
			l.add(1);
			l.add(2);
			List<Integer> ll = new ArrayList<Integer>();
			ll.add(2);
			ll.add(3);
			ll.add(4);
			for(int ii :ll){
				for(int i :l){
					System.out.println(i);
				}
				l.add(10);
			}
			String a []={"11","222"};
			Arrays.copyOf(a, 5);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
