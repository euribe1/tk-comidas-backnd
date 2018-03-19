import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AdminComponent } from "./admin.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UsersComponent } from "./users/users.component";
import { OrdersComponent } from "./orders/orders.component";
import { ReportsComponent } from "./reports/reports.component";
import { MyGuard } from "../services/my-guard.service";
import { CreateProductComponent } from "./dashboard/product/create-product.component";
import { EditProductComponent } from "./dashboard/product/edit-product.component";
import { CreateUserComponent } from "./users/create-user.component";
import { EditUserComponent } from "./users/edit-user.component";
import { EditOrdersComponent } from "./orders/edit-orders.component";

const adminRoutes: Routes = [
  {
    path: "",
    component: AdminComponent,
    canActivate: [MyGuard],
    children: [
      {
        path: "",
        redirectTo: "dashboard"
      },
      {
        path: "dashboard",
        component: DashboardComponent
      },
      {
        path: "users",
        component: UsersComponent
      },
      {
        path: "orders",
        component: OrdersComponent
      },
      {
        path: "reports",
        component: ReportsComponent
      },
      {
        path: "addProduct",
        component: CreateProductComponent
      },
      {
        path: "editProduct",
        component: EditProductComponent
      },
      {
        path: "addUser",
        component: CreateUserComponent
      },
      {
        path: "editUser",
        component: EditUserComponent
      },
      {
        path: "editOrder",
        component: EditOrdersComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
