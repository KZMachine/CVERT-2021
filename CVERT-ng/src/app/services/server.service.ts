import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { GisData } from '../classes/gisData';
import { FileService } from '../services/file.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {

  ip: string;
  port: string;

  constructor(private http: HttpClient,
              private fileService: FileService) {
    this.reset();
  }

  reset() {
    this.ip = '127.0.0.1';
    this.port = '5000';
  }

  /*getAssets() {
    this.fileService.getAlgorithmParameters().then((jsonParam) => {
      console.log(jsonParam);
    });
  }*/

  send(algorithm: any,
        sourcePath: string,
        targetPath: string) : Promise<any> {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.fileService.getAlgorithmParameters('win').then((jsonParam) => {
        // console.log(jsonParam);
        let jsonData = that.getJsonFromParam(algorithm, sourcePath, targetPath, jsonParam);
        let httpHeaders = new HttpHeaders({
          'Content-Type' : 'application/json'
    	  });
        let url = 'http://' + that.ip + ':' + that.port;
        that.http.post<any>(url, jsonData, {headers: httpHeaders})
        .subscribe((data) => {
          // console.log(data);
          resolve(data);
        })
      });
    })
  }

  sendGPSRequest(sourcePath: string[],
                  targetPath: string,
                  gisData: GisData) {
    var jsonData = {
      "sourcePath": sourcePath,
      "targetPath": targetPath,
      "gpsTarget": {
        "latitude": gisData.markerLat,
        "longitude": gisData.markerLon,
        "fov": gisData.fov
      }
    };
    var that = this;
    return new Promise(function(resolve, reject) {
      let httpHeaders = new HttpHeaders({
        'Content-Type' : 'application/json'
  	  });
      let url = 'http://' + that.ip + ':' + that.port;
      that.http.post<any>(url, jsonData, {headers: httpHeaders})
      .subscribe((data) => {
        // console.log(data);
        resolve(data);
      })
    });
  }

  getJsonFromParam(algorithm: any,
                    sourcePath: string,
                    targetPath: string,
                    jsonData: any) {
    var result = {
      "algorithm": algorithm,
      "sourcePath": sourcePath,
      "targetPath": targetPath,
      "parameters": this.getAlgoParametersFromJson(jsonData)
    }
    return result;
  }

  getAlgoParametersFromJson(jsonData) {
    var result = {};
    for (let param of jsonData) {
      if (param.useDefault) {
        var value = param.defaultValue;
      } else {
        var value = param.userValue;
      }
      result[param.name] = value;
    }
    return result;
  }

}
