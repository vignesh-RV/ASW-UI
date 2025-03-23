import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rfid',
  templateUrl: './rfid.component.html',
  styleUrls: ['./rfid.component.scss']
})
export class RfidComponent implements OnInit {

  paymentsHistory:any = [];
  rfidData:any = {};
  userData:any =  this.common.userData;

  currentModal:any = {};
  showModal:boolean = false;

  paymentForm:FormGroup = this.fb.group({
        upi_id: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)]],
        amount: [null, [Validators.required, Validators.min(0)]]
      });

  limitForm:FormGroup = this.fb.group({
    max_limit: [null, [Validators.required, Validators.min(0)]]
  });

  constructor(private fb:FormBuilder,private api: ApiService, public common: CommonService) { }

  ngOnInit(): void {
    this.getStudentRFIDData();
    this.getUserPayments();
  }

  isInvalid(field: string, fg?: any): boolean {
    fg = fg || this.paymentForm;
    if(!fg.controls[field]) return false;

    return fg.controls[field].invalid && 
           (fg.controls[field].dirty || fg.controls[field].touched);
  }

  getUserPayments() {
    this.api.handleRequest('get', '/payments/user/'+this.userData.user_id).then((res:any) => {
      this.paymentsHistory = res;
    });
  }

  getStudentRFIDData() {
    this.api.handleRequest('get', '/students/rfid/holder/'+this.userData.user_id).then((res:any) => {
      this.rfidData = res;
      this.limitForm.patchValue({
        max_limit: this.rfidData.max_limit
      });
    });
  }

  showPaymentModal(){
    this.currentModal = {
      title: 'Add Payment',
      action_text: 'Add Payment',
      type: 'PAYMENT',
      data: this.rfidData
    }
    this.showModal = true;
  }

  editLimit(){
    this.currentModal = {
      title: 'Update Card Limit',
      action_text: 'Update Limit',
      type: 'LIMIT',
      data: this.rfidData
    }
    this.showModal = true;
  }

  lockTheCard(){
    let data = {
      locked: !this.rfidData.locked
    }
    this.api.handleRequest('put', '/students/lock/'+this.rfidData.rf_id, null, data).then((res) => {
      this.getStudentRFIDData();
      this.common.logger.success('Card ' + (data.locked ? 'Locked' : 'Unlocked') + ' Successfully');
    });
  }

  closeModal(){
    this.showModal = false;
    this.currentModal = {};
  }

  progressBar: number = 0;
  doAction(){
    let fg: FormGroup = this.currentModal.type == 'PAYMENT' ? this.paymentForm : this.limitForm;
    if(fg.valid){
      let data = fg.getRawValue();
      data.student_id = this.userData.user_id;
      data.rfid = this.rfidData.rf_id;
      this.showProgressBar();
      setTimeout(() => {
        this.api.handleRequest('put', (this.currentModal.type == 'PAYMENT' ? '/students/recharge/' : '/students/limit/' )+this.rfidData.rf_id, null, data).then((res) => {
          this.getStudentRFIDData();
          this.common.logger.success((this.currentModal.type == 'PAYMENT' ? 'Payment' : 'Limit') + ' Updated Successfully');
          this.showModal = false;
        });
        
      }, 3000);
    }
    else {
      this.paymentForm.markAllAsTouched();
    }    
  }

  showProgressBar(){
    let progressInterval =
    setInterval(() => {
      this.progressBar += 10;
      if(this.progressBar >= 100){
        this.progressBar = 0;
        clearInterval(progressInterval);
      }
    }, 300)
  }
}
