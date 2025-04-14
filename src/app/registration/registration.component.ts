import { Component } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { LoggerService } from '../services/logger.service';
import * as moment from 'moment';
import { CommonService } from '../services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registrationForm: FormGroup = new FormGroup({});
  submitted = false;
  studentData:any = {};//this.common.userData;
  parentData:any = {};
  rfidData:any = {};
  constructor(private fb: FormBuilder, private common:CommonService, private api: ApiService, private logger: LoggerService,
    private activatedRoute:ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params) => {
      if(params['user_id']) {
        if(params['user_id'] > 0){
          this.getStudentData(params['user_id']);
          this.getStudentRFIDData(params['user_id']);
        }else{
          this.studentData = {};
          this.fillFormData();
        }
      }else{
        this.studentData = this.common.userData;
        this.fillFormData();
      }
    });
  }

  getStudentData(user_id:number) {
    if(!user_id) return;
    this.common.api.handleRequest('get', '/users/' + user_id).then((res) => {
      this.studentData = res;
      this.fillFormData();
    });
  }

  fillFormData() {
    this.registrationForm = this.fb.group({
      user_id: [this.studentData.user_id || ''],
      user_name: [this.studentData.user_name || '', [Validators.required, Validators.maxLength(100)]],
      gender: [this.studentData.gender || 'MALE', Validators.required],
      height: [this.studentData.height || 0, [Validators.min(0)]],
      weight: [this.studentData.weight || 0, [Validators.min(0)]],
      dob: [this.studentData.dob ? moment(this.studentData.dob).format('YYYY-MM-DD') : null, Validators.required],
      nationality: [this.studentData.nationality || 'Indian', [Validators.required, Validators.maxLength(100)]],
      religion: [this.studentData.religion || '', Validators.maxLength(100)],
      caste: [this.studentData.caste || '', Validators.maxLength(100)],
      mother_tongue: [this.studentData.mother_tongue || '', Validators.maxLength(100)],
      native_place: [this.studentData.native_place || '', Validators.maxLength(100)],
      mobile_no: [this.studentData.mobile_no || '', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      aadhaar: [this.studentData.aadhaar || '', [Validators.pattern(/^\d{12}$/)]],
      email: [this.studentData.email || '', [Validators.email]],
      first_graduate: [false, Validators.required],
      reg_no: [this.studentData.reg_no || '', [Validators.required, Validators.maxLength(50)]],
      password: [this.studentData.password || '', [Validators.required, Validators.minLength(8)]],
      user_type: [this.studentData.user_type || 'STUDENT', Validators.required],
      batch: [this.studentData.batch || '', Validators.maxLength(100)],
      semester: [1, [Validators.required, Validators.min(1)]],
      current_year: [1, [Validators.required, Validators.min(1)]],
      section_name: [this.studentData.section_name || '', Validators.maxLength(100)],
      course: [this.studentData.course || '', Validators.maxLength(100)],
      school: [this.studentData.school || '', Validators.maxLength(100)],
      blood_group: [this.studentData.blood_group || '', Validators.pattern(/^(A|B|AB|O)[+-]$/)],
      course_duration_in_years: [2, [Validators.required, Validators.min(1)]],
      course_fees: [100000, [Validators.required, Validators.min(0)]],
      profile_image: [this.studentData.profile_image || ''],
      face_id: [this.studentData.face_id || ''],
      rfid_uuid: [this.studentData.rfid_uuid || ''],

      parents: this.fb.array([])
    });
    if(this.studentData.user_id) {
      this.getParentData(this.studentData.user_id);
    }else{
      this.parents.push(this.createParent());
    }
  }

  getParentData(user_id: number) {
    if(!user_id)  return;
    this.api.handleRequest('get', '/users/parents/' + user_id).then((res) => {
        this.parentData.father = res.find((item:any) => item.parent_type === 'FATHER') || undefined;
        this.parentData.mother = res.find((item:any) => item.parent_type === 'MOTHER') || undefined;
        this.parentData.guardian = res.find((item:any) => item.parent_type === 'GUARDIAN') || undefined;

        Object.keys(this.parentData).forEach((key) => {
          if(!this.parentData[key]) return;
          this.addParent();
          this.parents.at(this.parents.controls.length-1).patchValue(this.parentData[key]);
        });

        // if(this.parents.length > 0) {
        //   this.parents.push(this.createParent());
        // }
    });
  }

  // Create a new parent form group
  createParent(): FormGroup {
    return this.fb.group({
      parent_id: [''],
      parent_type: ['FATHER', [Validators.required]],
      full_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      phone_number: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      occupation: [''],
      profile_image: [''],
      designation: [''],
      aadhaar_no: ['', [Validators.pattern(/^\d{12}$/)]], // Aadhaar number should be 12 digits
      email: ['', [Validators.email]],
      annual_income: [0, [Validators.min(0)]]
    });
  }

  get parents(): FormArray {
    return this.registrationForm.get('parents') as FormArray;
  }
  
  // Add a parent entry dynamically
  addParent() {
    if(this.parents.length >= 3) return;
    this.parents.push(this.createParent());
  }

  // Remove a parent entry
  removeParent(index: number) {
    if (this.parents.length > 1) {
      this.parents.removeAt(index);
    }
  }


  isInvalid(field: string, fg?: any): boolean {
    fg = fg || this.registrationForm;
    if(!fg.controls[field]) return false;

    return fg.controls[field].invalid && 
           (fg.controls[field].dirty || fg.controls[field].touched);
  }

  submitForm() {
    this.submitted = true;

    let firstInvalidField:any = document.querySelector('input.ng-invalid');
    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalidField.click();
      firstInvalidField.focus();
    }

    if (this.registrationForm.valid) {

      if(this.parents.length > 0) {
          let allValid =true;
          this.parents.controls.forEach((parent: any) => {
            parent.markAllAsTouched();
            if(parent.invalid) {
              allValid = false;
            }
          });
          if(!allValid) return;
      }else{
        this.logger.error('Required at least one parent information');
        let ele = document.querySelector(".parents-info ");
        if(ele){
          ele.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      console.log('Form Submitted', this.registrationForm.value);
      let formValue = this.registrationForm.getRawValue();
      formValue.password = btoa(formValue.password);
      formValue.dob = moment(formValue.dob).format('YYYY-MM-DD');
      delete formValue.parents;
      if(!formValue.user_id){
        delete formValue.user_id;
      }
      this.api.handleRequest(formValue.user_id ? 'put' : 'post', '/users'+(formValue.user_id? `/${formValue.user_id}` : ''), null, formValue, 'application/json').then((res) => {
        let parentData = (this.parents.getRawValue()||[]).map((d:any) => {
          if(!d.parent_id){
            delete d.parent_id;
          }
          d.student_user_id = res.user_id || formValue.user_id;
          return d;
        });
        Promise.all([
          this.saveParents(parentData),
          this.saveRFID(res, formValue.user_id)
        ]).then(() => {
          this.common.fetchCurrentUser();
          this.getParentData(this.studentData.user_id);
          this.logger.success(!formValue.user_id ? 'Student registered successfully..' : 'Student updated successfully..');
          this.clearForm();
          this.getStudentData(formValue.user_id);
          this.getStudentRFIDData(formValue.user_id);
        });
        
      })
    } else {
      this.registrationForm.markAllAsTouched();
    }
    
  }

  clearForm() {
    this.registrationForm.reset();
    this.submitted = false;
  }


  saveParents(data:any){
    return new Promise((resolve, reject) => {
      this.api.handleRequest('post', '/users/parents', null, data, 'application/json').then((res) => {
        resolve(res);
      });
    });
  }

  saveRFID(data:any, isExistingUser:boolean = false){
    if(isExistingUser){
      let reqData  = this.rfidData;
      reqData.uuid = this.registrationForm.get('rfid_uuid')?.value;
      delete reqData.rfid;
      return new Promise((resolve, reject) => {
        this.api.handleRequest('put', '/students/update_rfid/'+ this.rfidData.rf_id, null, reqData, 'application/json').then((res) => {
          resolve(res);
        });
      });
    }
    let reqData  = {
      student_id: data.user_id
    }
    return new Promise((resolve, reject) => {
      this.api.handleRequest('post', '/students/create_rfid', null, reqData, 'application/json').then((res) => {
        resolve(res);
      });
    });
  }

  onFileSelect(event: any, fg: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          let base64String = reader.result?.toString().split(",")[1] || null;
          const profileImageControl = fg.get('profile_image');
          if (profileImageControl) {
            profileImageControl.patchValue(`data:image/jpeg;base64,`+base64String);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }

  selectedParentIndex:number = 0;
  selectParent(index:number){
    this.selectedParentIndex = index;

    let ele = document.querySelector(".parents-info ");
    if(ele){
      ele.scrollTo({ left: index*300, behavior: "smooth" });
    }
    
  }

  chooseFile(id:string){
    let ele:any = document.querySelector("#"+id);
    if(ele){
      ele.click();
    }
  }

  goToHome() {
    this.common.router.navigate(['home']);
  }

  getStudentRFIDData(user_id:number) {
    this.api.handleRequest('get', '/students/rfid/holder/'+ user_id).then((res:any) => {
      this.rfidData = res;
      setTimeout(() => {
        this.registrationForm.patchValue({
          rfid_uuid: res.uuid
        });
      }, 1000);
    });
  }
}
