package com.exception;

import org.junit.Test;

public class ExceptionTest {
	@Test
	public void tTest(){
		
		try {
			ExceptionTest e = new ExceptionTest();
			e.m();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	public void m() throws Exception{
		try {
			throw new RuntimeException("1111111111");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
