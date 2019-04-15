import { Component } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  authToken: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private toastCtrl: ToastController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  menuOpened() {
    this.authToken = window.localStorage.getItem('auth-token');
  }

  clearToken() {
    this.authToken = undefined;
    window.localStorage.removeItem('auth-token');
  }

  async logout() {
    this.clearToken();
    const toast = await this.toastCtrl.create({
      message: 'Logged Out',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}
