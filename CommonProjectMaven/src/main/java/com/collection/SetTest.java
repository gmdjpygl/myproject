package com.collection;

import java.util.HashSet;
import java.util.Set;

import org.junit.Test;

public class SetTest {
	@Test
	public void removeTest(){
		Set<String> s = new HashSet<String>();
		s.add("1");
		s.add("2");
		s.add("3");
		s.add("4");
		s.add("5");
		s.add("6");
		for(String ss : s){
			System.out.println(ss);
		}
		int i=1;
		for(String ss:s){
			if(i==1){
				s.remove(ss);
			}
			if(i==4){
				s.remove(ss);
			}
			System.out.println(i++);
		}
		for(String ss : s){
			System.out.println(ss);
		}
	}
}
