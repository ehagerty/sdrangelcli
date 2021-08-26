import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SdrangelUrlService } from '../sdrangel-url.service';
import { Subscription } from 'rxjs';
import { DevicesetService } from '../deviceset/deviceset/deviceset.service';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css']
})
export class DeviceDetailsComponent implements OnInit {
  deviceIndex: number;
  isTx: boolean;
  private sub: Subscription;
  sdrangelURL: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private deviceSetService: DevicesetService,
    private sdrangelUrlService: SdrangelUrlService) {
    this.sub = null;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.deviceIndex = +params['dix']; // (+) converts string 'dix' to a number
    });
    this.sdrangelUrlService.currentUrlSource.subscribe(url => {
      this.sdrangelURL = url;
      this.getDeviceSettings();
    });
  }

  getDeviceSettings() {
    this.deviceSetService.getInfo(this.sdrangelURL, this.deviceIndex).subscribe(
      deviceSet => {
        this.isTx = deviceSet.samplingDevice.direction === 1;
        if (deviceSet.samplingDevice.hwType === 'Airspy') {
          this.router.navigate(['airspy'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'AirspyHF') {
          this.router.navigate(['airspyhf'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'BladeRF1') {
          if (deviceSet.samplingDevice.direction === 0) {
            this.router.navigate(['bladerf1in'], { relativeTo: this.route});
          } else {
            this.router.navigate(['bladerf1out'], { relativeTo: this.route});
          }
        } else if (deviceSet.samplingDevice.hwType === 'BladeRF2') {
          if (deviceSet.samplingDevice.direction === 0) {
            this.router.navigate(['bladerf2in'], { relativeTo: this.route});
          } else {
            this.router.navigate(['bladerf2out'], { relativeTo: this.route});
          }
        } else if (deviceSet.samplingDevice.hwType === 'FCDPro') {
          this.router.navigate(['fcdpro'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'FCDPro+') {
          this.router.navigate(['fcdproplus'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'HackRF') {
          if (deviceSet.samplingDevice.direction === 0) {
            this.router.navigate(['hackrfin'], { relativeTo: this.route});
          } else {
            this.router.navigate(['hackrfout'], { relativeTo: this.route});
          }
        } else if (deviceSet.samplingDevice.hwType === 'KiwiSDR') {
          this.router.navigate(['kiwisdr'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'LimeSDR') {
          if (deviceSet.samplingDevice.direction === 0) {
            this.router.navigate(['limesdrin'], { relativeTo: this.route});
          } else {
            this.router.navigate(['limesdrout'], { relativeTo: this.route});
          }
        } else if (deviceSet.samplingDevice.hwType === 'Perseus') {
          this.router.navigate(['perseus'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'PlutoSDR') {
          if (deviceSet.samplingDevice.direction === 0) {
            this.router.navigate(['plutosdrin'], { relativeTo: this.route});
          } else {
            this.router.navigate(['plutosdrout'], { relativeTo: this.route});
          }
        } else if (deviceSet.samplingDevice.hwType === 'RTLSDR') {
          this.router.navigate(['rtlsdr'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'SDRplay1') {
          this.router.navigate(['sdrplay1'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'SDRplayV3') {
          this.router.navigate(['sdrplayv3'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'TestSource') {
          this.router.navigate(['testsource'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'XTRX') {
          if (deviceSet.samplingDevice.direction === 0) {
            this.router.navigate(['xtrxin'], { relativeTo: this.route});
          } else {
            this.router.navigate(['xtrxout'], { relativeTo: this.route});
          }
        } else if (deviceSet.samplingDevice.hwType === 'RemoteInput') {
          this.router.navigate(['remotein'], { relativeTo: this.route});
        } else if (deviceSet.samplingDevice.hwType === 'RemoteOutput') {
          this.router.navigate(['remoteout'], { relativeTo: this.route});
        } else {
          this.router.navigate(['notsupported'], { relativeTo: this.route});
        }
      }
    );
  }

  getDevicesetLabel(): string {
    return (this.isTx ? 'Tx' : 'Rx') + this.deviceIndex;
  }
}
