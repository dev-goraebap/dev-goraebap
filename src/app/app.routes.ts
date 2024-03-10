import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('../pages/main/main.page').then(m => m.MainPage)
    }
];
