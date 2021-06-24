import { Component, OnInit } from '@angular/core';

import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-algorithm-parameters-edit',
  templateUrl: './algorithm-parameters-edit.component.html',
  styleUrls: ['./algorithm-parameters-edit.component.scss']
})
export class AlgorithmParametersEditComponent implements OnInit {

  algorithmParameters: any;

  constructor(private fileService: FileService) {
    // this.algorithmParameters = assets.algorithmParameters;
  }

  ngOnInit() {
    this.fileService.getAlgorithmParameters('paramWin').then((parameters) => {
      this.algorithmParameters = parameters;
    });
  }

  saveParameters() {
    console.log(this.algorithmParameters);
    this.fileService.saveAlgorithmParameters(this.algorithmParameters);
  }

}
