package com.stage.service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "service", "${{ values.name }}",
                "status", "running"
        );
    }
}
