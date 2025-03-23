import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoggerService } from './logger.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public static resourceChainPath: any = {};
  public static userFilterRoleData: any = {};
  public usersList: any = [];

  constructor(
    private http: HttpClient,
    private alertMsg: LoggerService,
    private logger: LoggerService
  ) {}

  makeRequest(type: string, url: string, body?: any, applicationType?: any) {
    let header: any = {};
    let path: string = '';
    if (ApiService.resourceChainPath[url]) {
      path = ApiService.resourceChainPath[url].chainPath;
      url = ApiService.resourceChainPath[url].formattedUrl;
      header = { resourceChainPath: path };
    }
    switch (type) {
      case 'get': {
        return path
          ? this.http.get(url, {
              responseType: 'text',
              observe: 'response',
              headers: { resourceChainPath: path }
            })
          : this.http.get(url, { responseType: 'text', observe: 'response' });
      }
      case 'post': {
        if (path) {
          return this.http.post(url, body, {
            responseType: 'text',
            observe: 'response',
            headers: header
          });
        } else {
          return this.http.post(url, body, {
            responseType: 'text',
            observe: 'response'
          }) as Observable<HttpResponse<any>>;
        }
      }
      case 'put': {
        if (applicationType) {
          return this.http.put(url, body, {
            headers: {
              'Content-Type': applicationType,
              resourceChainPath: path
            },
            responseType: applicationType,
            observe: 'response'
          });
        } else {
          return this.http.put(url, body, {
            responseType: 'text',
            observe: 'response',
            headers: header
          });
        }
      }
      case 'patch': {
        return this.http.patch(url, body, {
          responseType: 'text',
          observe: 'response',
          headers: header
        });
      }
      case 'delete': {
        if (body) {
          return this.http.delete(url, {
            responseType: 'text',
            observe: 'response',
            body: body,
            headers: header
          });
        } else
          return this.http.delete(url, {
            responseType: 'text',
            observe: 'response',
            headers: header
          });
      }
      case 'deletelist': {
        return this.http.delete(url, {
          responseType: 'text',
          observe: 'response',
          headers: header
        });
      }
      default: {
        return this.http.get(url, {
          responseType: 'text',
          observe: 'response',
          headers: header
        });
      }
    }
  }

  request(type: string, url: string, body?: any, applicationType?: any) {
    return this.makeRequest(type, url, body, applicationType);
  }

  errorHandler(err: any, type?: string, path?: string) {
    let message = '';
    let errMsg: any = {};
    if (err.error && this.isJSONparsable(err.error)) {
      message = JSON.parse(err.error).message || JSON.parse(err.error).error;
      errMsg = JSON.parse(err.error);
    } else {
      message = err && err.error ? err.error : '';
    }
    if (
      message.toString().toLowerCase() === 'no message available' ||
      message === 'Unauthorized access to the resource(INVESTOR)'
    ) {
      return;
    }
    switch (err.status) {
      case 400: {
        this.handleCashflowError(errMsg, message);
        break;
      }
      case 500: {
        this.alertMsg.error(message || 'Please try again later');
        break;
      }
      case 404: {
        this.alertMsg.error(message || 'No Data Available');
        break;
      }
      case 415: {
        this.alertMsg.error(message || 'Invalid Content Type');
        break;
      }

      case 406: {
        this.alertMsg.error(message || 'Action Failed');
        break;
      }
      /**
       * UnAuthorised Access
       * Force the user to login page
       **/
      case 401: {
        this.handleUnAuthorisedError(message, type, path);
        break;
      }
    }
  }

  handleCashflowError(errMsg: any, message: any) {
    if (
      errMsg &&
      errMsg?.status == 'FAILED' &&
      errMsg.status_code == 'TR_PY_000001'
    ) {
      let user = this.usersList.find(
        (userDetails: any) => userDetails.userId == errMsg.data
      );
      this.alertMsg.error(
        'Cashflow generation is already in progress initiated by ' +
          user?.name +
          ' (' +
          user?.email +
          '). Please try again after sometime. '
      );
    } else {
      this.alertMsg.error(message || 'Invalid URL Passed');
    }
  }

  handleUnAuthorisedError(message: any, type?: string, path?: string) {
    if (['Expired Token', 'Error Parsing Token'].indexOf(message) !== -1) {
      this.alertMsg.error('Please Try Again');
      this.logger.setDataObservable('userstatus', 'expired');
    } else if (message == 'Unauthorized' && type == 'get') {
      this.alertMsg.warn(`UnAuthorised Access @ ${path}`);
    } else {
      this.alertMsg.error(message);
    }
  }

  private isJSONparsable(err: string) {
    try {
      JSON.parse(err);
    } catch (error) {
      return false;
    }
    return true;
  }

  handleRequest(
    type: string,
    url: string,
    params?: any,
    body?: any,
    applicationType?: any,
    nonJsonResponse?: any,
    handleError?: boolean
  ): Promise<any> {
    // url = environment.baseUrl + url;

    return new Promise((resolve, reject) => {
      this.request(type, url, body, applicationType)?.subscribe({
        next: (res: any) => {
          if (nonJsonResponse) resolve(res.body);
          else resolve(res && res.body ? JSON.parse(res.body) : res);
        },
        error: (err: any) => {
          if (!handleError) this.errorHandler(err, type,'');
          reject('error');
        },
        complete: () => {
          // do nothing
        }
      });
    });
  }

  handleRawUrlRequest(
    type: string,
    url: string,
    body?: any,
    applicationType?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.request(type, url, body, applicationType)?.subscribe({
        next: (res: any) => {
          resolve(res && res.body ? JSON.parse(res.body) : res);
        },
        error: (err: any) => {
          this.errorHandler(err);
          reject('error');
        },
        complete: () => {
          //do nothing
        }
      });
    });
  }

  getUrl(target: string, params?: any) {
    try {
      return target;
    } catch (error) {
      console.error(target, params, ' failed !!');
      return '';
    }
  }
}
