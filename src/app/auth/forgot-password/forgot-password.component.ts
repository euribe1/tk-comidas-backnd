import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";

import { AuthService } from "../../services/auth.service";

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
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"]
})
export class ForgotPasswordComponent implements OnInit {
  email: string;
  errorMessage_: string;
  emailFormControl_: any;
  matcher_: any;
  active: any;
  messageError: string;
  busy: boolean;
  constructor(private authService: AuthService) {}
  ngOnInit() {
    this.emailFormControl_ = new FormControl("", [Validators.required]);
    this.matcher_ = new MyErrorStateMatcher();
    document.getElementById("email").focus();
    this.busy = false;
  }

  ckeckInput() {
    this.messageError = "";
  }

  resetPassword() {
    if (this.email) {
      this.busy = true;
      this.authService
        .auth()
        .sendPasswordResetEmail(this.email)
        .then(() => {
          this.messageError =
            "Le hemos enviado un mensaje al correo electrónico";
          this.active = true;
          this.busy = false;
        })
        .catch(error => {
          this.active = false;
          switch (error.code) {
            case "auth/invalid-email":
              this.messageError =
                "Ingresar correo válido para restablecer contraseña";
              break;
            case "auth/user-not-found":
              this.messageError = "Correo electrónico no registrado";
              break;
            default:
              this.messageError = "Ha ocurrido un error";
          }
          this.busy = false;
        });
    }
  }
}
