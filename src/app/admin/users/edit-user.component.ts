import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFireDatabase } from "angularfire2/database";
import { storage } from "firebase";
import { UserService } from "../../services/users.service";
import { ErrorStateMatcher } from "@angular/material/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from "@angular/forms";
import { DialogComponent } from "../dialog/dialog.component";
import { MatDialog } from "@angular/material";

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
  selector: "app-edit-user",
  templateUrl: "/edit-user.component.html",
  styleUrls: ["/create-user.component.css"]
})
export class EditUserComponent implements OnInit, AfterViewInit {
  user: any = {};
  idUser: string;
  headerName: string;
  nameFormControl: any;
  nameMatcher: any;
  lastnameFormControl: any;
  lastnameMatcher: any;
  nicknameFormControl: any;
  nicknameMatcher: any;
  dniFormControl: any;
  dniMatcher: any;
  constructor(
    private router: Router,
    private af: AngularFireDatabase,
    private userService: UserService,
    private dialog: MatDialog
  ) {}
  ngAfterViewInit() {
    setTimeout(() => {
      (<any>document.querySelector(".img-ul-button input")).addEventListener(
        "change",
        this.updateImageDisplay.bind(this)
      );
      (<any>document.querySelector(".picture")).style.display = "block";
      (<any>document.querySelector("image-upload")).style.display = "none";
    }, 0);
  }
  ngOnInit() {
    this.nameFormControl = new FormControl("", [Validators.required]);
    this.lastnameFormControl = new FormControl("", [Validators.required]);
    this.nicknameFormControl = new FormControl("", [Validators.required]);
    this.dniFormControl = new FormControl("", [Validators.required]);
    this.dniMatcher = new MyErrorStateMatcher();
    this.nameMatcher = new MyErrorStateMatcher();
    this.nicknameMatcher = new MyErrorStateMatcher();
    this.lastnameMatcher = new MyErrorStateMatcher();
    if (this.userService.userSelected) {
      this.idUser = this.userService.userSelected.id;
      this.af
        .object(`prod/users/${this.idUser}`)
        .valueChanges()
        .subscribe(res => {
          this.user = res;
          this.headerName = res["name"];
          if (res && res["profileImagePath"]) {
            const elem = document.createElement("img");
            elem.src = res["profileImagePath"];
            elem.setAttribute("width", "200");
            (<any>document.querySelector("image-upload")).style.display =
              "none";
            (<any>document.querySelector(".picture")).style.display = "block";
            if (document.querySelector(".picture").children.length === 0) {
              document.querySelector(".picture").appendChild(elem);
            }
          } else {
            (<any>document.querySelector("image-upload")).style.display =
              "block";
            (<any>document.querySelector(".picture")).style.display = "none";
          }
        });
    }
  }
  public updateImageDisplay(input) {
    (<any>document.querySelector("image-upload")).style.display = "block";
    (<any>document.querySelector(".picture")).style.display = "none";
    const file = input.currentTarget.files[0];
    if (file) {
      this.user.profileImagePath = {
        name: input.currentTarget.files[0].name,
        blobSrc: file
      };
    }
  }
  public uploadFile() {
    (<any>document.querySelector(".img-ul-button input")).click();
  }
  public updateUser() {
    if (
      !this.user.name ||
      !this.user.lastName ||
      !this.user.nickname ||
      !this.user.dni
    ) {
      this.nameFormControl.touched = true;
      this.lastnameFormControl.touched = true;
      this.nicknameFormControl.touched = true;
      this.dniFormControl.touched = true;
    } else if (!this.user.profileImagePath) {
      this.openDialog();
    } else {
      try {
        (<any>document.querySelector(".spinner-div")).style.display = "flex";
        (<any>document.querySelector(".col1")).classList.add("opacity");
        (<any>document.querySelector(".col2")).classList.add("opacity");
        const userRef = this.af.database.ref().child(`prod/users/${this.idUser}`);
        if (this.user.profileImagePath && this.user.profileImagePath.name) {
          // Se actualizará imagen también
          const my = storage()
            .ref()
            .child(`prod/users/${this.user.profileImagePath.name}`);
          my
            .put(this.user.profileImagePath.blobSrc)
            .then(res => {
              if (res.state === "success") {
                this.user.profileImagePath = res.metadata.downloadURLs[0];
              }
            })
            .then(res => {
              const obj = {
                name: this.user.name,
                lastName: this.user.lastName,
                nickname: this.user.nickname,
                email: this.user.email ? this.user.email : "",
                dni: this.user.dni,
                profileImagePath: this.user.profileImagePath
              };
              this._updateuser(userRef, obj);
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          delete this.user.profileImagePath;
          this._updateuser(userRef, this.user);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  public _updateuser(ref, user) {
    ref
      .update(user)
      .then(resp => {
        if (document.querySelector(".img-ul-clear")) {
          (<any>document.querySelector(".img-ul-clear")).click();
        }
        (<any>document.querySelector(".spinner-div")).style.display = "none";
        (<any>document.querySelector(".col1")).classList.remove("opacity");
        (<any>document.querySelector(".col2")).classList.remove("opacity");
        this.router.navigate(["users"]);
      })
      .catch(error => {
        console.log(error);
        if (document.querySelector(".img-ul-clear")) {
          (<any>document.querySelector(".img-ul-clear")).click();
        }
        (<any>document.querySelector(".spinner-div")).style.display = "none";
        (<any>document.querySelector(".col1")).classList.remove("opacity");
        (<any>document.querySelector(".col2")).classList.remove("opacity");
      });
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
}
