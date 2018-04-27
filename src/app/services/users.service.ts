import { Injectable } from "@angular/core";
import { firebaseConfig } from "../app.module";
import { storage } from "firebase";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { FirebaseApp } from "angularfire2";
import { MatPaginator } from "@angular/material";
import { DataSource } from "@angular/cdk/collections";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/map";

@Injectable()
export class UserService {
  userSelected: any = {};
  private usersData$: AngularFireList<User[]>;
  constructor(public af: AngularFireDatabase) {}
}

export interface User {
  nickname: string;
  name: string;
  lastName: string;
  email: string;
  date: string;
  action: string;
  id: string;
}

@Injectable()
export class UserDatabase {
  /* Stream that emits whenever the data has been modified. */
  public dataFilteredLength: number;
  public dataChange: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  get data(): User[] {
    return this.dataChange.value;
  }

  // Connection to remote db.
  private database = this.productAdminService.af.list("prod/users", ref =>
    ref.orderByChild("name")
  );

  public getUsers(): AngularFireList<any> {
    return this.database;
  }

  constructor(private productAdminService: UserService) {
    let items = new Observable<User[]>();
    items = this.getUsers()
      .snapshotChanges()
      .map(changes => {
        return changes.map(data => {
          const currentDate = new Date();
          let creationDate =
            currentDate.getDate() +
            "-" +
            (currentDate.getMonth() + 1) +
            "-" +
            currentDate.getFullYear();
          if (data.payload.val().createdAt) {
            creationDate = data.payload.val().createdAt.split(" ")[0];
          }
          const date = creationDate.split("-");
          const day = ("0" + date[0]).slice(-2);
          const month = ("0" + date[1]).slice(-2);
          const year = date[2];
          const obj = {
            nickname: data.payload.val().nickname,
            name: data.payload.val().name,
            lastName: data.payload.val().lastName,
            email: data.payload.val().email,
            date: `${day}-${month}-${year}`,
            action: "",
            id: data.key
          };
          return obj;
        });
      });
    items.subscribe(arr => this.dataChange.next(arr));
  }
}

interface MultiFilter {
  nickname: string;
  name: string;
  email: string;
  myDateFrom: string;
  myDateToFrom: string;
}

@Injectable()
export class UserAdminSource extends DataSource<User> {
  filterChange = new BehaviorSubject({
    nickname: "",
    name: "",
    email: "",
    myDateFrom: "",
    myDateToFrom: ""
  });
  get filter(): MultiFilter {
    return this.filterChange.value;
  }
  set filter(filter: MultiFilter) {
    this.filterChange.next(filter);
  }
  constructor(
    private userDatabase: UserDatabase,
    private paginator: MatPaginator
  ) {
    super();
  }

  connect(): Observable<User[]> {
    const displayDataChanges = [
      this.userDatabase.dataChange,
      this.filterChange,
      this.paginator.page
    ];

    return Observable.merge(...displayDataChanges) // Convert object to array with spread syntax.
      .map(() => {
        const dataSlice = this.userDatabase.data
          .slice()
          .filter((item: User) => {
            if (item.nickname) {
              const nickname = item.nickname.toLowerCase();
              return (
                nickname.indexOf(this.filter.nickname.toLowerCase()) !== -1
              );
            }
            item.nickname = "sin nickname";
            return true;
          })
          .filter((item: User) => {
            const itemName =
              item.name.toLowerCase() + " " + item.lastName.toLowerCase();
            return itemName.indexOf(this.filter.name.toLowerCase()) !== -1;
          })
          .filter((item: User) => {
            if (item.email) {
              const itemEmail = item.email;
              return itemEmail.indexOf(this.filter.email.toLowerCase()) !== -1;
            }
            item.email = "sin correo";
            return true;
          })
          .filter((item: User) => {
            const afDate = item.date.split("-");
            const objDate = new Date(
              parseInt(afDate[2]),
              parseInt(afDate[1]) - 1,
              parseInt(afDate[0])
            );
            const filterDateFrom = new Date(this.filter.myDateFrom);
            const filterDateTo = new Date(this.filter.myDateToFrom);
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
          });
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.paginator.length = dataSlice.length;
        const dataFilteredLength = dataSlice.length;
        return dataSlice.splice(startIndex, this.paginator.pageSize);
      });
  }
  disconnect() {}
}
