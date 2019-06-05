package com.cmd;

/**
 * 日期工具类
 * 
 */
public class NumberUtil {

	public static int parseInt(String str) {
		if (str != null && !str.equals("")) {
			return Integer.parseInt(str);
		}
		return 0;
	}
	public static int parseInt(String str,int radix) {
		if (str != null && !str.equals("")) {
			return Integer.parseInt(str,radix);
		}
		return 0;
	}
	public static double parseDouble(String str,int radix) {
		if (str != null && !str.equals("")) {
			return Integer.parseInt(str,radix);
		}
		return 0;
	}
	/**
	 * 计算电导率
	 * 
	 * @param str
	 * @return
	 */
	public static double paraseDDL(String str) {
		double v = (double) (parseDouble(str,16) / 1000 - 4) * 2000 / 16;
		return v;
	}

	/**
	 * 解析420MA数据
	 * 
	 * @param str
	 * @return
	 */
	public static double parase420MA(String str) {
		double v = (double) (parseDouble(str,16));
		return v;
	}

	/**
	 * 解析IO数据
	 * 
	 * @param str
	 * @return
	 */
	public static double paraseIO(String str) {
		double d = 0;
		if (str.equals("00FF")) {
			d = 0;
		} else if (str.equals("0000")) {
			d = 1;
		}
		return d;
	}
}