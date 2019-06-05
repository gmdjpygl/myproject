package com.cmd;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import org.junit.Test;

import com.cmd.service.DataJoinService;


public class TestUtil {
	
	@Test
	public void saveSbData() {
		//DataJoinService.saveSbData("", "");
		
	}
	public static byte[] hexStringToByte(String hex) {  
        int len = (hex.length() / 2);  
        byte[] result = new byte[len];  
        char[] achar = hex.toCharArray();  
        for (int i = 0; i < len; i++) {  
            int pos = i * 2;  
            result[i] = (byte) (toByte(achar[pos]) << 4 | toByte(achar[pos + 1]));  
        }  
        return result;  
    }  
  
    private static byte toByte(char c) {  
        byte b = (byte) "0123456789abcdef".indexOf(c);  
        return b;  
    } 
}
