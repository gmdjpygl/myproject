package com.cmd;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.mchange.v2.c3p0.ComboPooledDataSource;

public class JDBCC3p0Util {
	static ComboPooledDataSource cpds = null;
	static {
		cpds = new ComboPooledDataSource("oracle");
	}

	/**
	 * 获得数据库连接
	 * 
	 * @return Connection
	 */
	public static Connection getConnection() {
		try {
			return cpds.getConnection();
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * 数据库关闭操作
	 * 
	 * @param conn
	 * @param st
	 * @param pst
	 * @param rs
	 */
	public static void close(Connection conn, PreparedStatement pst,
			ResultSet rs) {
		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		if (pst != null) {
			try {
				pst.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}

		if (conn != null) {
			try {
				conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
	/**
	 * 保存
	 * @param sql
	 * @param params
	 * @return
	 */
	public static boolean save(String sql, List<Object> params) {
		Connection conn = getConnection();
		PreparedStatement pst = null;
		try {
			// 获得PrepareStatement对象进行预编译
			pst = conn.prepareStatement(sql);
			if (params != null) {
				// 处理将数据插入占位符
				int paramsIndex = 1;
				for (Object p : params) {
					pst.setObject(paramsIndex++, p);
				}
			}
			// 执行sql语句
			pst.executeUpdate();
			return true;
		} catch (SQLException e) {
			e.printStackTrace();
			return false;
		} finally {
			// 关闭资源
			close(conn, pst, null);
		}
	}

	// 修改
	public static boolean update(String sql, List<Object> params) {
		Connection conn = getConnection();
		PreparedStatement pst = null;
		try {
			// 获得连接
			// 获得PrepareStatement对象进行预编译
			pst = conn.prepareStatement(sql);
			// 处理将数据插入占位符
						// 执行sql语句
			pst.executeUpdate();
			return true;
		} catch (SQLException e) {
			e.printStackTrace();
			return false;
		} finally {
			// 关闭资源
			close(conn, pst, null);
		}
	}
	 //删除
    public static boolean delete(String sql,List<Object> params){
    	Connection conn = getConnection();
		PreparedStatement pst = null;
        try {
            //获得PrepareStatement对象进行预编译
            pst = conn.prepareStatement(sql);
            pst.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }finally{
            //关闭资源
        	close(conn, pst, null);
        }
    }
    /**
     * 查询
     * @param sql
     * @param params
     * @return
     */
    public static List<Map<String,Object>> query(String sql,List<Object> params){
    	Connection conn = getConnection();
		PreparedStatement pst = null;
        ResultSet rs = null;
        try {
            //获得preparedSttement对象进行预编译（？占位符）
            pst = conn.prepareStatement(sql);
            

            //执行sql语句获得结果集的对象
            rs = pst.executeQuery();
            //获得结果集中列的信息
            ResultSetMetaData rst = rs.getMetaData();
            //获得结果集的列的数量
            int column = rst.getColumnCount();
            //创建List容器
            List<Map<String,Object>> rstList = new ArrayList<Map<String,Object>>();
            //处理结果
            while(rs.next()){
                //创建Map容器存取每一列对应的值
                Map<String,Object> m = new HashMap<String,Object>();
                for(int i=1;i<=column;i++){
                    m.put(rst.getColumnName(i), rs.getObject(i));
                }
                //将Map容器放入List容器中
                rstList.add(m);
            }
             return rstList;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }finally{
            //关闭资源
        	close(conn, pst, null);
        }
    }
}