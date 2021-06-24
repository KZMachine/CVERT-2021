import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmParameterItemComponent } from './algorithm-parameter-item.component';

describe('AlgorithmParameterItemComponent', () => {
  let component: AlgorithmParameterItemComponent;
  let fixture: ComponentFixture<AlgorithmParameterItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmParameterItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmParameterItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
