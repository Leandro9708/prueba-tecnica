import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../../shared/models/invoice.model'; // Ajusta la ruta según tu proyecto

@Injectable({ providedIn: 'root' })
export class InvoiceService {

  // Asegúrate de que la URL coincida con tu @RequestMapping del Controller en Java
  private readonly apiUrl = 'http://localhost:8080/api/invoices';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las facturas
   */
  getAll(page: number, size: number, sort: string = 'createdAt,desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtiene una factura específica por su ID
   * @param id Identificador único de la factura
   */
  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  /**
   * Envía los datos para crear una nueva factura
   * @param invoice Objeto con customerName e items (productId y quantity)
   */
  create(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  update(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
