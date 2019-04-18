# Amazing Backends for Angular Devs Workshop with NestJS

## Prerequisites

You need a recent version of Node installed (this is tested with Node 10 but might work with Node 8). Visit [Node's website](https://nodejs.org/en/) to install it.

To begin, clone the starter app from Github:

```bash
git clone https://github.com/elylucas/nest-ngconf.git
```

Install the Nest CLI via npm globall:

```bash
npm i -g @nestjs/cli
```

Go into the `nest-ngconf` directory and install dependencies:

```bash
cd nest-ngconf
npm install
```

If you are using VSCode, install the extension '[Project Snippets](https://marketplace.visualstudio.com/itemdetails?itemName=rebornix.project-snippets)' if you would like to use the included snippets. If not, you can copy or type in the code straight from this guide.

That's all!

## Introduction

In this workshop, we will cover how to build out a full-stack TypeScript application using Angular, Ionic, and NestJS. As Angular devs, you already know how powerful TypeScript is. We will take the power of TypeScript and learn how to use it on the backend.

## Meet Nest

[NestJS](https://nestjs.com) (just Nest from here on out), is a Node framework meant to build server-side applications. Not only is it a framework, but it is also a platform to meet many backend application needs, like writing APIs, building microservices, or doing real-time communications through web sockets. For us Angular devs, it is an excellent solution to write our backends with because it fits in so well with the rest of our ecosystem.

## Meet Ionic

[Ionic](https://ionicframework.com) is a UI framework for building mobile first web applications. Ionic provides around 100 UI widgets that give your app a native user experience and lets you code with the technologies you know and love, like Angular, TypeScript, and HTML/CSS. With Ionic, you can create native iOS, Android, and Progressive Web Apps with one code base.

We will use Ionic in this workshop as our UI library. However, no previous experience with Ionic is required.

## Lab 1 

> Start with the `master` branch and run `npm run dev` to start the Nest and Angular dev servers.

### Create Missions Nest Service

Run the following command in your terminal to create the missions service:

```bash
nest g service missions
```

This creates a Nest service file at `src/server/app/missions/missions.service.ts`.

> When you create a service through the Nest CLI, it automatically adds it to the list of providers in the main `app.module.ts` module, so you won't need to do it yourself.

In this service class, we make use of the `MissionsRepository`, which is already provided as a part of the base solution. The purpose of this class is to provide a "fake" database for us to use, so we don't have to go through setting one up. The specifics of this class are outside the scope of this workshop.

Update the `MissionsService` class to inject `MissionsRepository` and get back a list of Missions:

**snippet: gsr-nest-missions-service**

```typescript
export class MissionsService {
  constructor(private missionsRepository: MissionsRepository) {}

  getMissions() {
    return this.missionsRepository.getList();
  }
}
```

> Import MissionsRepository from '../data/missions.repository'.

### Create Missions Nest Controller

Run the following command in your terminal to create the missions controller:

```bash
nest g controller missions
```

This command creates a Nest controller file at `src/server/app/missions/missions.service.ts`.

> Just like the service above, the CLI automatically adds controllers to the app module's list of controllers on your behalf.

The controller imports the `MissionsService` and provide a method that responds to a `GET` request to return the list of missions. Update the controller:

***snippet: gsr-nest-missions-controller***

```typescript
export class MissionsController {
  constructor(private missionsService: MissionsService) {}
  
  @Get()
  async getMissions() {
    return this.missionsService.getMissions();
  }
}
```

> Import the `@Get` decorator from '@nestjs/common'.

Open your browser to [http://localhost:3000](http://localhost:3000), and you should see a list of missions returned.

Notice, however, there is some meta-data on the model (the createdAt and createdBy fields), and we might not want this data returned to the client. The `MissionsRepository` is returning a type of `MissionEntity` (located at `src/server/app/data/mission.entity.ts`) from the get methods. We can use the `class-transformer` library to "exclude" certain members of the class from being returned. 

Open up the MissionEntity class, and add `@Exclude()` decorator to the `createdAt` and `createdBy` members like so:

```typescript
export class MissionEntity {
  id?: number;
  title: string;
  reward: number;
  active: boolean;
  @Exclude()
  createdAt: Date;
  @Exclude()
  createdBy: string;
}
```

> Import `Exclude` from the `class-transformer` library

For the properties to be excluded, we must run them through the `classToPlain` function from the `class-transformer` library. We could do this in the controller like so:

```typescript
@Get()
async getMissions() {
  const missionEntities = await this.missionsService.getMissions();
  const missions = classToPlain(missionEntities);
  return missions;
}
```

However, this adds some cruft to our controller methods. We would have to repeat this code everywhere we return a mission, and repeating code violates the DRY (don't repeat yourself) principle.

Fortunately, Nest provides a mechanism for manipulating data on the way out called interceptors. Let's take a look at building one next.

### Nest Interceptors

Nest interceptors are pretty much what they sound like; they intercept data from the controllers and let you inspect and modify that data.

Create an interceptor from the CLI with the following command:

```bash
nest g interceptor util/data
```

This command creates an interceptor file at `src/server/app/util/data.interceptor.ts`. Update the class in the file to the following:

**snippet: gsr-nest-data-interceptor**

```typescript
export class DataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        return {
          data: classToPlain(data)
        };
      })
    );
  }
}
```

> Import `map` from 'rxjs/operators' and `classToPlain` from 'class-transformer'

The `next.handle()` method is an observable stream that you can interact with like any other observable. Here, we use the `map` operator from RXJS to transform the output from one object to another. Specifically, we are using `classToPlain` to have `class-transformer` remove the excluded params from `MissionEntity`, just like the controller did earlier. 

We are also modifying the returned object to return an object that now has a `data` property on it, which contains the original response. Optionally, we can now return other properties the could be meta-data about the response, such as a request id or the time it took the request to complete.

To use the new interceptor, Nest provides a few different options. We can use the `@UseInterceptors` decorator and either put it on a class if we want it to apply to the entire controller like so:

```typescript
@UseInterceptors(DataInterceptor)
@Controller('missions')
export class MissionsController { ... }
```

Alternatively, we can be more selective and put it only on the route handlers we want:

```typescript
@UseInterceptors(DataInterceptor)
@Get()
async getMissions() { ... }
```

A third option allows us to apply the interceptor to run globally by specifying it in the app module:

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataInterceptor } from './util/data.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataInterceptor,
    },
  ],
})
export class AppModule {}
```

> Import `APP_INTERCEPTOR` from '@nestjs/core`.

