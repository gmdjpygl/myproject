package com.javaUtil;

import java.util.Calendar;
import java.util.Date;

import org.junit.Test;

import com.util.CalendarUtil;

public class TestCalendarUtil {
	@Test
	public void a() {
		Calendar current = Calendar.getInstance();
		System.out.println(current.get(Calendar.YEAR));
		System.out.println(current.get(Calendar.MONTH) + 1);
		System.out.println(current.get(Calendar.DATE));
		System.out.println(current.get(Calendar.DAY_OF_WEEK));
		System.out.println(Calendar.FRIDAY);
		System.out.println("----------");
		System.out.println(current.get(Calendar.DAY_OF_MONTH));
		System.out.println(current.get(Calendar.DAY_OF_YEAR));
		current.add(Calendar.YEAR, 2);
		System.out.println(current.get(Calendar.YEAR));
		System.out.println(Calendar.getInstance().getTimeInMillis());
	}
	@Test
	public void jiange() {
		Calendar current = Calendar.getInstance();
		System.out.println(current.get(Calendar.DAY_OF_MONTH));
		current.set(Calendar.DAY_OF_MONTH, Calendar.DAY_OF_MONTH+20);
		System.out.println(current.get(Calendar.DAY_OF_MONTH));
	}
	@Test
	public void  getMaxDayMonthTest(){
		Calendar time = Calendar.getInstance();
		System.out.println(CalendarUtil.getMaxDayMonth(time));
	}
}
