import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  studentList:any = [];
  studentData:any = {};
  constructor(private common: CommonService) {
    this.getStudentList();
  }

  ngOnInit(): void {
  }

  getStudentList() {
    this.common.api.handleRequest('get', '/users/list').then((res) => {
      this.studentList = res;
    })
  }

  addStudent():void {
    this.common.router.navigate(['registration/-1']);
  }

  editStudent(studentId:any):void {
    this.common.router.navigate(['registration/' + studentId]);
  }
  deleteStudent(studentId:any):void {
    this.common.api.handleRequest('delete', 'users/' + studentId).then((res) => {
      this.getStudentList();
    }
    ).catch((err) => {
      console.error(err);
    }
    );
  }

  goToHome():void {
    // Logic to navigate to home
  }

  logout():void {
    // Logic to logout
  }
}