This method is used to make sure our interceptor runs everywhere.

Once applied, hit the `/missions` endpoint again and you should see the list of missions minus the `createdAt` and `createdBy` meta-data.

Bonus: Add some additional metadata properties to the data object (request id, timings, etc).
Bonus: If the data coming back from the controller is undefined, throw a NotFoundException to send a 404 status.

Now that we have mission data returning from our API let's consume it from our Ionic app.

### Create Mission Interface

First, we want to use a common model between our server and client to represent a Mission. However, we don't want to use the MissionEntity as that has member variables that aren't returned via the API (the `createdAt` and `createdBy` members) and it also has a dependency on the `class-transformer` library, which we don't want to import into our client app if we don't need to. Therefore, we create a lightweight mission interface that can be used from both our front and back ends.

In the `src/shared/models` folder, create a file called `mission.ts` and add the following class to the file:

**snippet: gsr-mission-model**

```typescript
export interface Mission {
  id?: number;
  title: string;
  reward: number;
  active: boolean;
}
```

### Create Mission Angular Service

Next, create an Angular service to retrieve the Missions from the API. Run the following command from your terminal:

```bash
npx ionic g service services/missions
```

> The Ionic CLI invokes the same generator the Angular CLI would, except in special cases where there are Ionic specific modifications to make to the file.

This command creates a service at `src/client/app/services/missions.service.ts`. Take note that from here on out we have multiple files with the same name in this project (one on the client and one on the server), so make sure you are in the right file! Update the class in the client file to the following:

**snippet: gsr-ng-missions-service**

```typescript
export class MissionsService {
  constructor(private httpClient: HttpClient) {}

  getMissions() {
    return this.httpClient
      .get<{data: Mission[]}>('http://localhost:3000/missions')
      .pipe(map(response => response.data));
  }
}
```

