package com.javaUtil;

import org.junit.Test;


public class EnumUitl {
	public enum EnumTest {
	    MON, TUE, WED, THU, FRI, SAT, SUN,eeeeee;
	}
	@Test
	public void t(){
		for(EnumTest v:EnumTest.values()){
			System.out.println(v);
			
			switch (v) {
	        case MON:
	            System.out.println("今天是星期一");
	            break;
	        case TUE:
	            System.out.println("今天是星期二");
	            break;
	        // ... ...
	        default:
	            System.out.println("---");
	            break;
	        }
		}
	}
}
