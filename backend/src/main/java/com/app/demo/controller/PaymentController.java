package com.app.demo.controller;

import com.app.demo.entity.Payment;
import com.app.demo.repository.PaymentRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class PaymentController {

        private final PaymentRepository repo;

        public PaymentController(PaymentRepository repo) {
            this.repo = repo;
        }
        @GetMapping("/api/payments")
    public List<Payment> getPayments() {
            return repo.findAll();

        }

    }
