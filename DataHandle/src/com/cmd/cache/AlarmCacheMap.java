package com.cmd.cache;

import java.util.concurrent.ConcurrentHashMap;

public class AlarmCacheMap {
	private static ConcurrentHashMap<String, AlarmCache> cacheMap = new ConcurrentHashMap<>();

    /**
     * 获取缓存的对象
     * 
     * @param key
     * @return
     */
    public static AlarmCache getCache(String key) {

        // 如果缓冲中有该账号，则返回value
        if (cacheMap.containsKey(key)) {
            return cacheMap.get(key);
        }
        // 如果缓存中没有该账号，把该帐号对象缓存到concurrentHashMap中
        putCache(key,new AlarmCache());
        return cacheMap.get(key);
    }

    /**
     * 初始化缓存
     * 
     * @param key
     */
    public static void putCache(String key,AlarmCache alarmCache) {
        // 一般是进行数据库查询，将查询的结果进行缓存
        cacheMap.put(key, alarmCache);
    }



    /**
     * 移除缓存信息
     * 
     * @param key
     */
    public static void removeCache(String key) {
        cacheMap.remove(key);
    }
}
