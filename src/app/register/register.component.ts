import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/user';
import { Router } from '@angular/router';
import { Observable, pipe } from 'rxjs';
import { UserService } from '../_services/user.service';
import { map, debounce, debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  user: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  passwordStrength = 0;

  constructor(private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private alertify: AlertifyService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.bsConfig = {
      containerClass: 'theme-red'
    };
    this.createRegisterForm();
    this.registerForm.controls.password.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(newValue => (this.passwordStrength = newValue.length));

    // this.registerForm.controls.username.valueChanges.subscribe(x => {
    //   debugger;
    //   console.log(this.registerForm.controls.username);
    // });

    this.registerForm.controls.username.valueChanges
      .pipe(
        filter(query => query.length >= 3),
        debounceTime(400),
        switchMap(value => this.userService.userExists(value))
      )
      .subscribe(results => {
        console.log(' value changes called');
        
        if (results) {
          this.registerForm.controls.username.setErrors({
            alreadyInUse: true
          });
        }
      });
  }



  createRegisterForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', [Validators.required/*, control => this.isUserNameAvailable(control)*/]],
      knownAs: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : { 'mismatch': true };
  }


  // usernameBlur() : Observable<{ alreadyInUse: true } | null>{
  //   debugger;
  //   return this.isUserNameAvailable(this.registerForm.controls.username);
  // }
  isUserNameAvailable(control: AbstractControl): Observable<any> {
    debugger;
    return this.userService.userExists(control.value)
      .pipe(
        map(available => !available ? null : { alreadyInUse: true }),
      );
  }
  register() {
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);
      this.authService.register(this.user).subscribe(() => {
        this.alertify.success('Registration successful');
      }, error => {
        this.alertify.error(error);
      }, () => {
        this.authService.login(this.user).subscribe(() => {
          this.router.navigate(['/members']);
        });
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

}
