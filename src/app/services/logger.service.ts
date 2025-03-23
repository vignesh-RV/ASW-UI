import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

declare let toastr: any;

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public values: { [key: string]: any } = {
    userstatus: null,
    acmstatus: null
  };

  private globalObservables = new BehaviorSubject(this.values);
  globalValues = this.globalObservables.asObservable();
  private accessTokenSubject = new Subject();
  accessTokenObs: Observable<any> = this.accessTokenSubject.asObservable();
  isTokenReceived: boolean = false;
  constructor() {
    toastr.options = {
      "closeButton": true,
      "progressBar": true,
      "positionClass": "toast-top-right",
      "timeOut": "3000"
    };
  }

  setDataObservable(target: string, value: string) {
    const curr = this.globalObservables.getValue();
    if (curr.hasOwnProperty(target)) {
      curr[target] = value;
      this.globalObservables.next(curr);
      console.groupCollapsed('%c Observable  %c: ' + target + ' set ');
      console.groupEnd();
    } else {
      console.warn(target + ' observable not found');
    }
  }
  getDataObservable(): Observable<any> {
    return this.globalObservables;
  }

  getAccessToken() {
    return this.accessTokenObs;
  }

  setAccessToken(val: any) {
    return this.accessTokenSubject.next(val);
  }

  log(txt: string) {
    console.log(txt);
  }

  warn(txt: string) {
    console.warn(txt);
  }
  consoleError(txt: string) {
    console.error(txt);
  }

  warning(txt: string) {
    toastr.warning(txt, 'Warning');
  }

  success(txt: string) {
    toastr.success(txt, 'Success');
  }
  clearToast() {
    toastr.clear();
  }
  error(txt: string) {
    toastr.error(txt, 'Error');
  }
  info(txt: string) {
    toastr.info(txt, 'Info');
  }
  table(data: any) {
    console.table(data);
  }

  groupCollapsed(txt: string) {
    console.groupCollapsed(txt);
  }
  group(txt: string) {
    console.group(txt);
  }
  groupEnd() {
    console.groupEnd();
  }
}
