import { Component } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { LoggerService } from '../services/logger.service';
import * as moment from 'moment';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  submitted = false;
  studentData:any = this.common.userData;
  parentData:any = {};
  constructor(private fb: FormBuilder, private common:CommonService, private api: ApiService, private logger: LoggerService) {
    this.registrationForm = this.fb.group({
      user_id: [this.studentData.user_id || ''],
      user_name: [this.studentData.user_name || '', [Validators.required, Validators.maxLength(100)]],
      gender: [this.studentData.gender || '', Validators.required],
      height: [this.studentData.height || '', [Validators.min(0)]],
      weight: [this.studentData.weight || '', [Validators.min(0)]],
      dob: [this.studentData.dob ? moment(this.studentData.dob).format('YYYY-MM-DD') : null, Validators.required],
      nationality: [this.studentData.nationality || '', [Validators.required, Validators.maxLength(100)]],
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

      parents: this.fb.array([])
    });

    
    this.getParentData(this.studentData.user_id);
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
    });
  }

  // Create a new parent form group
  createParent(): FormGroup {
    return this.fb.group({
      parent_id: [''],
      parent_type: ['FATHER', [Validators.required]],
      full_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      phone_number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      occupation: [''],
      profile_image: [''],
      designation: [''],
      aadhaar_no: ['', [Validators.pattern(/^\d{12}$/)]], // Aadhaar number should be 12 digits
      email: ['', [Validators.email]],
      annual_income: ['', [Validators.min(0)]]
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
      }

      console.log('Form Submitted', this.registrationForm.value);
      let formValue = this.registrationForm.getRawValue();
      formValue.password = btoa(formValue.password);
      formValue.dob = moment(formValue.dob).format('YYYY-MM-DD');
      this.api.handleRequest('put', '/users/'+formValue.user_id, null, formValue, 'application/json').then((res) => {
        let parentData = (this.parents.getRawValue()||[]).map((d:any) => {
          d.student_user_id = formValue.user_id;
          return d;
        });
        Promise.all([
          this.saveParents(parentData)
        ]).then(() => {
          this.common.fetchCurrentUser();
          this.getParentData(this.studentData.user_id);
          this.logger.success(!formValue.user_id ? 'Student registered successfully..' : 'Student updated successfully..');
        });
        
      })
    } else {
      this.registrationForm.markAllAsTouched();
    }
    
  }


  saveParents(data:any){
    return new Promise((resolve, reject) => {
      this.api.handleRequest('post', '/users/parents', null, data, 'application/json').then((res) => {
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
}
