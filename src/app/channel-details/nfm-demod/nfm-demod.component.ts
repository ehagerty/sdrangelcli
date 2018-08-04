import { Component, OnInit } from '@angular/core';
import { NFMDemodSettings, NFMDEMOD_SETTINGS_DEFAULT, NFMDemodReport, NFMDEMOD_REPORT_DEFAULT } from './nfm-demod';
import { AudioDeviceInfo } from '../am-demod/am-demod.component';
import { Subscription, interval } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ChannelDetailsService } from '../channel-details.service';
import { SdrangelUrlService } from '../../sdrangel-url.service';
import { DeviceStoreService } from '../../device-store.service';
import { AudioStoreService } from '../../main/audio/audio-store.service';
import { Utils } from '../../common-components/utils';
import { ChannelSettings } from '../channel-details';

export interface AudioDeviceInfo {
  value: string,
  viewValue: number
}

export interface CTCSSValues {
  value: number,
  viewValue: number
}

@Component({
  selector: 'app-nfm-demod',
  templateUrl: './nfm-demod.component.html',
  styleUrls: ['./nfm-demod.component.css']
})
export class NfmDemodComponent implements OnInit {
  deviceIndex : number;
  channelIndex: number;
  sdrangelURL : string;
  settings: NFMDemodSettings = NFMDEMOD_SETTINGS_DEFAULT;
  deviceCenterFrequency: number;
  deviceBasebandRate: number;
  deviceStoreSubscription : Subscription;
  channelReportSubscription: Subscription;
  channelDeltaFrequency: number;
  channelCenterFrequencyKhz: number;
  channelMinFrequencyKhz: number;
  channelMaxFrequencyKhz: number;
  rfBandwidthKhz: number;
  audioMute: boolean;
  statusMessage: string;
  statusError: boolean = false;
  rgbTitle: number[] = [0, 0, 0];
  rgbTitleStr: string = 'rgb(0,0,0)'
  audioDevices: AudioDeviceInfo[] = [];
  ctcssValues: CTCSSValues[] = [ // The 32 EIA standard tones
    {value: 0, viewValue: 67.0},
    {value: 1, viewValue: 71.9},
    {value: 2, viewValue: 74.4},
    {value: 3, viewValue: 77.0},
    {value: 4, viewValue: 79.7},
    {value: 5, viewValue: 82.5},
    {value: 6, viewValue: 85.4},
    {value: 7, viewValue: 88.5},
    {value: 8, viewValue: 91.5},
    {value: 9, viewValue: 94.8},
    {value: 10, viewValue: 97.4},
    {value: 11, viewValue: 100.0},
    {value: 12, viewValue: 103.5},
    {value: 13, viewValue: 107.2},
    {value: 14, viewValue: 110.9},
    {value: 15, viewValue: 114.8},
    {value: 16, viewValue: 118.8},
    {value: 17, viewValue: 123.0},
    {value: 18, viewValue: 127.3},
    {value: 19, viewValue: 131.8},
    {value: 20, viewValue: 136.5},
    {value: 21, viewValue: 141.3},
    {value: 22, viewValue: 146.2},
    {value: 23, viewValue: 151.4},
    {value: 24, viewValue: 156.7},
    {value: 25, viewValue: 162.2},
    {value: 26, viewValue: 167.9},
    {value: 27, viewValue: 173.8},
    {value: 28, viewValue: 179.9},
    {value: 29, viewValue: 186.2},
    {value: 30, viewValue: 192.8},
    {value: 31, viewValue: 203.5},
  ];
  monitor: boolean;
  nfmDemodreport: NFMDemodReport = NFMDEMOD_REPORT_DEFAULT;

  constructor(private route: ActivatedRoute,
    private channeldetailsService: ChannelDetailsService,
    private sdrangelUrlService: SdrangelUrlService,
    private deviceStoreService: DeviceStoreService,
    private audioStoreService: AudioStoreService)
  {
    this.deviceStoreSubscription = null;
    this.channelReportSubscription = null;
    this.monitor = false;
  }

  ngOnInit() {
    this.deviceIndex = +this.route.snapshot.parent.params['dix']
    this.channelIndex = +this.route.snapshot.parent.params['cix']
    this.getDeviceStorage();
    this.sdrangelUrlService.currentUrlSource.subscribe(url => {
      this.sdrangelURL = url;
    });
    this.getChannelSettings();
    this.getAudioDevicesInfo();
  }

