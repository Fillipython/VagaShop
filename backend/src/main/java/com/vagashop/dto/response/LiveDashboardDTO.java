package com.vagashop.dto.response;

import java.util.ArrayList;
import java.util.List;

public class LiveDashboardDTO {

    private DashboardSummaryDTO summary;
    private List<RegistroEstacionamentoDTO> parkedCars = new ArrayList<>();
    private List<AtividadeRecenteDTO> recentActivity = new ArrayList<>();
    private List<SetorDTO> sectors = new ArrayList<>();

    public LiveDashboardDTO() {}

    public LiveDashboardDTO(DashboardSummaryDTO summary, List<RegistroEstacionamentoDTO> parkedCars, List<AtividadeRecenteDTO> recentActivity, List<SetorDTO> sectors) {
        this.summary = summary;
        this.parkedCars = parkedCars;
        this.recentActivity = recentActivity;
        this.sectors = sectors;
    }

    public DashboardSummaryDTO getSummary() {
        return summary;
    }

    public void setSummary(DashboardSummaryDTO summary) {
        this.summary = summary;
    }

    public List<RegistroEstacionamentoDTO> getParkedCars() {
        return parkedCars;
    }

    public void setParkedCars(List<RegistroEstacionamentoDTO> parkedCars) {
        this.parkedCars = parkedCars;
    }

    public List<AtividadeRecenteDTO> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<AtividadeRecenteDTO> recentActivity) {
        this.recentActivity = recentActivity;
    }

    public List<SetorDTO> getSectors() {
        return sectors;
    }

    public void setSectors(List<SetorDTO> sectors) {
        this.sectors = sectors;
    }
}
