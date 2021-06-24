import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-algorithm-parameter-item',
  templateUrl: './algorithm-parameter-item.component.html',
  styleUrls: ['./algorithm-parameter-item.component.scss']
})
export class AlgorithmParameterItemComponent implements OnInit {

  @Input() parameter: any;

  constructor() { }

  ngOnInit() {
  }

}
