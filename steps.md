# NestJS for NG Devs WS Steps

## Setup

- Delete db.json
- Start off clean master
- Start timers, have timer app ready

## Lab 1 – 12:55 (15 mins)

### Create

- Nest Mission service getMissions: `gsr-nest-missions-service-getMissions`

	```typescript
	getMissions() {
	  return this.missionsRepository.getList();
	}
	```

- Nest Mission Controller getMissions: `gsr-nest-missions-controller-getMissions`

	```typescript
	@Get()
	async getMissions() {
	  return this.missionsService.getMissions();
	}
	```

- Add `@Exclude()` to createdAt and createdBy to MissionEntity

- Show how to use classToPlain in the controller get method

### Interceptor

- Nest Data Interceptor: `‌gsr-nest-data-interceptor-intercept`

	``` code omitted ```

	- Show ways to include interceptor

- Show Mission Model

- NG Mission Service getMissions: `gsr-ng-missions-service-getmissions`

	```typescript
	getMissions() {
	  return this.httpClient
	    .get<{ data: Mission[] }>('http://localhost:3000/missions')
	    .pipe(map(response => response.data));
	}
	```

- NG Home Page ngOnInit: `gsr-ng-missions-controller-oninit`

	```typescript
	ngOnInit() {
	  this.missions = this.missionsService.getMissions();
	}
	```

	-	Show homepage template

- Show app

## Lab 2 – 1:20 (15 mins)

### Get Single

- Nest Mission Service getMission: `gsr-nest-missions-service-getmission`

	```typescript
	getMission(id: number) {
	  return this.missionsRepository.get(id);
	}
	```

- Nest Mission Controller getMission: `gsr-nest-missions-controller-getmission`

	```typescript
	@Get(':id')
	async getMission(@Param('id') id: number) {
	  return this.missionsService.getMission(id);
	}
	```

	- Show nothing comes back in request

### Nest Pipe

- Nest Data Pipe transform: `gsr-nest-data-pipe-transform`

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

	- Show pipe is already in providers

### NG Mission getSingle

- NG Mission Service getMissionById: `gsr-ng-missions-service-getmissionbyid`

	```typescript
	getMissionById(id: number) {
	  return this.httpClient
	    .get<{data: Mission}>(`http://localhost:3000/missions/${id}`)
	    .pipe(map(response => response.data));
	}
	```

- NG Mission Form ngOnInit: `gsr-ng-missionform-component-ngoninit`

	``` code omitted ```
	
	- Show Mission Form HTML

- NG Home Page openMission: `gsr-ng-home-page-openmission`

	``` code omitted ```

 - Show `<ion-item>` click handler in html

## Lab 3 – 1:45 (15 mins)

### Create/Update/Delete

- Nest Mission Service CUD methods: `‌gsr-nest-missions-service-createupdatedelete`

	``` code omitted ```

- Nest Mission Controller CUD methods: `gsr-nest-missions-controller-createupdatedelete`

	``` code omitted ```

- NG Mission Service CUD methods: `gsr-ng-missions-service-createupdatedelete`

	``` code omitted ```
	
- NG Mission Form submit: ` gsr-ng-mission-form-component-submit`

	``` code omitted ```

- NG Home Page newMission: `gsr-ng-home-page-newmission`

	``` code omitted ```
	
	- Show button click handler in html

### Delete 

- NG Mission Form delete: `gsr-ng-mission-form-component-delete`

	``` code omitted ```

- Demo

### Validation
 
- Nest Mission Entity validators `IsDefined`, `IsString`, `IsNotEmpty`, `IsNumber`, `IsBoolean`

	``` code omitted ```

- NG Missions Service handleError: `gsr-ng-missions-service-handleerror`

	``` code omitted ```

	- Update NG Missions CUD methods to use handleError: `.toPromise().catch(this.handleError);`

- Demo

## Lab 4 - 2:10 (15 mins)

### Authentication

- Add `@Roles('user') to Post and Put, and `@Roles('admin')` to Delete
- Nest AuthGuard canActivate: `gsr-nest-auth-guard-canactivate`

	``` code omitted ```
	
	- Show it registered in providers

### HTTP Interceptor

- NG AuthInterceptor intercept: `gsr-ng-auth-interceptor-intercept`

	``` code omitted ```
	
	- Show registered in providers

### GetUser Decorator

- Show how we could get access to user from request:

	```typescript
	@Roles('user')
	@Post()
	async createMission(@Body() mission: MissionEntity, @Request() req: any) {
	  const user: User = req.user;
	  mission.createdBy = user.id;
	  return this.missionsService.createMission(mission);
	}
	```
	
- Nest GetUserDecorator getUser `gsr-nest-getuser-decorator-getuser`

	```typescript
	export const GetUser = createParamDecorator((data, req) => {
	  return req.user;
	});
	```
	
