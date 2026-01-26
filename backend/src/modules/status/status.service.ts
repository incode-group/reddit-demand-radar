import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface RequestStatus {
  id: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  message: string;
  progress: number;
  subreddits: string[];
  keywords: string[];
  results?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(private prisma: PrismaService) {}

  async createRequest(
    subreddits: string[],
    keywords: string[],
  ): Promise<RequestStatus> {
    const request = await this.prisma.requestStatus.create({
      data: {
        status: "pending",
        message: "Request created",
        progress: 0,
        subreddits: JSON.stringify(subreddits),
        keywords: JSON.stringify(keywords),
      },
    });

    this.logger.log(
      `Created request ${request.id} for subreddits: [${subreddits.join(", ")}]`,
    );

    return this.mapToRequestStatus(request);
  }

  async updateStatus(
    requestId: string,
    status: RequestStatus["status"],
    message: string,
    progress: number,
  ): Promise<RequestStatus> {
    const request = await this.prisma.requestStatus.update({
      where: { id: requestId },
      data: {
        status,
        message,
        progress,
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Updated request ${requestId} status: ${status} (${progress}%) - ${message}`,
    );

    return this.mapToRequestStatus(request);
  }

  async markCompleted(requestId: string, results: any): Promise<RequestStatus> {
    const request = await this.prisma.requestStatus.update({
      where: { id: requestId },
      data: {
        status: "completed",
        message: "Analysis completed successfully",
        progress: 100,
        results: JSON.stringify(results),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Completed request ${requestId}`);

    return this.mapToRequestStatus(request);
  }

  async markFailed(requestId: string, error: string): Promise<RequestStatus> {
    const request = await this.prisma.requestStatus.update({
      where: { id: requestId },
      data: {
        status: "failed",
        message: "Analysis failed",
        progress: 0,
        error,
        updatedAt: new Date(),
      },
    });

    this.logger.error(`Failed request ${requestId}: ${error}`);

    return this.mapToRequestStatus(request);
  }

  async getRequestStatus(requestId: string): Promise<RequestStatus | null> {
    const request = await this.prisma.requestStatus.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return null;
    }

    return this.mapToRequestStatus(request);
  }

  async listRecentRequests(limit: number = 10): Promise<RequestStatus[]> {
    const requests = await this.prisma.requestStatus.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return requests.map((request) => this.mapToRequestStatus(request));
  }

  private mapToRequestStatus(dbRequest: any): RequestStatus {
    return {
      id: dbRequest.id,
      status: dbRequest.status,
      message: dbRequest.message,
      progress: dbRequest.progress,
      subreddits: JSON.parse(dbRequest.subreddits),
      keywords: JSON.parse(dbRequest.keywords),
      results: dbRequest.results ? JSON.parse(dbRequest.results) : undefined,
      error: dbRequest.error,
      createdAt: dbRequest.createdAt,
      updatedAt: dbRequest.updatedAt,
    };
  }
}
