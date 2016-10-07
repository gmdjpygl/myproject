import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.Test;



public class t {
	
	public static void main(String[] args) {
		File f = new File("/usr/1.txt");
		try {
			f.createNewFile();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	@Test
	public void tHost(){
		try {
			String ip = InetAddress.getLocalHost().getHostAddress();
			Pattern pattern = Pattern.compile("([1-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])(\\.(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])){3}",Pattern.CASE_INSENSITIVE);
			Matcher matcher = pattern.matcher(ip);
			System.out.println(matcher.matches());
		} catch (UnknownHostException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	@Test
	public void tt(){
		int x =2;
		System.out.println((++x)+(++x));
		System.out.println(x);
	}
}
