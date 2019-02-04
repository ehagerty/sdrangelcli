import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteSinkComponent } from './remote-sink.component';
import { ChannelHeaderComponent } from '../channel-header/channel-header.component';
import { ChannelMonitorComponent } from '../channel-monitor/channel-monitor.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatTooltipModule, MatProgressBarModule } from '@angular/material';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonComponentsModule } from '../../common-components/common-components.module';
import { ColorPickerModule } from 'ngx-color-picker';

describe('RemoteSinkComponent', () => {
  let component: RemoteSinkComponent;
  let fixture: ComponentFixture<RemoteSinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RemoteSinkComponent,
        ChannelHeaderComponent,
        ChannelMonitorComponent
      ],
      imports: [
        RouterModule,
        FormsModule,
        MatCardModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatProgressBarModule,
        HttpClientTestingModule,
        CommonComponentsModule,
        ColorPickerModule
      ],
      providers: [
        {provide: ActivatedRoute, useValue: { snapshot: {parent: {params: {dix: 0, cix: 0}}}}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteSinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});