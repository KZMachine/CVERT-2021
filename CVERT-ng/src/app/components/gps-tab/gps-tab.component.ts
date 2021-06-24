import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { GisData } from '../../classes/gisData';

import { CanvasService } from '../../services/canvas.service';
import { GisService } from '../../services/gis.service';

@Component({
  selector: 'app-gps-tab',
  templateUrl: './gps-tab.component.html',
  styleUrls: ['./gps-tab.component.scss']
})
export class GpsTabComponent implements OnInit {

  @Input() gisData: GisData;

  altitudeFeet: number;
  metersToFeet = 3.28084; // factor

  markerDisplayed = true;
  gridDisplayed = true;

  // wait for data init for change
  @ViewChild('altitude', {static: false}) set altitude(element) {
    if (element) {
      this.updateAltitude();
    }
  }
  @ViewChild('pitch', {static: false}) set pitch(element) {
    if (element) {
      this.updateCanvas('pitch');
    }
  }
  @ViewChild('fov', {static: false}) set fov(element) {
    if (element) {
      this.updateCanvas('fov');
    }
  }

  constructor(private canvasService: CanvasService,
              private gisService: GisService) {
  }

  ngOnInit() {
    this.altitudeFeet = this.gisData.altitude * this.metersToFeet;
  }

  updateAltitude() {
    if (this.gisData.altitudeUnit == "feet") {
      this.gisData.altitude = Number((this.altitudeFeet / this.metersToFeet).toFixed(2));
    } else {
      this.altitudeFeet = this.gisData.altitude * this.metersToFeet;
    }
    this.updateCanvas('altitude');
  }

  onGridDisplayToggle(evt: any) {
    this.canvasService.displayGrid(evt.checked);
    this.gridDisplayed = evt.checked;
  }

  onMarkersDisplayToggle(evt: any) {
    this.canvasService.displayMarkers(evt.checked);
    this.markerDisplayed = evt.checked;
  }

  updateCanvas(property: string) {
    var value: number;
    switch(property) {
      case 'altitude':
        value = this.gisData.altitude;
        break;
      case 'pitch':
        value = this.gisData.pitch;
        break;
      case 'fov':
        value = this.gisData.fov;
        break;
      default:
        console.log('not a known property for canvas update');
    }
    if (typeof value !== 'undefined') {
      this.canvasService.updateGIS(property, value);
      this.gisService.setGis(this.gisData);
    }
  }

}
