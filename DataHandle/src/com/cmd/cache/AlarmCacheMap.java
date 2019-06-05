package com.cmd.cache;

import java.util.concurrent.ConcurrentHashMap;

public class AlarmCacheMap {
	private static ConcurrentHashMap<String, AlarmCache> cacheMap = new ConcurrentHashMap<>();

    /**
     * ��ȡ����Ķ���
     * 
     * @param key
     * @return
     */
    public static AlarmCache getCache(String key) {

        // ����������и��˺ţ��򷵻�value
        if (cacheMap.containsKey(key)) {
            return cacheMap.get(key);
        }
        // ���������û�и��˺ţ��Ѹ��ʺŶ��󻺴浽concurrentHashMap��
        putCache(key,new AlarmCache());
        return cacheMap.get(key);
    }

    /**
     * ��ʼ������
     * 
     * @param key
     */
    public static void putCache(String key,AlarmCache alarmCache) {
        // һ���ǽ������ݿ��ѯ������ѯ�Ľ�����л���
        cacheMap.put(key, alarmCache);
    }



    /**
     * �Ƴ�������Ϣ
     * 
     * @param key
     */
    public static void removeCache(String key) {
        cacheMap.remove(key);
    }
}
