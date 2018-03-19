import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource, MatPaginator } from "@angular/material";
import { AngularFireDatabase } from "angularfire2/database";
import { Router } from "@angular/router";

import {
  OrderService,
  OrderDatabase,
  OrderAdminSource
} from "../../services/orders.service";
import { ExcelService } from "../../services/excel-exporter.service";
import { DialogComponent } from "../dialog/dialog.component";
import { MatDialog } from "@angular/material";

import { FormControl } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/startWith";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/observable/combineLatest";

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

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.css"]
})
export class OrdersComponent implements OnInit {
  displayedColumns: any;
  statusOrders: any;
  dataSource: any;
  data: Array<Order> = [];
  totalOrders: number;
  order: any = {};
  orderSelected: any = {};
  idPlace: string;
  mydate: any;
  dniFilter = new FormControl();
  dateFilter = new FormControl();
  stateFilter = new FormControl();
  dataLength: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private af: AngularFireDatabase,
    private router: Router,
    private orderService: OrderService,
    private orderDatabase: OrderDatabase,
    private excelService: ExcelService,
    private dialog: MatDialog
  ) {
    this.displayedColumns = ["dni", "state", "address", "date", "action"];
    this.statusOrders = [
      "Pendiente",
      "Enviado",
      "En Proceso",
      "Entregado",
      "Cancelado"
    ];
    this.idPlace = "-KqUfHv6pOigweWypUmH";
  }

  ngOnInit() {
    this.orderDatabase
      .getOrders()
      .valueChanges()
      .subscribe(orders => {
        this.dataSource = new OrderAdminSource(
          this.orderDatabase,
          this.paginator
        );
        this.dataLength = orders;
      });

    const dniFilter$ = this.formControlValueStream(this.dniFilter, "");
    const dateFilter$ = this.formControlValueStream(this.dateFilter, "");
    const stateFilter$ = this.formControlValueStream(this.stateFilter, "");

    Observable.combineLatest(dniFilter$, dateFilter$, stateFilter$)
      .map(([dni, date, state]) => ({ dni, date, state }))
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
  public goToEditOrderView(order) {
    if (order) {
      this.orderService.orderSelected = order;
      this.router.navigate(["/editOrder"]);
    }
  }
  public restoreOrders(order) {
    this.dniFilter.setValue("");
    this.dateFilter.setValue("");
    this.stateFilter.setValue("");
  }
  public downloadFile(order) {
    order.dni = this.dniFilter.value;
    order.state = this.stateFilter.value;
    order.date = this.dateFilter.value;
    const fileJson = [];
    const filter = new Promise((resolve, reject) => {
      this.dataSource.orderDatabase.data
        .slice()
        .filter(elem => {
          if (order.dni && elem.dni) {
            const dni = elem.dni;
            return dni.indexOf(order.dni) !== -1;
          }
          return true;
        })
        .filter(elem => {
          if (order.state && elem.state) {
            const state = elem.state.toLowerCase();
            return state.indexOf(order.state.toLowerCase()) !== -1;
          }
          return true;
        })
        .filter(elem => {
          const afDate = elem.date.split("-");
          if (elem.date && order.date) {
            const day = order.date.getDate();
            const month = order.date.getMonth() + 1;
            const year = order.date.getFullYear();
            return (
              parseInt(afDate[0]) === day &&
              parseInt(afDate[1]) === month &&
              parseInt(afDate[2]) === year
            );
          }
          return true;
        })
        .forEach((elem, index, filterData) => {
          let obj = {};
          obj["DNI / CE"] = elem.dni;
          obj["Estado"] = elem.state;
          obj["Dirección Destino"] = elem.address;
          obj["Fecha"] = elem.date;
          fileJson.push(obj);
          if (index === filterData.length - 1) {
            resolve(fileJson);
          }
        });
    })
      .then(resp => {
        this.excelService.exportAsExcelFile(fileJson, "orders_tkcomidas");
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
