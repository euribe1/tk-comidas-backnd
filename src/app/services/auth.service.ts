import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";

@Injectable()
export class AuthService {
  activeUser: boolean;
  activePassword: boolean;
  errorMessage: string;
  state: boolean;
  constructor(private angularFireAuth: AngularFireAuth) {
    this.isLogged();
  }
  public logout = () => {
    this.angularFireAuth.auth.signOut();
  };
  public isLogged() {
    return this.angularFireAuth.authState;
  }
  public auth() {
    return this.angularFireAuth.auth;
  }
}
