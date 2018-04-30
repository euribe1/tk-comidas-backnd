import { Injectable } from "@angular/core";

@Injectable()
export class Globals {
  environment: object = {
    dev: {
      name: "dev",
      ip: "127.0.0.1:4200"
    },
    prod: {
      name: "prod",
      ip: "40.121.85.209/serverAdmin"
    },
    current: {
      name: "prod",
      ip: "127.0.0.1:8080"
    }
  };
}
