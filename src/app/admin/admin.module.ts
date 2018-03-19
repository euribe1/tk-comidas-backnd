import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AdminRoutingModule } from "./admin-routing.module";
import { MaterialModule } from "./../material.module";

import { AdminComponent } from "./admin.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UsersComponent } from ".//users/users.component";
import { OrdersComponent } from "./orders/orders.component";
import { SidenavComponent } from "./sidenav/sidenav.component";
import { ReportsComponent } from "./reports/reports.component";
import { CreateProductComponent } from "./dashboard/product/create-product.component";
import { EditProductComponent } from "./dashboard/product/edit-product.component";
import { CreateUserComponent } from "./users/create-user.component";
import { EditUserComponent } from "./users/edit-user.component";
import { EditOrdersComponent } from "./orders/edit-orders.component";
import { ImageUploadModule } from "angular2-image-upload";
import { AgmCoreModule } from "@agm/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    MaterialModule,
    ImageUploadModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCQe-pr8hofhaIq_K0v3bQajFpVEa-d3U0"
    })
  ],
  declarations: [
    AdminComponent,
    DashboardComponent,
    UsersComponent,
    OrdersComponent,
    SidenavComponent,
    ReportsComponent,
    CreateProductComponent,
    EditProductComponent,
    CreateUserComponent,
    EditUserComponent,
    EditOrdersComponent
  ]
})
export class AdminModule {}
