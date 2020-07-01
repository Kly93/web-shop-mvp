import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Product } from './models/product';
import {take} from 'rxjs/operators';
import { ShoppingItem } from './models/shoppingitem';
import { Observable } from 'rxjs/internal/Observable';


@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private db: AngularFireDatabase) { }

  private create() {
    return this.db.list('/shopping-carts').push({
      dateCreate: new Date().getTime()
    });
  }
  private getCart(cartId: string) {
    return this.db.object('/shopping-carts/' + cartId);
  }

  private async getOrCreateCartId() {
    const cartId = localStorage.getItem('cartId');
    if (cartId) { return cartId; }
    const result = await this.create();
    localStorage.setItem('cartId', result.key);
    return result.key;
  }

  async addToCart(product: Product) {
    const cartId = await this.getOrCreateCartId();
    const item$: Observable<any> = this.db.object('/shopping-carts/' + cartId + '/items/' + product.key).valueChanges();
    const item$$ = this.db.object('/shopping-carts/' + cartId + '/items/' + product.key);

    item$.pipe(take(1)).subscribe( item => {
     if ( item === null ) {
        item$$.set({product, quantity: 1});
        console.log('adding new product to cart');
    } else {
        item$$.update({quantity: item.quantity + 1});
        console.log('updating exisiting product ');
   }
  });
  }
}
