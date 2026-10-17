import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    data: { title: 'Dashboard' },
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  {
    path: 'students',
    data: { title: 'Students' },
    loadComponent: () => import('./pages/student-list/student-list').then((m) => m.StudentListPage),
  },
  {
    path: 'students/new',
    data: { title: 'Add Student' },
    loadComponent: () => import('./pages/student-form/student-form').then((m) => m.StudentFormPage),
  },
  {
    path: 'students/:id/edit',
    data: { title: 'Edit Student' },
    loadComponent: () => import('./pages/student-form/student-form').then((m) => m.StudentFormPage),
  },
  {
    path: 'students/:id',
    data: { title: 'Student Details' },
    loadComponent: () => import('./pages/student-details/student-details').then((m) => m.StudentDetailsPage),
  },
  {
    path: 'classes',
    data: { title: 'Classes', kind: 'class' },
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.CatalogPage),
  },
  {
    path: 'courses',
    data: { title: 'Courses', kind: 'course' },
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.CatalogPage),
  },
  {
    path: 'settings',
    data: { title: 'Settings' },
    loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
