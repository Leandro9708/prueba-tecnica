import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice';
import { ProductService } from '../../../core/services/product';
import { Product } from '../../../shared/models/product.model';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './invoice-form.html',
  styleUrls: ['./invoice-form.scss']
})
export class InvoiceFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Inyectado para detectar ID
  private messageService = inject(MessageService);

  // Formulario principal
  form = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(3)]],
    items: this.fb.array([], [Validators.required])
  });

  products: Product[] = [];
  loading = false;
  submitting = false;
  isEdit = false;
  invoiceId?: number;

  ngOnInit(): void {
    this.loadProducts();

    // Lógica para detectar si es edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.invoiceId = Number(id);
      this.loadInvoice(this.invoiceId);
    } else {
      this.addItem(); // Fila inicial solo si es factura nueva
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products = data,
      error: () => this.showError('No se pudieron cargar los productos')
    });
  }

  private loadInvoice(id: number): void {
    this.loading = true;
    this.invoiceService.getById(id).subscribe({
      next: (invoice) => {
        // 1. Seteamos nombre del cliente
        this.form.patchValue({ customerName: invoice.customerName });

        // 2. Limpiamos items actuales y cargamos los de la factura
        this.items.clear();
        if (invoice.items && invoice.items.length > 0) {
          invoice.items.forEach(item => {
            this.items.push(this.fb.group({
              productId: [item.productId, Validators.required],
              quantity: [item.quantity, [Validators.required, Validators.min(1)]]
            }));
          });
        }
        this.loading = false;
      },
      error: () => {
        this.showError('No se pudo cargar la factura seleccionada');
        this.goBack();
      }
    });
  }

  addItem(): void {
    const itemForm = this.fb.group({
      productId: [null as number | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'La factura debe tener al menos un producto'
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    // Decidimos si llamar a update o create
    const request = this.isEdit
      ? this.invoiceService.update(this.invoiceId!, this.form.value as any)
      : this.invoiceService.create(this.form.value as any);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEdit ? 'Factura actualizada' : 'Factura generada correctamente'
        });
        setTimeout(() => this.goBack(), 1500);
      },
      error: (err) => {
        this.showError(err.error?.message ?? 'Error al procesar la solicitud');
        this.submitting = false;
      }
    });
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail
    });
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }
}
