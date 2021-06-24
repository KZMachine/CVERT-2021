import { Component, OnInit } from '@angular/core';

import { Filter } from '../../classes/filter';
import { ImageInstance } from '../../classes/imageInstance';
import { ImageFile } from '../../classes/imageFile';

import { GisService } from '../../services/gis.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  topImage: ImageInstance;
  bottomImage: ImageInstance;

  inputFiles: ImageFile[];

  filtersList: Array<Filter>;
  currentFilter: Filter;

  constructor(private gisService: GisService) {
    // this.topImage = new ImageInstance("assets/cache/test.JPG");
    // this.bottomImage = new ImageInstance("assets/cache/test.JPG");
    this.filtersList = new Array<Filter>();
  }

  ngOnInit() {
  }
}
