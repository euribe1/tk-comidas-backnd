import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { Http, URLSearchParams } from "@angular/http";
import { Router } from "@angular/router";
import { AngularFireAuth } from "angularfire2/auth";

import { AuthService } from "../../services/auth.service";
import { error } from "util";
import { Globals } from "../../globals";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: "app-update-password",
  templateUrl: "./update-password.component.html",
  styleUrls: ["../auth.component.scss"]
})
export class UpdatePasswordComponent implements OnInit {
  email: string = "";
  randomPswd: string = "";
  newPswd: string = "";
  emailFormControl_: any;
  matcher_: any;
  randomPswdFormControl_: any;
  randomPswdMatcher: any;
  newPswdFormControl_: any;
  newPswdMatcher: any;
  errorMessage: string = "";
  busy: boolean;
  ipAddress: string = "127.0.0.1:4200";
  constructor(
    private http: Http,
    private router: Router,
    private authService: AuthService,
    private angularFireAuth: AngularFireAuth,
    private globals: Globals
  ) {
    this.authService.isLogged().subscribe(
      result => {
        if (result && result.uid) {
          this.router.navigate(["/dashboard"]);
        }
      },
      error => {
        this.router.navigate(["/signin"]);
      }
    );
  }
  ngOnInit() {
    this.emailFormControl_ = new FormControl("", [Validators.required]);
    this.matcher_ = new MyErrorStateMatcher();
    this.randomPswdFormControl_ = new FormControl("", [Validators.required]);
    this.randomPswdMatcher = new MyErrorStateMatcher();
    this.newPswdFormControl_ = new FormControl("", [Validators.required]);
    this.newPswdMatcher = new MyErrorStateMatcher();
  }
  public resetPassword() {
    if (!this.newPswd || !this.email || !this.randomPswd) {
      this.emailFormControl_.touched = true;
      this.randomPswdFormControl_.touched = true;
      this.newPswdFormControl_.touched = true;
    } else {
      this.busy = true;
      this.errorMessage = "";
      const data = new URLSearchParams();
      data.append("password", this.newPswd);
      data.append("email", this.email);
      data.append("randomPassword", this.randomPswd);
      this.http
        .post(`http://${this.globals.environment["current"].ip}/auth/updateUser`, data)
        .subscribe(
          resp => {
            const res = JSON.parse(resp["_body"]);
            if (res.updated) {
              this.signInWithEmail(this.email, this.newPswd);
            } else if (!res.equal && !res.error.code) {
              this.errorMessage = "No coincide la clave temporal";
              this.busy = false;
            } else if (res.error.code) {
              this.errorMessage = res.error.code;
              this.busy = false;
            } else {
              this.errorMessage =
                "Ha surgido un error al intentar actualizar contraseña";
              this.busy = false;
            }
          },
          error => {
            if (error) {
              this.errorMessage =
                "Ha surgido un error al intentar actualizar contraseña";
            }
            this.busy = false;
          }
        );
    }
  }
  public signInWithEmail(email, password) {
    this.angularFireAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        if (response.uid) {
          this.errorMessage = "";
          this.busy = false;
          this.router.navigate(["/"]);
        }
      })
      .catch(error => {
        this.busy = false;
        switch (error.code) {
          case "auth/wrong-password":
            this.errorMessage = "Contraseña inválida";
            break;
          case "auth/invalid-email":
            this.errorMessage = "Correo electrónico con formato inválido";
            break;
          case "auth/user-not-found":
            this.errorMessage = "Usuario no registrado";
            break;
          default:
            this.errorMessage = "Ha ocurrido un error";
        }
      });
  }
}
