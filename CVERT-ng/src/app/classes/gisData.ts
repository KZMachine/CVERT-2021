import { GisService } from '../services/gis.service';

export class GisData {

  altitude: number;
  altitudeUnit: string; // feet or meters

  fov: number; // degrees DIAGONAL !
  fovPreset: string;
  pitch: number; // degrees

  positionUnit: string; // gps or usng
  latitude: number;
  longitude: number;
  heading: number; // degrees

  model: string;

  gisService: GisService;

  markerLat: number;
  markerLon: number;

  markerUSNG: string;

  constructor(path: string, gisService: GisService) {
    this.gisService = gisService;
    this.getGISdataFromPath(path, gisService);
    this.altitudeUnit = "meters"
    this.positionUnit = "gps";
    this.fovPreset = "custom";
    this.fov = 94; // P3 diagonal FOV
  }

  setMarkerPos(lat: number, lon: number) {
    this.markerLat = lat;
    this.markerLon = lon;
  }

  getGISdataFromPath(path: string, gisService: GisService) {
    const ipc = (<any>window).require('electron').ipcRenderer;
    ipc.once("getGISdataResponse", (event, exif, xmp) => {
      this.getGisFromDict(exif, xmp);
      this.gisService.setGis(this);
    });
    ipc.send("getGISdata", path);
  }

  getGisFromDict(exif: any, xmp: any) {
    if (exif && exif.Model && xmp != {}) {
      this.altitude = xmp.RelativeAltitude;
      this.latitude = exif.latitude;
      this.longitude = exif.longitude;
      this.heading = xmp.GimbalYawDegree;
      this.pitch = xmp.GimbalPitchDegree;
      if (exif.Model.includes("FC220")) { // Mavic Pro
        this.model = "DJI Mavic Pro";
        this.fov = 78.8;
      } else if (exif.Model.includes("FC1102")) { //Spark
        this.model = "DJI Spark";
        this.fov = 81.9;
      } else if (exif.Model.includes("FC200")) { // P2
        this.model = "DJI Phantom 2 Vision";
        this.fov = 85;
      } else if (exif.Model.includes("FC2103")) { // Mavic Air
        this.model = "DJI Mavic Air";
        this.fov = 85;
      } else if (exif.Model.includes("FC300")) { // P3 P/A/4K
        this.model = "DJI Phantom 3";
        this.fov = 94;
      } else if (exif.Model.includes("FC7203")) { // Mavic Mini
        this.model = "DJI Mavic Mini";
        this.heading = xmp.FlightYawDegree; // Gimbal Yaw is only offset
        this.fov = 83;
      } else if (exif.Model.includes("FC330")) { //P4
        this.model = "DJI Phantom 4";
        this.fov = 94;
      } else if (exif.Model.includes("FC6310S")) { //P4P v2
        this.model = "DJI Phantom 4 Pro v2";
        this.fov = 84;
      } else if (exif.Model.includes("FC6310")) { //P4P or P4A
        this.model = "DJI Phantom 4 Pro / Advanced";
        this.fov = 84;
      } else {
        this.model = exif.Model;
      }
      console.log("Found metadata for " + this.model);
    } else {
      this.altitude = 0;
      this.latitude = 0;
      this.longitude = 0;
      this.heading = 0;
      this.pitch = -90;
      console.log("metadata not found");
    }
  }

}
