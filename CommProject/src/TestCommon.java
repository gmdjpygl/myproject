import java.io.File;
import java.math.BigDecimal;

import javax.swing.text.Position.Bias;

import org.junit.Test;

public class TestCommon {
	@Test
	public void testDouble() {
		double d = 1.1;

		BigDecimal bd1 = new BigDecimal(-1.1d); // Noncompliant; see comment above
		BigDecimal bd2 = new BigDecimal(-1.1f); // Noncompliant; same result
		BigDecimal bd3 = new BigDecimal(-1l); // Noncompliant; same result
		System.out.println(bd1.toString());
		System.out.println(bd2.toString());
		System.out.println(bd3.toString());
		System.out.println(1.1111f * 1.1111f);
	}

	@Test
	public void testNum() {
		byte b = -11;
		short s = -11;
		int i = -11;
		long l = -11;
		float f = Float.MAX_VALUE;
		double d = -11;
		char c =11;
		//System.out.println(f);
		//System.out.println(Float.MIN_VALUE);
		BigDecimal bD = BigDecimal.valueOf(Integer.MAX_VALUE);
		
		System.out.println(bD.toPlainString());
		
	}
	@Test
	public void testStr() {
		String str = "/File|Name.txt";
		String clean = str.replaceAll("//.","1"); // Noncompliant; probably meant to remove only dot chars, but returns an empty string
		String clean2 = str.replaceAll("/|","_"); // Noncompliant; yields _/_F_i_l_e_|_N_a_m_e_._t_x_t_
		System.out.println(clean);
		System.out.println(clean2);
	}
}
