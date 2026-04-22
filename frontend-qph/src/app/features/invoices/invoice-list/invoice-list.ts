import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Invoice } from '../../../shared/models/invoice.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InvoiceService } from '../../../core/services/invoice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../../core/services/auth';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ConfirmDialogModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ToolbarModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './invoice-list.html',
  styleUrls: ['./invoice-list.scss']
})
export class InvoiceListComponent implements OnInit {

  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);

  invoices: Invoice[] = [];
  loading = false;
  totalRecords = 0;

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.invoiceService.getAll(0, 10000, 'createdAt,desc').subscribe({
      next: (res) => {
        this.invoices = res.content;
        this.totalRecords = res.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos'
        });
      }
    });
  }

  confirmDelete(invoice: Invoice): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de anular la factura #${invoice.id} de ${invoice.customerName}? El stock será devuelto a los productos.`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteInvoice(invoice.id!)
    });
  }

  private deleteInvoice(id: number): void {
    this.invoiceService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Factura anulada y stock restaurado'
        });
        this.loadAll();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo anular la factura'
        });
      }
    });
  }

  goToCreate = () => this.router.navigate(['/invoices/new']);
  goToEdit = (id: number) => this.router.navigate(['/invoices/edit', id]);
  viewDetail = (id: number) => this.router.navigate(['/invoices', id]);
  goToProducts = () => this.router.navigate(['/products']);
  logout = () => this.authService.logout();
}
