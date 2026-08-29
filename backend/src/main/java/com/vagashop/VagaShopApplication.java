package com.vagashop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VagaShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(VagaShopApplication.class, args);
    }
}
