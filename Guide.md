# Amazing Backends for Angular Devs Workshop with NestJS

## Prerequisites

You need a recent version of Node installed (this is tested with Node 10 but might work with Node 8). Visit [Node's website](https://nodejs.org/en/) to install it.

To begin, clone the starter app from Github:

```bash
git clone https://github.com/elylucas/nest-ngconf.git
```

<copy-button></copy-button>

Go into the `nest-ngconf` directory and install dependencies:

```bash
cd nest-ngconf
npm install
```

<copy-button></copy-button>

To start the dev server for both Ionic and Nest, run:

```bash
npm run dev
```

<copy-button></copy-button>

Any changes you make to your project will automatically be recompiled when you save.

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

### Nest Missions Service

Nest services are much like Angular services. They are simple classes that can be registered in the app module's providers, which lets them be injected into other components. Services are the ideal place for interacting with the database layer, performing business logic, or making calls into other APIs.

Open the `MissionService` file and add the `getMissions` method:

<!-- gsr-nest-missions-service-getMissions -->

`src/server/app/missions/missions.service.ts`

```typescript
getMissions() {
  return this.missionsRepository.getList();
}
```

<copy-button></copy-button>

In this service class, we make use of the `MissionsRepository`, which is already provided as a part of the base solution. The purpose of this class is to provide a "fake" database for us to use, so we don't have to go through setting one up. The specifics of this class are outside the scope of this workshop.

### Missions Nest Controller

Open up the `MissionController` and note that it is has `@Controller('missions')` as a decorator on the class. This decorator instructs Nest that this class is responsible for requests at the /missions` endpoint.

Next, add the GET handler in the `MissionController` class:

<!-- gsr-nest-missions-controller-getMissions -->

`src/server/app/missions/missions.controller.ts`

```typescript
@Get()
async getMissions() {
  return this.missionsService.getMissions();
}
```

<copy-button></copy-button>

The `@Get` decorator on the `getMissions` method states that this is the method that will response to GET requests.

Open your browser to [http://localhost:3000/missions](http://localhost:3000/missions), and you should see a list of missions returned.

Notice, however, there is some meta-data on the model (the createdAt and createdBy fields), and we might not want this data returned to the client. The `MissionsRepository` is returning a type of `MissionEntity` (located at `src/server/app/data/mission.entity.ts`) from the get methods. We can use the `class-transformer` library to "exclude" certain members of the class from being returned. 

Open up the `MissionEntity` class, and add `@Exclude()` decorator to the `createdAt` and `createdBy` members like so:

`src/server/app/data/mission.entity.ts`

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

<copy-button></copy-button>

For the properties to be excluded, we must run them through the `classToPlain` function from the `class-transformer` library. 

We could run `classToPlain` in the controller like so:

```typescript
@Get()
async getMissions() {
  const missionEntities = await this.missionsService.getMissions();
  const missions = classToPlain(missionEntities);
  return missions;
}
```

However, this adds some cruft to our controller methods. We would have to repeat this code everywhere we return a mission, and repeating code violates the DRY (don't repeat yourself) principle.

Fortunately, Nest provides a mechanism called interceptors that allow manipulation of data before being returned in the request. 
Let's take a look at building one next.

### Nest Interceptors

Nest interceptors are pretty much what they sound like; they intercept data from the controllers and let you inspect and modify that data.

We will use an interceptor to run the `classToPlain` method after the controller has processed the request.

Update the `intercept` method in `DataInterceptor` to the following:

<!-- gsr-nest-data-interceptor-intercept -->

`src/server/app/util/data.interceptor.ts`

```typescript
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  return next.handle().pipe(
    map(data => {
      return {
        data: classToPlain(data)
      };
    })
  );
}
```

<copy-button></copy-button>

> Import `map` from 'rxjs/operators' and `classToPlain` from 'class-transformer'

The `next.handle()` method is an observable stream that you can interact with like any other observable. Here, we use the `map` operator from RXJS to transform the output from one object to another. Specifically, we are using `classToPlain` to have `class-transformer` remove the excluded params from `MissionEntity`, just like the controller did earlier. 

We are also modifying the returned object to return an object that now has a `data` property on it, which contains the original response. Optionally, we can now return other properties the could be meta-data about the response, such as a request id or the time it took the request to complete.

To use the `DataInterceptor`, Nest provides a few different options to bind it to a request. 

We can use the `@UseInterceptors` decorator and either put it on a class if we want it to apply to the entire controller like so:

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

`src/server/app/app.module.ts`

```typescript
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

