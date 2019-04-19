export class MissionsController {

  constructor(private missionsService: MissionsService) {}

  @Get()
  async getMissions() {
    return this.missionsService.getMissions();
  }
}