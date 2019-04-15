import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Mission } from '../../../shared/models/mission.model';
import { MissionsService } from '../services/missions.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  missions: Observable<Mission[]>;

  constructor(private missionsService: MissionsService) {}

  ngOnInit() {
    this.missions = this.missionsService.getMissions();
  }
}