This method is already setup in the demo project for the `DataInterceptor` and all the other pieces of Nest middleware we will implement in this workshop, so no need to do this yourself.

Hit the `/missions` endpoint again and you should see the list of missions minus the `createdAt` and `createdBy` meta-data.

Now that we have mission data returning from our API let's consume it from our Ionic app.

### Mission Interface

We want to use a common model between our server and client to represent a Mission. However, we don't want to use the MissionEntity as that has member variables that aren't returned via the API (the `createdAt` and `createdBy` members) and it also has a dependency on the `class-transformer` library, which we don't want to import into our client app if we don't need to. Therefore, we create a lightweight mission interface that can be used from both our front and back ends.

There is a `Mission` interface already defined in the shared folder:

 `src/shared/models/mission.model.ts`

```typescript
export interface Mission {
  id?: number;
  title: string;
  reward: number;
  active: boolean;
}
```

The `MissionEntity` database model implements this interface already to help make sure the main properties for a Mission stay consistent.

### Update Mission Angular Service to Retrieve Missions

> Take note that we have multiple files with the same name in this solution (one in the client and one in the server), so make sure you are in the right file! 

Next, update the **client** `MissionsService` to retrieve the Missions from the API. Add the `getMissions` method:

<!-- gsr-ng-missions-service-getmissions -->

`src/client/app/services/missions.service.ts`

```typescript
getMissions() {
  return this.httpClient
    .get<{ data: Mission[] }>('http://localhost:3000/missions')
    .pipe(map(response => response.data));
}
```

<copy-button></copy-button>


### Update Home Page

Next, modify the `home.page.ts` ngOnInit method to call into the service and save the results to a local observable:

<!-- gsr-ng-missions-controller-oninit -->

`src/client/app/home/home.page.ts`

```typescript
ngOnInit() {
  this.missions = this.missionsService.getMissions();
}
```

<copy-button></copy-button>

The home page template is already setup to display the data. Feel free to browse through it:

`src/client/app/home/home.page.html`

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

That is a great start! Next, we will look into display a mission in its own form.

### Lab 1 Bonus Exercise 

Update the `DataInterceptor` class to return the time that it took to process the request. Before the call to `next.handle()`, get the start time, and during the `map`, get the end time. Use the difference between these variables to represent the number of milliseconds the time of the request took, and return it with the response.

Check the lab1-complete branch for the complete lab1 code and the solution to the exercise.

## Lab 2

> To start fresh at lab2, you can checkout the lab2-start branch in git

We now have a list of missions displayed. Next, let's add to our API to retrieve a single mission by its id, and display the mission in a form.

### Update Nest Service and Controller to get Single Mission

Open up the **server** `MissionService` and add the following method to fetch a single mission from the repository:

<!-- gsr-nest-missions-service-getmission -->

`src/server/app/missions/missions.service.ts`

```typescript
getMission(id: number) {
  return this.missionsRepository.get(id);
}
```

<copy-button></copy-button>

Update the `MissionController` to call into this new service method:

<!-- gsr-nest-missions-controller-getmission -->

`src/server/app/missions/missions.controller.ts`

```typescript
@Get(':id')
async getMission(@Param('id') id: number) {
  return this.missionsService.getMission(id);
}
```

<copy-button></copy-button>

The `Get()` decorator here takes in a route parameter named `id`, and in the `getMission` method, we extract that parameter out using the new `@Param` decorator, which in turn assigns the value to `id`.
    
If you request http://localhost:3000/missions/1, you should notice that nothing comes back. Why? Parameters are passed in as strings, but we expect the `id` to be a number, and the repo does not find the mission because of it. In the params to `getMission`, `id` is of type number, but, unfortunately, we are practically lying to TypeScript that the value is coming in as a number.

We could parse the string value of `id` into a number manually inside the controller method before calling into the service, but once again this muddies our controller code with duplicated logic throughout. It would be nice to have a facility to do this for us automatically. 

Nest comes to the rescue here!

### Nest Pipes

