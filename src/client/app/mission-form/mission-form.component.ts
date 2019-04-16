import { Component, OnInit } from '@angular/core';
import { Mission } from '../../../shared/models/mission.model';
import { Observable, of } from 'rxjs';
import { NavParams, ModalController, AlertController } from '@ionic/angular';
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
    private modalCtrl: ModalController,
    private alertController: AlertController
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

  async submit(mission: Mission) {
    try {
      if (mission.id) {
        await this.missionsService.updateMission(mission);
      } else {
        await this.missionsService.createMission(mission);
      }
      this.modalCtrl.dismiss({
        refreshMissions: true
      });
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'API Error',
        subHeader: error.error,
        message: error.message,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async delete(mission: Mission) {
    const alert = await this.alertController.create({
      header: 'Delete Mission?',
      message: 'Are you sure you want to delete this mission?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Yes',
          handler: async () => {
            try {
              await this.missionsService.deleteMission(mission);
              this.modalCtrl.dismiss({
                refreshMissions: true
              });
            } catch (error) {
              const deleteAlert = await this.alertController.create({
                header: 'API Error',
                subHeader: error.error,
                message: error.message,
                buttons: ['OK']
              });
              await deleteAlert.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
