package com.cmd.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

import com.cmd.ConfigUtil;
import com.cmd.DateUtil;
import com.cmd.HttpClientUtil;
import com.cmd.JDBCC3p0Util;
import com.cmd.NumberUtil;
import com.cmd.cache.AlarmCache;
import com.cmd.cache.AlarmCacheMap;
import com.cmd.task.DealTableTimerTask;

public class DataJoinService {
    static Logger logger= Logger.getLogger(DataJoinService.class);
	public static void saveMessage(String deviceId,String dataStr,String json, String eventTime) {
		String id = UUID.randomUUID().toString();
		json = json.replaceAll("\"", "");
		//保存到历史表
		String sql = "insert into M_MONI_DATA_MESSAGE (ID,device_Id, message,dataStr, DATA_TIME)"+
				"values ('"+id+"', '"+deviceId+"', '"+json+"','"+dataStr+"', to_date('"+eventTime+"', 'yyyymmddHH24miss'))";
		JDBCC3p0Util.save(sql, null);
		
	}  
	
	public static void savePLCData(String deviceId,String dataStr,String dateTime) {
		int l = Integer.parseInt(dataStr.substring(4,6), 16);
		String data =dataStr.substring(6,6+l*2);
		String str =data16To2(data);
		String dataType = dataStr.substring(2,4);
		char[] list = str.toCharArray();
		StringBuffer querySql = new StringBuffer();
		querySql.append("select t.SITE_ITEM,t.POSITION from device_item_config t");
		querySql.append("	where t.device_id='"+deviceId +"' and data_Type='"+dataType+"'");
		querySql.append("	and  device_type='PLC'");
		List<Map<String,Object>> deviceList= JDBCC3p0Util.query(querySql.toString(),null);
		if(deviceList!=null && !deviceList.isEmpty()){
			for(Map<String,Object> map:deviceList){
				String siteItem =(String)map.get("SITE_ITEM");
				String position =(String)map.get("POSITION");
				if(list.length>Integer.parseInt(position)){
					saveData(siteItem,list[Integer.parseInt(position)]+"",dateTime);
				}
			}
			
		}		
	}
	public static void saveIOTData(String deviceId,String dataStr,String dateTime) {
		
		StringBuffer querySql = new StringBuffer();
		querySql.append("select t.SITE_ITEM,t.POSITION from device_item_config t");
		querySql.append("	where t.device_id='"+deviceId +"'");
		querySql.append("	and  device_type='IOT'");
		List<Map<String,Object>> deviceList= JDBCC3p0Util.query(querySql.toString(),null);
		if(deviceList!=null && !deviceList.isEmpty()){
			for(Map<String,Object> map:deviceList){
				String siteItem =(String)map.get("SITE_ITEM");
				int position =NumberUtil.parseInt((String)map.get("POSITION"));
				double v = 0;
				if(position==5){
					v = NumberUtil.paraseDDL(dataStr.substring(6+(position-1)*4,6+4+(position-1)*4));
				}else if(position>5 && position<=8){
					v = NumberUtil.parase420MA(dataStr.substring(6+(position-1)*4,6+4+(position-1)*4));
				}else if(position>=0 && position<5){
					v = NumberUtil.paraseIO(dataStr.substring(6+(position-1)*4,6+4+(position-1)*4));
				}
				saveData(siteItem,v+"",dateTime);
				
			}
		}		
	}
	// 首次报警需要连续报警4条记录 恢复正常需要连续2次正常数据
	public static void saveData(String siteItem,String dataValue,String dataTimestr){
		String id = UUID.randomUUID().toString();
		String inputDate = DateUtil.getDateFormat(new Date(),"yyyy-MM-dd HH:mm:ss");
		Date dataTime = DateUtil.formatDate(dataTimestr,"yyyyMMddHHmmss");
		try {
			// 只保存0到4000内的数据 
			if(Double.valueOf(dataValue)>=0 && Double.valueOf(dataValue)<=5000 ){
		
				// 判断是否存在
				String querySql = "select site_item,to_char(data_time,'yyyy-mm-dd hh24:mi:ss') data_time from m_moni_data  where site_item='"+siteItem+"'";
				List<Map<String,Object>> datalist = JDBCC3p0Util.query(querySql,null);
				boolean isSave=true;
				if(datalist!=null && datalist.size()>0){
					Date preDate = DateUtil.formatDate((String)datalist.get(0).get("DATA_TIME"),"yyyy-MM-dd HH:mm:ss");
				    long mi= (dataTime.getTime()-preDate.getTime())/(1000*60);
				    if(mi<4){
				    	isSave = false;
				    }
				}
				if(isSave){
					//判断是否触发报警
					 querySql = "select id from m_moni_alerm_config t "+
					                  " where t.conf_struct_id='"+siteItem+"' "+
					                  " and ((t.lower_limit<="+dataValue+" and t.upper_limit>"+dataValue+") or t.lower_limit="+dataValue+")"+
					                  " and t.alarm_type_code in ('YX_1401','YX_1402')";
					List<Map<String,Object>> isAlarm = JDBCC3p0Util.query(querySql,null);
					//重新采集
					if(isAlarm!=null && isAlarm.size()>0){
						String alarmId = (String)isAlarm.get(0).get("ID");
						AlarmCache alarmCache = AlarmCacheMap.getCache(siteItem);
						alarmCache.setNormalNum(0);
						int checkState = checkAlarmCacheState(alarmCache, alarmId,dataTime);
						logger.info("---cs:"+checkState+"---si:"+siteItem+"---dv:"+dataValue+"---ai:"+alarmId);
						if(checkState==1 || checkState==2 ||checkState==3){
							sendRequest(siteItem);
							return;
						}else{
							if(alarmCache.getIsFirst()){
								dataTimestr=DateUtil.getDateFormat(alarmCache.getCreateDate(),"yyyyMMddHHmmss");
							}
							alarmCache.setIsFirst(false);
							alarmCache.setCreateDate(dataTime);
						}
					}else{
						// 报警后 连接两次正常,才认为报警关闭
						AlarmCache alarmCache = AlarmCacheMap.getCache(siteItem);
						if(alarmCache.getAlarmNum()>=1 && alarmCache.getNormalNum()<1){
							alarmCache.setNormalNum(alarmCache.getNormalNum()+1);
							sendRequest(siteItem);
							return;
						}
						AlarmCacheMap.removeCache(siteItem);
					}
					
					
					
					//保存到历史表
					String sql = "insert into M_MONI_DATA_HISTORY (ID, DATA_VALUE, DATA_TIME, INPUT_TIME, ALERM_FLAG, SITE_ITEM)"+
							"values ('"+id+"', "+dataValue+", to_date('"+dataTimestr+"', 'yyyymmddHH24miss'), to_date('"+inputDate+"', 'yyyy-mm-dd HH24:mi:ss'), '0', '"+siteItem+"')";
					JDBCC3p0Util.save(sql, null);
					//保存到历史表明细表
					String sqlRec = "insert into M_MONI_DATA_HISTORY_REC (ID, DATA_VALUE, DATA_TIME, INPUT_TIME, ALERM_FLAG, SITE_ITEM)"+
							"values ('"+id+"', "+dataValue+", to_date('"+dataTimestr+"', 'yyyymmddHH24miss'), to_date('"+inputDate+"', 'yyyy-mm-dd HH24:mi:ss'), '0', '"+siteItem+"')";
					JDBCC3p0Util.save(sqlRec, null);   
					
					//保存到实时表
					String dataSql = "";
					if(datalist!=null && datalist.size()>0){
						dataSql = "update M_MONI_DATA set DATA_VALUE="+dataValue+",DATA_TIME=to_date('"+dataTimestr+"', 'yyyymmddHH24miss'),INPUT_TIME=to_date('"+inputDate+"', 'yyyy-mm-dd HH24:mi:ss') where site_item='"+siteItem+"'";
						JDBCC3p0Util.update(dataSql,null);
					}else{
						dataSql = "delete from  M_MONI_DATA where site_item='"+siteItem+"'";
						JDBCC3p0Util.update(dataSql,null);
						dataSql = "insert into M_MONI_DATA (ID, DATA_VALUE, DATA_TIME, INPUT_TIME, ALERM_FLAG, SITE_ITEM)"+
								"values ('"+id+"', "+dataValue+", to_date('"+dataTimestr+"', 'yyyymmddHH24miss'), to_date('"+inputDate+"', 'yyyy-mm-dd HH24:mi:ss'), '0', '"+siteItem+"')";
						JDBCC3p0Util.save(dataSql, null);
					}
				}
			}
		} catch (NumberFormatException e) {
		}
	}
	
	
	public static String acceptJSON(HttpServletRequest request) {
		String acceptjson = "";
		BufferedReader br = null;
		try {
			br = new BufferedReader(new InputStreamReader(
					(ServletInputStream) request.getInputStream(), "utf-8"));
			StringBuffer sb = new StringBuffer("");
			String temp;
			while ((temp = br.readLine()) != null) {
				sb.append(temp);
			}
			acceptjson = sb.toString();
		} catch (Exception e) {
			e.printStackTrace();
		}finally{
			try {
				if(br!=null){
					br.close();
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return acceptjson;
	}
	
	private static String data16To2(String data){
		String str = "";
		for(int i=0;i<data.length();i++){
			str +=charTo2(data.charAt(i));
		}
		return str;
	}
	private static String charTo2(char charAt) {  
        // TODO Auto-generated method stub  
        switch (charAt) {  
        case '0':     
            return "0000";  
        case '1':     
            return "0001";  
        case '2':     
            return "0010";  
        case '3':     
            return "0011";  
        case '4':     
            return "0100";  
        case '5':     
            return "0101";  
        case '6':     
            return "0110";  
        case '7':     
            return "0111";  
        case '8':     
            return "1000";  
        case '9':     
            return "1001";  
        case 'A':     
            return "1010";  
        case 'B':     
            return "1011";  
        case 'C':     
            return "1100";  
        case 'D':     
            return "1101";  
        case 'E':     
            return "1110";  
        case 'F':     
            return "1111";  
      
        }  
        return null;  
    }
	/**
	 * 判断报警缓存状态
	 * @param alarmCache
	 * @param alarmId
	 * @return 1 缓存过期  2 缓存不匹配 3需要再次确认  4确定报警  
	 */
    private static int checkAlarmCacheState(AlarmCache alarmCache,String alarmId,Date createDate){
    	
    	if(  ((new Date()).getTime()-alarmCache.getCreateDate().getTime())/(1000*60)>=10){
			alarmCache.setAlarmNum(1);
			alarmCache.setAlarmId(alarmId);
			alarmCache.setIsFirst(true);
			alarmCache.setCreateDate(createDate);
			return 1;
		}
    	if(  ((new Date()).getTime()-alarmCache.getCreateDate().getTime())/(1000*60)<10
				&&!alarmCache.getAlarmId().equals(alarmId)){
			alarmCache.setAlarmNum(1);
			alarmCache.setAlarmId(alarmId);
			alarmCache.setIsFirst(true);
			alarmCache.setCreateDate(createDate);
			return 2;
		}
    	if(  ((new Date()).getTime()-alarmCache.getCreateDate().getTime())/(1000*60)<10
				&&alarmCache.getAlarmId().equals(alarmId)
				&&alarmCache.getAlarmNum()>=3){
			return 4;
		}
		if(  ((new Date()).getTime()-alarmCache.getCreateDate().getTime())/(1000*60)<10
			  &&alarmCache.getAlarmId().equals(alarmId)
			  &&alarmCache.getAlarmNum()<3){
			alarmCache.setAlarmNum(alarmCache.getAlarmNum()+1);
			return 3;
		}
		// 初始化时alarmId为空
		if(  ((new Date()).getTime()-alarmCache.getCreateDate().getTime())/(1000*60)<10
				&&alarmCache.getAlarmId().equals("")){
			alarmCache.setAlarmId(alarmId);
			alarmCache.setAlarmNum(1);
			alarmCache.setIsFirst(true);
			alarmCache.setCreateDate(createDate);
			return 3;
		}
		return 4;
    }
    private static void sendRequest(String siteItem){
		String sbUrl = ConfigUtil.getPropertyValue("sbUrl");
    	String querySql="select t4.device_id,t4.coding from m_moni_site t1,m_moni_site t2,"
    			+ "  m_moni_site_config_item t3,device_send_coding  t4"
    			+ "  where t1.id=t2.owend_station and t2.id=t3.struct_site "
    	        + "  and t3.scada_id='"+siteItem+"' and t1.ITEM_CODE=t4.site_item";
		List<Map<String, Object>> deviceList = JDBCC3p0Util.query(querySql,null);
        for(Map<String, Object> obj:deviceList){
			String deviceId = (String) obj.get("DEVICE_ID");
			String coding = (String) obj.get("CODING");
			String msg = "{\"deviceId\":\"" + deviceId + "\",\"data\":\"" + coding + "\"}";
			DealTableTimerTask.fixedThreadPool.execute(new Runnable() {
				@Override
				public void run() {
					try {
						Map<String,Object> map = HttpClientUtil.doHttpPost(sbUrl,msg);
						int status =(int)map.get("status");
						if(status!=200){
							System.out.println(msg+":"+status+":"+(String)map.get("content"));
						}
					} catch (Exception e) {
						System.out.println(msg);
						e.printStackTrace();
					}
				}
			});
        }
    }
	
}