> import `Mission` from the new model class at '../../../shared/models/mission.model', HttpClient from '@angular/common/http', and `map` from 'rxjs/operators'.

> Since we are using HttpClient, make sure to add HttpClientModule (from `@angular/common/http`) in the app module's list of imports.

### Update Home Page

Next, modify the `home.page.ts` file to call into the service and save the results to a local observable:

**snippet: gsr-ng-homepage-ts**

```typescript
export class HomePage implements OnInit {
  missions: Observable<Mission[]>;
  
  constructor(private missionsService: MissionsService) {}
  
  ngOnInit() {
    this.missions = this.missionsService.getMissions();
  }
}
```

> Import `OnInit` from '@angular/core' and `Observable` from 'rxjs', `Mission` from '../../../shared/models/mission.model',  and `MissionsService` from '../services/missions.service' (be careful to not import the `MissionsService` that belongs to the Nest project.

Next, replace the `home.page.html` template with the following:

**snippet: gsr-ng-homepage-template**

```html
<ion-header>
  <ion-toolbar>
  <ion-buttons slot="start">
      <ion-menu-button></ion-menu-button>
  </ion-buttons>
    <ion-title>Missions</ion-title>
    <ion-buttons slot="end">
      <ion-button><ion-icon name="add"></ion-icon></ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item *ngFor="let mission of (missions | async)">
      <ion-label>
        <h2>{{ mission.title }}</h2>
        <p>{{ mission.reward | currency }} - {{ mission.active ? 'Active' : 'Complete'}}</p>
      </ion-label>
      <ion-icon slot="start" icon="rocket" color="primary"></ion-icon>
    </ion-item>
  </ion-list>
</ion-content>
```

If you don't already have a browser window opened to http://localhost:8100, go ahead and do so. You should now see the list of missions.

### Lab 1 Exercise 

Update the `DataInterceptor` class to return the time that it took to process the request. Before the call to `next.handle()`, get the start time, and during the `map`, get the end time. Use the difference between these variables to represent the number of milliseconds the time of the request took, and return it with the response.

Check the lab1-complete branch for the complete lab1 code and the solution to the exercise.

## Lab 2

> To start fresh at lab2, you can checkout the lab2-start branch in git

We now have a list of missions displayed. Next, let's add to our API to retrieve a single mission by its id, and display the mission in a form.

### Update Nest Service and Controller to get Single Mission

Open up the mission service in the Nest project and add the following method to fetch a single mission from the repository:

***snippet: gsr-nest-missions-service-get***

```typescript
getMission(id: number) {
  return this.missionsRepository.get(id);
}
```

Update the Nest mission controller to call into this new service method:

***snippet: gsr-nest-missions-controller-get***

```typescript
@Get(':id')
async getMission(@Param('id') id: number) {
  return this.missionsService.getMission(id);
}
```

> Import `Param` from '@nestjs/common'.

The `Get()` decorator here takes in a route parameter named `id`, and in the `getMission` method, we extract that parameter out using the new `@Param` decorator, which in turn assigns the value to `id`.
    
If you request http://localhost:3000/missions/1, you should notice that nothing comes back. Why? Parameters are passed in as strings, but we expect the `id` to be a number, and the repo does not find a mission because of it. In the params to `getMission`, `id` is of type number, but, unfortunately, TypeScript does coerce values to be their proper types.

We could parse the string value of `id` into a number manually inside the controller method before calling into the service, but once again this muddies our controller code with duplicated logic throughout. It would be nice to have a facility to do this for us automatically. 

Nest comes to the rescue here!

### Nest Pipes

Fortunately, we can use another facet of Nest, called Pipes, to manipulate data that comes in from the outside before it reaches our controller. Because we are using TypeScript, Pipes know all the little details about your controller methods, including all the parameters, and the types those parameters are supposed to be. We can take advantage of this information and use `class-transformer` again to convert a plain object into something of a specific type. Let's see how to do that.

Create a data pipe via the CLI:

```bash
nest g pipe util/data
```

This command creates a pipe file at `src/server/app/util/data.pipe.ts`. Update the class in the file to:

***snippet: gsr-nest-data-pipe***

```typescript
export class DataPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    const convertedValue = plainToClass(metatype, value);
    return convertedValue;
  }
}
```

> Import `planToClass` from `class-transformer`.

The Pipe itself is simple. It implements the `PipeTransform` interface, and has one method, `transform`, which is called for each parameter a route handler takes in. 

The `transform` method takes two arguments: the first being the value being passed into the parameter, and the second is meta-data about the parameter itself. This metadata is derived from TypeScript and the `emitDecoratorMetadata` parameter that is enabled in the `tsconfig.json` file. When this option enabled, TypeScript automatically includes information about all your object's types, which can then be used at runtime. This metadata is very powerful and enables some of the functionality you see in Angular and Nest.

Next, we call `plainToClass`, which converts a value into a particular type, then return the converted value, which becomes the new value for the parameter.

Pipes are bound in all the same ways we saw Interceptors bound earlier. Once again we elect to bind the pipe at the app level, so it is used in every request. Add the following to the list of imports in the server `app.module.ts` file:

```typescript
{
  provide: APP_PIPE,
  useClass: DataPipe
}
```

> Import `APP_PIPE` from '@nestjs/core' and `DataPipe` from './util/data.pipe'.

Now, make a call to http://localhost:3000/missions/1, and you should see a single mission come back.

### Update Angular Missions Service

We can now pull back a specific mission from our API, so let's update the mission service in the Ionic project to do just that. 

Add the following method to the `missions.service.ts` service:

***snippet: gsr-ng-missions-service-getbyid***

```typescript
getMissionById(id: number) {
  return this.httpClient
    .get<{data: Mission}>(`http://localhost:3000/missions/${id}`)
    .pipe(map(response => response.data));
}
```

### Create Mission Form

Create a new component with the following command:

```bash
npx ionic g component MissionForm
```

The MissionForm needs to be registered with the home module. Open up `home.module.ts` and add MissionFormComponent to the NgModel's `entryComponents` and `declarations` arrays like so:

```typescript
@NgModule({
  /* .... */
  entryComponents: [MissionFormComponent],
  declarations: [HomePage, MissionFormComponent]
})
export class HomePageModule {}
```

Update `mission-form.component.ts` with the following:

***snippet: gsr-ng-missionform-ts***

```typescript
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
```

> Import `NavParams` and `ModalController` from '@ionic/angular', and `of` from 'rxjs`.

