import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import { ImageInstance } from '../../classes/imageInstance';
import { CanvasService } from '../../services/canvas.service';

@Component({
  selector: 'app-image-tab',
  templateUrl: './image-tab.component.html',
  styleUrls: ['./image-tab.component.scss'],
  // providers: [CanvasService] // to add for two canvas
})
export class ImageTabComponent implements OnInit {

  @Input() image: ImageInstance;
  @Input() addOverlay: boolean;
  @Input() containerId: string;

  @ViewChild("img", {static: false}) img: ElementRef;
  @ViewChild("overlayCanvas", {static: false}) overlayCanvas: ElementRef;

  constructor(private canvasService: CanvasService) { }

  ngOnInit() {
  }

  onImageLoad() {
    if (this.addOverlay) {
      if (this.addOverlay && !this.canvasService.isInit()) {
        this.canvasService.createScene(this.overlayCanvas);
        this.canvasService.animate();
      }
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    if (typeof this.img !== "undefined" && typeof this.overlayCanvas !== "undefined") {
      this.overlayCanvas.nativeElement.height = this.img.nativeElement.height;
      this.overlayCanvas.nativeElement.width = this.img.nativeElement.width;
      this.canvasService.resize();
    }
  }

}
