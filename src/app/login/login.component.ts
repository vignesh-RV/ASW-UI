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
  loginData:any = {user_type: 'student'};
  constructor(private api: ApiService, private logger: LoggerService, private common: CommonService) {}

  ngOnInit(): void {
  }

  doLogin() {
    this.api.handleRequest('post', '/users/login', null, this.loginData).then((res) => {
      this.common.userData = res;
      this.common.router.navigate(['/home']);
    });
  }

}
