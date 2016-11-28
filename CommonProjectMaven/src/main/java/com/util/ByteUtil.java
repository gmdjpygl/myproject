package com.util;

public class ByteUtil {
	/**
	 * int转byte数组(低位在前高位在后)
	 * 
	 * @param res
	 * @return
	 */
	public static byte[] intToByte(int res) {
		byte[] byteArr = new byte[4];
		byteArr[0] = (byte) (res & 0xff);// 最低位(经测试0xff加不加都可以)
		byteArr[1] = (byte) ((res >> 8) & 0xff);// 次低位
		byteArr[2] = (byte) ((res >> 16) & 0xff);// 次高位
		byteArr[3] = (byte) (res >>> 24);// 最高位,无符号右移。
		return byteArr;
	}

	/**
	 * int转byte数组(低位在前高位在后)
	 * 
	 * @param res
	 * @param length(截取字节长度)
	 * @return
	 */
	public static byte[] intToByte(int res, int length) {
		byte[] byteArr = new byte[length];
		for (int i = 0; i < byteArr.length; i++) {
			byteArr[i] = (byte) ((res >> 8 * i) & 0xff);
		}
		return byteArr;
	}

	/**
	 * byte数组转int(低位在前高位在后)
	 * 
	 * @param byteArr
	 * @return
	 */
	public static int byteToInt(byte[] byteArr) {
		int iOutcome = 0;
		byte bLoop;
		for (int i = 0; i < byteArr.length; i++) {
			bLoop = byteArr[i];
			iOutcome += (bLoop & 0xFF) << (8 * i);
		}
		return iOutcome;
	}
	/**
	 * byte数组转int(低位在前高位在后)
	 * 
	 * @param byteArr
	 * @return
	 */
	public static int byteToInt2(byte[] byteArr) {
		int iOutcome = 0;
		iOutcome += (byteArr[0] & 0xFF);
		iOutcome += (byteArr[1] & 0xFF) << 8;
		iOutcome += (byteArr[2] & 0xFF) << 16;
		iOutcome += (byteArr[3] & 0xFF) << 24;
		return iOutcome;
	}
}
