package com.example.demo.service;

import com.example.demo.dto.InvoiceDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InvoiceService {

    InvoiceDto create(InvoiceDto invoiceDto);

    Page<InvoiceDto> getAll(Pageable pageable);

    InvoiceDto getById(Long id);

    InvoiceDto update(Long id, InvoiceDto invoiceDto);

    void delete(Long id);
}