Fortunately, we can use another facet of Nest, called Pipes, to manipulate data that comes in from the outside before it reaches our controller. Because we are using TypeScript, Pipes know all the little details about your controller methods, including all the parameters, and the types those parameters are supposed to be. We can take advantage of this information and use `class-transformer` again to convert a plain object into something of a specific type. Let's see how to do that.

Open up the `DataPipe` class and update the `transform` method to: 

<!-- gsr-nest-data-pipe-transform -->

`src/server/app/util/data.pipe.ts`

```typescript
transform(value: any, metadata: ArgumentMetadata) {
  const { metatype } = metadata;
  if (!metatype) {
    return value;
  }
  const convertedValue = plainToClass(metatype, value);
  return convertedValue;
}
```

<copy-button></copy-button>

The Pipe itself is simple. It implements the `PipeTransform` interface, and has one method, `transform`, which is called for each parameter a route handler takes in. 

The `transform` method takes two arguments: the first being the value being passed into the parameter, and the second is meta-data about the parameter itself. This metadata is derived from TypeScript and the `emitDecoratorMetadata` parameter that is enabled in the `tsconfig.json` file. When this option enabled, TypeScript automatically includes information about all your object's types, which can then be used at runtime. This metadata is very powerful and enables some of the functionality you see in Angular and Nest.

Next, we call `plainToClass`, which converts a value into a particular type, then return the converted value, which becomes the new value for the parameter.

Pipes are bound in all the same ways we saw Interceptors bound earlier. Once again we elect to bind the pipe at the app level, and this is already taken care of in the starter app.

Now, data being passed into all controller handlers will have their types converted automatically. Make a call to http://localhost:3000/missions/1, and you should see a single mission come back.

### Update Angular Missions Service

We can now pull back a specific mission from our API, so let's update the mission service in the Ionic project to do just that. 

Add the following method to the `missions.service.ts` service:

<!-- gsr-ng-missions-service-getmissionbyid -->

`src/client/app/services/missions.service.ts`

