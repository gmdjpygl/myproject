package com.cmd;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class JDBCUtil {
    private static String user = null;
    private static String password = null;
    private static String driver = null;
    private static String url = null;
    private static Connection conn = null;
    
    private static Properties p =null;
    
    //����ģʽ --����ʽ(˫������)��֤�̵߳İ�ȫ��
    public static JDBCUtil db = null;
    private JDBCUtil(){
        
    }
    public static JDBCUtil getInstance(){
        if(db == null){
            synchronized(JDBCUtil.class){
                if(db == null){
                    db = new JDBCUtil();
                }            
            }        
        }
        return db;
    }
    //��ȡ�����ļ��Ҽ������ݿ�����
    static{
        //ʵ����һ��properties���������������ǵ������ļ�
        p = new Properties();
        //ͨ�������������ȡ���ǵ������ļ������ֽ�������ʽ��ȡ
        InputStream in = JDBCUtil.class.getClassLoader().getResourceAsStream("config.properties");
        try {
            //�������ļ����絽Propreties���������н���
            p.load(in);
            //��ȡ�����ļ�
            driver = p.getProperty("driver");
            url = p.getProperty("jdbcUrl");
            user = p.getProperty("user");
            password = p.getProperty("password");
            //��������
            Class.forName(driver);
        } catch (IOException e1) {
            e1.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } 
        
    }
    //�������ݿ������
    public Connection getConn(){
        try {
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
    //��ѯ����List����
    public List<Map<String,Object>> query(String sql,Object...params){
        PreparedStatement pst = null;
        ResultSet rs = null;
        try {
            //�������
            conn = getConn();
            //���preparedSttement�������Ԥ���루��ռλ����
            pst = conn.prepareStatement(sql);
            int paramsIndex = 1;
            for(Object p : params){
                pst.setObject(paramsIndex++, p);
            }
            //ִ��sql����ý�����Ķ���
            rs = pst.executeQuery();
            //��ý�������е���Ϣ
            ResultSetMetaData rst = rs.getMetaData();
            //��ý�������е�����
            int column = rst.getColumnCount();
            //����List����
            List<Map<String,Object>> rstList = new ArrayList<Map<String,Object>>();
            //������
            System.out.println(rs);
            while(rs.next()){
                //����Map������ȡÿһ�ж�Ӧ��ֵ
                Map<String,Object> m = new HashMap<String,Object>();
                System.out.println("----"+column);
                for(int i=1;i<=column;i++){
                	System.out.println("-----------"+i);
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
            close(rs, pst, conn);
        }
    }
     
     public List<Map<String,Object>> query(String sql,List<Object> params){
            PreparedStatement pst = null;
            ResultSet rs = null;
            try {
                //�������
                conn = getConn();
                //���preparedSttement�������Ԥ���루��ռλ����
                pst = conn.prepareStatement(sql);
                int paramsIndex = 1;
                for(Object p : params){
                    pst.setObject(paramsIndex++, p);
                }
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
                close(rs, pst, conn);
            }
        }
    
    //��ҳ��ѯ�ܹ��ж�������¼totleSize
    public long queryLong(String sql,Object...params){
        PreparedStatement pst = null;
        ResultSet rs = null;
        try {
            //�������
            conn = getConn();
            //���preparedSttement�������Ԥ���루��ռλ����
            pst = conn.prepareStatement(sql);
            int paramsIndex = 1;
            for(Object p : params){
                pst.setObject(paramsIndex++, p);
            }
            //ִ��sql����ý�����Ķ���
            rs = pst.executeQuery();
            while(rs.next()){
                return Long.valueOf(rs.getLong(1));
            }
            return 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        }
    }
    //����
    public boolean insert(String sql,List<Object> params){
        PreparedStatement pst = null;
        ResultSet rs = null;
        try {
            //�������
            conn = getConn();
            //���PrepareStatement�������Ԥ����
            pst = conn.prepareStatement(sql);
            if(params!=null){
	            //�������ݲ���ռλ��
	            int paramsIndex = 1;
	            for(Object p : params){
	                pst.setObject(paramsIndex++, p);
	            }
	        }
            //ִ��sql���
            pst.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }finally{
            //�ر���Դ
            close(null, pst, conn);
        }
    }
    
    //�޸�
    public boolean update(String sql,Object...params){
        PreparedStatement pst = null;
        ResultSet rs = null;
        try {
            //�������
            conn = getConn();
            //���PrepareStatement�������Ԥ����
            pst = conn.prepareStatement(sql);
            //�������ݲ���ռλ��
            int paramsIndex = 1;
            for(Object p : params){
                pst.setObject(paramsIndex++, p);
            }
            //ִ��sql���
            pst.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }finally{
            //�ر���Դ
            close(null, pst, conn);
        }
    }
    
    //ɾ��
    public boolean delete(String sql,Object...params){
        PreparedStatement pst = null;
        ResultSet rs = null;
        try {
            //�������
            conn = getConn();
            //���PrepareStatement�������Ԥ����
            pst = conn.prepareStatement(sql);
            //�������ݲ���ռλ��
            int paramsIndex = 1;
            for(Object p : params){
                pst.setObject(paramsIndex++, p);
            }
            //ִ��sql���
            pst.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }finally{
            //�ر���Դ
            close(null, pst, conn);
        }
    }
    //�ر���Դ
    public static void close(ResultSet rs,PreparedStatement pst,Connection conn){
        if(rs!=null){
            try {
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            rs = null;
        }
        if(pst!=null){
            try {
                pst.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            pst = null;
        }
        if(conn!=null){
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            conn = null;
        }
    }
}