import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable()
export class MyGuard implements CanActivate {
  loggedIn = false;
  constructor(private authService: AuthService, private router: Router) {
    const currentUrl =
      window.location.pathname === "/signin" ||
      window.location.pathname === "/changePassword"
        ? "/"
        : window.location.pathname;
    this.authService.isLogged().subscribe(
      result => {
        if (result && result.uid) {
          this.loggedIn = true;
          this.router.navigate([currentUrl]);
        } else {
          this.loggedIn = false;
          this.router.navigate(["/signin"]);
        }
      },
      error => {
        this.loggedIn = false;
        this.router.navigate(["/signin"]);
      }
    );
  }
  canActivate() {
    return this.loggedIn;
  }
}
