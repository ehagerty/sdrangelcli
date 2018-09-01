import { Component, OnInit } from '@angular/core';
import { SDRDaemonChannelSourceSettings, DAEMON_SOURCE_SETTINGS_DEFAULT, SDRDaemonChannelSourceReport, DAEMON_SOURCE_REPORT_DEFAULT } from './daemon-source';
import { ActivatedRoute } from '@angular/router';
import { ChannelDetailsService } from '../channel-details.service';
import { DevicesetService } from '../../deviceset/deviceset/deviceset.service';
import { SdrangelUrlService } from '../../sdrangel-url.service';
import { DeviceStoreService } from '../../device-store.service';
import { Subscription, interval } from 'rxjs';
import { Utils } from '../../common-components/utils';
import { ChannelSettings } from '../channel-details';

@Component({
  selector: 'app-daemon-source',
  templateUrl: './daemon-source.component.html',
  styleUrls: ['./daemon-source.component.css']
})
export class DaemonSourceComponent implements OnInit {
  deviceIndex : number;
  channelIndex: number;
  sdrangelURL : string;
  settings: SDRDaemonChannelSourceSettings = DAEMON_SOURCE_SETTINGS_DEFAULT;
  report: SDRDaemonChannelSourceReport = DAEMON_SOURCE_REPORT_DEFAULT;
  deviceCenterFrequency: number;
  deviceBasebandRate: number;
  statusMessage: string;
  statusError: boolean = false;
  rgbTitle: number[] = [0, 0, 0];
  rgbTitleStr: string = 'rgb(0,0,0)'
  monitor: boolean;
  deviceStoreSubscription : Subscription;
  channelReportSubscription: Subscription;

  constructor(private route: ActivatedRoute,
    private channeldetailsService: ChannelDetailsService,
    private deviceSetService: DevicesetService,
    private sdrangelUrlService: SdrangelUrlService,
    private deviceStoreService: DeviceStoreService)
  {
    this.deviceStoreSubscription = null;
    this.channelReportSubscription = null;
    this.monitor = false;
    this.sdrangelUrlService.currentUrlSource.subscribe(url => {
      this.sdrangelURL = url;
    });
  }

  ngOnInit() {
    this.deviceIndex = +this.route.snapshot.parent.params['dix']
    this.channelIndex = +this.route.snapshot.parent.params['cix']
    this.getDeviceStorage();
    this.getChannelSettings();
  }

  ngOnDestroy() {
    (this.deviceStoreSubscription) && this.deviceStoreSubscription.unsubscribe();
    (this.channelReportSubscription) && this.channelReportSubscription.unsubscribe();
  }

  private getDeviceStorage() {
    this.deviceStoreSubscription = this.deviceStoreService.get(this.deviceIndex).subscribe(
      deviceStorage => {
        this.deviceCenterFrequency = deviceStorage.centerFrequency;
        this.deviceBasebandRate = deviceStorage.basebandRate;
      },
      error => {
        if (error == "No device at this index") {
          this.deviceSetService.getInfo(this.sdrangelURL, this.deviceIndex).subscribe(
            deviceset => {
              this.deviceStoreService.change(
                this.deviceIndex,
                {
                  basebandRate: deviceset.samplingDevice.bandwidth,
                  centerFrequency: deviceset.samplingDevice.centerFrequency
                }
              )
              this.deviceBasebandRate = deviceset.samplingDevice.bandwidth;
              this.deviceCenterFrequency = deviceset.samplingDevice.centerFrequency;
            }
          )
        }
      }
    )
  }

  private getChannelSettings() {
    this.channeldetailsService.getSettings(this.sdrangelURL, this.deviceIndex, this.channelIndex).subscribe(
      channelSettings => {
        if (channelSettings.channelType == "DaemonSrc") {
          this.statusMessage = "OK";
          this.statusError = false;
          this.settings = channelSettings.SDRDaemonChannelSourceSettings;
          this.rgbTitle = Utils.intToRGB(this.settings.rgbColor);
          this.rgbTitleStr = Utils.getRGBStr(this.rgbTitle);
        } else {
          this.statusMessage = "Not a DaemonSrc channel";
          this.statusError = true;
        }
      }
    )
  }

  private setDeviceSettings(daemonSourceSettings : SDRDaemonChannelSourceSettings) {
    const settings : ChannelSettings = <ChannelSettings>{};
    settings.channelType = "DaemonSrc";
    settings.tx = 1,
    settings.SDRDaemonChannelSourceSettings = daemonSourceSettings;
    this.channeldetailsService.setSettings(this.sdrangelURL, this.deviceIndex, this.channelIndex, settings).subscribe(
      res => {
        console.log("Set settings OK", res);
        this.statusMessage = "OK";
        this.statusError = false;
        this.getChannelSettings();
      },
      error => {
        this.statusMessage = error.message;
        this.statusError = true;
      }
    )
  }

  enableReporting(enable: boolean) {
    if (enable) {
      this.channelReportSubscription = interval(1000).subscribe(
        _ => {
          this.channeldetailsService.getReport(this.sdrangelURL, this.deviceIndex, this.channelIndex).subscribe(
            channelReport => {
              if (channelReport.channelType === "DaemonSrc") {
                this.report = channelReport.SDRDaemonChannelSourceReport;
              }
            }
          )
        }
      )
    } else {
      this.channelReportSubscription.unsubscribe();
      this.channelReportSubscription = null;
    }
  }

  onTitleColorChanged(colorStr: string) {
    this.rgbTitleStr = colorStr;
    this.setTitleColor();
  }

  setTitleColor() {
    const newSettings: SDRDaemonChannelSourceSettings = <SDRDaemonChannelSourceSettings>{};
    newSettings.rgbColor = Utils.rgbToInt(this.rgbTitleStr);
    this.setDeviceSettings(newSettings);
  }

  onTitleChanged(title: string) {
    this.settings.title = title;
    this.setTitle();
  }

  setTitle() {
    const newSettings: SDRDaemonChannelSourceSettings = <SDRDaemonChannelSourceSettings>{};
    newSettings.title = this.settings.title;
    this.setDeviceSettings(newSettings);
  }

  setDataAddress() {
    const newSettings: SDRDaemonChannelSourceSettings = <SDRDaemonChannelSourceSettings>{};
    newSettings.dataAddress = this.settings.dataAddress;
    this.setDeviceSettings(newSettings);
  }

  setDataPort() {
    const newSettings: SDRDaemonChannelSourceSettings = <SDRDaemonChannelSourceSettings>{};
    newSettings.dataPort = this.settings.dataPort;
    this.setDeviceSettings(newSettings);
  }
}
