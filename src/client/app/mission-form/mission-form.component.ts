import { Component, OnInit } from '@angular/core';
import { Mission } from '../../../shared/models/mission.model';
import { Observable, of } from 'rxjs';
import { NavParams, ModalController } from '@ionic/angular';
import { MissionsService } from '../services/missions.service';

@Component({
  selector: 'app-mission-form',
  templateUrl: './mission-form.component.html',
  styleUrls: ['./mission-form.component.scss'],
})
export class MissionFormComponent implements OnInit {
  mission$: Observable<Mission>;

  constructor(
    private navParams: NavParams,
    private missionsService: MissionsService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    const id = this.navParams.data.id;
    if (id) {
      this.mission$ = this.missionsService.getMissionById(id);
    } else {
      this.mission$ = of({ active: false } as any);
    }
  }

  close() {
    this.modalCtrl.dismiss({
      refreshMissions: false
    });
  }

  submit(mission: Mission) {
    console.log(mission);
  }
}
