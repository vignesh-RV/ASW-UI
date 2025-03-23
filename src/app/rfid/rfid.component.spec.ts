import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfidComponent } from './rfid.component';

describe('RfidComponent', () => {
  let component: RfidComponent;
  let fixture: ComponentFixture<RfidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfidComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
