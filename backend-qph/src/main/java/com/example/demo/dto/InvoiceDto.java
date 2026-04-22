package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvoiceDto {

    private Long id;

    @NotBlank(message = "El nombre del cliente no puede estar vacío")
    private String customerName;

    // Salida: Fecha de creación
    private LocalDateTime createdAt;

    // Salida: Suma de todos los subtotales
    private BigDecimal totalAmount;

    // Entrada y Salida: Lista de productos en la factura
    @NotEmpty(message = "La factura debe tener al menos un producto")
    private List<InvoiceItemDto> items;
}