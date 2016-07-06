import org.junit.Test;

import com.massclouds.cmobile.center.common.util.StringUtil;


public class StringUtilTest {
	@Test
	public void createSerialNumberTest(){
	System.out.println(StringUtil.createSerialNumber(555555, 5));
		System.out.println(StringUtil.createSerialNumber(544, 5));
		System.out.println(StringUtil.createSerialNumber(5, 5));
		char[] c = {'1','1','1'};
		System.out.println(c.toString());
	}
	
}
