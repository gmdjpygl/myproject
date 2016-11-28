package com.util;

public class AsciiUtil {
	/**
	 * 将char 强制转换为byte
	 * 
	 * @param ch
	 * @return
	 */
	public static byte charToByteAscii(char ch) {
		byte byteAscii = (byte) ch;
		return byteAscii;
	}

	/**
	 * 同理，ascii转换为char 直接int强制转换为char
	 * 
	 * @param ascii
	 * @return
	 */
	public static byte byteAsciiToChar(int ascii) {
		char ch = (char) ascii;
		return charToByteAscii(ch);
	}

	/**
	 * 求出字符串的ASCII值和 注意，如果有中文的话，会把一个汉字用两个byte来表示，其值是负数
	 */
	public static int SumStrAscii(String str) {
		byte[] bytestr = str.getBytes();
		int sum = 0;
		for (int i = 0; i < bytestr.length; i++) {
			sum += bytestr[i];
		}
		return sum;
	}
}
