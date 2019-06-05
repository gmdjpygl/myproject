package com.cmd.task;
import java.io.*;
import java.util.Properties;

import javax.servlet.*;
import javax.servlet.http.*;

/**
 * 重新配置定时任务
 * @author Join
 *
 */
public class DealTableTimeRunServlet extends HttpServlet {

	
	private static Properties p =null;
	

	public void init() throws ServletException {
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		DealTableTimer.task.cancel();
		DealTableTimer.timer.scheduleAtFixedRate(DealTableTimer.getTask(), 1000*1, 1000*2);
	}
	
	public void destroy() {
	}
}