import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private common: CommonService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // To Avoid UI loading before getting code from login page
    if(state.url.includes('registration') && route.url.length > 1 && this.common.userData.user_type !== 'STAFF'){
      return false;
    }
    return localStorage.getItem('user_data') ? true : false;
  }
}