package com.util;

import java.util.Calendar;

public class CalendarUtil {
	/**
	 * 月最大天数
	 * @param time
	 * @return
	 */
	public static int getMaxDayMonth(Calendar time){
		time.set(Calendar.DAY_OF_MONTH, 1);
		time.set(Calendar.MONTH, time.get(Calendar.MONTH)+1);
		time.add(Calendar.DAY_OF_MONTH, -1);
		return time.get(Calendar.DAY_OF_MONTH);
	}
}
