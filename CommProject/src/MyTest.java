import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.junit.Test;

import com.massclouds.cmobile.center.common.util.DateUtil;
import com.massclouds.cmobile.center.service.util.CollectionUtil;


public class MyTest {
	@Test
	public void nullTest(){
		//List<String> l =null;
		List<String> l = new ArrayList<String>();
		System.out.println(l.size());
		for(String s:l){
			System.out.println(1);
		}
	}
	@Test
	public void stringbufferTest(){
		StringBuffer s = new StringBuffer();
		a(s);
		System.out.println(s.toString());
	}

	private void a(StringBuffer s) {
		s.append("aaaaaa");
		
	}
	@Test
	public void b(){
		System.out.println(Thread.currentThread().getName());
		String[] c = {"111","222","3333"};
		System.out.println(c.toString());
		System.out.println(CollectionUtil.stringArrayToString(c));
	}
	@Test
	public void Tbefore(){
		Date n1 = new Date(116,3,11);
		Date n2 = new Date(116,3,12);
		Date n3 = new Date(116,3,13);
		Date n4 = new Date(116,3,12);
		System.out.println(n1.before(n4));
		System.out.println(n2.before(n4));
		System.out.println(n3.before(n4));
		
	}
	@Test
	public void tDateUtil(){
		Date startDay =new Date();
		Date endDay =  new Date(116,3,13);
		//System.out.println(DateUtil.getDaysBetweenDates(startDay, endDay));
		Calendar aCalendar = Calendar.getInstance();
       aCalendar.setTime(startDay);
       int day1 = aCalendar.get(Calendar.DAY_OF_YEAR);
       aCalendar.setTime(endDay);
       int day2 = aCalendar.get(Calendar.DAY_OF_YEAR);
       System.out.println(day2 - day1);
	}
	@Test
	public void tCalendar(){
		Date startDay =new Date();
		
		Date day2 = new Date(116,3,22, 12,11, 11);
		
		Calendar aCalendar = Calendar.getInstance();
		aCalendar.setTime(startDay);
		aCalendar.set(Calendar.HOUR, 0);
		aCalendar.set(Calendar.MINUTE, 0);
		aCalendar.set(Calendar.SECOND, 0);
		aCalendar.set(Calendar.MILLISECOND, 0);	
		
		Calendar aCalendar2 = Calendar.getInstance();
		aCalendar2.setTime(day2);
		aCalendar2.set(Calendar.HOUR, 0);
		aCalendar2.set(Calendar.MINUTE, 0);
		aCalendar2.set(Calendar.SECOND, 0);
		aCalendar2.set(Calendar.MILLISECOND, 0);	
		
		System.out.println(24*60*60*1000);
		System.out.println(aCalendar.getTimeInMillis());
		System.out.println(aCalendar2.getTimeInMillis());
		System.out.println(aCalendar.getTimeInMillis()-aCalendar2.getTimeInMillis());
		System.out.println((aCalendar.getTimeInMillis()-aCalendar2.getTimeInMillis())/(24*60*60*1000));
	}
	public static void main(String[] args) {
		System.out.println(Thread.currentThread().getName());
	}
}