And then update the `mission-form.component.html` template to:

***snippet: gsr-ng-missionform-template***

```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="end">
      <ion-button (click)="close()">
        <ion-icon name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
    <ion-title>Mission</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list *ngIf="(mission$ | async) as mission">
    <form (submit)="submit(mission)" #form>
      <ion-item *ngIf="mission.id">
        <ion-label>Id: {{ mission.id }}</ion-label>
        <ion-icon name="trash" color="danger" slot="end"></ion-icon>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Title</ion-label>
        <ion-input [(ngModel)]="mission.title" name="title"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Reward</ion-label>
        <ion-input
          type="number"
          [(ngModel)]="mission.reward"
          name="reward"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>Active</ion-label>
        <ion-toggle [(ngModel)]="mission.active" name="active"></ion-toggle>
      </ion-item>
      <ion-button type="submit" expand="block">Save</ion-button>
    </form>
  </ion-list>
</ion-content>
```

### Update Mission List to Open Mission

We open an Ionic modal and display the `MissionForm` when a user clicks on one of the missions in the list. 

Update the `home.page.ts` file to inject `private modalController: ModalController` into the constructor and then add the `openMission` method:

***snippet: gsr-ng-homepage-openMission***

```typescript
async openMission(id: number) {
  const modal = await this.modalController.create({
    component: MissionFormComponent,
    componentProps: { id }
  });
  await modal.present();
  const { data = {} } = await modal.onDidDismiss();
  if (data.refreshMissions) {
    this.missions = this.missionsService.getMissions();
  }
}
```

Add a click handler to the `<ion-item>` in `home.page.html`:

```html
<ion-item *ngFor="let mission of (missions | async)" (click)="openMission(mission.id)">
```

We will leave the form submission for the next lab.

### Lab 2 Exercise

Currently, if we supply an id to the `missions/:id` endpoint that doesn't exist, the API returns a null object. We should return a 404 Not Found status code instead.

