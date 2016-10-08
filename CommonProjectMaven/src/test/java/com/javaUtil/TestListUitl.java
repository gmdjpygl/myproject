package com.javaUtil;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.junit.Test;

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
}
