package com.app.demo.controller;

import com.app.demo.entity.Invoice;
import com.app.demo.entity.Payment;
import com.app.demo.repository.InvoiceRepository;
import com.app.demo.repository.PaymentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class MatchingController {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public MatchingController(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository) {

        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }
    @PostMapping("/api/payments/{paymentId}/confirm/{invoiceId}")
    public String confirmMatch(
            @PathVariable String paymentId,
            @PathVariable String invoiceId) {

        Payment payment =
                paymentRepository.findById(paymentId).orElse(null);

        Invoice invoice =
                invoiceRepository.findById(invoiceId).orElse(null);

        // Validation 1
        if (payment == null) {
            return "Payment not found";
        }

        // Validation 2
        if (invoice == null) {
            return "Invoice not found";
        }

        // Validation 3
        if (!payment.getCustomer()
                .equalsIgnoreCase(invoice.getCustomer())) {

            return "Customer mismatch. Match not allowed";
        }

        payment.setStatus("MATCHED");
        invoice.setStatus("PAID");

        paymentRepository.save(payment);
        invoiceRepository.save(invoice);

        return "Payment " + paymentId +
                " matched with Invoice " + invoiceId;
    }

    @GetMapping("/api/payments/{paymentId}/matches")
    public List<Map<String, Object>> findMatches(
            @PathVariable String paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId).orElse(null);

        if (payment == null) {
            return List.of();
        }

        List<Invoice> invoices = invoiceRepository.findAll();

        List<Map<String, Object>> matches = new ArrayList<>();

        for (Invoice invoice : invoices) {

            if (payment.getCustomer()
                    .equalsIgnoreCase(invoice.getCustomer())) {

                String confidence;

                if (payment.getAmount() == invoice.getAmount()) {
                    confidence = "HIGH";
                } else {
                    confidence = "REVIEW";
                }

                matches.add(
                        Map.of(
                                "invoiceId", invoice.getInvoiceId(),
                                "customer", invoice.getCustomer(),
                                "invoiceAmount", invoice.getAmount(),
                                "paymentAmount", payment.getAmount(),
                                "confidence", confidence
                        )
                );
            }
        }

        return matches;
    }
}