Update the Nest `DataInterceptor` to return a NotFoundException if the data is null.

Check the lab2-complete branch for the complete lab2 code and the solution to the exercise.

## Lab 3

> To start fresh at lab3, you can checkout the lab3-start branch in git

### Update Nest Missions Service to add Create, Update, and Delete Methods

Add the create, update, and delete methods to the Nest `missions.service.ts` class:

***snippet: gsr-nest-missions-service-createupdatedelete***

```typescript
createMission(mission: MissionEntity) {
  return this.missionsRepository.create(mission);
}

async updateMission(id: number, mission: MissionEntity) {
  const current = await this.getMission(id);
  if (!current) {
    return null;
  }
  mission.createdAt = current.createdAt;
  mission.createdBy = current.createdBy;
  return this.missionsRepository.update(id, mission);
}

deleteMission(id: number) {
  return this.missionsRepository.delete(id);
}
```

> Import `MissionEntity` from '../data/mission.entity'.

The `createMission` and `deleteMission` methods are straightforward, just passing through to the mission repository. The `updateMission` method, however, is making sure we preserve the original `createdAt` and `createdBy` values that were originally on the mission. This code is an example of the type of logic that could go into a service class.

### Update Nest Missions Controller to add Post and PUT Methods

***snippet: gsr-nest-missions-controller-createupdatedelete***

```typescript
@Post()
async createMission(@Body() mission: MissionEntity) {
  return this.missionsService.createMission(mission);
}

@Put(':id')
async updateMission(@Param('id') id: number, @Body() mission: MissionEntity) {
  return this.missionsService.updateMission(id, mission);
}

@Delete(':id')
async deleteMission(@Param('id') id: number) {
  return this.missionsService.deleteMission(id);
}
```

> Import `Post`, `Put`, `Delete`, and `Body` from '@nestjs/common'.

These new methods each use a new decorator (`@Post`, `@Put`, and `@Delete`) to let Nest know which HTTP method each route handler should respond to.

In the params to both the create and update methods, we use the `@Body` decorator to indicate we want to populate the `mission` object from the request body. We don't need to set up anything additional (like add a body parser), as Nest takes care of this for us.

Additionally, since we are still using the `DataPipe` that we set up earlier, `mission` is automatically converted to a MissionEntity class when coming into our route handlers. This conversion is important right now because we set some default values for the `createdAt` and `createdBy` properties wouldn't be set unless this was an actual instance of `MemberEntity`.

Now that our API supports the remaining create, update, and delete methods, let's add it to our Ionic app.

### Update Angular Missions Service for Create, Update, and Delete methods

Update the Angular `missions.service.ts` file with the remaining methods:

***snippet: gsr-ng-missions-service-createupdatedelete***

```typescript
createMission(mission: Mission) {
  return this.httpClient
    .post<Mission>(`http://localhost:3000/missions`, mission)
    .toPromise().catch(response => { throw response.error; });
}

updateMission(mission: Mission) {
  return this.httpClient
    .put<Mission>(`http://localhost:3000/missions/${mission.id}`, mission)
    .toPromise().catch(response => { throw response.error; });
}

