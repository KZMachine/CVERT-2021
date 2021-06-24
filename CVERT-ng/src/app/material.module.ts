import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { Ng5SliderModule } from 'ng5-slider';

import { NgModule } from '@angular/core';

@NgModule ({
  imports: [
    DragDropModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    Ng5SliderModule
  ],
  exports: [
    DragDropModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    Ng5SliderModule
  ]
})

export class MaterialModule { }
