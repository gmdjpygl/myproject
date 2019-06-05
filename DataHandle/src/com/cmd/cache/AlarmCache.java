package com.cmd.cache;

import java.util.Date;


public class AlarmCache {
	private String siteItem;
	private String alarmId;
	private int alarmNum;
	private int normalNum;
	private Date createDate;
	private boolean isFirst;

	
	public AlarmCache() {
		super();
		this.siteItem = "";
		this.alarmId = "";
		this.alarmNum = 0;
		this.normalNum=0;
		this.createDate = new Date();
		this.isFirst=true;
	}

	public String getSiteItem() {
		return siteItem;
	}

	public void setSiteItem(String siteItem) {
		this.siteItem = siteItem;
	}

	public String getAlarmId() {
		return alarmId;
	}

	public void setAlarmId(String alarmId) {
		this.alarmId = alarmId;
	}

	public int getAlarmNum() {
		return alarmNum;
	}

	public void setAlarmNum(int alarmNum) {
		this.alarmNum = alarmNum;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	public boolean getIsFirst() {
		return isFirst;
	}

	public void setIsFirst(boolean isFirst) {
		this.isFirst = isFirst;
	}

	public int getNormalNum() {
		return normalNum;
	}

	public void setNormalNum(int normalNum) {
		this.normalNum = normalNum;
	}
}
