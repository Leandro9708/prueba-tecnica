import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/products/products.routes').then(m => m.PRODUCT_ROUTES)
  },
  {
    path: 'invoices',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/invoices/invoice.routes').then(m => m.INVOICE_ROUTES)
  },
  { path: '**', redirectTo: 'products' }
];
