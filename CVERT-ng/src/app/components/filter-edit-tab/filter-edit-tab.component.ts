import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Filter } from '../../classes/filter';
import { FileService } from '../../services/file.service';

import * as assets from '../../../assets/assets.json';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-filter-edit-tab',
  templateUrl: './filter-edit-tab.component.html',
  styleUrls: ['./filter-edit-tab.component.scss']
})
export class FilterEditTabComponent implements OnInit {

  @Input() currentFilter: Filter;
  @Output() currentFilterChange = new EventEmitter();

  filters: any;
  serverFilters: any;
  miscFilters: any;
  allFilters: any;

  constructor(private fileService: FileService) {
    this.filters = assets.filters;
    this.serverFilters = assets.serverFilters;
    this.miscFilters = assets.miscFilters;
    this.allFilters = this.filters.concat(this.serverFilters).concat(this.miscFilters);
  }

  ngOnInit() {
  }

  changeFilter() {
    this.currentFilter.filter = JSON.parse(JSON.stringify(
      this.allFilters.find(
        filterItem => {
          return filterItem.name == this.currentFilter.filter.name;
        }
      )
    ));
    this.currentFilterChange.emit(this.currentFilter);
  }

  getRangeOptions(arg) {
    let options: Options = {
      floor: arg.min,
      ceil: arg.max,
      draggableRange: true
    }
    return options
  }

  openParameters() {
    this.fileService.openParameters();
  }

}
