import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  authToken: string;

  constructor(private toastController: ToastController, private router: Router) {}

  ngOnInit() {
    this.authToken = window.localStorage.getItem('auth-token');
  }

  setToken(token: string) {
    this.authToken = token;
    window.localStorage.setItem('auth-token', token);
  }

  clearToken() {
    this.authToken = undefined;
    window.localStorage.removeItem('auth-token');
  }

  async login(role: 'admin' | 'user') {
    let message = '';
    if (role === 'admin') {
      message = 'Logged in as Admin';
      this.setToken('admin-token');
    } else if (role === 'user') {
      message = 'Logged in as User';
      this.setToken('user-token');
    }
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    this.router.navigateByUrl('/home');
  }
}
