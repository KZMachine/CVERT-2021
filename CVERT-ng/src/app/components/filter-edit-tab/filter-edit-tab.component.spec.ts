import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterEditTabComponent } from './filter-edit-tab.component';

describe('FilterEditTabComponent', () => {
  let component: FilterEditTabComponent;
  let fixture: ComponentFixture<FilterEditTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterEditTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterEditTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
