import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerTabComponent } from './server-tab.component';

describe('ServerTabComponent', () => {
  let component: ServerTabComponent;
  let fixture: ComponentFixture<ServerTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
