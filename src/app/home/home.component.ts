import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  studentData:any = {};
  parentData:any = {father: {}, mother: {}};
  currentView:string = 'info';
  attendanceViewType:string = '';
  feeViewType:string = '';

  constructor(private api: ApiService, private router: Router, private common:CommonService) {
    
  }

  ngOnInit(): void {
    this.studentData = this.common.userData;
    this.getParentData(this.studentData.user_id);
  }

  getParentData(user_id: number) {
    if(!user_id)  return;
    this.api.handleRequest('get', '/users/parents/' + user_id).then((res) => {
        this.parentData.father = res.find((item:any) => item.parent_type === 'FATHER');
        this.parentData.mother = res.find((item:any) => item.parent_type === 'MOTHER');
    });
  }

  editProfile(){
    this.router.navigate(['registration']);
  }

  goToHome(){
    this.common.router.navigate(['home']);
  }

  goToStudentList(){
    this.common.router.navigate(['student-list']);
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
