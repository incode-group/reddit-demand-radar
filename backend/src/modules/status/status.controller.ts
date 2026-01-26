import { Controller, Get, Param } from "@nestjs/common";
import { StatusService, RequestStatus } from "./status.service";

@Controller("status")
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get(":id")
  async getStatus(
    @Param("id") requestId: string,
  ): Promise<RequestStatus | null> {
    return this.statusService.getRequestStatus(requestId);
  }

  @Get()
  async listRecent(): Promise<RequestStatus[]> {
    return this.statusService.listRecentRequests(20);
  }
}