```typescript
getMissionById(id: number) {
  return this.httpClient
    .get<{data: Mission}>(`http://localhost:3000/missions/${id}`)
    .pipe(map(response => response.data));
}
```

<copy-button></copy-button>

### Mission Form

The mission form will display in a modal when the user clicks a mission from the list. From here, a user can view the mission, edit, and update it. The mission form is already created as a part of the base solution, so let's update the `MissionFormComponent` to pull the selected one back from the service and display it.

Update the `MissionFormComponent` to use the following `ngOnInit`:

<!-- gsr-ng-missionform-component-ngoninit -->

`src/client/app/mission-form/mission-form.component.ts`

```typescript
ngOnInit() {
  const id = this.navParams.data.id;
  if (id) {
    this.mission$ = this.missionsService.getMissionById(id);
  } else {
    this.mission$ = of({ active: false } as any);
  }
}
```

<copy-button></copy-button>

The mission form template is a simple Ionic page that displays the details of the mission in a form. The template is already filled out in the starter app, but here it is for your reference:

`src/client/app/mission-form/mission-form.component.html`

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

We open an Ionic modal and display the `MissionForm` when a user clicks on a mission in the list. 

Update the `HomePage`file to add the `openMission` method:

<!-- gsr-ng-home-page-openmission -->

`src/client/app/home/home.page.ts`

```typescript
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
```

<copy-button></copy-button>

The `<ion-item>` in the home page template has a click handler to call the above method:

```html
<ion-item *ngFor="let mission of (missions | async)" (click)="openMission(mission.id)">
```

We will leave the form submission for the next lab.

### Lab 2 Bonus Exercise

Currently, if we supply an id to the `missions/:id` endpoint that doesn't exist, the API returns a null object. We should return a 404 Not Found status code instead.

Update the Nest `DataInterceptor` to return a NotFoundException if the data is null.

Check the lab2-complete branch for the complete lab2 code and the solution to the exercise.

## Lab 3

> To start fresh at lab3, you can checkout the lab3-start branch in git

### Update Nest Missions Service to add Create, Update, and Delete Methods

Add the create, update, and delete methods to the **server** `MissionService` class:

<!-- gsr-nest-missions-service-createupdatedelete -->

`src/server/app/missions/missions.service.ts`

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

<copy-button></copy-button>

The `createMission` and `deleteMission` methods are straightforward, just passing through to the mission repository. The `updateMission` method, however, is making sure we preserve the original `createdAt` and `createdBy` values that were originally on the mission. This code is an example of the type of logic that could go into a service class.

### Update Nest Missions Controller to add Post and PUT Methods

Add the following methods to the `MissionsController`:

<!--- gsr-nest-missions-controller-createupdatedelete --->

`src/server/app/missions/missions.controller.ts`

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

<copy-button></copy-button>

These new methods each use a new decorator (`@Post`, `@Put`, and `@Delete`) to let Nest know which HTTP method each route handler should respond to.

In the params to both the create and update methods, we use the `@Body` decorator to indicate we want to populate the `mission` object from the request body. We don't need to set up anything additional (like add a body parser), as Nest takes care of this for us.

Additionally, since we are still using the `DataPipe` that we set up earlier, `mission` is automatically converted to a MissionEntity class when coming into our route handlers. This conversion is important right now because we set some default values for the `createdAt` and `createdBy` properties wouldn't be set unless this was an actual instance of `MemberEntity`.

Now that our API supports the remaining create, update, and delete methods, let's add it to our Ionic app.

### Update Angular Missions Service for Create, Update, and Delete methods

Update the **client** `MissionsService` class with the remaining methods:

<!-- gsr-ng-missions-service-createupdatedelete -->

`src/client/app/services/missions.service.ts`

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

<copy-button></copy-button>

The new methods above follow the same pattern as before, except now we are using the `catchError` operator from RXJS to capture any HTTP errors that come back from the API. 

With the service methods taken care of, let's look at updating the mission form next.

### Updating Mission Form to Support Create and Edit

When the user submits the form on the mission form screen, its setup to call the `submit` method in `MissionFormComponent`. Update that class with the following `sumbit` method:

<!-- gsr-ng-mission-form-component-submit -->

`src/client/app/mission-form/mission-form.component.ts`

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

<copy-button></copy-button>

First, we take a look to see if this is a new mission or an existing one by checking to see if the mission has an id, then we call the appropriate service method based on this check. Next, we subscribe to the call so we can dismiss the modal when it is complete. We also save a reference to the subscription so we can make sure to unsubscribe from it when the call is done, which helps prevent any potential memory leaks.

### Showing New Mission Modal

The last thing we need to do is hook up the add a button to open up the mission form modal. In `home.page.html`, there is a button in the Ionic header to create new missions, and it is set up to call `newMission()` when clicked like so:

```html
<ion-button (click)="newMission()"><ion-icon name="add"></ion-icon></ion-button>
```

Update the `newMission` method to the class in `home.page.ts`:

<!-- gsr-ng-home-page-newmission -->

`src/client/app/home/home.page.ts`

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

<copy-button></copy-button>

### Deleting Missions

When the `MissionForm` modal loads an existing mission, a row displays above the form showing the mission's ID and a delete icon. Next, we enable the delete icon to allow a user to delete missions.

There is a click handler to the "trash" icon in `mission-form.component.html`:

```html
<ion-icon name="trash" (click)="delete(mission)" color="danger" slot="end"></ion-icon>
```

In `MissionFormComponent`, update the delete method:

<!-- gsr-ng-mission-form-component-delete -->

`src/client/app/mission-form/mission-form.component.ts`

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

<copy-button></copy-button>

Now, you can delete missions, and a confirmation alert box will ask you to confirm the deletion.

With all that now in place, we should have a fully functioning app for our space rangers to create, read, update, and delete (CRUD) missions. 

When we submit an invalid form (like when a title or reward is missing), we get back a server error that is not too helpful. Next, we will see how to put proper validation in place in our API to make sure the models are valid before we even send them to the database.

### Validation

We can now create and update missions, but if we try to submit an incomplete mission, we get a server error that's not entirely helpful. We will see how to use the `class-validator` library to help provide validation for our MissionEntity, and how to return back a proper 400 Bad Request error when a validation error occurs.

Class validator offers up many validators that can be applied to members of classes through decorators. We will use a few here to make sure that when an instance of `MissionEntity` is passed in, that there is a value and that the value type is correct.

### Add Nest Validators to MissionEntity

Open up `MissionEntity` and add some validation decorators to the class:

`src/server/app/data/mission.entity.ts`

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

<copy-button></copy-button>

> The IsDefined, IsString, IsNotEmpty, IsNumber, and IsBoolean validators are imported from `class-validator`;

Nest Pipes (that we used earlier to convert types on the way in) are also good at validation. In fact, Nest includes a ValidationPipe that utilizes `class-validator` out of the box. Instead of creating our own validation pipe, we us the built in one. Its already setup in the servers 'AppModule' for us:

```typescript
{
  provide: APP_PIPE,
  useClass: ValidationPipe,
}
```

> `ValidationPipe` is imported from '@nestjs/common`.

