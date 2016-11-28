package com.javaUtil;

import java.io.File;
import java.io.IOException;

import org.junit.Test;

public class FileUtilTest {
	@Test
	public void t(){
		String path0 = "c:/aa/bb/cc/";
	    String path1 = "c:/aa/bb/cc/kkk.java";
	
	    File f = new File(path0);
	
	    // 创建文件夹
	    if (!f.exists()) {
	        f.mkdirs();
	    }
	
	    f = new File(path1);
	
	    // 创建文件
	    if (!f.exists()) {
	        try {
	            f.createNewFile();
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
	    }
	}
}
