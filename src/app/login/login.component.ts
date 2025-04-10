import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LoggerService } from '../services/logger.service';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginData:any = {user_type: 'STUDENT'};

  loginTypes:any = [
    {
      id: 'STUDENT',
      name: 'Student'
    },
    {
      id: 'STAFF',
      name: 'Staff'
    },
    {
      id: 'PARENT',
      name: 'Parent'
    }
  ];

  constructor(private api: ApiService, private logger: LoggerService, private common: CommonService) {
    if(localStorage.getItem('user_data')){
      this.common.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
  }

  doLogin() {
    this.api.handleRequest('post', '/users/login', null, this.loginData).then((res) => {
      
      if(res.user_type != this.loginData.user_type || res.user_type == 'STAFF'){
        res.logged_in_as = this.loginData.user_type;
        this.common.userTmpData = res;
        this.common.showOTP.next(true);
      } else {
        res.logged_in_as = this.loginData.user_type;
        this.common.userData = res;
        
        this.common.router.navigate(['/home']);
      }
    });
  }

  showOTPScreen() {
    this.common.router.navigate(['/otp']);
  }

}