deleteMission(mission: Mission) {
  return this.httpClient
    .delete<Mission>(`http://localhost:3000/missions/${mission.id}`)
    .toPromise().catch(response => { throw response.error; });
}
```

The new methods above follow the same pattern as before, except now we are using the `catchError` operator from RXJS to capture any HTTP errors that come back from the API. 

With the service methods taken care of, let's look at updating the mission form next.

### Updating Mission Form to Support Create and Edit

Next, go update the `submit` method in `mission-page.component.ts` with the following:

***snippet: gsr-ng-missionform-submit-method***

```typescript
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
```

> Add `private alertController: AlertController` to the constructor params and import `AlertController` from '@ionic/angular'.

First, we take a look to see if this is a new mission or an existing one by checking to see if the mission has an id, then we call the appropriate service method based on this check. Next, we subscribe to the call so we can dismiss the modal when it is complete. We also save a reference to the subscription so we can make sure to unsubscribe from it when the call is done, which helps prevent any potential memory leaks.

The last thing we need to do is hook up the add a button to open up the mission form modal. In `home.page.html` add the click handler `(click)="newMission()"` to the add button in the `<ion-header>`:

```html
<ion-button (click)="newMission()"><ion-icon name="add"></ion-icon></ion-button>
```

Then add the `newMission` method to the class in `home.page.ts`:

***snippet: gsr-ng-homepage-newmission***

```typescript
async newMission() {
  const modal = await this.modalController.create({
    component: MissionFormComponent
  });
  await modal.present();
  const { data = {} } = await modal.onDidDismiss();
  if (data.refreshMissions) {
    this.missions = this.missionsService.getMissions();
  }
}
```

### Deleting Missions

When the `MissionForm` modal loads an existing mission, a row displays above the form showing the mission's ID and a delete icon. Next, we enable the delete icon to allow a user to delete missions.

Add a click handler to the "trash" icon in `mission-form.component.html`:

```html
<ion-icon name="trash" (click)="delete(mission)" color="danger" slot="end"></ion-icon>
```

In `mission-form.component.ts`, add the delete method:

***snippet: gsr-ng-missionform-delete***

```typescript
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
```

Now, you can delete missions, and a confirmation alert box will ask you to confirm the deletion.

With all that now in place, we should have a fully functioning app for our space rangers to create, read, update, and delete (CRUD) missions. 

When we submit an invalid form (like when a title or reward is missing), we get back a server error that is not too helpful. Next, we will see how to put proper validation in place in our API to make sure the models are valid before we even send them to the database.

## Lab 4

> To start fresh at lab4, you can checkout the lab4-start branch in git

### Validation

### Add Nest Validators to MissionEntity

Open up `mission.entity.ts` and add some validators to the class.

```typescript
export class MissionEntity {
  id?: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDefined()
  @IsNumber()
  reward: number;

  @IsDefined()
  @IsBoolean()
  active: boolean;

  @Exclude()
  createdAt: Date = new Date();
  @Exclude()
  createdBy = 'user';
}
```

> The IsDefined, IsString, IsNotEmpty, IsNumber, and IsBoolean validators are imported from `class-validator`;

Add the Nest `ValidationPipe` to the list of imports in the server `app.module.ts`:

```typescript
{
  provide: APP_PIPE,
  useClass: ValidationPipe,
}
```

> `ValidationPipe` is imported from '@nestjs/common`.

In the client 'mission.service.ts` file, add a `handleError` method the HTTP responses can use to parse the validation error into a single string:

***snippet: gsr-ng-missions-service-handleerror***

```typescript
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
```

Then update the create, update, and delete methods to use `handleError`:

```typescript
createMission(mission: Mission) {
  return this.httpClient
    .post<Mission>(`http://localhost:3000/missions`, mission)
    .toPromise().catch(this.handleError);
}
```

> Make sure to update `updateMission` and `deleteMission` as well.

Now, when you submit an invalid form, you get a proper 400 error back. In this example, we loop through the error objects and construct a string showing all the validation issues, but you could do a lot more with it. The errors contain the validation rule that caused the error and the property for which the validation was applied to, so you could go fancier in showing the errors than a simple alert modal.

### Authentication

Now, let's see how we can use Authentication in Nest and protect our API endpoints. We make sure that when someone calls one of our protected endpoints that they provide a token that proves who they are. For this sample app, the tokens are contrived values that we manually set, but in a real-world application these would be obtained through some identity (login) system.

Nest provides a mechanism called Guards that function similar to route guards in Angular. A guard is a piece of middleware that runs before a controller gets access to the request (similar to an interceptor) and returns a boolean value that when true lets the request through, or if false, throws a 403 Forbidden response error. In the guard, we inspect the value of the token to help determine if they should be let through or not.

We will also set up a simple role system that contains two roles, users and admins, and only allow these roles to do specific actions:

 - `GET` requests will be open to everyone with no authentication required.
 - `POST` and `PUT` requests will require a user or admin role.
 - `DELETE` requests will require the admin role.

### Create Roles Decorator 

Let's start off by creating a `Roles` decorator that we can use on our controller methods to specify which roles we want the auth guard to check. Nest makes it simple to create a TypeScript decorator for this use case. From the command line, issue this command:

```bash
nest g decorator util/roles
```

The roles decorator is good to go and ready to use, so we won't need to make any modifications to the file Nest generated.

To specify which roles we want a route handler to check for access, we use `@Roles('...')` on each of the controller's methods. In `missions.controller.ts` add `@Roles` and specify the role to the following methods:

```typescript
@Post()
@Roles('user')
async createMission(...) { ... }

