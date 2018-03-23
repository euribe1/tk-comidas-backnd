import { Component, OnInit, AfterViewInit } from "@angular/core";
import Chart from "chart.js";
import { MatTableDataSource } from "@angular/material";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { Http, URLSearchParams } from "@angular/http";

const ELEMENT_DATA: Element[] = [
  { position: 1, name: "--" },
  { position: 2, name: "--" },
  { position: 3, name: "--" },
  { position: 4, name: "--" },
  { position: 5, name: "--" }
];

export interface Element {
  name: string;
  position: number;
}

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  ctx: any;
  ctx2: any;
  ctx3: any;
  ctx4: any;
  chart1: any;
  chart2: any;
  chart3: any;
  chart4: any;
  busy: boolean = true;
  displayedColumns: any;
  dataSource1: any;
  dataSource2: any;
  ipAddress: string = "40.121.85.209";
  lastDays: Array<any>;
  lastMonths: Array<any>;
  lastYears: Array<any>;
  orders: AngularFireList<any>;
  ordersRecieved: AngularFireList<any>;
  ordersCanceled: AngularFireList<any>;
  usersRegistered: AngularFireList<any>;
  jsonMostWanted: any = {};
  productMostWanted: Array<any> = [];
  productMostWantedByMonth: Array<any> = [];
  productMostWantedByYear: Array<any> = [];
  months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic"
  ];
  constructor(public af: AngularFireDatabase, private http: Http) {}
  ngAfterViewInit() {
    setTimeout(() => {
      this.ctx = document.getElementById("chart1");
      this.ctx2 = document.getElementById("chart2");
      this.ctx3 = document.getElementById("chart3");
      this.ctx4 = document.getElementById("chart4");
      if (this.ctx && this.ctx2 && this.ctx3 && this.ctx4) {
        this.setChart1();
        this.setChart2();
        this.setChart3();
        this.setChart4();
        this.getTotalSalesByDays(this.chart1);
        this.getUsersRegisteredByDays(this.chart2);
        this.getOrdersRecievedByDays(this.chart3);
        this.getOrdersCanceledByDays(this.chart4);
        this.getTopLast5ProductsByDay();
      }
    }, "0");
  }
  ngOnInit() {
    this.orders = this.af.list(
      `ordersGroupedByPlaces/-KqUfHv6pOigweWypUmH`,
      ref => ref.orderByChild("orderStatus")
    );
    this.ordersRecieved = this.af.list(
      `ordersGroupedByPlaces/-KqUfHv6pOigweWypUmH`,
      ref => ref.orderByChild("orderStatus").equalTo(3)
    );
    this.ordersCanceled = this.af.list(
      `ordersGroupedByPlaces/-KqUfHv6pOigweWypUmH`,
      ref => ref.orderByChild("orderStatus").equalTo(4)
    );
    this.usersRegistered = this.af.list(`users`, ref =>
      ref.orderByChild("name")
    );
    this.displayedColumns = ["position", "name"];
  }
  public setChart1() {
    this.chart1 = new Chart(this.ctx, {
      type: "bar",
      data: {
        labels: this.getLast5Days(new Date()),
        datasets: [
          {
            label: "Total de ventas",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: [
              "pink",
              "rgb(233, 97, 122)",
              "pink",
              "rgb(233, 97, 122)",
              "pink",
              "rgb(233, 97, 122)"
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              stacked: true,
              gridLines: {
                display: false
              },
              ticks: {
                beginAtZero: true,
                fontColor: "black"
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: "black"
              }
            }
          ]
        },
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Total de ventas",
          fontColor: "black",
          fontSize: 14
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return (
                "Total de ventas: " + tooltipItem.yLabel.toFixed(2) + " S/."
              );
            }
          }
        }
      }
    });
  }
  public setChart2() {
    this.chart2 = new Chart(this.ctx2, {
      type: "bar",
      data: {
        labels: this.getLast5Days(new Date()),
        datasets: [
          {
            label: "Total de clientes",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: [
              "pink",
              "rgb(233, 97, 122)",
              "pink",
              "rgb(233, 97, 122)",
              "pink",
              "rgb(233, 97, 122)"
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              stacked: true,
              gridLines: {
                display: false
              },
              ticks: {
                beginAtZero: true,
                fontColor: "black"
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: "black"
              }
            }
          ]
        },
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Total de clientes",
          fontColor: "black",
          fontSize: 14
        }
      }
    });
  }
  public setChart3() {
    this.chart3 = new Chart(this.ctx3, {
      type: "line",
      data: {
        labels: this.getLast5Days(new Date()),
        datasets: [
          {
            label: "Ordenes finalizadas",
            data: [0, 0, 0, 0, 0],
            borderColor: ["pink"]
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              stacked: true,
              gridLines: {
                display: false
              },
              ticks: {
                beginAtZero: true,
                fontColor: "black"
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: "black"
              }
            }
          ]
        },
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Órdenes finalizadas",
          fontColor: "black",
          fontSize: 14
        }
      }
    });
  }
  public setChart4() {
    this.chart4 = new Chart(this.ctx4, {
      type: "line",
      data: {
        labels: this.getLast5Days(new Date()),
        datasets: [
          {
            label: "Ordenes rechazadas",
            data: [0, 0, 0, 0, 0],
            borderColor: ["pink"]
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              stacked: true,
              gridLines: {
                display: false
              },
              ticks: {
                beginAtZero: true,
                fontColor: "black"
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: "black"
              }
            }
          ]
        },
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Órdenes rechazadas",
          fontColor: "black",
          fontSize: 14
        }
      }
    });
  }
  public getLast5Days(currentDate) {
    return [1, 2, 3, 4, 5].map((elem, index) => {
      const newDate =
        index > 0
          ? new Date(currentDate.setDate(currentDate.getDate() - 1))
          : new Date(currentDate.setDate(currentDate.getDate()));
      return `${("00" + newDate.getDate()).slice(-2)}-${
        this.months[newDate.getMonth()]
      }-${("" + newDate.getFullYear()).slice(-4)}`;
    });
  }
  public getLast5Months(currentDate) {
    return [1, 2, 3, 4, 5].map((elem, index) => {
      const newDate =
        index > 0
          ? new Date(currentDate.setMonth(currentDate.getMonth() - 1))
          : new Date(currentDate.setMonth(currentDate.getMonth()));
      return `${this.months[newDate.getMonth()]}-${(
        "0000" + newDate.getFullYear()
      ).slice(-4)}`;
    });
  }
  public getLast5Years(currentDate) {
    return [1, 2, 3, 4, 5].map((elem, index) => {
      const newDate =
        index > 0
          ? new Date(currentDate.setFullYear(currentDate.getFullYear() - 1))
          : new Date(currentDate.setFullYear(currentDate.getFullYear()));
      return `${("0000" + newDate.getFullYear()).slice(-4)}`;
    });
  }
  public changeToDay(id) {
    switch (id) {
      case "chart1":
        this.chart1.data.labels = this.getLast5Days(new Date());
        this.chart1.update();
        this.getTotalSalesByDays(this.chart1);
        document.getElementById('btn1').classList.add('selected');
        document.getElementById('btn2').classList.remove('selected');
        document.getElementById('btn3').classList.remove('selected');
        break;
      case "chart2":
        this.chart2.data.labels = this.getLast5Days(new Date());
        this.chart2.update();
        this.getUsersRegisteredByDays(this.chart2);
        document.getElementById('btn4').classList.add('selected');
        document.getElementById('btn5').classList.remove('selected');
        document.getElementById('btn6').classList.remove('selected');
        break;
      case "chart3":
        this.chart3.data.labels = this.getLast5Days(new Date());
        this.chart3.update();
        this.getOrdersRecievedByDays(this.chart3);
        document.getElementById('btn7').classList.add('selected');
        document.getElementById('btn8').classList.remove('selected');
        document.getElementById('btn9').classList.remove('selected');
        break;
      case "chart4":
        this.chart4.data.labels = this.getLast5Days(new Date());
        this.chart4.update();
        this.getOrdersCanceledByDays(this.chart4);
        document.getElementById('btn10').classList.add('selected');
        document.getElementById('btn11').classList.remove('selected');
        document.getElementById('btn12').classList.remove('selected');
        break;
      case "table1":
        this.getTop5ProductsByDay();
        document.getElementById('btn13').classList.add('selected');
        document.getElementById('btn14').classList.remove('selected');
        document.getElementById('btn15').classList.remove('selected');
        break;
      case "table2":
        this.getLast5ProductsByDay();
        document.getElementById('btn16').classList.add('selected');
        document.getElementById('btn18').classList.remove('selected');
        document.getElementById('btn19').classList.remove('selected');
        break;
    }
  }
  public changeToMonth(id) {
    switch (id) {
      case "chart1":
        this.chart1.data.labels = this.getLast5Months(new Date());
        this.chart1.update();
        this.getTotalSalesByMonths(this.chart1);
        document.getElementById('btn1').classList.remove('selected');
        document.getElementById('btn2').classList.add('selected');
        document.getElementById('btn3').classList.remove('selected');
        break;
      case "chart2":
        this.chart2.data.labels = this.getLast5Months(new Date());
        this.chart2.update();
        this.getUsersRegisteredByMonths(this.chart2);
        document.getElementById('btn4').classList.remove('selected');
        document.getElementById('btn5').classList.add('selected');
        document.getElementById('btn6').classList.remove('selected');
        break;
      case "chart3":
        this.chart3.data.labels = this.getLast5Months(new Date());
        this.chart3.update();
        this.getOrdersRecievedByMonth(this.chart3);
        document.getElementById('btn7').classList.remove('selected');
        document.getElementById('btn8').classList.add('selected');
        document.getElementById('btn9').classList.remove('selected');
        break;
      case "chart4":
        this.chart4.data.labels = this.getLast5Months(new Date());
        this.chart4.update();
        this.getOrdersCanceledByMonth(this.chart4);
        document.getElementById('btn10').classList.remove('selected');
        document.getElementById('btn11').classList.add('selected');
        document.getElementById('btn12').classList.remove('selected');
        break;
      case "table1":
        this.getTop5ProductsByMonth();
        document.getElementById('btn13').classList.remove('selected');
        document.getElementById('btn14').classList.add('selected');
        document.getElementById('btn15').classList.remove('selected');
        break;
      case "table2":
        this.getLast5ProductsByMonth();
        document.getElementById('btn16').classList.remove('selected');
        document.getElementById('btn18').classList.add('selected');
        document.getElementById('btn19').classList.remove('selected');
        break;
    }
  }
  public changeToYear(id) {
    switch (id) {
      case "chart1":
        this.chart1.data.labels = this.getLast5Years(new Date());
        this.chart1.update();
        this.getTotalSalesByYears(this.chart1);
        document.getElementById('btn1').classList.remove('selected');
        document.getElementById('btn2').classList.remove('selected');
        document.getElementById('btn3').classList.add('selected');
        break;
      case "chart2":
        this.chart2.data.labels = this.getLast5Years(new Date());
        this.chart2.update();
        this.getUsersRegisteredByYears(this.chart2);
        document.getElementById('btn4').classList.remove('selected');
        document.getElementById('btn5').classList.remove('selected');
        document.getElementById('btn6').classList.add('selected');
        break;
      case "chart3":
        this.chart3.data.labels = this.getLast5Years(new Date());
        this.getOrdersRecievedByYear(this.chart3);
        this.chart3.update();
        document.getElementById('btn7').classList.remove('selected');
        document.getElementById('btn8').classList.remove('selected');
        document.getElementById('btn9').classList.add('selected');
        break;
      case "chart4":
        this.chart4.data.labels = this.getLast5Years(new Date());
        this.chart4.update();
        this.getOrdersCanceledByYear(this.chart4);
        document.getElementById('btn10').classList.remove('selected');
        document.getElementById('btn11').classList.remove('selected');
        document.getElementById('btn12').classList.add('selected');
        break;
      case "table1":
        this.getTop5ProductsByYear();
        document.getElementById('btn13').classList.remove('selected');
        document.getElementById('btn14').classList.remove('selected');
        document.getElementById('btn15').classList.add('selected');
        break;
      case "table2":
        this.getLast5ProductsByYear();
        document.getElementById('btn16').classList.remove('selected');
        document.getElementById('btn18').classList.remove('selected');
        document.getElementById('btn19').classList.add('selected');
        break;
    }
  }
  public getOrdersRecievedByDays(chart) {
    chart.data.labels.forEach((element, index) => {
      this.ordersRecieved.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          const index = this.months.findIndex(function(el) {
            return el === arr[1];
          });
          if (
            date.getDate() === parseInt(arr[0]) &&
            date.getMonth() === index &&
            date.getFullYear() === parseInt(arr[2])
          ) {
            return true;
          }
          return false;
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getOrdersRecievedByMonth(chart) {
    chart.data.labels.forEach((element, index) => {
      this.ordersRecieved.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          const index = this.months.findIndex(function(el) {
            return el === arr[0];
          });
          if (
            date.getMonth() === index &&
            date.getFullYear() === parseInt(arr[1])
          ) {
            return true;
          }
          return false;
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getOrdersRecievedByYear(chart) {
    chart.data.labels.forEach((element, index) => {
      this.ordersRecieved.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          if (date.getFullYear() === parseInt(arr[0])) {
            return true;
          }
          return false;
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getOrdersCanceledByDays(chart) {
    chart.data.labels.forEach((element, index) => {
      this.ordersCanceled.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          const index = this.months.findIndex(function(el) {
            return el === arr[1];
          });
          if (
            date.getDate() === parseInt(arr[0]) &&
            date.getMonth() === index &&
            date.getFullYear() === parseInt(arr[2])
          ) {
            return true;
          }
          return false;
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getOrdersCanceledByMonth(chart) {
    chart.data.labels.forEach((element, index) => {
      this.ordersCanceled.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          const index = this.months.findIndex(function(el) {
            return el === arr[0];
          });
          if (
            date.getMonth() === index &&
            date.getFullYear() === parseInt(arr[1])
          ) {
            return true;
          }
          return false;
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getOrdersCanceledByYear(chart) {
    chart.data.labels.forEach((element, index) => {
      this.ordersCanceled.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          if (date.getFullYear() === parseInt(arr[0])) {
            return true;
          }
          return false;
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getUsersRegisteredByDays(chart) {
    chart.data.labels.forEach((element, index) => {
      this.usersRegistered.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          if (elem.createdAt) {
            const creationDate = elem.createdAt.split(" ")[0];
            const date = creationDate.split("-");
            const day = parseInt(date[0]);
            const month = parseInt(date[1]) - 1;
            const year = parseInt(date[2]);
            const arr = element.split("-");
            const index = this.months.findIndex(function(el) {
              return el === arr[1];
            });
            if (
              day === parseInt(arr[0]) &&
              month === index &&
              year === parseInt(arr[2])
            ) {
              return true;
            }
            return false;
          }
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getUsersRegisteredByMonths(chart) {
    chart.data.labels.forEach((element, index) => {
      this.usersRegistered.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          if (elem.createdAt) {
            const creationDate = elem.createdAt.split(" ")[0];
            const date = creationDate.split("-");
            const day = parseInt(date[0]);
            const month = parseInt(date[1]) - 1;
            const year = parseInt(date[2]);
            const arr = element.split("-");
            const index = this.months.findIndex(function(el) {
              return el === arr[0];
            });
            if (month === index && year === parseInt(arr[1])) {
              return true;
            }
            return false;
          }
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getUsersRegisteredByYears(chart) {
    chart.data.labels.forEach((element, index) => {
      this.usersRegistered.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          if (elem.createdAt) {
            const creationDate = elem.createdAt.split(" ")[0];
            const date = creationDate.split("-");
            const day = parseInt(date[0]);
            const month = parseInt(date[1]) - 1;
            const year = parseInt(date[2]);
            const arr = element.split("-");
            if (year === parseInt(arr[0])) {
              return true;
            }
            return false;
          }
        });
        chart.data.datasets[0].data[index] = dataFiltered.length;
        chart.update();
      });
    });
  }
  public getTotalSalesByDays(chart) {
    chart.data.datasets[0].data = [0, 0, 0, 0, 0];
    chart.data.labels.forEach((element, index_) => {
      this.ordersRecieved.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          const index = this.months.findIndex(function(el) {
            return el === arr[1];
          });
          if (
            date.getDate() === parseInt(arr[0]) &&
            date.getMonth() === index &&
            date.getFullYear() === parseInt(arr[2])
          ) {
            chart.data.datasets[0].data[index_] += elem.totalPrice;
            return true;
          }
          return false;
        });
        chart.update();
      });
    });
  }
  public getTotalSalesByMonths(chart) {
    chart.data.datasets[0].data = [0.0, 0.0, 0.0, 0.0, 0.0];
    chart.data.labels.forEach((element, index_) => {
      this.ordersRecieved.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          const index = this.months.findIndex(function(el) {
            return el === arr[0];
          });
          if (
            date.getMonth() === index &&
            date.getFullYear() === parseInt(arr[1])
          ) {
            chart.data.datasets[0].data[index_] += elem.totalPrice;
            return true;
          }
          return false;
        });
        chart.update();
      });
    });
  }
  public getTotalSalesByYears(chart) {
    chart.data.datasets[0].data = [0, 0, 0, 0, 0];
    chart.data.labels.forEach((element, index) => {
      this.ordersRecieved.valueChanges().subscribe(data => {
        const dataFiltered = data.filter(elem => {
          const myDate = elem.timestamp.split(' ')[0] + ' ' + elem.timestamp.split(' ')[1];
          const date = new Date(myDate);
          const arr = element.split("-");
          if (date.getFullYear() === parseInt(element, 10)) {
            chart.data.datasets[0].data[index] += elem.totalPrice;
            return true;
          }
          return false;
        });
        chart.update();
      });
    });
  }
  public getTopLast5ProductsByDay() {
    this.dataSource1 = new MatTableDataSource<Element>(ELEMENT_DATA);
    this.dataSource2 = new MatTableDataSource<Element>(ELEMENT_DATA);
    const data = new URLSearchParams();
    data.append("idPlace", "-KqUfHv6pOigweWypUmH");
    this.http
      .post(`http://${this.ipAddress}/serverAdmin/admin/getLast5ProductsByDay`, data)
      .subscribe(res => {
        const resp = JSON.parse(res["_body"]);
        console.log(resp);
        if (!resp.error) {
          this.productMostWanted = Object.keys(resp.data).map((key, index) => {
            return resp.data[key];
          });
          this.productMostWanted.sort(this.diffMatches);
          const data = [1, 2, 3, 4, 5].map((elem, index) => {
            if (this.productMostWanted[index]) {
              return {
                name: this.productMostWanted[index].name,
                position: index + 1
              };
            } else {
              return { name: "--", position: index + 1 };
            }
          });

          this.dataSource1.data = data;
          const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
            let diff = this.productMostWanted.length - index;
            if (diff > 0) {
              return {
                name: this.productMostWanted[diff - 1].name,
                position: index + 1
              };
            } else {
              return { name: "--", position: index + 1 };
            }
          });
          this.dataSource2.data = data2;
        } else {
          const data = [1, 2, 3, 4, 5].map((elem, index) => {
            return { name: "--", position: index + 1 };
          });

          this.dataSource1.data = data;
          const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
            return { name: "--", position: index + 1 };
          });
          this.dataSource2.data = data2;
        }
      });
  }
  public getLast5ProductsByDay() {
    this.dataSource1 = new MatTableDataSource<Element>(ELEMENT_DATA);
    if (this.productMostWanted.length > 0) {
      const data = [1, 2, 3, 4, 5].map((elem, index) => {
        if (this.productMostWanted[index]) {
          return {
            name: this.productMostWanted[index].name,
            position: index + 1
          };
        } else {
          return { name: "--", position: index + 1 };
        }
      });
      this.dataSource1.data = data;
    } else {
      const data = [1, 2, 3, 4, 5].map((elem, index) => {
        if (index === 0)
          return {
            name: "Hoy no se han registrado pedidos",
            position: index + 1
          };
        else return { name: "--", position: index + 1 };
      });

      this.dataSource1.data = data;
    }
  }
  public getTop5ProductsByDay() {
    this.dataSource2 = new MatTableDataSource<Element>(ELEMENT_DATA);
    if (this.productMostWanted.length > 0) {
      const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
        let diff = this.productMostWanted.length - index;
        if (diff > 0) {
          return {
            name: this.productMostWanted[diff - 1].name,
            position: index + 1
          };
        } else {
          return { name: "--", position: index + 1 };
        }
      });
      this.dataSource2.data = data2;
    } else {
      const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
        if (index === 0)
          return {
            name: "Hoy no se han registrado pedidos",
            position: index + 1
          };
        else return { name: "--", position: index + 1 };
      });
      this.dataSource2.data = data2;
    }
  }
  public getLast5ProductsByMonth() {
    this.busy = true;
    this.dataSource1 = new MatTableDataSource<Element>(ELEMENT_DATA);
    if (this.productMostWantedByMonth.length > 0) {
      const data = [1, 2, 3, 4, 5].map((elem, index) => {
        if (this.productMostWantedByMonth[index]) {
          return {
            name: this.productMostWantedByMonth[index].name,
            position: index + 1
          };
        } else {
          return { name: "--", position: index + 1 };
        }
      });
      this.dataSource1.data = data;
    } else {
      const data = new URLSearchParams();
      data.append("idPlace", "-KqUfHv6pOigweWypUmH");
      this.http
        .post(`http://${this.ipAddress}/serverAdmin/admin/getProductsByMonth`, data)
        .subscribe(res => {
          const resp = JSON.parse(res["_body"]);
          console.log(resp);
          if (!resp.error) {
            this.productMostWantedByMonth = Object.keys(resp.data).map(
              (key, index) => {
                return resp.data[key];
              }
            );
            this.productMostWantedByMonth.sort(this.diffMatches);
            const data = [1, 2, 3, 4, 5].map((elem, index) => {
              if (this.productMostWantedByMonth[index]) {
                return {
                  name: this.productMostWantedByMonth[index].name,
                  position: index + 1
                };
              } else {
                return { name: "--", position: index + 1 };
              }
            });

            this.dataSource1.data = data;
          }
          this.busy = false;
        });
    }
  }
  public getTop5ProductsByMonth() {
    this.busy = true;
    this.dataSource2 = new MatTableDataSource<Element>(ELEMENT_DATA);
    if (this.productMostWantedByMonth.length > 0) {
      const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
        let diff = this.productMostWantedByMonth.length - index;
        if (diff > 0) {
          return {
            name: this.productMostWantedByMonth[diff - 1].name,
            position: index + 1
          };
        } else {
          return { name: "--", position: index + 1 };
        }
      });
      this.dataSource2.data = data2;
    } else {
      const data = new URLSearchParams();
      data.append("idPlace", "-KqUfHv6pOigweWypUmH");
      this.http
        .post(`http://${this.ipAddress}/serverAdmin/admin/getProductsByMonth`, data)
        .subscribe(res => {
          const resp = JSON.parse(res["_body"]);
          console.log(resp);
          if (!resp.error) {
            this.productMostWantedByMonth = Object.keys(resp.data).map(
              (key, index) => {
                return resp.data[key];
              }
            );
            this.productMostWantedByMonth.sort(this.diffMatches);
            const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
              let diff = this.productMostWantedByMonth.length - index;
              if (diff > 0) {
                return {
                  name: this.productMostWantedByMonth[diff - 1].name,
                  position: index + 1
                };
              } else {
                return { name: "--", position: index + 1 };
              }
            });
            this.dataSource2.data = data2;
          }
          this.busy = false;
        });
    }
  }
  public getLast5ProductsByYear() {
    this.busy = true;
    this.dataSource1 = new MatTableDataSource<Element>(ELEMENT_DATA);
    if (this.productMostWantedByYear.length > 0) {
      const data = [1, 2, 3, 4, 5].map((elem, index) => {
        if (this.productMostWantedByYear[index]) {
          return {
            name: this.productMostWantedByYear[index].name,
            position: index + 1
          };
        } else {
          return { name: "--", position: index + 1 };
        }
      });
      this.dataSource1.data = data;
    } else {
      const data = new URLSearchParams();
      data.append("idPlace", "-KqUfHv6pOigweWypUmH");
      this.http
        .post(`http://${this.ipAddress}/serverAdmin/admin/getProductsByYear`, data)
        .subscribe(res => {
          const resp = JSON.parse(res["_body"]);
          console.log(resp);
          if (!resp.error) {
            this.productMostWantedByYear = Object.keys(resp.data).map(
              (key, index) => {
                return resp.data[key];
              }
            );
            this.productMostWantedByYear.sort(this.diffMatches);
            const data = [1, 2, 3, 4, 5].map((elem, index) => {
              if (this.productMostWantedByYear[index]) {
                return {
                  name: this.productMostWantedByYear[index].name,
                  position: index + 1
                };
              } else {
                return { name: "--", position: index + 1 };
              }
            });
            this.dataSource1.data = data;
          }
          this.busy = false;
        });
    }
  }
  public getTop5ProductsByYear() {
    this.busy = true;
    this.dataSource2 = new MatTableDataSource<Element>(ELEMENT_DATA);
    if (this.productMostWantedByYear.length > 0) {
      const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
        let diff = this.productMostWantedByYear.length - index;
        if (diff > 0) {
          return {
            name: this.productMostWantedByYear[diff - 1].name,
            position: index + 1
          };
        } else {
          return { name: "--", position: index + 1 };
        }
      });
      this.dataSource2.data = data2;
    } else {
      const data = new URLSearchParams();
      data.append("idPlace", "-KqUfHv6pOigweWypUmH");
      this.http
        .post(`http://${this.ipAddress}/serverAdmin/admin/getProductsByYear`, data)
        .subscribe(res => {
          const resp = JSON.parse(res["_body"]);
          console.log(resp);
          if (!resp.error) {
            this.productMostWantedByYear = Object.keys(resp.data).map(
              (key, index) => {
                return resp.data[key];
              }
            );
            this.productMostWantedByYear.sort(this.diffMatches);
            const data2 = [1, 2, 3, 4, 5].map((elem, index) => {
              let diff = this.productMostWantedByYear.length - index;
              if (diff > 0) {
                return {
                  name: this.productMostWantedByYear[diff - 1].name,
                  position: index + 1
                };
              } else {
                return { name: "--", position: index + 1 };
              }
            });
            this.dataSource2.data = data2;
          }
          this.busy = false;
        });
    }
  }
  public diffMatches(a, b) {
    return a.times - b.times;
  }
}
