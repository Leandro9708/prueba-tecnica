package com.example.demo.service;

import com.example.demo.dto.InvoiceDto;
import com.example.demo.dto.InvoiceItemDto;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.InvoiceItem;
import com.example.demo.entity.Product;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public InvoiceDto create(InvoiceDto invoiceDto) {
        // 1. Instanciar la cabecera de la factura
        Invoice invoice = Invoice.builder()
                .customerName(invoiceDto.getCustomerName())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        // 2. Procesar cada ítem del DTO
        for (InvoiceItemDto itemDto : invoiceDto.getItems()) {
            // Buscar producto y validar existencia
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + itemDto.getProductId()));

            // Validar Stock disponible
            if (product.getStock() < itemDto.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + product.getNombre());
            }

            // Descontar stock y guardar cambio
            product.setStock(product.getStock() - itemDto.getQuantity());
            productRepository.save(product);

            // Calcular valores monetarios
            BigDecimal unitPrice = product.getPrecio();
            BigDecimal subtotal = unitPrice.multiply(new BigDecimal(itemDto.getQuantity()));

            // Crear el detalle y vincularlo a la factura
            InvoiceItem detail = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            invoice.getItems().add(detail);
            runningTotal = runningTotal.add(subtotal);
        }

        invoice.setTotalAmount(runningTotal);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return mapToDto(savedInvoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceDto> getAll(Pageable pageable) {
        Page<Invoice> invoicePage = invoiceRepository.findAll(pageable);
        return invoicePage.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDto getById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada con ID: " + id));
        return mapToDto(invoice);
    }

    @Override
    @Transactional
    public InvoiceDto update(Long id, InvoiceDto invoiceDto) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada con ID: " + id));

        // Devolver el stock actual
        for (InvoiceItem oldItem : invoice.getItems()) {
            Product product = oldItem.getProduct();
            product.setStock(product.getStock() + oldItem.getQuantity());
            productRepository.save(product);
        }

        invoice.setCustomerName(invoiceDto.getCustomerName());
        invoice.getItems().clear();
        BigDecimal total = BigDecimal.ZERO;

        for (InvoiceItemDto itemDto : invoiceDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemDto.getProductId()));

            if (product.getStock() < itemDto.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + product.getNombre());
            }

            product.setStock(product.getStock() - itemDto.getQuantity());
            productRepository.save(product);

            InvoiceItem newItem = new InvoiceItem();
            newItem.setProduct(product);
            newItem.setQuantity(itemDto.getQuantity());
            newItem.setUnitPrice(product.getPrecio());

            BigDecimal quantity = BigDecimal.valueOf(itemDto.getQuantity());
            BigDecimal subtotal = product.getPrecio().multiply(quantity);

            newItem.setSubtotal(subtotal);
            newItem.setInvoice(invoice);

            invoice.getItems().add(newItem);
            total = total.add(subtotal);
        }

        invoice.setTotalAmount(total);

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapToDto(updatedInvoice);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        // IMPORTANTE: Antes de borrar, devolvemos el stock a los productos
        for (InvoiceItem item : invoice.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        invoiceRepository.delete(invoice);
    }

    // Método de mapeo de Entidad a DTO para la respuesta
    private InvoiceDto mapToDto(Invoice invoice) {
        return InvoiceDto.builder()
                .id(invoice.getId())
                .customerName(invoice.getCustomerName())
                .totalAmount(invoice.getTotalAmount())
                .createdAt(invoice.getCreatedAt())
                .items(invoice.getItems().stream().map(item ->
                        InvoiceItemDto.builder()
                                .productId(item.getProduct().getId())
                                .productName(item.getProduct().getNombre())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .subtotal(item.getSubtotal())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}