package com.javaUtil;

import org.junit.Test;

public class AsciiUtil {
	@Test
	public void a(){
		String a = "abcedefghzlml1234567890";
		byte [] bArr = a.getBytes();
		System.out.println(asciiToString(bArr));
	}
	public static String asciiToString(byte[] bArr){
		String str="";
		for(byte b : bArr){
			str+=(char)b;
		}
		return str;
	}
}