Now that you have validation decorators on `MissionEntity`, the Nest `ValidationPipe` will return a bad request error with a list of the messages that caused the error. Next, we will parse those errors on the client and display a better error dialog to the user.

### Update Angular Mission Service to Process Validation Errors

When a user tries to create or update a mission and does not provide a title or reward, the API will now throw a bad request status. We need to parse that error response in the service.

In the **client** `MissionService` add a `handleError` method that the HTTP responses can use to parse the validation error into a single string:

<!-- gsr-ng-missions-service-handleerror -->

`src/client/app/services/missions.service.ts`

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

<copy-button></copy-button>

Then update the create, update, and delete methods to use `handleError` in the promises catch handler:

```typescript
createMission(mission: Mission) {
  return this.httpClient
    .post<Mission>(`http://localhost:3000/missions`, mission)
    .toPromise().catch(this.handleError);
}
```

<copy-button></copy-button>

> Make sure to update `updateMission` and `deleteMission` as well.

Now, when you submit an invalid form, you get a proper 400 Bad Request error response. In this example, we loop through the error objects and construct a string showing all the validation issues, but you could do a lot more with it. The errors contain the validation rule that caused the error and the property for which the validation was applied to, so you could go fancier in showing the errors than a simple alert modal.

### Lab 3 Bonus Exercise

Explore some of the other class validator decorators to add more validation logic to the `MissionEntity` class. For instance, try the `@Min` decorator on `reward` to make the minimum value of reward be greater than or equal to 0. View a list of the available decorators [here](https://github.com/typestack/class-validator#validation-decorators).

## Lab 4

> To start fresh at lab4, you can checkout the lab4-start branch in git

### Authentication

Now, let's see how we can use Authentication in Nest and protect our API endpoints. We make sure that when someone calls one of our protected endpoints that they provide a token that proves who they are. For this sample app, the tokens are contrived values that we manually set, but in a real-world application these would be obtained through some identity (login) system.

Nest provides a mechanism called Guards that function similar to route guards in Angular. A guard is a piece of middleware that runs before a controller gets access to the request (similar to an interceptor) and returns a boolean value that when true lets the request through, or if false, throws a 403 Forbidden response error. In the guard, we inspect the value of the token to help determine if they should be let through or not.

We will also set up a simple role system that contains two roles, users and admins, and only allow these roles to do specific actions:

 - `GET` requests will be open to everyone with no authentication required.
 - `POST` and `PUT` requests will require a user or admin role.
 - `DELETE` requests will require the admin role.

### Nest Roles Decorator 

In our base project, we have a `Roles` decorator that we can use on our controller methods to specify which roles we want the upcoming auth guard to check. 

The decorator was created with the Nest CLI, and out of the box does everything we need it to do.

To specify which roles we want a route handler to check for access, we use `@Roles('...')` on each of the controller's methods. In `MissionsController` add `@Roles` and specify the role to the following methods:

`src/server/app/missions/missions.controller.ts`

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

### Nest Guards

Open the **server** `AuthGuard` file, and replace the class's `canActivate` method with the following:

<!-- gsr-nest-auth-guard-canactivate -->

`src/server/app/util/auth.guard.ts`

```typescript
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  let token: string;
  let user: User;

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer ')
  ) {
    token = request.headers.authorization.split(' ')[1];
    user = this.userService.getUser(token.replace('-token', ''));
    if (!user) {
      return false;
    }
    request.user = user;
  }

  const requiredRoles =
    this.reflector.get<string[]>('roles', context.getHandler()) || [];

  if (requiredRoles.length === 0) {
    return true;
  } else if (!user) {
    return false;
  }

  const hasRole = user.roles.some(role => requiredRoles.indexOf(role) > -1);
  return hasRole;
}
```

<copy-button></copy-button>

Let's break the above code down. 

First, we check to see if there is an Authorization header, and if there is, we pull the token out of the header and then retrieve the user from the provided users service. If a user is not found, the request is rejected.

Next, we try to pull the list of roles applied to the request handler by checking for a decorator names "roles", and put those roles into the `requiredRoles` variable. If the method doesn't have the decorator, it returns undefined, so we make sure to set `requiredRoles` to an empty array in that case. If we do have a user, we attach it to the request object so we can access it at a later point in the HTTP request (which we will do in the next section).

If requiredRoles is empty, authentication is not required for this call, so we return true.

Last, we make sure the user has a role that the API call requires.

This guard is already registered with the **server's** `AppModule` providers, but here is how it's done for your reference:

```typescript
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

