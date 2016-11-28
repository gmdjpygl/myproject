package com.javaUtil;

import java.util.Arrays;

import org.junit.Test;

public class ArraysUitl {
	@Test
	public void a(){
		String [] arr = {"aa","cc","bb"};
		System.out.println(Arrays.toString(arr));
		System.out.println(Arrays.binarySearch(arr, "a"));
	}
}
