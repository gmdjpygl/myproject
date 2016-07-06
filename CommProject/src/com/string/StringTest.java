package com.string;

import org.junit.Test;

public class StringTest {
	@Test
	public void lengthTest(){
		String s="0123456789";
		System.out.println(s.length());
		System.out.println(s.substring(0,1));
	}
	@Test
	public void reTest(){
		String detail="[中画谱VM. Thevmrevm  vms svm vm中  国vm .vm vm.  VM    vm]";
		System.out.println(detail);
		detail = detail.substring(1,detail.length()-1);
		//detail = detail.replaceAll("(\\W)([vV][mM])(\\W|\\s)", "$1虚拟机$3");
		// 只翻译认为是单词的vm为虚拟机
		detail = detail.replaceAll("(\\b|\\W)([vV][mM])(\\b|\\W)", "$1虚拟机$3");
		System.out.println(detail);
	}
}
