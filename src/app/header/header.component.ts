import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  get studentData():any {
    return this.common.userData;
  }

  constructor(private common:CommonService) { }

  ngOnInit(): void {
  }

  goToHome(){
    this.common.router.navigate(['home']);
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
