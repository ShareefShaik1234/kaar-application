package com.app.demo.controller;

import com.app.demo.entity.Invoice;
import com.app.demo.repository.InvoiceRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    public InvoiceController(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/api/invoices")
    public List<Invoice> getInvoices() {
        return invoiceRepository.findAll();
    }
}