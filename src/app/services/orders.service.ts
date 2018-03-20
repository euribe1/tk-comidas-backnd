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
export class OrderService {
  orderSelected: any = {};
  private ordersData$: AngularFireList<Order[]>;
  constructor(public af: AngularFireDatabase) {}
}

export interface Order {
  dni: string;
  state: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  action: string;
  id: string;
}

@Injectable()
export class OrderDatabase {
  idPlace = "-KqUfHv6pOigweWypUmH";
  statusOrders = [
    "Pendiente",
    "Enviado",
    "En Proceso",
    "Entregado",
    "Cancelado"
  ];
  /* Stream that emits whenever the data has been modified. */
  public dataChange: BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>(
    []
  );
  get data(): Order[] {
    return this.dataChange.value;
  }

  // Connection to remote db.
  private database = this.orderAdminService.af.list(
    `ordersGroupedByPlaces/${this.idPlace}`,
    ref => ref.orderByChild("orderStatus")
  );

  public getOrders(): AngularFireList<any> {
    return this.database;
  }

  constructor(private orderAdminService: OrderService) {
    let items = new Observable<Order[]>();
    items = this.getOrders()
      .snapshotChanges()
      .map(changes => {
        return changes.map(data => {
          const state = data.payload.val().orderStatus;
          let lat = 0;
          let lng = 0;
          if (data.payload.val().userWillPickupOrder) {
            lat = data.payload.val().userLatitude;
            lng = data.payload.val().userlongitude;
          }
          const obj = {
            dni: "",
            state: "",
            address: "",
            lat: lat,
            lng: lng,
            date: "00-00-0000",
            action: "",
            id: ""
          };
          obj.lat = lat;
          obj.lng = lng;
          this.orderAdminService.af
            .object(`users/${data.payload.val().userId}`)
            .valueChanges()
            .subscribe(resp => {
              if (resp) {
                if (data.payload.val().timestamp !== undefined) {
                  const myDate =
                    data.payload.val().timestamp.split(" ")[0] +
                    " " +
                    data.payload.val().timestamp.split(" ")[1];
                  const creationDate = new Date(myDate);
                  const day = ("0" + creationDate.getDate()).slice(-2);
                  const month = ("0" + (creationDate.getMonth() + 1)).slice(-2);
                  obj.date = day + "-" + month + "-" + creationDate.getFullYear();
                }
                else obj.date = "00-00-0000";
                obj.dni = resp["dni"];
                obj.state = state > -1 ? this.statusOrders[state] : "Pendiente";
                obj.address = data.payload.val().userAddress
                  ? data.payload.val().userAddress
                  : "Recojo";
                
                obj.action = "";
                obj.id = data.key;
              }
            });
          return obj;
        });
      });
    items.subscribe(arr => this.dataChange.next(arr));
  }
}

interface MultiFilter {
  dni: string;
  date: string;
  state: string;
}

@Injectable()
export class OrderAdminSource extends DataSource<Order> {
  filterChange = new BehaviorSubject({ dni: "", date: "", state: "" });
  get filter(): MultiFilter {
    return this.filterChange.value;
  }
  set filter(filter: MultiFilter) {
    this.filterChange.next(filter);
  }
  constructor(
    private orderDatabase: OrderDatabase,
    private paginator: MatPaginator
  ) {
    super();
  }

  connect(): Observable<Order[]> {
    const displayDataChanges = [
      this.orderDatabase.dataChange,
      this.filterChange,
      this.paginator.page
    ];

    return Observable.merge(...displayDataChanges) // Convert object to array with spread syntax.
      .map(() => {
        const dataSlice = this.orderDatabase.data
          .slice()
          .filter((item: Order) => {
            const dni = item.dni;
            return dni.indexOf(this.filter.dni) !== -1;
          })
          .filter((item: Order) => {
            const state = item.state.toLowerCase();
            return state.indexOf(this.filter.state.toLowerCase()) !== -1;
          })
          .filter((item: Order) => {
            const afDate = item.date.split("-");
            const objDate = new Date(
              parseInt(afDate[2]),
              parseInt(afDate[1]) - 1,
              parseInt(afDate[0])
            );
            const filterDate = new Date(this.filter.date);
            if (!isNaN(filterDate.getDate()))
              return (
                objDate.getDate() >= filterDate.getDate() &&
                objDate.getMonth() >= filterDate.getMonth() &&
                objDate.getFullYear() >= filterDate.getFullYear()
              );
            return true;
          });
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        const dataLength = this.paginator.length;
        return dataSlice.splice(startIndex, this.paginator.pageSize);
      });
  }
  disconnect() {}
}
