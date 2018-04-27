import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { storage } from 'firebase';
import { OrderService } from '../../services/orders.service';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material';
import { Globals } from '../../globals';

declare const google: any;

@Component({
  selector: 'app-edit-orders',
  templateUrl: './edit-orders.component.html',
  styleUrls: ['./edit-orders.component.css']
})
export class EditOrdersComponent implements OnInit {
  userRef: AngularFireObject<any>;
  user: any = {};
  orderRef: AngularFireObject<any>;
  order: any = {};
  productRef: AngularFireList<any>;
  products: Observable<any[]>;
  prodMenuRef: AngularFireObject<any>;
  prodMenu: any = {};
  idOrder: string;
  lat: number = -11.9957517;
  lng: number = -77.0728857;
  userAddress: string = '';
  userDni: string = '';
  statusOrders: Array<any>;
  idPlace: string;
  totalPayment: number = 0;
  currency: string = '';
  ordersGroupedByPlacesDir: string = '';
  orderProductsDir: string = '';
  placeMenuDir: string = '';
  constructor(
    private router: Router,
    private af: AngularFireDatabase,
    private orderService: OrderService,
    private dialog: MatDialog,
    private globals: Globals
  ) {
    this.ordersGroupedByPlacesDir = `${this.globals.environment['current'].name}/ordersGroupedByPlaces`;
    this.orderProductsDir = `${this.globals.environment['current'].name}/orderProducts`;
    this.placeMenuDir = `${this.globals.environment['current'].name}/placeMenu`;
    this.statusOrders = [
      'Pendiente',
      'Enviado',
      'En Proceso',
      'Entregado',
      'Cancelado'
    ];
    this.idPlace = '-KqUfHv6pOigweWypUmH';
    this.orderRef = this.af.object(
      `${this.ordersGroupedByPlacesDir}/${this.idPlace}/${
        this.orderService.orderSelected.id
      }`
    );
    this.orderRef.snapshotChanges().subscribe(data => {
      const order = data.payload.val();
      if (order) {
        let date = '00-00-0000';
        let hour = 'hh:mm';
        if (order.timestamp !== undefined) {
          const myDate =
            order.timestamp.split(' ')[0] + ' ' + order.timestamp.split(' ')[1];
          const creationDate = new Date(myDate);
          date =  ('0' + creationDate.getDate()).slice(-2) + '-' + ('0' + (creationDate.getMonth() + 1)).slice(-2) + '-' + creationDate.getFullYear();
          hour = creationDate.getHours() + ':' + ('0' + creationDate.getMinutes()).slice(-2);
        }
        if (!order.userWillPickupOrder && order.userLatitude == 0 && order.userLongitude == 0) {
          order.userWillPickupOrder = true;
        }
        const directionsService = new google.maps.DirectionsService();
        const directionsDisplay = new google.maps.DirectionsRenderer();
        const obj = {
          key: data.key,
          totalPrice: order.totalPrice.toFixed(2),
          orderStatus: order.orderStatus,
          status: this.statusOrders[order.orderStatus],
          paymentMethod: order.paymentMethod ? order.paymentMethod : '--',
          userWillPickupOrder: order.userWillPickupOrder,
          type: order.userWillPickupOrder ? 'Recojo' : 'Delivery',
          lat: order.userLatitude,
          lng: order.userLongitude,
          date: date,
          hour: hour,
          userAddress: order.userAddress ? order.userAddress : '--',
          userId: order.userId,
          deliveryTime: order.deliveryTime ? order.deliveryTime : ''
        };
        if (!order.userWillPickupOrder) {
          this.userAddress = order.userAddress;
          var map = new google.maps.Map(document.querySelector('div.map'), {
            zoom: 7,
            center: { lat: this.lat, lng: this.lng }
          });
          directionsDisplay.setMap(map);
          this.calculateAndDisplayRoute(directionsService, directionsDisplay);
        }
        this.order = obj;
        this.userRef = this.af.object(`prod/users/${this.order.userId}`);
        this.userRef.snapshotChanges().subscribe(data => {
          this.user = data.payload.val();
          this.user.email = data.payload.val().email ? this.user.email : '--';
        });
      }
    });
    this.productRef = this.af.list(
      `${this.orderProductsDir}/${this.orderService.orderSelected.id}`
    );
    this.products = this.productRef.snapshotChanges().map(changes => {
      return changes.map(data => {
        const orderProd = data.payload.val();
        const obj = {
          key: data.key,
          name: orderProd.name,
          quantity: orderProd.quantity,
          price: '',
          total: '',
          currency: ''
        };
        this.prodMenuRef = this.af.object(
          `${this.placeMenuDir}/${this.idPlace}/${obj.key}`
        );
        this.prodMenuRef.snapshotChanges().subscribe(data => {
          const prodInfo = data.payload.val();
          this.currency = prodInfo.currency;
          obj.price = prodInfo.currency + ' ' + prodInfo.price;
          obj.total = prodInfo.currency + ' ' + prodInfo.price * obj.quantity;
          this.totalPayment += prodInfo.price * obj.quantity;
        });
        return obj;
      });
    });
  }
  ngOnInit() {}
  public calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route(
      {
        origin: 'Av Benavides 456',
        destination: this.userAddress,
        travelMode: 'DRIVING'
      },
      function(response, status) {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );
  }
  public changeStatusOrder(key) {
    if (this.order.orderStatus < 3) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          message: `¿Estás seguro de cambiar el estado de la orden ${
            this.user.dni
          }?`,
          confirmRemove: true
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'ok') {
          const ref = this.af.database
            .ref()
            .child(`${this.ordersGroupedByPlacesDir}/${this.idPlace}/${key}`);
          let newStatus = this.order.orderStatus + 1;
          if (this.order.type === 'Recojo' && newStatus === 1) {
            newStatus = newStatus + 1;
          }
          if (newStatus === 3) {
            const dateDelivery = new Date();
            this.order.hour =
              dateDelivery.getHours() +
              ':' +
              ('0' + dateDelivery.getMinutes()).slice(-2);
            ref
              .update({
                orderStatus: newStatus,
                deliveryTime: this.order.hour
              })
              .then(resp => {
                console.log(resp);
              })
              .catch(error => console.log(error));
          } else {
            ref
              .update({
                orderStatus: newStatus
              })
              .then(resp => {
                console.log(resp);
              })
              .catch(error => console.log(error));
          }
        }
      });
    }
  }
  public cancelOrder(key) {
    if (this.order.orderStatus !== 4) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          message: `¿Estás seguro de cancelar la orden ${this.user.dni}?`,
          confirmRemove: true
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'ok') {
          this.af.database
            .ref()
            .child(`${this.ordersGroupedByPlacesDir}/${this.idPlace}/${key}`)
            .update({
              orderStatus: 4
            })
            .then(resp => {
              console.log(resp);
            })
            .catch(error => console.log(error));
        }
      });
    }
  }
}
