import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthComponent } from "./auth/auth.component";
import { PageNotFoundComponent } from "./notFound/pageNotFound.component";
import { MyGuard } from "./services/my-guard.service";
import { UpdatePasswordComponent } from "./auth/update-password/update-password.component";

const routes: Routes = [
  {
    path: "signin",
    component: AuthComponent
  },
  {
    path: "changePassword",
    component: UpdatePasswordComponent
  },
  {
    path: "",
    loadChildren: "app/admin/admin.module#AdminModule",
    canActivate: [MyGuard]
  },
  {
    path: "**",
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
