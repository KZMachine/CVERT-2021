import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmParametersEditComponent } from './algorithm-parameters-edit.component';

describe('AlgorithmParametersEditComponent', () => {
  let component: AlgorithmParametersEditComponent;
  let fixture: ComponentFixture<AlgorithmParametersEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmParametersEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmParametersEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
