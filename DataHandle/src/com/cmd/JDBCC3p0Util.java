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
	 * ������ݿ�����
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
	 * ���ݿ�رղ���
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
	 * ����
	 * @param sql
	 * @param params
	 * @return
	 */
	public static boolean save(String sql, List<Object> params) {
		Connection conn = getConnection();
		PreparedStatement pst = null;
		try {
			// ���PrepareStatement�������Ԥ����
			pst = conn.prepareStatement(sql);
			if (params != null) {
				// �������ݲ���ռλ��
				int paramsIndex = 1;
				for (Object p : params) {
					pst.setObject(paramsIndex++, p);
				}
			}
			// ִ��sql���
			pst.executeUpdate();
			return true;
		} catch (SQLException e) {
			e.printStackTrace();
			return false;
		} finally {
			// �ر���Դ
			close(conn, pst, null);
		}
	}

	// �޸�
	public static boolean update(String sql, List<Object> params) {
		Connection conn = getConnection();
		PreparedStatement pst = null;
		try {
			// �������
			// ���PrepareStatement�������Ԥ����
			pst = conn.prepareStatement(sql);
			// �������ݲ���ռλ��
						// ִ��sql���
			pst.executeUpdate();
			return true;
		} catch (SQLException e) {
			e.printStackTrace();
			return false;
		} finally {
			// �ر���Դ
			close(conn, pst, null);
		}
	}
	 //ɾ��
    public static boolean delete(String sql,List<Object> params){
    	Connection conn = getConnection();
		PreparedStatement pst = null;
        try {
            //���PrepareStatement�������Ԥ����
            pst = conn.prepareStatement(sql);
            pst.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }finally{
            //�ر���Դ
        	close(conn, pst, null);
        }
    }
    /**
     * ��ѯ
     * @param sql
     * @param params
     * @return
     */
    public static List<Map<String,Object>> query(String sql,List<Object> params){
    	Connection conn = getConnection();
		PreparedStatement pst = null;
        ResultSet rs = null;
        try {
            //���preparedSttement�������Ԥ���루��ռλ����
            pst = conn.prepareStatement(sql);
            

            //ִ��sql����ý�����Ķ���
            rs = pst.executeQuery();
            //��ý�������е���Ϣ
            ResultSetMetaData rst = rs.getMetaData();
            //��ý�������е�����
            int column = rst.getColumnCount();
            //����List����
            List<Map<String,Object>> rstList = new ArrayList<Map<String,Object>>();
            //������
            while(rs.next()){
                //����Map������ȡÿһ�ж�Ӧ��ֵ
                Map<String,Object> m = new HashMap<String,Object>();
                for(int i=1;i<=column;i++){
                    m.put(rst.getColumnName(i), rs.getObject(i));
                }
                //��Map��������List������
                rstList.add(m);
            }
             return rstList;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }finally{
            //�ر���Դ
        	close(conn, pst, null);
        }
    }
}