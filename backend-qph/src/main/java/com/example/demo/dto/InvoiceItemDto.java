package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvoiceItemDto {

    // Entrada: Necesitamos el ID para saber qué producto se vende
    @NotNull(message = "El ID del producto es obligatorio")
    private Long productId;

    // Salida: Nombre del producto para mostrar en la tabla del frontend
    private String productName;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer quantity;

    // Salida: El precio al que se vendió (capturado del producto en el Service)
    private BigDecimal unitPrice;

    // Salida: unitPrice * quantity
    private BigDecimal subtotal;
}