import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { LoggerService } from './logger.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public showOTP: Subject<any>  = new Subject<any>();
  get userData(): any{
    return JSON.parse(localStorage.getItem('user_data') || '{}');
  }
  set userData(data: any){
    localStorage.setItem('user_data', JSON.stringify(data));
  }

  public userTmpData: any = {};
  
  constructor(public router: Router, public api: ApiService, public logger: LoggerService) {}


  fetchCurrentUser() {
    this.api.handleRequest('get', '/users/'+this.userData.user_id).then((res) => {
      console.log(res);
      this.userData = res;
    });
  }
}
