import { Component, OnInit, AfterViewInit } from "@angular/core";
import { DashboardComponent } from "../dashboard.component";
import { ProductService } from "../../../services/products.service";
import { Router } from "@angular/router";
import { ErrorStateMatcher } from "@angular/material/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from "@angular/forms";
import { DialogComponent } from "../../dialog/dialog.component";
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
  selector: "app-create-product",
  templateUrl: "./create-product.component.html",
  styleUrls: ["./create-product.component.css"]
})
export class CreateProductComponent implements OnInit, AfterViewInit {
  product: any = {};
  idPlace: string;
  inputFile: any;
  files: any;
  nameFormControl: any;
  nameMatcher: any;
  ingFormControl: any;
  ingMatcher: any;
  descpFormControl: any;
  descpMatcher: any;
  currencyFormControl: any;
  currencyMatcher: any;
  priceFormControl: any;
  priceMatcher: any;
  stockFormControl: any;
  stockMatcher: any;
  constructor(
    private dashboard: DashboardComponent,
    private productService: ProductService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.idPlace = this.dashboard.getIdPlace();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      if (<any>document.querySelector(".img-ul-button input")) {
        (<any>document.querySelector(".img-ul-button input")).addEventListener(
          "change",
          this.updateImageDisplay.bind(this)
        );
      }
    }, 0);
  }
  ngOnInit() {
    this.nameFormControl = new FormControl("", [Validators.required]);
    this.nameMatcher = new MyErrorStateMatcher();
    this.ingFormControl = new FormControl("", [Validators.required]);
    this.ingMatcher = new MyErrorStateMatcher();
    this.descpFormControl = new FormControl("", [Validators.required]);
    this.descpMatcher = new MyErrorStateMatcher();
    this.currencyFormControl = new FormControl("", [Validators.required]);
    this.currencyMatcher = new MyErrorStateMatcher();
    this.priceFormControl = new FormControl("", [Validators.required]);
    this.priceMatcher = new MyErrorStateMatcher();
    this.stockFormControl = new FormControl("", [Validators.required]);
    this.stockMatcher = new MyErrorStateMatcher();
  }
  saveProduct(product) {
    if (
      !product.name ||
      !product.ingredients ||
      !product.description ||
      !product.currency ||
      !product.price ||
      !product.stock
    ) {
      this.nameFormControl.touched = true;
      this.ingFormControl.touched = true;
      this.descpFormControl.touched = true;
      this.currencyFormControl.touched = true;
      this.priceFormControl.touched = true;
      this.stockFormControl.touched = true;
    } else if (product.price < 0 || product.stock < 0) {
      this.priceFormControl.touched = true;
      this.stockFormControl.touched = true;
    } else if (!this.product.productPhoto) {
      this.openDialog();
    } else {
      (<any>document.querySelector(".spinner-div")).style.display = "flex";
      (<any>document.querySelector(".col1")).classList.add("opacity");
      (<any>document.querySelector(".col2")).classList.add("opacity");
      this.productService
        .createProduct(this.idPlace, product)
        .then(res => {
          this.product = {};
          (<any>document.querySelector(".img-ul-clear")).click();
          (<any>document.querySelector(".spinner-div")).style.display = "none";
          (<any>document.querySelector(".col1")).classList.remove("opacity");
          (<any>document.querySelector(".col2")).classList.remove("opacity");
          this.router.navigate(["dashboard"]);
        })
        .catch(error => {
          alert(
            "Ha surgido un error mientras se guardaba registro. Intente nuevamente"
          );
          (<any>document.querySelector(".spinner-div")).style.display = "none";
          (<any>document.querySelector(".col1")).classList.remove("opacity");
          (<any>document.querySelector(".col2")).classList.remove("opacity");
        });
    }
  }
  uploadFile() {
    (<any>document.querySelector(".img-ul-button input")).click();
  }
  updateImageDisplay(input) {
    const file = input.currentTarget.files[0];
    if (file) {
      this.product.productPhoto = {
        name: input.currentTarget.files[0].name,
        blobSrc: file
      };
    }
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        message: "No olvide cargar la foto del producto",
        confirmRemove: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  onRemoved(event) {
    this.product.productPhoto = undefined;
  }
}
