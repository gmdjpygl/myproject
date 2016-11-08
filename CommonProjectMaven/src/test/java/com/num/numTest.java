package com.num;

import java.math.BigDecimal;
import java.util.List;

import org.junit.Test;

public class numTest {
	@Test
	public void intTest(){
		System.out.println(Short.MAX_VALUE);
		System.out.println(Short.MIN_VALUE);
		System.out.println(Integer.MAX_VALUE);
		System.out.println(Integer.MIN_VALUE);
		System.out.println(Long.MIN_VALUE);
		System.out.println(Long.MIN_VALUE);
		System.out.println(Float.MIN_VALUE);
		System.out.println(Float.MIN_VALUE);
		System.out.println(Double.MIN_VALUE);
		System.out.println(Double.MIN_VALUE);
		System.out.println(new BigDecimal(Double.MAX_VALUE).toString());
		System.out.println(new BigDecimal(Double.MIN_VALUE).toString());
	}
}
