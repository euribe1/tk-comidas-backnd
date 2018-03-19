import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { AppRoutingModule } from '../app-routing.module';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loginParams: any = {};
  emailFormControl: any;
  matcher: any;
  passFormControl: any;
  matcher_: any;
  active: boolean;
  activeResetPsw: boolean;
  errorMessage: string = '';
  busy: boolean;
  constructor(
    private authService: AuthService,
    private af: AngularFireDatabase,
    private angularFireAuth: AngularFireAuth,
    private router: Router) {
    this.authService.isLogged()
      .subscribe(result => {
        if (result && result.uid) {
          this.router.navigate(['/dashboard']);
        }
      }, error => {
        this.router.navigate(['/signin']);
      });
  }
  ngOnInit() {
    this.emailFormControl = new FormControl('', [
      Validators.required
    ]);
    this.matcher = new MyErrorStateMatcher();
    this.passFormControl = new FormControl('', [
      Validators.required
    ]);
    this.matcher_ = new MyErrorStateMatcher();
    this.active = false;
    this.activeResetPsw = false;
  }

  cancelResetPassword() {
    this.active = false;
    this.activeResetPsw = false;
    this.loginParams.email = '';
    this.loginParams.password = '';
    this.emailFormControl = new FormControl('', [
      Validators.required
    ]);
    this.matcher = new MyErrorStateMatcher();
    this.passFormControl = new FormControl('', [
      Validators.required
    ]);
    this.matcher_ = new MyErrorStateMatcher();
  }

  wantResetPassword() {
    this.active = true;
    this.activeResetPsw = true;
    this.errorMessage = '';
  }

  login() {
    this.busy = true;
    if (!this.loginParams.email || !this.loginParams.password) {
      this.errorMessage = '';
      this.emailFormControl.touched = true;
      this.passFormControl.touched = true;
      this.busy = false;
    } else if (this.loginParams.email && this.loginParams.password && this.loginParams.email.search('@') === -1) {
      this.af.list('/users', ref => {
        return ref.orderByChild('nickname').equalTo(this.loginParams.email);
      })
        .valueChanges()
        .subscribe(elem => {
          if (elem.length > 0) {
            return this.signInWithEmail(elem[0]['email'], this.loginParams.password);
          } else {
            this.errorMessage = 'Usuario no registrado';
            this.busy = false;
          }
        });
    } else {
      this.signInWithEmail(this.loginParams.email, this.loginParams.password);
    }
  }
  ckeckInput() {
    this.errorMessage = '';
  }
  public signInWithEmail(email, password) {
    this.angularFireAuth.auth.signInWithEmailAndPassword(email, password)
      .then(response => {
        if (response.uid) {
          this.errorMessage = '';
          this.busy = false;
          this.router.navigate(['/']);
        }
      })
      .catch(error => {
        this.busy = false;
        switch (error.code) {
          case 'auth/wrong-password':
            this.errorMessage = 'Contraseña inválida';
            break;
          case 'auth/invalid-email':
            this.errorMessage = 'Correo electrónico con formato inválido';
            break;
          case 'auth/user-not-found':
            this.errorMessage = 'Usuario no registrado';
            break;
          default:
            this.errorMessage = 'Ha ocurrido un error';
        }
      });
  }
}