If you try to use the app now, you see that you can view the list of missions and go to a mission's details, but you can't create, edit, or delete them.

The menu button in the top left lets you "login" as a user or admin, and it keeps track of your choice in local storage. However, we don't currently send the Bearer token in the HTTP request. We will do that next.

### Angular HTTP Interceptor

In Angular, HTTP Interceptors adds a piece of middleware that will let you modify the outgoing request. Interceptors are a perfect place to add the authorization header if our user is authenticated.

Open the **client** `AuthInterceptor` class and update the `intercept` method to:

<!-- gsr-ng-auth-interceptor-intercept --->

`src/client/app/util/auth.interceptor.ts`

```typescript
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
```

<copy-button></copy-button>

Interceptors are a simple class that implements an `intercept` method. In our `intercept`, we check to make sure if the user is currently "logged in" (by seeing if they have an auth-token value in local storage, which is set by the login screen). If not, the request goes through without any modification. If there is an auth-token, we clone the original request (because requests are immutable, we need a new copy to make changes to it) and add an `Authorization` header with the auth-token for its value.

The interceptor is already registered in our Angular apps main app module providers:

```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

With the authentication in place, depending on if you log in as a user or admin, you can continue adding, editing, and deleting missions.

### Accessing the Authenticated User in the Nest 

Now that we have authentication in place, how do we access the authenticated user? 

In the `AuthGuard`, we attached the user to the request object. Nest does provide a way to get the request object in controllers by using the `Request()` decorator. We could use this method in our POST handler to get the user and set the correct `createdBy`  property for the new mission:

```typescript
@Roles('user')
@Post()
async createMission(@Body() mission: MissionEntity, @Request() req: any) {
  const user: User = req.user;
  mission.createdBy = user.id;
  return this.missionsService.createMission(mission);
}
```

And while this works, it is not very clean introduces the possibility of having to repeat this code everywhere we want to get the user.

Nest comes to the rescue again by providing the ability to make custom param decorators that have access to the request.

Open the `GetUser` decorator and update the exported function with the following:

<!-- gsr-nest-getuser-decorator-getuser -->

`src/server/app/util/getuser.decorator.ts`

```typescript
export const GetUser = createParamDecorator((data, req) => {
  return req.user;
});
```

<copy-button></copy-button>

The `createParamDecorator` helper method provided by Nest takes care of all the hard work and gives you direct access to the request object. Here, we simply return the user from the request.

Now, we can update the createMission method to use the new `GetUser` decorator:

```typescript
@Roles('user')
@Post()
async createMission(@Body() mission: MissionEntity, @GetUser() user: User) {
  mission.createdBy = user.id;
  return this.missionsService.createMission(mission);
}
```

The `GetUser` decorator will automatically populate the user param, helps clean up the code and gives a reusable way to retrieve users in other handlers.

## Conclusion

We now have a fully functioning app where we can view lists of missions, see mission details, edit the missions, delete them, and even create a new one. Our space rangers are ready to get to work!

In this tutorial, we used Nest to build out a backend API and saw how it utilizes TypeScript to provide features otherwise impossible in a typical Node app.

On the front end, we have an Angular App powered by the Ionic Framework to build a mobile-first experience for the space rangers.

Together, they made a powerful duo to build out a full-stack TypeScript app. 