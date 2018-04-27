import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFireDatabase } from "angularfire2/database";
import { storage } from "firebase";

import { ProductService } from "../../../services/products.service";
import { resolve } from "url";
import { Globals } from "../../../globals";

@Component({
  selector: "app-edit-product",
  templateUrl: "./edit-product.component.html",
  styleUrls: ["./create-product.component.css"]
})
export class EditProductComponent implements OnInit {
  product: any = {};
  idPlace: string;
  idProduct: string;
  placeMenuDir: string = '';
  constructor(
    private router: Router,
    private productService: ProductService,
    private af: AngularFireDatabase,
    private globals: Globals
  ) {
    this.idPlace = "-KqUfHv6pOigweWypUmH";
    this.placeMenuDir = `${this.globals.environment['current'].name}/placeMenu`;    
  }
  ngOnInit() {
    (<any>document.querySelector(".img-ul-button input")).addEventListener(
      "change",
      this.updateImageDisplay.bind(this)
    );
    if (this.productService.productSelected) {
      this.product = this.productService.productSelected;
      this.idProduct = this.product.id;
      this.af
        .object(`${this.placeMenuDir}/${this.idPlace}/${this.product.id}`)
        .valueChanges()
        .subscribe(res => {
          this.product = res;
          if (res && res["productPhoto"]) {
            const elem = document.createElement("img");
            elem.src = res["productPhoto"].originalPath;
            elem.setAttribute("width", "250");
            (<any>document.querySelector("image-upload")).style.display =
              "none";
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
  uploadFile() {
    (<any>document.querySelector(".img-ul-button input")).click();
  }
  updateImageDisplay(input) {
    (<any>document.querySelector("image-upload")).style.display = "block";
    (<any>document.querySelector(".picture")).style.display = "none";
    const file = input.currentTarget.files[0];
    if (file) {
      console.log(this.product);
      this.product.productPhoto = {
        name: input.currentTarget.files[0].name,
        blobSrc: file
      };
    }
  }
  updateProduct() {
    (<any>document.querySelector(".spinner-div")).style.display = "flex";
    (<any>document.querySelector(".col1")).classList.add("opacity");
    (<any>document.querySelector(".col2")).classList.add("opacity");
    const productRef = this.af.database
      .ref()
      .child(`${this.placeMenuDir}/${this.idPlace}/${this.idProduct}`);
    if (this.product.productPhoto && this.product.productPhoto.name) {
      // Se actualizará imagen también
      const my = storage()
        .ref()
        .child(`productos/${this.product.productPhoto.name}`);
      my
        .put(this.product.productPhoto.blobSrc)
        .then(res => {
          if (res.state === "success") {
            this.product.productPhoto = {
              contentType: res.metadata.contentType,
              originalPath: res.metadata.downloadURLs[0],
              thumbnailPath: ""
            };
          }
        })
        .then(res => {
          const obj = {
            name: this.product.name,
            ingredients: this.product.ingredients,
            description: this.product.description,
            price: this.product.price,
            currency: this.product.currency,
            stock: this.product.stock,
            productPhoto: this.product.productPhoto
          };
          this._updateProduct(productRef, obj);
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      delete this.product.productPhoto;
      this._updateProduct(productRef, this.product);
    }
  }
  _updateProduct(ref, product) {
    ref
      .update(product)
      .then(resp => {
        if (document.querySelector(".img-ul-clear")) {
          (<any>document.querySelector(".img-ul-clear")).click();
        }
        (<any>document.querySelector(".spinner-div")).style.display = "none";
        (<any>document.querySelector(".col1")).classList.remove("opacity");
        (<any>document.querySelector(".col2")).classList.remove("opacity");
        this.router.navigate(["dashboard"]);
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
}
