import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { AngularFireDatabase } from "angularfire2/database";
import { Globals } from "../../globals";

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.css"]
})
export class SidenavComponent implements OnInit {
  userAdmin: boolean;
  user: any = {};
  userDir: string = '';
  constructor(
    private authService: AuthService,
    private af: AngularFireDatabase,
    private globals: Globals
  ) {
    this.userDir = `${this.globals.environment['current'].name}/users`;
    this.authService.isLogged().subscribe(result => {
      if (result) {
        this.af
          .object(`${this.userDir}/${result.uid}`)
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
