import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListTabComponent } from './file-list-tab.component';

describe('FileListTabComponent', () => {
  let component: FileListTabComponent;
  let fixture: ComponentFixture<FileListTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileListTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileListTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
