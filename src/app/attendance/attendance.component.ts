import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  _viewType: string = 'HOURLY';
  @Input( 'viewType' )
  set viewType(va:string){
    this._viewType = va;    
  }
  get viewType(){
    return this._viewType;
  }

  selected: any = {startDate: moment(), endDate: moment().add(1, 'days')};
  alwaysShowCalendars: boolean = true;
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

  isInvalidDate = (m: moment.Moment) =>  {
    return this.invalidDates.some(d => d.isSame(m, 'day') )
  }

  attendanceData: any = {daily: [], hourly: [], raw:[]};

  constructor(private api: ApiService, private common:CommonService) { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
    setTimeout(() => this.getAttendance(), 1000);
  }

  getAttendance() {
    console.dir(this.selected);
    let reqData = {
      startDate: new Date(this.selected.startDate).toISOString(),
      endDate: new Date(this.selected.endDate).toISOString(),
      userId: this.common.userData.user_id
    }
    this.api.handleRequest('post', '/attendance/range', null, reqData).then((res) => {
      this.attendanceData.raw = res;
      this.attendanceData.daily = this.getDailyAttendance(res);
      this.attendanceData.hourly = this.getHourlyAttendance(res);
    });
  }

  getDailyAttendance(data: any) {
    let uniDates = Array.from(new Set(data.map((d: any) => moment(d.created_date).format('YYYY-MM-DD'))));
    let res_data:any = [];
    uniDates.forEach((d: any) => {
      let isPresent = data.some((x: any) => x.punch_type == 'IN' && x.created_date.includes(d));
      
      res_data.push({
        date: d,
        isPresent: isPresent,
        day: moment(d).format("dddd")
      });
    });

    return res_data;
  }

  getHourlyAttendance(data: any) {
    let uniDates = Array.from(new Set(data.map((d: any) => moment(d.created_date).format('YYYY-MM-DD'))));
    let res_data:any = [];
    uniDates.forEach((d: any) => {
      let inTime = data.filter((x: any) => x.punch_type == 'IN' && x.created_date.includes(d));
      
      res_data.push({
        date: d,
        totalHours: 8,
        present: inTime.length,
        absent: 8 - inTime.length
      });
    });

    return res_data;
  }
}
