import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  get userData(): any{
    return JSON.parse(localStorage.getItem('user_data') || '{}');
  }
  set userData(data: any){
    localStorage.setItem('user_data', JSON.stringify(data));
  }
  
  constructor(public router: Router, private api: ApiService, public logger: LoggerService) {}


  fetchCurrentUser() {
    this.api.handleRequest('get', '/users/'+this.userData.user_id).then((res) => {
      console.log(res);
      this.userData = res;
    });
  }
}
