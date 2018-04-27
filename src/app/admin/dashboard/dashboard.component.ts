import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource, MatPaginator } from "@angular/material";
import { AngularFireDatabase } from "angularfire2/database";
import { Router } from "@angular/router";
import { DialogComponent } from "../dialog/dialog.component";
import { MatDialog } from "@angular/material";
import { FormControl } from "@angular/forms";
import {
  ProductService,
  ProductDatabase,
  ProductAdminSource
} from "../../services/products.service";
import { AuthService } from "../../services/auth.service";
import { ExcelService } from "../../services/excel-exporter.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/startWith";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/observable/combineLatest";
import { Globals } from "../../globals";

export interface Element {
  name: string;
  price: number;
  currency: string;
  ingredients: string;
  stock: number;
  date: string;
  action: string;
  id: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  displayedColumns: any;
  dataSource: any;
  data: Array<Element> = [];
  totalProducts: number;
  product: any = {};
  idPlace: string;
  productSelected: any = {};
  isAdmin: boolean;
  nameFilter = new FormControl();
  ingredientsFilter = new FormControl();
  startPriceFilter = new FormControl();
  endPriceFilter = new FormControl();
  currencyFilter = new FormControl();
  stockFilter = new FormControl();
  dataLength: any;
  placeMenuDir: string = '';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private af: AngularFireDatabase,
    public productService: ProductService,
    public productDatabase: ProductDatabase,
    private router: Router,
    private excelService: ExcelService,
    private dialog: MatDialog,
    private authService: AuthService,
    private globals: Globals
  ) {
    this.placeMenuDir = `${this.globals.environment['current'].name}/placeMenu`;
    this.displayedColumns = ["name", "price", "ingredients", "stock", "action"];
    this.idPlace = "-KqUfHv6pOigweWypUmH";
    this.authService.isLogged().subscribe(result => {
      if (result) {
        this.af
          .object(`prod/users/${result.uid}`)
          .valueChanges()
          .subscribe(elem => {
            if (elem["role"] && elem["role"] === "admin") {
              this.isAdmin = true;
            } else {
              this.isAdmin = false;
            }
          });
      }
    });
  }
  ngOnInit() {
    this.productDatabase
      .getProducts()
      .valueChanges()
      .subscribe(products => {
        this.dataSource = new ProductAdminSource(
          this.productDatabase,
          this.paginator
        );
        this.dataLength = products;
      });

    const nameFilter$ = this.formControlValueStream(this.nameFilter, "");
    const ingredientsFilter$ = this.formControlValueStream(
      this.ingredientsFilter,
      ""
    );
    const priceMinFilter$ = this.formControlValueStream(
      this.startPriceFilter,
      0
    );
    const priceMaxFilter$ = this.formControlValueStream(this.endPriceFilter, 0);
    const currencyFilter$ = this.formControlValueStream(
      this.currencyFilter,
      ""
    );
    const stockFilter$ = this.formControlValueStream(this.stockFilter, 0);

    Observable.combineLatest(
      nameFilter$,
      ingredientsFilter$,
      priceMinFilter$,
      priceMaxFilter$,
      currencyFilter$,
      stockFilter$
    )
      .map(([name, ingredients, minPrice, maxPrice, currency, stock]) => ({
        name,
        ingredients,
        minPrice,
        maxPrice,
        currency,
        stock
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
  public goToAddProductView() {
    this.router.navigate(["/addProduct"]);
  }
  public goToEditProductView(product) {
    if (product) {
      this.productService.productSelected = product;
      this.router.navigate(["/editProduct"]);
    }
  }
  public getIdPlace() {
    return this.idPlace;
  }
  public getProductSelected() {
    return this.productSelected;
  }
  public setProductSelected(product) {
    this.productSelected = product;
  }
  public removeProduct(product) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        message: `¿Estás seguro de eliminar el producto ${product.name}?`,
        confirmRemove: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "ok") {
        if (product && product.id) {
          const productRef = this.af.database
            .ref()
            .child(`${this.placeMenuDir}/${this.idPlace}/${product.id}`);
          productRef
            .remove()
            .then(res => {
              document
                .querySelector(`.${product.id}`)
                .classList.add("hidden-row");
              this.totalProducts--;
            })
            .catch(error => console.log(error));
        }
      }
    });
  }
  public restoreFilter(product) {
    this.nameFilter.setValue("");
    this.ingredientsFilter.setValue("");
    this.startPriceFilter.setValue("");
    this.endPriceFilter.setValue("");
    this.currencyFilter.setValue("");
    this.stockFilter.setValue("");
  }
  public hideProduct(product) {
    if (product) {
      const productRef = this.af.database
        .ref()
        .child(`${this.placeMenuDir}/${this.idPlace}/${product.id}`);
      productRef
        .update({
          hiddenProduct: true
        })
        .then(res => {
          document.querySelector(`.${product.id}`).classList.add("opacity-row");
        })
        .catch(error => console.log(error));
    }
  }
  public showProduct(product) {
    if (product) {
      const productRef = this.af.database
        .ref()
        .child(`${this.placeMenuDir}/${this.idPlace}/${product.id}`);
      productRef
        .update({
          hiddenProduct: false
        })
        .then(res => {
          document
            .querySelector(`.${product.id}`)
            .classList.remove("opacity-row");
        })
        .catch(error => console.log(error));
    }
  }
  public downloadFile(product) {
    product.name = this.nameFilter.value;
    product.ingredients = this.ingredientsFilter.value;
    product.endPrice = this.endPriceFilter.value;
    product.startPrice = this.startPriceFilter.value;
    product.currency = this.currencyFilter.value;
    product.stock = this.stockFilter.value;
    const fileJson = [];
    const filter = new Promise((resolve, reject) => {
      this.dataSource.productDatabase.data
        .slice()
        .filter(elem => {
          if (product.name && elem.name) {
            const name = elem.name.toLowerCase();
            return name.indexOf(product.name.toLowerCase()) !== -1;
          }
          return true;
        })
        .filter(elem => {
          if (product.ingredients && elem.ingredients) {
            const ingredients = elem.ingredients.toLocaleLowerCase();
            return (
              ingredients.indexOf(product.ingredients.toLowerCase()) !== -1
            );
          }
          return true;
        })
        .filter(elem => {
          const price = elem.price;
          const currency = elem.currency;
          if (product.startPrice && product.endPrice && price && currency) {
            return (
              price >= product.startPrice &&
              price <= product.endPrice &&
              currency == product.currency
            );
          } else if (product.startPrice && !product.endPrice && currency) {
            return price === product.startPrice && currency == product.currency;
          } else if (product.endPrice && !product.startPrice && currency) {
            return price === product.endPrice && currency == product.currency;
          }
          return true;
        })
        .filter(elem => {
          if (product.stock && elem.stock) {
            const stock = elem.stock;
            return stock == product.stock;
          }
          return true;
        })
        .forEach((elem, index, filterData) => {
          let obj = {};
          obj["Nombre"] = elem.name;
          obj["Precio"] = elem.currency + " " + elem.price;
          obj["Ingredientes"] = elem.ingredients;
          obj["Stock"] = elem.stock.toString();
          fileJson.push(obj);
          if (index === filterData.length - 1) {
            resolve(fileJson);
          }
        });
    })
      .then(resp => {
        this.excelService.exportAsExcelFile(fileJson, "products_tkcomidas");
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
