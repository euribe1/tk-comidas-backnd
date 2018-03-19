import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { AngularFireDatabase } from "angularfire2/database";

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.css"]
})
export class SidenavComponent implements OnInit {
  userAdmin: boolean;
  user: any = {};
  constructor(
    private authService: AuthService,
    private af: AngularFireDatabase
  ) {
    this.authService.isLogged().subscribe(result => {
      if (result) {
        this.af
          .object(`users/${result.uid}`)
          .valueChanges()
          .subscribe(elem => {
            this.user = elem;
            if (elem["role"] && elem["role"] === "admin") {
              this.userAdmin = true;
            } else {
              this.userAdmin = false;
            }
          });
      }
    });
  }

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }
}
