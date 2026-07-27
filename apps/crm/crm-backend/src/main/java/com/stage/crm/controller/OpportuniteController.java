package com.stage.crm.controller;

import com.stage.crm.entity.Opportunite;
import com.stage.crm.service.OpportuniteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opportunites")
public class OpportuniteController {

    @Autowired
    private OpportuniteService opportuniteService;

    @GetMapping
    public List<Opportunite> getAllOpportunites() {
        return opportuniteService.getAllOpportunites();
    }

    @GetMapping("/{id}")
    public Opportunite getOpportuniteById(@PathVariable Long id) {
        return opportuniteService.getOpportuniteById(id);
    }

    @PostMapping
    public Opportunite createOpportunite(@RequestBody Opportunite opportunite) {
        return opportuniteService.createOpportunite(opportunite);
    }

    @PutMapping("/{id}")
    public Opportunite updateOpportunite(@PathVariable Long id, @RequestBody Opportunite opportunite) {
        return opportuniteService.updateOpportunite(id, opportunite);
    }

    @DeleteMapping("/{id}")
    public void deleteOpportunite(@PathVariable Long id) {
        opportuniteService.deleteOpportunite(id);
    }
}
