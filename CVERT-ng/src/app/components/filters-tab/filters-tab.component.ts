import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Filter } from '../../classes/filter';
import { ImageInstance } from '../../classes/imageInstance';

import { ServerService } from '../../services/server.service';

import Jimp from 'jimp';
import * as assets from '../../../assets/assets.json';

@Component({
  selector: 'app-filters-tab',
  templateUrl: './filters-tab.component.html',
  styleUrls: ['./filters-tab.component.scss']
})
export class FiltersTabComponent implements OnInit {

  @Input() topImage: ImageInstance;
  @Output() topImageChange = new EventEmitter();

  @Input() bottomImage: ImageInstance;
  @Output() bottomImageChange = new EventEmitter();

  @Input() filtersList: Array<Filter>;
  @Output() filterListChange = new EventEmitter();

  @Input() currentFilter: Filter;
  @Output() currentFilterChange = new EventEmitter();

  sourceImage: Jimp;

  constructor(private server: ServerService) { }

  ngOnInit() {
    // console.log(assets.filters);
    // console.log(assets.filters);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.filtersList, event.previousIndex, event.currentIndex);
    // console.log(this.filtersList);
    this.filterListChange.emit(this.filtersList);
  }

  addFilter() {
    this.filtersList.push(new Filter(assets.filters[0]));
    this.filterListChange.emit(this.filtersList);
    this.currentFilter = this.filtersList[this.filtersList.length-1];
    this.currentFilterChange.emit(this.currentFilter);
    // console.log('add filter');
  }

  editFilter(filter: Filter) {
    this.currentFilter = filter;
    this.currentFilterChange.emit(this.currentFilter);
    // console.log(filter);
  }

  removeFilterFromList(filter: Filter) {
    if (this.currentFilter == filter) {
      this.currentFilter = undefined;
      this.currentFilterChange.emit(this.currentFilter);
    }
    this.filtersList.splice(this.filtersList.indexOf(filter), 1);
    this.filterListChange.emit(this.filtersList);
    // console.log(filter);
  }

  applyFilters() {
    this.topImage.applyFilterList(this.filtersList, this.server).then(result => {
      this.bottomImage.update(result, this.bottomImage.gisService);
      this.bottomImageChange.emit(this.bottomImage);
      // console.log(this.bottomImage);
    });
  }

}
