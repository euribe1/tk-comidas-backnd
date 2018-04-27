import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AuthModule } from "./auth/auth.module";

import { AppComponent } from "./app.component";
import { PageNotFoundComponent } from "./notFound/pageNotFound.component";

import { AngularFireModule } from "angularfire2";
import {
  AngularFireDatabaseModule,
  AngularFireDatabase
} from "angularfire2/database";
import { AngularFireAuthModule } from "angularfire2/auth";

import { AuthService } from "./services/auth.service";
import { MyGuard } from "./services/my-guard.service";
import { ProductService, ProductDatabase } from "./services/products.service";
import { DashboardComponent } from "./admin/dashboard/dashboard.component";
import { UserService, UserDatabase } from "./services/users.service";
import { DialogComponent } from "./admin/dialog/dialog.component";
import { OrderService, OrderDatabase } from "./services/orders.service";
import { ExcelService } from "./services/excel-exporter.service";

import {Globals} from './globals';

export const firebaseConfig = {
  apiKey: "AIzaSyDfQGosQ7EZVhG7D3KumNzAxdyryRuOjtQ",
  authDomain: "tkcomidas-6ae27.firebaseapp.com",
  databaseURL: "https://tkcomidas-6ae27.firebaseio.com",
  storageBucket: "tkcomidas-6ae27.appspot.com",
  messagingSenderId: "1045960513496"
};

@NgModule({
  declarations: [AppComponent, PageNotFoundComponent, DialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AuthModule
  ],
  providers: [
    Globals,
    AngularFireDatabase,
    AuthService,
    MyGuard,
    ProductService,
    ProductDatabase,
    UserService,
    UserDatabase,
    OrderService,
    OrderDatabase,
    ExcelService,
    DashboardComponent
  ],
  bootstrap: [AppComponent],
  entryComponents: [DialogComponent]
})
export class AppModule {}
