package com.Comparator;

import java.util.Comparator;

import com.entity.Student;

public class Paixu implements Comparator<Student>{

    @Override
    public int compare(Student s1, Student s2) {
        return s1.getage() - s2.getage();//按年龄大小排序
    }
}