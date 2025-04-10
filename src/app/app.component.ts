import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from './services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  otpInput: string = '';
  showOTPSection: boolean = false;
  resendOTPTimer: any = null;
  constructor(private router: Router, private common: CommonService) {
    if (!localStorage.getItem('user_data')) {
      this.router.navigate(['/login']);
    }

    this.common.showOTP.subscribe((data) => {
      if(data){
        this.showOTPSection = true;
        this.resendOtp();
      }
    });
  }

  otptime:any = 60;
  enableOTPTimer() {
    if(this.resendOTPTimer) clearInterval(this.resendOTPTimer);
    this.otptime = 60;
    this.resendOTPTimer = setInterval(() => {
      this.otptime--;
      if(this.otptime <= 0){
        clearInterval(this.resendOTPTimer);
        this.resendOTPTimer = null;
      }
    }, 1000);
  }

  verifyOtp() {
    let data = {code: this.getOTPVal()};
    this.common.api.handleRequest('post', '/common/verify_otp', null, data).then((res) => {
      if(res.status != 'approved'){
        this.common.logger.error('Invalid OTP');
        return;
      }
      this.common.logger.info('OTP verified successfully');
      this.common.userData = this.common.userTmpData;
      setTimeout(() => {
        this.common.userTmpData = null;
        this.showOTPSection = false;
        this.router.navigate(['/home']);
      }, 2000);
    }
    ).catch((err) => {
      // Handle OTP resend error
      this.common.logger.error('Error resending OTP: ' + err);
    });
  }
  goToHome() {
    this.router.navigate(['/home']);
  }
  resendOtp() {
    this.common.api.handleRequest('post', '/common/trigger_otp', null, {}).then((res) => {
      this.enableOTPTimer();
      this.common.logger.info('OTP sent successfully..');
    }
    ).catch((err) => {
      // Handle OTP resend error
      this.common.logger.error('Error resending OTP: ' + err);
    }
    );
  }

  helpToMove(event:any, ind:number = 0){
    if(event.key == 'Backspace' && ind){
      let currentValue = event.target.value;
      if(!currentValue.length){
        document.getElementById('otp-'+(ind-1))?.focus();
        return false;
      }
      return true;
    }
    if(event.key == 'ArrowLeft' && ind){
      document.getElementById('otp-'+(ind-1))?.focus();
      return true;
    }
    if(event.key == 'ArrowRight' && ind){
      document.getElementById('otp-'+(ind+1))?.focus();
      return true;
    }
    return true;
  }

  validateInput(event:any, max:number){
    if( isNaN(event.key) && !['Backspace'].includes(event.key) ) return false;

    if(event.target.value.length >= max){
      event.target.value = event.key;
      let ind = parseInt(event.target.id.split('-')[1]);
      document.getElementById('otp-'+(ind+1))?.focus();
      return false;
    }
    return true;
  }

  

  moveFocus(event:any, elementId:number) {
    let ele = event.target;
    if (ele.value.length === ele.maxLength && elementId) {
      let nexEle = document.getElementById('otp-'+(elementId+1));
      nexEle ? nexEle.focus() : ele.focus();
    }else{
      let preEle = document.getElementById('otp-'+(elementId-1));
      preEle ? preEle.focus() : ele.focus();
    }
  }

  getOTPVal(){
    let mpin = '';
    Array.from(document.querySelectorAll(".otp-input"))
    .map((d:any) => {return {id: d.id,value: d.value}})
    .sort((a:any,b:any) => a.id - b.id)
    .forEach((ele:any) => mpin += ''+ ele.value);
    return mpin;
  }
}
