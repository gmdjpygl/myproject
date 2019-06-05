package com.cmd.task;

import java.util.Timer;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.cmd.ConfigUtil;
import com.cmd.NumberUtil;

public class DataSubTimer implements ServletContextListener {
	private static Timer timer = null;

	public static Timer getTimer() {
		if (timer == null) {
			return timer = new Timer();
		}
		return timer;
	}

	public DataSubTimer() {
		super();
	}

	@Override
	public void contextInitialized(ServletContextEvent servletContextEvent) {
		if (timer == null) {
			getTimer();
		}
		servletContextEvent.getServletContext().log("【INFO】订阅定时器启动.");
		String period = ConfigUtil.getPropertyValue("subPeriod");
		timer.schedule(new DataSubTimerTask(), 1000*10, 1000*60*NumberUtil.parseInt(period));
	}

	@Override
	public void contextDestroyed(ServletContextEvent servletContextEvent) {
		timer.cancel();
		servletContextEvent.getServletContext().log("【INFO】订阅定时器结束.");
	}

}