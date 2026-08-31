package com.app.demo.config;

import com.app.demo.entity.Invoice;
import com.app.demo.entity.Payment;
import com.app.demo.repository.InvoiceRepository;
import com.app.demo.repository.PaymentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner loadData(PaymentRepository repository, InvoiceRepository invoiceRepository) {

        return args -> {

            repository.save(
                    new Payment(
                            "PAY1001",
                            "ABC Ltd",
                            50000,
                            "UNMATCHED"
                    )
            );

            repository.save(
                    new Payment(
                            "PAY1002",
                            "XYZ Ltd",
                            25000,
                            "UNMATCHED"
                    )
            );

            repository.save(
                    new Payment(
                            "PAY1003",
                            "ABC Ltd",
                            29500,
                            "UNMATCHED"
                    )
            );
            invoiceRepository.save(
                    new Invoice(
                            "INV1001",
                            "ABC Ltd",
                            50000,
                            "OPEN"
                    )
            );

            invoiceRepository.save(
                    new Invoice(
                            "INV1002",
                            "XYZ Ltd",
                            25000,
                            "OPEN"
                    )
            );

            invoiceRepository.save(
                    new Invoice(
                            "INV1003",
                            "ABC Ltd",
                            30000,
                            "OPEN"
                    )
            );


        };

    }
}