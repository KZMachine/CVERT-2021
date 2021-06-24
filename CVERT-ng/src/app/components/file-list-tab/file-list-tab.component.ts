import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as path from 'path';

import { ImageInstance } from '../../classes/imageInstance';
import { ImageFile } from '../../classes/imageFile';
import { GisService } from '../../services/gis.service';

@Component({
  selector: 'app-file-list-tab',
  templateUrl: './file-list-tab.component.html',
  styleUrls: ['./file-list-tab.component.scss']
})
export class FileListTabComponent implements OnInit {

  @Input() topImage: ImageInstance;
  @Output() topImageChange = new EventEmitter();

  @Input() bottomImage: ImageInstance;
  @Output() bottomImageChange = new EventEmitter();

  @Input() inputFiles: ImageFile[];
  @Output() inputFilesChange = new EventEmitter();

  constructor(private gisService: GisService) { }

  ngOnInit() {
  }

  async openImage(image: ImageFile) {
    this.topImage = new ImageInstance();
    await this.topImage.update(image.path, this.gisService);
    this.topImageChange.emit(this.topImage);
    this.bottomImage = new ImageInstance();
    await this.bottomImage.update(image.path, this.gisService);
    this.bottomImageChange.emit(this.bottomImage);
  }

  onChangeColor(image: ImageFile) {
    switch (image.color) {
      case "currentColor":
        image.color = "primary";
        break;
      case "primary":
        image.color = "accent";
        break;
      case "accent":
        image.color = "warn";
        break;
      case "warn":
        image.color = "currentColor";
        break;
      default:
        break;
    };
  }

  onChangeViewed(file: ImageFile) {
    file.viewed = !file.viewed;
  }

  getName(image: ImageFile): string {
    return path.basename(image.path);
  }

}
