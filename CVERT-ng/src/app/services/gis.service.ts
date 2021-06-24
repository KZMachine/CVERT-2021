import { Injectable } from '@angular/core';
import * as usgn from 'usng.js';

import { GisData } from '../classes/gisData'

@Injectable({
  providedIn: 'root'
})
export class GisService {

  gis: GisData;
  private radius = 6371000; // earth radius, in m
  private converter: any;

  constructor() { }

  setGis(gis: GisData) {
    this.gis = gis;
    this.converter = new usgn.Converter({});
  }

  getGPS(x: number, y: number) {
    // https://www.movable-type.co.uk/scripts/latlong.html
    var relHdg = Math.atan2(x, -y); // in rad
    var fullHdg = this.gis.heading * Math.PI/180 + relHdg; // in rad
    fullHdg = this.unWrap(fullHdg);
    var dist = Math.sqrt(x*x + y*y); // in  m
    var latitude = Math.asin( Math.sin(this.gis.latitude*Math.PI/180)*Math.cos(dist/this.radius)
                + Math.cos(this.gis.latitude*Math.PI/180)*Math.sin(dist/this.radius)*Math.cos(fullHdg));
    var longitude = this.gis.longitude*Math.PI/180 + Math.atan2(Math.sin(fullHdg)*Math.sin(dist/this.radius)*Math.cos(this.gis.latitude*Math.PI/180),
                         Math.cos(dist/this.radius)-Math.sin(this.gis.latitude*Math.PI/180)*Math.sin(latitude));
    this.gis.markerLat = latitude * 180 / Math.PI;
    this.gis.markerLon = longitude * 180 / Math.PI;
    this.gis.markerUSNG = this.converter.LLtoUSNG(latitude * 180 / Math.PI, longitude * 180 / Math.PI, 5);
  }

  unWrap(bearingRad) {
    while (bearingRad > Math.PI) {
      bearingRad -= 2*Math.PI;
    }
    while (bearingRad < -Math.PI) {
      bearingRad += 2*Math.PI;
    }
    return bearingRad;
  }
}
