# NestJS for NG Devs WS Steps

## Lab 1

Create Service: `nest g service missions`

Mission service: `gsr-nest-missions-service`

Create Controller: `nest g controller missions`

Mission Controller: `gsr-nest-missions-controller`

Add `@Exclude()` to createdAt and createdBy to MissionEntity

Show how to use classToPlain in the controller get method

Create Interceptor: `nest g interceptor util/data`

Data Interceptor: `gsr-nest-data-interceptor`

Add interceptor to module providers:
```
{
  provide: APP_INTERCEPTOR,
  useClass: DataInterceptor,
}
```

Mission Model: `gsr-mission-model`

Create NG Service: `npx ionic g service services/missions`

NG Mission Service: `gsr-ng-missions-service`

Home Page TS: `gsr-ng-homepage-ts`

Home Page HTML: `gsr-ng-homepage-template`

Show app

## Lab 2

Update Nest Mission Service GET method: `gsr-nest-missions-service-get`

Update Nest Mission Controller GET method: `gsr-nest-missions-controller-get`

Show nothing comes back in request

Create Nest Data Pipe: `nest g pipe util/data`

Data Pipe: `gsr-nest-data-pipe`

Add data pipe to modules imports:
```typescript
{
  provide: APP_PIPE,
  useClass: DataPipe
}
```

Update NG Mission Service GET method: `gsr-ng-missions-service-getbyid`

Create NG Mission Form: `npx ionic g component MissionForm`

Add Form to home module:
```typescript
  entryComponents: [MissionFormComponent],
  declarations: [HomePage, MissionFormComponent]
```

Mission Form TS: `gsr-ng-missionform-ts`

Mission Form HTML: `gsr-ng-missionform-template`

Home Page TS openMission: `gsr-ng-homepage-openMission`
- inject modalController

Home Page HTML Add click handler to `<ion-item>`: `(click)="openMission(mission.id)"`

## Lab 3

Update Nest Mission Service CUD methods: `gsr-nest-missions-service-createupdatedelete`

Update Nest Mission Controller CUD methods: `gsr-nest-missions-controller-createupdatedelete`

Update NG Mission Service CUD methods: `gsr-ng-missions-service-createupdatedelete`

Update NG Mission Form submit method: `gsr-ng-missionform-submit-method`
- inject alertController

Home Page HTML Add click handler to new button: `(click)="newMission()"`

Update Home Page TS newMission: `gsr-ng-homepage-newmission`

Demo

NG Mission Form add click handler to trash icon: `(click)="delete(mission)"`

Update NG Mission Form delete method: `gsr-ng-missionform-delete`

Demo

## Lab 4

Add Validators to mission entity: `@IsDefined() @IsString() @IsNotEmpty() @IsNumber() @IsBoolean()`

Add to nest app module providers:
```typescript
{
  provide: APP_PIPE,
  useClass: ValidationPipe,
}
```

Update NG Missions Service handleError method: `gsr-ng-missions-service-handleerror`

Update NG Missions CUD methods to use handleError: `.toPromise().catch(this.handleError);`

Demo

Create Nest Roles Decorator: `nest g decorator util/roles`

Add Roles to controller methods: `@Roles('user')` to POST and PUT,  `@Roles('admin')` to DELETE

Create Nest Auth Guard: `nest g guard util/auth`

Nest Auth Guard: `gsr-nest-authguard`

Add to nest app module providers:
```typescript
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

Create file at src/client/app/util/auth.interceptor.ts

NG Auth Interceptor: `gsr-ng-auth-interceptor`

Add to ng app module providers:
```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

Demo
