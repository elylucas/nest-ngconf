import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Mission } from '../../../shared/models/mission.model';
import { MissionsService } from '../services/missions.service';
import { ModalController } from '@ionic/angular';
import { MissionFormComponent } from '../mission-form/mission-form.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  missions: Observable<Mission[]>;

  constructor(
    private missionsService: MissionsService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.missions = this.missionsService.getMissions();
  }

async openMission(mission: Mission) {
  const modal = await this.modalController.create({
    component: MissionFormComponent,
    componentProps: { id: mission.id }
  });
  await modal.present();
  const { data = {} } = await modal.onDidDismiss();
  if (data.refreshMissions) {
    this.missions = this.missionsService.getMissions();
  }
}

  async newMission() {}
}