  ngOnDestroy() {
    (this.deviceStoreSubscription) && this.deviceStoreSubscription.unsubscribe();
    (this.channelReportSubscription) && this.channelReportSubscription.unsubscribe();
  }

  private getChannelSettings() {
    this.channeldetailsService.getSettings(this.sdrangelURL, this.deviceIndex, this.channelIndex).subscribe(
      channelSettings => {
        if (channelSettings.channelType == "NFMDemod") {
          this.statusMessage = "OK";
          this.statusError = false;
          this.settings = channelSettings.NFMDemodSettings;
          this.channelDeltaFrequency = this.settings.inputFrequencyOffset;
          this.channelCenterFrequencyKhz = (this.deviceCenterFrequency + this.channelDeltaFrequency)/1000;
          this.channelMaxFrequencyKhz = (this.deviceCenterFrequency + (this.deviceBasebandRate/2))/1000;
          this.channelMinFrequencyKhz = (this.deviceCenterFrequency - (this.deviceBasebandRate/2))/1000;
          this.rfBandwidthKhz = this.settings.rfBandwidth/1000;
          this.rgbTitle = Utils.intToRGB(this.settings.rgbColor);
          this.rgbTitleStr = Utils.getRGBStr(this.rgbTitle);
          this.settings.volume = +this.settings.volume.toFixed(1);
          this.audioMute = this.settings.audioMute !== 0;
        } else {
          this.statusMessage = "Not an NFMDemod channel";
          this.statusError = true;
        }
      }
    )
  }

  private getDeviceStorage() {
    this.deviceStoreSubscription = this.deviceStoreService.get(this.deviceIndex).subscribe(
      deviceStorage => {
        this.deviceCenterFrequency = deviceStorage.centerFrequency;
        this.deviceBasebandRate = deviceStorage.basebandRate;
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

  private setDeviceSettings(nfmDemodSettings : NFMDemodSettings) {
    const settings : ChannelSettings = <ChannelSettings>{};
    settings.channelType = "NFMDemod";
    settings.tx = 0,
    settings.NFMDemodSettings = nfmDemodSettings;
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

  onFrequencyUpdate(frequency: number) {
    this.channelCenterFrequencyKhz = frequency;
    this.setCenterFrequency();
  }

  setCenterFrequency() {
    const newSettings: NFMDemodSettings = <NFMDemodSettings>{};
    newSettings.inputFrequencyOffset = this.channelCenterFrequencyKhz * 1000 - this.deviceCenterFrequency;
    this.setDeviceSettings(newSettings);
  }

  getDeltaFrequency() : number {
    return this.channelCenterFrequencyKhz - (this.deviceCenterFrequency/1000);
  }

  onTitleColorChanged(colorStr: string) {
    this.rgbTitleStr = colorStr;
    this.setTitleColor();
  }

  setTitleColor() {
    const newSettings: NFMDemodSettings = <NFMDemodSettings>{};
    newSettings.rgbColor = Utils.rgbToInt(this.rgbTitleStr);
    this.setDeviceSettings(newSettings);
  }

  onTitleChanged(title: string) {
    this.settings.title = title;
    this.setTitle();
  }

  setTitle() {
    const newSettings: NFMDemodSettings = <NFMDemodSettings>{};
    newSettings.title = this.settings.title;
    this.setDeviceSettings(newSettings);
  }

  setAudioDevice() {
    const newSettings: NFMDemodSettings = <NFMDemodSettings>{};
    newSettings.audioDeviceName = this.settings.audioDeviceName;
    this.setDeviceSettings(newSettings);
  }

  setVolume() {
    const newSettings: NFMDemodSettings = <NFMDemodSettings>{};
    newSettings.volume = this.settings.volume;
    this.setDeviceSettings(newSettings);
  }

  setAudioMute() {
    const newSettings: NFMDemodSettings = <NFMDemodSettings>{};
    newSettings.audioMute = this.audioMute ? 1 : 0;
    this.setDeviceSettings(newSettings);
  }

  enableReporting(enable: boolean) {
    if (enable) {
      this.channelReportSubscription = interval(950).subscribe(
        _ => {
          this.channeldetailsService.getReport(this.sdrangelURL, this.deviceIndex, this.channelIndex).subscribe(
            channelReport => {
              if (channelReport.channelType === "NFMDemod") {
                this.nfmDemodreport = channelReport.NFMDemodReport;
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

}
