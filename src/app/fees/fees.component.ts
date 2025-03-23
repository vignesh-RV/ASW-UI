import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.scss']
})
export class FeesComponent implements OnInit {
  _viewType: string = 'TUITION';
  @Input( 'viewType' )
  set viewType(va:string){
    this._viewType = va;
    this.loadData();
  }
  get viewType(){
    return this._viewType;
  }

  tuitionFees:any = [];
  placementFees:any = [];
  arrearFees:any = [];
  revaluationFees:any = [];

  userData:any = this.common.userData;
  userPayments:any = [];

  constructor(private api: ApiService, private common:CommonService) {
    this.loadData();
  }

  loadData(){
    this.getPlacementFees();
    this.getArrearFees();
    this.getRevaluationFees();
    this.getUserPayments();
  }

  ngOnInit(): void {
  }

  getUserPayments() {
    this.api.handleRequest('get', '/payments/user/'+this.userData.user_id).then((res:any) => {
      this.userPayments = res;
      this.prepareTutionFees(res);
      if(this.placementFees.length) {
        this.preparePlacementFees();
      }

      if(this.arrearFees.length) {
        this.prepareArrearFees();
      }
      
      if(this.revaluationFees.length) {
        this.prepareRevaluationFees();
      }
    });
  }

  prepareTutionFees(data:any) {
    data = data.filter((d:any) => d.transaction_type == 'TUITION');
    
    let totalYears = this.userData.course_duration_in_years;
    let currentYear = this.userData.current_year-1;
    let joineddata = moment(this.userData.created_date);
    let joinedMonth = joineddata.month();
    let remainingMonths = ((totalYears-currentYear)*2) -(joinedMonth>5 ?-1: 0);
    // let uniDates = Array.from(new Set(data.map((d: any) => moment(d.created_date).format('YYYY-MM'))));
    this.tuitionFees = [];
    for(let y=1; y<=remainingMonths; y++) {
      let joinedMonth = joineddata.month();
      let joinedYear = joineddata.year();
      let data = {
        acamic_year_format: moment(joineddata).format('YYYY-MM'),
        acadamic_year: joinedYear-1 + '-' + joinedYear + (joinedMonth>5 ? 'JUN': 'JAN'),
        course_fees: this.userData.course_fees,
      }

      this.tuitionFees.push(data);
      joineddata =moment(joineddata).add(6, 'months');
    }

    this.tuitionFees.forEach((tf:any) => {
        tf.paid = data.reduce((acc:any, item:any) => {
          if(item.created_date.includes(tf.acamic_year_format)) {
            acc += item.amount;
          }
          return acc;
        }, 0) || undefined;
        let filteredData = data.filter((item:any) => item.created_date.includes(tf.acamic_year_format));
        let sortedData = filteredData.sort((a:any, b:any) => moment(b.created_date).diff(moment(a.created_date)));
        tf.last_transaction_date = sortedData.length ?  sortedData[0].created_date : undefined;
    });
    
  }

  getPlacementFees() {
    this.api.handleRequest('get', '/common/placement_fees').then((res:any) => {
      this.placementFees = res;
      if(this.userPayments.length) {
        this.preparePlacementFees();
      }
    });
  }

  preparePlacementFees() {
    let placementPayments = this.userPayments.filter((d:any) => d.transaction_type == 'PLACEMENT');
    if(!placementPayments.length) {
      return;
    }
    this.placementFees.forEach((pf:any) => {
      pf.paid = placementPayments.reduce((acc:any, item:any) => {
        if(item.object_id == pf.id) {
          acc += item.amount;
        }
        return acc;
      }, 0) || undefined;
      let filteredData = placementPayments.filter((item:any) => item.object_id == pf.id);
      let sortedData = filteredData.sort((a:any, b:any) => moment(b.created_date).diff(moment(a.created_date)));
      pf.last_transaction_date = sortedData.length ? sortedData[0].created_date : undefined;
    })
  }

  getArrearFees() {
    this.api.handleRequest('get', '/common/arrear_fees').then((res:any) => {
      this.arrearFees = res;
      if(this.userPayments.length) {
        this.prepareArrearFees();
      }
    });
  }

  prepareArrearFees() {
    let arrearPayments = this.userPayments.filter((d:any) => d.transaction_type == 'ARREAR');
    if(!arrearPayments.length) {
      return;
    }
    this.arrearFees.forEach((pf:any) => {
      pf.paid = arrearPayments.reduce((acc:any, item:any) => {
        if(item.object_id == pf.id) {
          acc += item.amount;
        }
        return acc;
      }, 0) || undefined;
      let filteredData = arrearPayments.filter((item:any) => item.object_id == pf.id);
      let sortedData = filteredData.sort((a:any, b:any) => moment(b.created_date).diff(moment(a.created_date)));
      pf.last_transaction_date = sortedData.length ? sortedData[0].created_date : undefined;
    })
  }


  getRevaluationFees() {
    this.api.handleRequest('get', '/common/revaluation_fees').then((res:any) => {
      this.revaluationFees = res;
      if(this.userPayments.length) {
        this.prepareRevaluationFees();
      }
    });
  }

  prepareRevaluationFees() {
    let revaluationPayments = this.userPayments.filter((d:any) => d.transaction_type == 'REVALUATION');
    if(!revaluationPayments.length) {
      return;
    }
    this.revaluationFees.forEach((pf:any) => {
      pf.paid = revaluationPayments.reduce((acc:any, item:any) => {
        if(item.object_id == pf.id) {
          acc += item.amount;
        }
        return acc;
      }, 0) || undefined;
      let filteredData = revaluationPayments.filter((item:any) => item.object_id == pf.id);
      let sortedData = filteredData.sort((a:any, b:any) => moment(b.created_date).diff(moment(a.created_date)));
      pf.last_transaction_date = sortedData.length ? sortedData[0].created_date : undefined;
    })
  }

  Number(value: any) {
    return Number(value);
  }
}
