import { Injectable } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { firebaseConfig } from "../app.module";
import { storage } from "firebase";
import { FirebaseApp } from "angularfire2";
import { MatPaginator } from "@angular/material";
import { DataSource } from "@angular/cdk/collections";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/map";
import { Globals } from "../globals";

@Injectable()
export class ProductService {
  productSelected: any;
  idPlace: string;
  placeMenuDir: string = '';  
  private productsData$: AngularFireList<Element[]>;
  constructor(public af: AngularFireDatabase, private globals: Globals) {
    this.idPlace = "-KqZS_VuwLviXXtKDWfx";
    this.placeMenuDir = `${this.globals.environment['current'].name}/placeMenu`;    
  }
  public getProductsByPlace(idPlace) {
    return this.af.list(`${this.placeMenuDir}/${idPlace}`, ref =>
      ref.orderByChild("name")
    );
  }
  public createProduct(idPlace, product) {
    return new Promise((resolve, reject) => {
      const productRef = this.af.database.ref().child(`${this.placeMenuDir}/${idPlace}`);
      const my = storage()
        .ref()
        .child(`productos/${product.productPhoto.name}`);
      my
        .put(product.productPhoto.blobSrc)
        .then(res => {
          if (res.state === "success") {
            product.productPhoto = {
              contentType: res.metadata.contentType,
              originalPath: res.metadata.downloadURLs[0],
              thumbnailPath: ""
            };
            const newProductRef = productRef.push(product);
            resolve("success");
          }
        })
        .catch(error => {
          console.log(error);
          reject("error");
        });
    });
  }
  public updateProduct(idPlace, product) {
    const productRef = this.af.database
      .ref()
      .child(`${this.placeMenuDir}/${idPlace}/${product.id}`);
    productRef
      .update({
        name: product.name,
        ingredients: product.ingredients,
        price: product.price,
        currency: product.currency,
        stock: product.stock
      })
      .catch(error => console.log(error));
  }
  public removeProduct(idPlace, idProduct) {
    const productRef = this.af.database.ref().child(`${this.placeMenuDir}/${idPlace}`);
    productRef.remove(idProduct).catch(error => console.log(error));
  }
  public getProductById(idProduct) {
    this.af
      .object(`${this.placeMenuDir}/${this.idPlace}/${idProduct}`)
      .valueChanges()
      .subscribe(res => {
        this.productSelected = res;
      });
  }
}

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

@Injectable()
export class ProductDatabase {
  placeMenuDir: string = 'prod/placeMenu';  
  /* Stream that emits whenever the data has been modified. */
  public dataChange: BehaviorSubject<Element[]> = new BehaviorSubject<
    Element[]
  >([]);
  get data(): Element[] {
    return this.dataChange.value;
  }

  // Connection to remote db.
  private database = this.productAdminService.af.list(
    `${this.placeMenuDir}/-KqUfHv6pOigweWypUmH`,
    ref => ref.orderByChild("name")
  );

  public getProducts(): AngularFireList<any> {
    return this.database;
  }

  constructor(private productAdminService: ProductService) {
    let items = new Observable<Element[]>();
    items = this.getProducts()
      .snapshotChanges()
      .map(changes => {
        return changes.map(data => {
          const product = data.payload.val();
          const obj = {
            id: data.key,
            name: product.name,
            ingredients: product.ingredients,
            price: product.price,
            currency: product.currency,
            stock: product.stock,
            hiddenProduct: product.hiddenProduct,
            date: "",
            action: ""
          };
          return obj;
        });
      });
    items.subscribe(arr => this.dataChange.next(arr));
  }
}

interface MultiFilter {
  name: string;
  ingredients: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  stock: number;
}

@Injectable()
export class ProductAdminSource extends DataSource<Element> {
  filterChange = new BehaviorSubject({
    name: "",
    ingredients: "",
    minPrice: 0,
    maxPrice: 0,
    currency: "",
    stock: 0
  });
  get filter(): MultiFilter {
    return this.filterChange.value;
  }
  set filter(filter: MultiFilter) {
    this.filterChange.next(filter);
  }
  constructor(
    private productDatabase: ProductDatabase,
    private paginator: MatPaginator
  ) {
    super();
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Element[]> {
    const displayDataChanges = [
      this.productDatabase.dataChange,
      this.filterChange,
      this.paginator.page
    ];

    return Observable.merge(...displayDataChanges) // Convert object to array with spread syntax.
      .map(() => {
        const dataSlice = this.productDatabase.data
          .slice()
          .filter((item: Element) => {
            const itemName = item.name.toLowerCase();
            return itemName.indexOf(this.filter.name.toLowerCase()) !== -1;
          })
          .filter((item: Element) => {
            const itemColor = item.ingredients.toLowerCase();
            return (
              itemColor.indexOf(this.filter.ingredients.toLowerCase()) !== -1
            );
          })
          .filter((item: Element) => {
            const itemPrice = item.price;
            if (
              this.filter.minPrice > 0 &&
              this.filter.maxPrice > 0 &&
              this.filter.currency != ""
            )
              return (
                itemPrice >= this.filter.minPrice &&
                itemPrice <= this.filter.maxPrice &&
                item.currency == this.filter.currency
              );
            else if (
              this.filter.minPrice > 0 &&
              this.filter.maxPrice > 0 &&
              this.filter.currency == ""
            )
              return (
                itemPrice >= this.filter.minPrice &&
                itemPrice <= this.filter.maxPrice
              );
            else if (
              this.filter.minPrice > 0 &&
              !this.filter.maxPrice &&
              this.filter.currency == ""
            )
              return itemPrice == this.filter.minPrice;
            else if (
              this.filter.minPrice > 0 &&
              !this.filter.maxPrice &&
              this.filter.currency != ""
            )
              return (
                itemPrice == this.filter.minPrice &&
                item.currency == this.filter.currency
              );
            else if (
              this.filter.maxPrice > 0 &&
              !this.filter.minPrice &&
              this.filter.currency == ""
            )
              return itemPrice == this.filter.maxPrice;
            else if (
              this.filter.maxPrice > 0 &&
              !this.filter.minPrice &&
              this.filter.currency != ""
            )
              return (
                itemPrice == this.filter.maxPrice &&
                this.filter.currency == item.currency
              );
            else return itemPrice >= 0;
          })
          .filter((item: Element) => {
            const itemStock = item.stock;
            if (this.filter.stock > 0) return itemStock == this.filter.stock;
            else {
              return itemStock >= 0;
            }
          });
        // Get the page's slice per pageSize setting.
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        const dataLength = this.paginator.length; // This is for the counter on the DOM.
        return dataSlice.splice(startIndex, this.paginator.pageSize);
      });
  }
  disconnect() {}
}
