import { Observable, Observer } from 'rxjs';
import * as assets from '../../assets/assets.json';

import { ServerService } from '../services/server.service';
import { GisService } from '../services/gis.service';

import Jimp from 'jimp';
import { Filter } from './filter';
import { GisData } from './gisData';

export class ImageInstance {

  jimpObject: Jimp;
  uri: string;
  histogram: number[][];
  gisData: GisData;
  gisService: GisService;

  constructor() {
  }

  async update(uri, gisService: GisService) {
    // console.log(uri.toString());
    return new Promise((resolve, reject) => {
      Jimp.read(uri).then(image => {
        var resizedImage = image.resize(800, Jimp.AUTO);
        this.jimpObject = resizedImage;
        this.setBase64Data(resizedImage).then((data) => {
          if (typeof uri == 'string') {
            const ipc = (<any>window).require('electron').ipcRenderer;
            ipc.once("pathExistsResponse", (event, pathExists) => {
              if (pathExists) {
                this.gisService = gisService;
                this.gisData = new GisData(uri, gisService);
              }
              resolve();
            });
            ipc.send("pathExists", uri);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async setBase64Data(image: Jimp) {
    var self = this;
    return new Promise((resolve, reject) => {
      image.getBase64(image.getMIME(), function(err, base64data) {
        self.uri = base64data;
        self.getHistogram(base64data).subscribe(data => {
          self.histogram = data;
          resolve();
        });
      });
    });
  }

  applyFilterList(filtersList: Array<Filter>, server: ServerService) : Promise<Jimp> {
    let that = this;
    return new Promise(async function(resolve, reject) {
      var result = that.jimpObject.clone();
      var jimpFilterArray = [];
      for (let filter of filtersList) {
        if (that.isJimp(filter)) {
          var args = [];
          for (let arg of filter.filter.args) {
            args.push(arg.value);
          }
          jimpFilterArray.push({apply: filter.filter.name, params: args});
        } else {
          if (jimpFilterArray.length > 0) {
            result = result.color(jimpFilterArray);
            jimpFilterArray = [];
          }
          if (that.isServer(filter)) {
            result = await that.applyServerFilter(result, filter, server);
          } else if (filter.filter.name == "Histogram") {
            result = await that.applyHistogramEqualization(result, filter);
          }
        }
      }
      if (jimpFilterArray.length > 0) {
        var result = result.color(jimpFilterArray);
        jimpFilterArray = [];
      }
      resolve(result);
    });
  }

  isJimp(filter: Filter) {
    var found = assets.filters.find(function(element) {
      return(filter.filter.name == element.name);
    });
    return(typeof found !== 'undefined');
  }

  isServer(filter: Filter) {
    var found = assets.serverFilters.find(function(element) {
      return(filter.filter.name == element.name);
    });
    return(typeof found !== 'undefined');
  }

  async applyServerFilter(image: Jimp, filter: Filter, server: ServerService): Promise<Jimp> {
    let base64data = await image.getBase64Async(image.getMIME());
    var data = await server.send(filter.filter, base64data, 'response');
    return (await new Promise((resolve, reject) => {
      var buffer = Buffer.from(data.image, 'base64');
      Jimp.read(buffer).then(image => {
        resolve(image);
      });
    }));
  }

  async applyHistogramEqualization(image: Jimp, filter: Filter): Promise<Jimp> {
    //https://www.tutorialspoint.com/dip/histogram_equalization.htm

    // getting the histogram
    let base64data = await image.getBase64Async(image.getMIME());
    let array: Uint8ClampedArray = await this.getImagePixelsFromURI(base64data).toPromise();
    let histogram: number[][] = this.getHistList(array);

    // getting the settings for the 3 ranges
    var red = filter.filter.args.find(function(element) {
      return(element.name == "R");
    });
    var green = filter.filter.args.find(function(element) {
      return(element.name == "G");
    });
    var blue = filter.filter.args.find(function(element) {
      return(element.name == "B");
    });

    // sum of pixels
    const r_sum: number = histogram[0].reduce((a, b) => a + b, 0);
    const g_sum: number = histogram[1].reduce((a, b) => a + b, 0);
    const b_sum: number = histogram[2].reduce((a, b) => a + b, 0);

    // probability mass function
    const r_pmf: number[] = histogram[0].map(a => a / r_sum);
    const g_pmf: number[] = histogram[1].map(a => a / g_sum);
    const b_pmf: number[] = histogram[2].map(a => a / b_sum);

    // cumulative distributive function
    const r_cdf: number[] = r_pmf.map((sum => value => Math.min(sum += value, 1))(0));
    const g_cdf: number[] = g_pmf.map((sum => value => Math.min(sum += value, 1))(0));
    const b_cdf: number[] = b_pmf.map((sum => value => Math.min(sum += value, 1))(0));

    // mapping list
    const r_mapping: number[] = r_cdf.map(a => parseInt(red.low + a * (red.high - red.low)));
    const g_mapping: number[] = g_cdf.map(a => parseInt(green.low + a * (green.high - green.low)));
    const b_mapping: number[] = b_cdf.map(a => parseInt(blue.low + a * (blue.high - blue.low)));

    // scanning each individual pixel and mapping to its new value
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      this.bitmap.data[idx + 0] = r_mapping[this.bitmap.data[idx + 0]];
      this.bitmap.data[idx + 1] = g_mapping[this.bitmap.data[idx + 1]];
      this.bitmap.data[idx + 2] = b_mapping[this.bitmap.data[idx + 2]];
    });

    return image;
  }

  getHistList(imagePixels: Uint8ClampedArray): number[][] {
    var rvals = this.array256(0);
    var gvals = this.array256(0);
    var bvals = this.array256(0);
    var avals = this.array256(0);
    for (let i = 0; i < imagePixels.length; i += 4) {
      rvals[imagePixels[i]]++;
      gvals[imagePixels[i+1]]++;
      bvals[imagePixels[i+2]]++;
      avals[imagePixels[i+3]]++;
    }
    return([rvals, gvals, bvals, avals]);
  }

  getHistogram(uri: string): Observable<number[][]> {
    return Observable.create((observer: Observer<number[][]>) => {
      this.getImagePixelsFromURI(uri).subscribe(imagePixels => {
        let result = this.getHistList(imagePixels);
        observer.next(result);
      });
    });
  }

  getImagePixelsFromURI(uri) : Observable<Uint8ClampedArray> {
    return Observable.create((observer: Observer<Uint8ClampedArray>) => {
     let img = new Image();
     img.crossOrigin = 'Anonymous';
     if (typeof uri == "string") {
       img.src = uri;
     } else {
       img.src = uri.uri;
     }
     if (!img.complete) {
       img.onload = () => {
         observer.next(this.getImagePixels(img));
         observer.complete();
       };
       img.onerror = (err) => {
         observer.error(err);
       };
     } else {
         observer.next(this.getImagePixels(img));
         observer.complete();
     }
   });
  }

  getImagePixels(img: HTMLImageElement): Uint8ClampedArray {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  }

  array256(default_value: number) : number[] {
    var arr = [];
    for (var i=0; i<256; i++) { arr[i] = default_value; }
    return arr;
  }

}
