import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ErrorCodes } from '../constants/errorCodes';
import { RequireAuth } from '../middlewares/auth';
import { ActivityTemplateInput, ActivityTemplateService } from '../services/activityTemplateService';
import { AppError } from '../utils/AppError';
import { logTemplate } from '../utils/logger';

@Controller('activity-templates')
@UseGuards(RequireAuth)
export class ActivityTemplateController {
  constructor(private readonly templateService: ActivityTemplateService) {}

  @Get()
  list(@Req() request: Request) {
    return this.templateService.list(request.user!.id);
  }

  @Post()
  async create(@Req() request: Request, @Body() body: ActivityTemplateInput) {
    request.auditEntity = 'ActivityTemplate';
    request.auditAction = 'ActivityTemplate create';
    try {
      return await this.templateService.create(request.user!.id, body);
    } catch (error: any) {
      logTemplate('error', 'TEMPLATE_CREATE_FAILED', { id: 0, field: 'ActivityTemplate.name', reason: error.message });
      throw new AppError(error.code || ErrorCodes.VALIDATION_FAILED, `ActivityTemplate[id=0] controller create failed: ${error.message}`, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  async update(@Req() request: Request, @Param('id') id: string, @Body() body: Partial<ActivityTemplateInput>) {
    request.auditEntity = 'ActivityTemplate';
    request.auditEntityId = Number(id);
    request.auditAction = 'ActivityTemplate update';
    try {
      return await this.templateService.update(request.user!.id, Number(id), body);
    } catch (error: any) {
      logTemplate('error', 'TEMPLATE_UPDATE_FAILED', { id, field: 'ActivityTemplate.id', reason: error.message });
      throw new AppError(error.code || ErrorCodes.DATABASE_FAILED, `ActivityTemplate[id=${id}] controller update failed: ${error.message}`, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') id: string) {
    request.auditEntity = 'ActivityTemplate';
    request.auditEntityId = Number(id);
    request.auditAction = 'ActivityTemplate delete';
    return this.templateService.remove(request.user!.id, Number(id));
  }
}
