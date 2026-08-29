package com.vagashop.controller;

import com.vagashop.dto.response.LiveDashboardDTO;
import com.vagashop.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/live")
    public ResponseEntity<LiveDashboardDTO> getLiveDashboard() {
        LiveDashboardDTO data = dashboardService.getLiveDashboard();
        return ResponseEntity.ok(data);
    }
}
