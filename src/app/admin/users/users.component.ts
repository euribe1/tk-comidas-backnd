import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource, MatPaginator } from "@angular/material";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { Router } from "@angular/router";
import { Http, URLSearchParams } from "@angular/http";

import { DialogComponent } from "../dialog/dialog.component";
import { MatDialog } from "@angular/material";
import { ExcelService } from "../../services/excel-exporter.service";

import { DataSource } from "@angular/cdk/collections";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";

import { FormControl } from "@angular/forms";
import {
  UserService,
  UserDatabase,
  UserAdminSource
} from "../../services/users.service";
import { AuthService } from "../../services/auth.service";
import "rxjs/add/operator/startWith";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/observable/combineLatest";

export interface User {
  nickname: string;
  name: string;
  lastName: string;
  email: string;
  date: string;
  action: string;
  id: string;
}

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"]
})
export class UsersComponent implements OnInit {
  displayedColumns: any;
  dataSource: any;
  data: Array<User> = [];
  totalUsers: number;
  user: any = {};
  idPlace: string;
  userSelected: any = {};
  myDateFrom: any;
  myDateTo: any;
  userRef: AngularFireList<any>;
  _user: Observable<any[]>;
  nameFilter = new FormControl();
  nicknameFilter = new FormControl();
  emailFilter = new FormControl();
  myDateFromFilter = new FormControl();
  myDateToFromFilter = new FormControl();
  dataLength: any;
  ipAddress: string = "40.121.85.209";
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private af: AngularFireDatabase,
    private router: Router,
    private userService: UserService,
    public userDatabase: UserDatabase,
    private dialog: MatDialog,
    private excelService: ExcelService,
    private http: Http
  ) {
    this.displayedColumns = ["name", "nickname", "email", "date", "action"];
  }

  ngOnInit() {
    this.userDatabase
      .getUsers()
      .valueChanges()
      .subscribe(products => {
        this.dataSource = new UserAdminSource(
          this.userDatabase,
          this.paginator
        );
        this.dataLength = products;
      });

    const nameFilter$ = this.formControlValueStream(this.nameFilter, "");
    const emailFilter$ = this.formControlValueStream(this.emailFilter, "");
    const nicknameFilter$ = this.formControlValueStream(
      this.nicknameFilter,
      ""
    );
    const myDateFromFilter$ = this.formControlValueStream(
      this.myDateFromFilter,
      ""
    );
    const myDateToFromFilter$ = this.formControlValueStream(
      this.myDateToFromFilter,
      ""
    );

    Observable.combineLatest(
      nameFilter$,
      emailFilter$,
      nicknameFilter$,
      myDateFromFilter$,
      myDateToFromFilter$
    )
      .map(([name, email, nickname, myDateFrom, myDateToFrom]) => ({
        name,
        email,
        nickname,
        myDateFrom,
        myDateToFrom
      }))
      .subscribe(filter => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = filter;
      });
  }
  private formControlValueStream(control: FormControl, defaultValue: any) {
    return control.valueChanges
      .debounceTime(150)
      .distinctUntilChanged()
      .startWith(defaultValue);
  }
  public goToAddUserView() {
    this.router.navigateByUrl("addUser");
  }
  public goToEditUserView(user) {
    if (user) {
      this.userService.userSelected = user;
      this.router.navigate(["/editUser"]);
    }
  }
  public removeUser(user) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        message: `¿Estás seguro de eliminar el usuario ${user.nickname}?`,
        confirmRemove: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "ok") {
        if (user && user.id) {
          const data = new URLSearchParams();
          data.append("userId", user.id);
          this.http
            .post(`http://${this.ipAddress}/serverAdmin/admin/deleteUser`, data)
            .subscribe(
              resp => {
                const res = JSON.parse(resp["_body"]);
                if (res.deleted) {
                  const userRef = this.af.database
                    .ref()
                    .child(`prod/users/${user.id}`);
                  userRef
                    .remove()
                    .then(res => {
                      document
                        .querySelector(`.${user.id}`)
                        .classList.add("hidden-row");
                      this.totalUsers--;
                    })
                    .catch(error => console.log(error));
                } else {
                  this.openDialogError(
                    "Ha surgido un error al intentar borrar usuario"
                  );
                }
              },
              error => {
                this.openDialogError(
                  "Ha surgido un error al intentar borrar usuario"
                );
              }
            );
        }
      }
    });
  }
  public restoreFilter(user) {
    this.nameFilter.setValue("");
    this.nicknameFilter.setValue("");
    this.emailFilter.setValue("");
    this.myDateFromFilter.setValue("");
    this.myDateToFromFilter.setValue("");
  }
  public downloadFile(user) {
    user.nickname = this.nicknameFilter.value;
    user.name = this.nameFilter.value;
    user.email = this.emailFilter.value;
    user.myDateFrom = this.myDateFromFilter.value;
    user.myDateTo = this.myDateToFromFilter.value;
    const fileJson = [];
    const filter = new Promise((resolve, reject) => {
      this.dataSource.userDatabase.data
        .slice()
        .filter(elem => {
          if (user.nickname && elem.nickname) {
            const nickname = elem.nickname.toLowerCase();
            return nickname.indexOf(user.nickname.toLowerCase()) !== -1;
          }
          return true;
        })
        .filter(elem => {
          if (user.name && elem.name) {
            const name = elem.name.toLowerCase();
            return name.indexOf(user.name.toLowerCase()) !== -1;
          }
          return true;
        })
        .filter(elem => {
          if (user.email && elem.email) {
            const email = elem.email.toLowerCase();
            return email.indexOf(user.email.toLowerCase()) !== -1;
          }
          return true;
        })
        .filter(elem => {
          if (elem.date) {
            const afDate = elem.date.split("-");
            const objDate = new Date(
              parseInt(afDate[2]),
              parseInt(afDate[1]) - 1,
              parseInt(afDate[0])
            );
            const filterDateFrom = new Date(user.myDateFrom);
            const filterDateTo = new Date(user.myDateTo);
            if (
              !isNaN(filterDateTo.getDate()) &&
              !isNaN(filterDateFrom.getDate())
            )
              return objDate >= filterDateFrom && objDate <= filterDateTo;
            else if (
              !isNaN(filterDateFrom.getDate()) &&
              isNaN(filterDateTo.getDate())
            ) {
              return (
                objDate.getDate() == filterDateFrom.getDate() &&
                objDate.getMonth() == filterDateFrom.getMonth() &&
                objDate.getFullYear() == filterDateFrom.getFullYear()
              );
            } else if (
              isNaN(filterDateFrom.getDate()) &&
              !isNaN(filterDateTo.getDate())
            ) {
              return (
                objDate.getDate() == filterDateTo.getDate() &&
                objDate.getMonth() == filterDateTo.getMonth() &&
                objDate.getFullYear() == filterDateTo.getFullYear()
              );
            } else return true;
          } else return true;
        })
        .forEach((elem, index, filterData) => {
          let obj = {};
          obj["Usuario"] = elem.nickname;
          obj["Nombre"] = elem.name + " " + elem.lastName;
          obj["Correo"] = elem.email;
          obj["Fecha"] = elem.date;
          fileJson.push(obj);
          if (index === filterData.length - 1) {
            resolve(fileJson);
          }
        });
    })
      .then(resp => {
        this.excelService.exportAsExcelFile(fileJson, "users_tkcomidas");
      })
      .catch(error =>
        this.openDialogError("Ha surgido un error al exportar archivo")
      );
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
