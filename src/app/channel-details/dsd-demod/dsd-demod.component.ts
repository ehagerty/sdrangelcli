import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChannelDetailsService } from '../channel-details.service';
import { DevicesetService } from '../../deviceset/deviceset/deviceset.service';
import { SdrangelUrlService } from '../../sdrangel-url.service';
import { DeviceStoreService } from '../../device-store.service';
import { AudioStoreService } from '../../main/audio/audio-store.service';
import { Subscription, interval } from 'rxjs';
import { DSDDemodSettings, DSDDEMOD_SETTINGS_DEFAULT, DSDDemodReport, DSDDEMOD_REPORT_DEFAULT } from './dsd-demod';
import { Utils } from '../../common-components/utils';
import { ChannelSettings } from '../channel-details';

interface AudioDeviceInfo {
  value: string,
  viewValue: number
}

interface Log2 {
  value: number,
  viewValue: number
}

@Component({
  selector: 'app-dsd-demod',
  templateUrl: './dsd-demod.component.html',
  styleUrls: ['./dsd-demod.component.css']
})
export class DsdDemodComponent implements OnInit {
  deviceStoreSubscription : Subscription;
  channelReportSubscription: Subscription;
  sdrangelURL : string;
  monitor: boolean;
  deviceIndex : number;
  channelIndex: number;
  deviceCenterFrequency: number;
  deviceBasebandRate: number;
  audioDevices: AudioDeviceInfo[] = [];
  statusMessage: string;
  statusError: boolean = false;
  settings: DSDDemodSettings = DSDDEMOD_SETTINGS_DEFAULT;
  channelDeltaFrequency: number;
  channelCenterFrequencyKhz: number;
  channelMinFrequencyKhz: number;
  channelMaxFrequencyKhz: number;
  rfBandwidthKhz: number;
  rgbTitle: number[] = [0, 0, 0];
  rgbTitleStr: string = 'rgb(0,0,0)';
  dsdDemodReport: DSDDemodReport = DSDDEMOD_REPORT_DEFAULT;

  constructor(private route: ActivatedRoute,
    private channeldetailsService: ChannelDetailsService,
    private deviceSetService: DevicesetService,
    private sdrangelUrlService: SdrangelUrlService,
    private deviceStoreService: DeviceStoreService,
    private audioStoreService: AudioStoreService)
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
    this.getAudioDevicesInfo();
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

  private getAudioDevicesInfo() {
    if (!this.audioStoreService.isInitialized()) {
      this.audioStoreService.initialize();
    }
    this.audioStoreService.getOutput().subscribe(
      audioData => {
        this.audioDevices = [];
        for (let [key, value] of Object.entries(audioData)) {
          this.audioDevices.push({value: key, viewValue: value["audioRate"]});
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  private getChannelSettings() {
    this.channeldetailsService.getSettings(this.sdrangelURL, this.deviceIndex, this.channelIndex).subscribe(
      channelSettings => {
        if (channelSettings.channelType == "DSDDemod") {
          this.statusMessage = "OK";
          this.statusError = false;
          this.settings = channelSettings.DSDDemodSettings;
          this.channelDeltaFrequency = this.settings.inputFrequencyOffset;
          this.channelCenterFrequencyKhz = (this.deviceCenterFrequency + this.channelDeltaFrequency)/1000;
          this.channelMaxFrequencyKhz = (this.deviceCenterFrequency + (this.deviceBasebandRate/2))/1000;
          this.channelMinFrequencyKhz = (this.deviceCenterFrequency - (this.deviceBasebandRate/2))/1000;
          this.rfBandwidthKhz = this.settings.rfBandwidth/1000;
          this.rgbTitle = Utils.intToRGB(this.settings.rgbColor);
          this.rgbTitleStr = Utils.getRGBStr(this.rgbTitle);
          this.settings.volume = +this.settings.volume.toFixed(1);
        } else {
          this.statusMessage = "Not a DSDDemod channel";
          this.statusError = true;
        }
      }
    )
  }

  private setDeviceSettings(dsdDemodSettings : DSDDemodSettings) {
    const settings : ChannelSettings = <ChannelSettings>{};
    settings.channelType = "DSDDemod";
    settings.tx = 0,
    settings.DSDDemodSettings = dsdDemodSettings;
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
              if (channelReport.channelType === "DSDDemod") {
                this.dsdDemodReport = channelReport.DSDDemodReport;
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

  toggleMonitor() {
    this.monitor = !this.monitor;
    this.enableReporting(this.monitor);
  }

  onTitleColorChanged(colorStr: string) {
    this.rgbTitleStr = colorStr;
    this.setTitleColor();
  }

  setTitleColor() {
    const newSettings: DSDDemodSettings = <DSDDemodSettings>{};
    newSettings.rgbColor = Utils.rgbToInt(this.rgbTitleStr);
    this.setDeviceSettings(newSettings);
  }

  onTitleChanged(title: string) {
    this.settings.title = title;
    this.setTitle();
  }

  setTitle() {
    const newSettings: DSDDemodSettings = <DSDDemodSettings>{};
    newSettings.title = this.settings.title;
    this.setDeviceSettings(newSettings);
  }

}