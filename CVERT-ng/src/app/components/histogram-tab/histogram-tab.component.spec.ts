import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogramTabComponent } from './histogram-tab.component';

describe('HistogramTabComponent', () => {
  let component: HistogramTabComponent;
  let fixture: ComponentFixture<HistogramTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistogramTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistogramTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
