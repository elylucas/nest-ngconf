import { Injectable } from '@angular/core';
import { Mission } from '../../../shared/models/mission.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MissionsService {
  constructor(private httpClient: HttpClient) {}

  getMissions() {
    return this.httpClient
      .get<{ data: Mission[] }>('http://localhost:3000/missions')
      .pipe(map(response => response.data));
  }

  getMissionById(id: number) {
    return this.httpClient
      .get<{ data: Mission }>(`http://localhost:3000/missions/${id}`)
      .pipe(map(response => response.data));
  }

  createMission(mission: Mission) {
    return this.httpClient
      .post<Mission>(`http://localhost:3000/missions`, mission)
      .toPromise().catch(this.handleError);
  }

  updateMission(mission: Mission) {
    return this.httpClient
      .put<Mission>(`http://localhost:3000/missions/${mission.id}`, mission)
      .toPromise().catch(this.handleError);
  }

  deleteMission(mission: Mission) {
    return this.httpClient
      .delete<Mission>(`http://localhost:3000/missions/${mission.id}`)
      .toPromise().catch(this.handleError);
  }

  handleError(response: any) {
    const { error } = response;
    if (error.statusCode === 400) {
      let message = '';
      error.message.forEach((msg: any) => {
        const keys = Object.keys(msg.constraints);
        keys.forEach(k => {
          message += msg.constraints[k] + '<br />';
        });
      });
      throw { message };
    }
    throw error;
  }
}