@Put(':id')
@Roles('user')
async updateMission(...) { ... }

@Delete(':id')
@Roles('admin')
async deleteMission(...) { ... }
```

### Crea9te Nest Guard

Next, create the auth guard with the following CLI command:

```bash
nest g guard util/auth
```

Open up the `src/server/app/util/auth.guard.ts` file, and replace the class with the following:

***snipppet: gsr-nest-authguard***

```typescript
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (
      !request.headers.authorization ||
      !request.headers.authorization.startsWith('Bearer ')
    ) {
      return false;
    }

    const token = request.headers.authorization.split(' ')[1];

    const userRoles = [];

    if (token === 'user-token') {
      userRoles.push('user');
    }
    if (token === 'admin-token') {
      userRoles.push('user', 'admin');
    }

    const hasRole = userRoles.some(role => requiredRoles.indexOf(role) > -1);
    return hasRole;
  }
}
```

> Import `Reflector` from `@nestjs/core`.

Let's break the above code down. 

First, we check to see if the method being called has the `@Roles` decorator applied to it and get back a list of the strings specified in the decorator. If the method doesn't have the decorator, it returns undefined, so we make sure to set `requiredRoles` to an empty array in that case. If requiredRoles is empty, authentication is not required for this call, so we return true.

Next, we get a reference to the HTTP request and check to make sure the authorization header is present and valid (by making sure it begins with `Bearer `).

We declare a `usersRoles` array that contains the roles the user belongs to. In our contrived example, if the token is a user token, we add 'user' to the array, and if the token is an admin token, we add `user` and `admin` to the array. In a real-world app, you would need to verify the token is valid and probably populate the roles based on some other backend call.

Last, we make sure the authenticated request contains a role that the API call requires.

Add the new auth guard to the app module providers:

```typescript
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

> Import `APP_GUARD` from '@nestjs/core' and `AuthGuard` from './util/auth.guard'.

If you try to use the app now, you see that you can view the list of missions and go to a mission's details, but you can't create, edit, or delete them.

The menu button in the top left lets you "login" as a user or admin, and it keeps track of your choice in local storage. However, we don't currently send the Bearer token in the HTTP request. We will do that next.

### Create Angular HTTP Interceptor

In Angular, HTTP Interceptors adds a piece of middleware that will let you modify the outgoing request. This interceptor is a perfect place to add the authorization header if our user is authenticated.

In the `src/client/app/util` folder, create a new file called `auth.interceptor.ts` and use the following code for it:

***snippet: gsr-ng-auth-interceptor***

```typescript
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authToken = window.localStorage.getItem('auth-token');

    if (!authToken) {
      return next.handle(request);
    }

    const newRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    return next.handle(newRequest);
  }
}
```

Interceptors are a simple class that implements an `intercept` method. In our `intercept`, we check to make sure if the user is currently "logged in" (by seeing if they have an auth-token value in local storage, which is set by the login screen). If not, the request goes through without any modification. If there is an auth-token, we clone the original request (because requests are immutable, we need a new copy to make changes to it) and add an `Authorization` header with the auth-token for its value.

Add the new interceptor to the client's `app.module.ts` list of providers:

```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

> Import `HTTP_INTERCEPTORS` from '@angular/common/http' and `AuthInterceptor` from './util/auth.interceptor'.

With the authentication in place, depending on if you log in as a user or admin, you can continue adding, editing, and deleting missions.

## Conclusion

We now have a fully functioning app where we can view lists of missions, see mission details, edit the missions, delete them, and even create a new one. Our space rangers are ready to get to work!

In this tutorial, we used Nest to build out a backend API and saw how it utilizes TypeScript to provide features otherwise impossible in a typical Node app.

On the front end, we have an Angular App powered by the Ionic Framework to build a mobile-first experience for the space rangers.

Together, they made a powerful duo to build out a full-stack TypeScript app. 