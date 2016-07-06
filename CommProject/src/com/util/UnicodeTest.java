package com.util;

import org.junit.Test;

import com.massclouds.cmobile.center.common.util.UnicodeUtil;

public class UnicodeTest {
	@Test
	public void gbTest(){
		String s = "\u865a\u62df\u673a\u64cd\u4f5c\u5931\u8d25";
		String ss = "\\u865a\\u62df\\u673a\\u64cd\\u4f5c\\u5931\\u8d25";
		System.out.println(UnicodeUtil.gbEncoding("中国中国中国中国中国"));
		System.out.println(s );
		System.out.println(ss.replaceAll("\\\\", "\\") );
	}
}
