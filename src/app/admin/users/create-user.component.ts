import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { ErrorStateMatcher } from "@angular/material/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from "@angular/forms";
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { storage } from "firebase";
import { DialogComponent } from "../dialog/dialog.component";
import { MatDialog } from "@angular/material";
import { Http, URLSearchParams } from "@angular/http";

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
  selector: "app-create-user",
  templateUrl: "/create-user.component.html",
  styleUrls: ["/create-user.component.css"]
})
export class CreateUserComponent implements OnInit, AfterViewInit {
  user: any = {};
  nameFormControl: any;
  nameMatcher: any;
  lastnameFormControl: any;
  lastnameMatcher: any;
  nicknameFormControl: any;
  nicknameMatcher: any;
  emailFormControl: any;
  emailMatcher;
  dniFormControl: any;
  dniMatcher: any;
  idUser: string;
  ipAddress: string = "40.121.85.209";
  constructor(
    private router: Router,
    private af: AngularFireDatabase,
    private dialog: MatDialog,
    private angularFireAuth: AngularFireAuth,
    private http: Http
  ) {}
  ngAfterViewInit() {
    setTimeout(() => {
      if (document.querySelector(".img-ul-button input")) {
        document
          .querySelector(".img-ul-button input")
          .addEventListener("change", this.updateImageDisplay.bind(this));
      }
    }, 2000);
  }
  ngOnInit() {
    this.nameFormControl = new FormControl("", [Validators.required]);
    this.lastnameFormControl = new FormControl("", [Validators.required]);
    this.nicknameFormControl = new FormControl("", [Validators.required]);
    this.emailFormControl = new FormControl("", [Validators.required]);
    this.dniFormControl = new FormControl("", [Validators.required]);
    this.dniMatcher = new MyErrorStateMatcher();
    this.emailMatcher = new MyErrorStateMatcher();
    this.nameMatcher = new MyErrorStateMatcher();
    this.nicknameMatcher = new MyErrorStateMatcher();
    this.lastnameMatcher = new MyErrorStateMatcher();
  }
  public uploadFile() {
    (<any>document.querySelector(".img-ul-button input")).click();
  }
  public updateImageDisplay(input) {
    const file = input.currentTarget.files[0];
    if (file) {
      this.user.profileImagePath = {
        name: input.currentTarget.files[0].name,
        blobSrc: file
      };
    }
  }
  public saveUser(user) {
    if (
      !this.user.name ||
      !this.user.lastName ||
      !this.user.nickname ||
      !this.user.email ||
      !this.user.dni
    ) {
      this.nameFormControl.touched = true;
      this.lastnameFormControl.touched = true;
      this.nicknameFormControl.touched = true;
      this.emailFormControl.touched = true;
      this.dniFormControl.touched = true;
    } else if (!this.user.profileImagePath) {
      this.openDialog();
    } else {
      (<any>document.querySelector(".spinner-div")).style.display = "flex";
      (<any>document.querySelector(".col1")).classList.add("opacity");
      (<any>document.querySelector(".col2")).classList.add("opacity");
      const data = new URLSearchParams();
      const randomPassword = Date.now()
        .toString()
        .slice(-8);
      data.append("email", user.email);
      data.append("password", randomPassword);
      data.append("name", user.name);
      this.http
        .post(`http://${this.ipAddress}/serverAdmin/admin/createUser`, data)
        .subscribe(
          resp => {
            const res = JSON.parse(resp["_body"]);
            if (res.created) {
              const userId = res.userId;
              const userRef = this.af.database.ref().child("users");
              const storageRef = storage()
                .ref()
                .child(`users/${this.user.profileImagePath.name}`);
              storageRef
                .put(this.user.profileImagePath.blobSrc)
                .then(res => {
                  if (res.state === "success") {
                    user.profileImagePath = res.metadata.downloadURLs[0];
                    user.role = "empleado";
                    user.generatedPassword = randomPassword;
                    const obj = {};
                    obj[`${userId}`] = user;
                    user.didUserSignUpWithEmail = true;
                    const newuserRef = userRef.update(obj);
                    this.user = {};
                    (<any>document.querySelector(".img-ul-clear")).click();
                    (<any>document.querySelector(
                      ".spinner-div"
                    )).style.display =
                      "none";
                    (<any>document.querySelector(".col1")).classList.remove(
                      "opacity"
                    );
                    (<any>document.querySelector(".col2")).classList.remove(
                      "opacity"
                    );
                    this.router.navigate(["users"]);
                  }
                })
                .catch(error => {
                  this.openDialogError(
                    "Ha surgido un error mientras se guardaba registro. Intente nuevamente"
                  );
                  (<any>document.querySelector(".spinner-div")).style.display =
                    "none";
                  (<any>document.querySelector(".col1")).classList.remove(
                    "opacity"
                  );
                  (<any>document.querySelector(".col2")).classList.remove(
                    "opacity"
                  );
                });
              const dataUser = new URLSearchParams();
              dataUser.append("email", user.email);
              dataUser.append("name", user.name);
              dataUser.append("randomPassword", randomPassword);
              dataUser.append("nickname", user.nickname);
              this.http
                .post(
                  `http://${
                    this.ipAddress
                  }/serverAdmin/email/sendEmailToNotifyUpdatePassword`,
                  dataUser
                )
                .subscribe(
                  resp => {
                    console.log(resp);
                    this.openDialogError(
                      `Se ha enviado una notifiación al correo ${user.email}`
                    );
                  },
                  error => {
                    this.openDialogError(
                      `Ha surgido un error al enviar notificación al correo ${
                        user.email
                      }`
                    );
                  }
                );
            } else {
              switch (res.error) {
                case "auth/email-already-exists":
                  this.openDialogError(
                    "El correo ya esta asignado a otro usuario"
                  );
                  break;
                case "auth/invalid-email":
                  this.openDialogError("El correo no cumple un formato válido");
                  break;
                case "auth/operation-not-allowed":
                  this.openDialogError("Operación no permitida");
                  break;
                case "auth/weak-password":
                  this.openDialogError("Intente con una mejor contraseña");
                  break;
                default:
                  this.openDialogError("Ha surgido un error");
              }
              (<any>document.querySelector(".spinner-div")).style.display =
                "none";
              (<any>document.querySelector(".col1")).classList.remove(
                "opacity"
              );
              (<any>document.querySelector(".col2")).classList.remove(
                "opacity"
              );
            }
          },
          error => {
            console.log(error);
            (<any>document.querySelector(".spinner-div")).style.display =
              "none";
            (<any>document.querySelector(".col1")).classList.remove("opacity");
            (<any>document.querySelector(".col2")).classList.remove("opacity");
          }
        );
    }
  }
  public openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        message: "No olvide cargar la foto del usuario",
        confirmRemove: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  public onRemoved(event) {
    this.user.profileImagePath = undefined;
  }
  public openDialogError(msg) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        message: msg,
        confirmRemove: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
