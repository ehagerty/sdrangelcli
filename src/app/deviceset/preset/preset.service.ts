import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Presets, PresetLoad } from './preset';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  constructor(private http: HttpClient) { }

  getInfo(url: string): Observable<Presets> {
    return this.http.get<Presets>(url + '/presets');
  }

  loadPreset(url: string, preset: PresetLoad) : Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'accept':  'application/json',
        'Content-Type':  'application/json'
      })
    };
    return this.http.patch(url, JSON.stringify(preset), httpOptions);
  }
}