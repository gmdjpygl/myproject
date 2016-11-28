package com.javaUtil;

import org.junit.Test;

import com.util.ByteUtil;

public class IntegerUitlTest {
	@Test
	public void a() {
		Integer i = -255;
		byte[] byteArr = ByteUtil.intToByte(i);
		System.out.println(ByteUtil.byteToInt2(byteArr));
		byteArr = ByteUtil.intToByte(i, 4);
		System.out.println(ByteUtil.byteToInt(byteArr));
	}

	@Test
	public void b() {
		int res = -1;
		byte[] t = intToByte(res);
		byte[] t2 = intToByte2(res);
		for (byte b : t) {
			System.out.print(b + "\t");
		}
		System.out.println("");
		for (byte b : t2) {
			System.out.print(b + "\t");
		}
		System.out.println("");
	}

	public static byte[] intToByte(int res) {
		byte[] byteArr = new byte[4];
		byteArr[0] = (byte) (res & 0xff);// 最低位
		byteArr[1] = (byte) ((res >> 8) & 0xff);// 次低位
		byteArr[2] = (byte) ((res >> 16) & 0xff);// 次高位
		byteArr[3] = (byte) (res >>> 24);// 最高位,无符号右移。
		return byteArr;
	}

	public static byte[] intToByte2(int res) {
		byte[] byteArr = new byte[4];
		byteArr[0] = (byte) (res);// 最低位
		byteArr[1] = (byte) ((res >> 8));// 次低位
		byteArr[2] = (byte) ((res >> 16));// 次高位
		byteArr[3] = (byte) (res >>> 24);// 最高位,无符号右移。
		return byteArr;
	}

	@Test
	public void c() {
		int res = -255;
		byte[] t = intToByte(res);
		byteToInt(t);
		byteToInt2(t);
	}

	public static int byteToInt(byte[] byteArr) {
		int iOutcome = 0;
		byte bLoop;
		for (int i = 0; i < byteArr.length; i++) {
			bLoop = byteArr[i];
			System.out.print((bLoop & 0xFF) + "\t");
		}
		System.out.println("");
		for (int i = 0; i < byteArr.length; i++) {
			bLoop = byteArr[i];
			iOutcome = (bLoop & 0xFF) << (8 * i);
			System.out.print(iOutcome + "\t");
		}
		System.out.println("");
		return iOutcome;
	}

	public static int byteToInt2(byte[] byteArr) {
		int iOutcome = 0;
		byte bLoop;
		for (int i = 0; i < byteArr.length; i++) {
			bLoop = byteArr[i];
			System.out.print((bLoop) + "\t");
		}
		System.out.println("");
		for (int i = 0; i < byteArr.length; i++) {
			bLoop = byteArr[i];
			iOutcome = (bLoop) << (8 * i);
			System.out.print(iOutcome + "\t");
		}
		System.out.println("");
		return iOutcome;
	}
}
