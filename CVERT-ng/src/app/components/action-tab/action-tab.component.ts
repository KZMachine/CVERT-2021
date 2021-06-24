import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import html2canvas from 'html2canvas';

import * as path from 'path';

import { ImageInstance } from '../../classes/imageInstance';
import { ImageFile } from '../../classes/imageFile';
import { Filter } from '../../classes/filter';

import { FileService } from '../../services/file.service';
import { ServerService } from '../../services/server.service';
import { GisService } from '../../services/gis.service';

@Component({
  selector: 'app-action-tab',
  templateUrl: './action-tab.component.html',
  styleUrls: ['./action-tab.component.scss']
})
export class ActionTabComponent implements OnInit {

  @Input() bottomImage: ImageInstance;

  @Input() filtersList: Array<Filter>;
  @Output() filtersListChange = new EventEmitter();

  @Input() inputFiles: ImageFile[];
  @Output() inputFilesChange = new EventEmitter();

  private inputLabel = "Input";
  private outputLabel = "Output";

  private outputDir: string;

  constructor(private fileService: FileService,
              private serverService: ServerService,
              private gisService: GisService) { }

  ngOnInit() { }

  saveImage() {
    this.fileService.saveImage(this.bottomImage);
  }

  saveCanvas() {
    let image = this.getElementInsideContainer("bottom-container", "img");
    html2canvas(document.querySelector("#bottom-container")).then(canvas => {
      let outCanvas = document.createElement('canvas');
      outCanvas.width = image.width;
      outCanvas.height = image.height;
      let ctx = outCanvas.getContext('2d');
      ctx.drawImage(canvas, (canvas.width - image.width)/2, (canvas.height - image.height)/2, image.width, image.height, 0, 0, image.width, image.height);
      const mime = "image/png";
      var img = outCanvas.toDataURL(mime);
      this.fileService.saveCanvas(img, mime);
    });
  }

  getElementInsideContainer(containerID, childID) {
    var elm;
    var elms = document.getElementById(containerID).getElementsByTagName("*");
    for (var i = 0; i < elms.length; i++) {
        if (elms[i].id === childID) {
            elm = elms[i];
            break;
        }
    }
    return elm;
  }

  getInputFiles() {
    this.fileService.getIntputFiles().then((filePaths) => {
      if (filePaths.length > 0) {
        this.inputFiles = [];
        console.log(filePaths);
        for (let filePath of filePaths) {
          this.inputFiles.push(new ImageFile(filePath));
        }
        this.inputFilesChange.emit(this.inputFiles);
        this.inputLabel = 'In: ' + filePaths.length.toString() + ' files';
      } else {
        console.log('no input files selected');
      }
    });
  }

  getOutputDirectory() {
    this.fileService.getOutputDirectory().then((dirPath) => {
      if (dirPath !== '') {
        console.log(dirPath);
        this.outputDir = dirPath;
        var dirSplit = path.parse(dirPath);
        this.outputLabel = 'Out: ' + dirSplit.name;
      } else {
        console.log('no output folder selected');
      }
    });
  }

  async applyFilters() {
    for (var file of this.inputFiles) {
      var image = new ImageInstance();
      await image.update(file.path, this.gisService);
      await image.applyFilterList(this.filtersList, this.serverService).then(async (result) => {
        await image.update(result, image.gisService).then(async (res) => {
          var pathSplit = path.parse(file.path);
          var name = pathSplit.name + '-mod' + pathSplit.ext;
          var imagePath = path.join(this.outputDir, name);
          console.log(imagePath);
          await this.fileService.saveImageToPath(image, imagePath);
        });
      })
    }
  }

  async applyGPS() {
    let filePaths = [];
    for (let file of this.inputFiles) {
      filePaths.push(file.path);
    }
    var result = await this.serverService.sendGPSRequest(filePaths, this.outputDir, this.gisService.gis);
    console.log(result);
  }

}
