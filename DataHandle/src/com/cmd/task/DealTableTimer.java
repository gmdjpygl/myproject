package com.cmd.task;

import java.util.Timer;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.cmd.ConfigUtil;
import com.cmd.NumberUtil;

public class DealTableTimer implements ServletContextListener {
	public static Timer timer = null;
	public static DealTableTimerTask task = null;

	public static Timer getTimer() {
		if (timer == null) {
			return timer = new Timer();
		}
		return timer;
	}
	public static DealTableTimerTask getTask() {
		return task = new DealTableTimerTask();
	}

	public DealTableTimer() {
		super();
	}

	@Override
	public void contextInitialized(ServletContextEvent servletContextEvent) {
		getTimer();
		servletContextEvent.getServletContext().log("【INFO】定时器启动.");
		String period = ConfigUtil.getPropertyValue("period");
		timer.scheduleAtFixedRate(getTask(), 1000*1, 1000*60*Integer.parseInt(period));
	}

	@Override
	public void contextDestroyed(ServletContextEvent servletContextEvent) {
		timer.cancel();
		servletContextEvent.getServletContext().log("【INFO】定时器结束.");
	}

}