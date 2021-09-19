import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeaturePresetIdentifier, FeaturePresets } from 'src/app/main/featurepreset/featurepreset';
import { FeaturepresetService } from 'src/app/main/featurepreset/featurepreset.service';
import { SdrangelUrlService } from 'src/app/sdrangel-url.service';

export interface PresetSelect {
  value: FeaturePresetIdentifier;
  viewValue: string;
}

export interface PresetGroupSelect {
  name: string;
  presets: PresetSelect[];
}

@Component({
  selector: 'app-save-feature-preset-dialog',
  templateUrl: './save-feature-preset-dialog.component.html',
  styleUrls: ['./save-feature-preset-dialog.component.css']
})
export class SaveFeaturePresetDialogComponent implements OnInit {
  sdrangelURL: string;
  presets: FeaturePresets;
  presetGroups: PresetGroupSelect[] = [];
  featuresetIndex: number;
  selectedPreset: FeaturePresetIdentifier;

  constructor(private dialogRef: MatDialogRef<SaveFeaturePresetDialogComponent>,
    private presetService: FeaturepresetService,
    private sdrangelUrlService: SdrangelUrlService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar) {
      this.featuresetIndex = data.featuresetIndex;
    }

  ngOnInit(): void {
    this.sdrangelUrlService.currentUrlSource.subscribe(url => {
      this.sdrangelURL = url;
      this.fetchPresetInformation();
    });
  }

  private fetchPresetInformation() {
    this.presetService.getInfo(this.sdrangelURL).subscribe(
      presets => {
        this.presets = presets;
        for (const presetGroup of presets.groups) {
          this.presetGroups.push({
            name: presetGroup.groupName,
            presets: []
          });
          for (const preset of presetGroup.presets) {
            this.presetGroups[this.presetGroups.length - 1].presets.push({
              viewValue: preset.description,
              value: {
                groupName: presetGroup.groupName,
                description: preset.description
              }
            });
            if (!this.selectedPreset) {
              this.selectedPreset = {
                groupName: presetGroup.groupName,
                description: preset.description
              };
            }
          }
        }
      },
      err => {
        this.snackBar.open(err.error.message, 'OK', {duration: 2000});
        this.dialogRef.close('Error');
      }
    );
  }

  close() {
    this.dialogRef.close('Dismiss');
  }

  save() {
    this.presetService.savePreset(this.sdrangelURL, this.featuresetIndex, this.selectedPreset).subscribe(
      res => {
        console.log('Saved OK', res);
        this.dialogRef.close('OK');
      },
      error => {
        console.log(error);
        this.snackBar.open(error.message, 'OK', {duration: 2000});
        this.dialogRef.close('Error');
      }
    );
  }
}
