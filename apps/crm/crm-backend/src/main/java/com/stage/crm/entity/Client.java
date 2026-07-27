package com.stage.crm.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String phone;

    private String company;


    // Required by JPA
    public Client() {
    }


    public Client(String name, String phone, String company) {
        this.name = name;
        this.phone = phone;
        this.company = company;
    }


    public Long getId() {
        return id;
    }


    public String getName() {
        return name;
    }


    public String getPhone() {
        return phone;
    }


    public String getCompany() {
        return company;
    }


    public void setName(String name) {
        this.name = name;
    }


    public void setPhone(String phone) {
        this.phone = phone;
    }


    public void setCompany(String company) {
        this.company = company;
    }
}
