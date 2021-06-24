import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageTabComponent } from './image-tab.component';

describe('ImageTabComponent', () => {
  let component: ImageTabComponent;
  let fixture: ComponentFixture<ImageTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
