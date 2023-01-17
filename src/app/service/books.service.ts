import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, scan, tap } from 'rxjs/operators';
import { catchError, retry } from 'rxjs/operators';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  products: any = [];
  shippingCost = 10;
  public cart = new BehaviorSubject<any>([]);
  public totals = new BehaviorSubject<{
    withShipping: number;
    withoutShipping: number;
  }>({ withShipping: 0, withoutShipping: 0 });
  public productList = new BehaviorSubject<any>([]);
  // public cartCount = new BehaviorSubject<number>(5);

  url: string = 'https://fakestoreapi.com/products';

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerService
  ) {}

  getAllProducts() {
    this.spinnerService.requestStart();
    return this.http
      .get(this.url)
      .pipe(tap(() => this.spinnerService.requestEnded()));
  }

  getSelectedProduct(id: any) {
    return this.http.get(this.url + '/' + id);
  }

  addProductToCart(product: any) {
    let cartValues = this.cart.value;

    let exists = cartValues.find(
      (eachProduct: any) => eachProduct.id == product.id
    );

    if (exists) {
      exists.quantity++;
    } else {
      cartValues.push({ ...product, quantity: 1 });
    }
    this.cart.next(cartValues);
    this.calcTotals();
  }

  removeProductFromCart(index: any) {
    let cartValues = this.cart.value;
    this.cart.value.splice(index, 1);
    this.cart.next(cartValues);
    this.calcTotals();
  }

  EmptytheCart() {
    let clearCart = this.cart.value;
    clearCart = [];
    this.cart.next(clearCart);
  }

 

  public calcTotals() {
    const totals = this.cart.value.reduce(
      (carry: number, item: any) => (carry += item.price * item.quantity),
      0
    );
    const totalwithshippingcast = totals + this.shippingCost;

    this.totals.next({
      withShipping: totalwithshippingcast,
      withoutShipping: totals,
    });
  }

  changeItemAmount(id: number, quantity: number) {
    let cartValues = this.cart.value;

    let exists = cartValues.find(
      (eachProduct: any) => eachProduct.id == id
    );

    if (exists) {
      exists.quantity = quantity;
    }

    this.cart.next(cartValues);
    this.calcTotals();
  }
}
