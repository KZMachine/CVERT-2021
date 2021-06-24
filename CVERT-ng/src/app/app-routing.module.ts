import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlgorithmParametersEditComponent } from './components/algorithm-parameters-edit/algorithm-parameters-edit.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'parameters',
    component: AlgorithmParametersEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
