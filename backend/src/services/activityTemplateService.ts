import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityCategory } from '../constants/activity';
import { ErrorCodes } from '../constants/errorCodes';
import { Messages } from '../constants/messages';
import { ActivityTemplate } from '../models/activityTemplate';
import { AppError } from '../utils/AppError';
import { logTemplate } from '../utils/logger';

export interface ActivityTemplateInput {
  name: string;
  category: ActivityCategory;
  subType: string;
  unit: string;
  note?: string;
}

@Injectable()
export class ActivityTemplateService {
  constructor(
    @InjectRepository(ActivityTemplate) private readonly templateRepo: Repository<ActivityTemplate>
  ) {}

  async list(userId: number) {
    logTemplate('info', 'TEMPLATE_LIST_START', { userId });
    return this.templateRepo.find({
      where: { userId },
      order: { createdAt: 'DESC', id: 'DESC' }
    });
  }

  async create(userId: number, input: ActivityTemplateInput) {
    logTemplate('info', 'TEMPLATE_CREATE_START', { userId, name: input.name });
    if (!Object.values(ActivityCategory).includes(input.category)) {
      logTemplate('warn', 'TEMPLATE_CREATE_FAILED', { id: 0, field: 'ActivityTemplate.category', reason: 'invalid enum' });
      throw new AppError(ErrorCodes.ACTIVITY_CATEGORY_INVALID, `ActivityTemplate[id=0] create failed: category invalid`);
    }
    const existing = await this.templateRepo.findOne({ where: { userId, name: input.name } });
    if (existing) {
      logTemplate('warn', 'TEMPLATE_CREATE_FAILED', { id: 0, field: 'ActivityTemplate.name', reason: 'duplicate name' });
      throw new AppError(ErrorCodes.VALIDATION_FAILED, `ActivityTemplate[id=0] create failed: name already exists`);
    }
    const template = this.templateRepo.create({
      userId,
      name: input.name,
      category: input.category,
      subType: input.subType,
      unit: input.unit,
      note: input.note || null
    });
    const saved = await this.templateRepo.save(template);
    logTemplate('info', 'TEMPLATE_CREATE_SUCCESS', { id: saved.id });
    return { message: Messages.TEMPLATE_CREATED, template: saved };
  }

  async update(userId: number, id: number, input: Partial<ActivityTemplateInput>) {
    logTemplate('info', 'TEMPLATE_UPDATE_START', { id, fields: Object.keys(input).join(',') });
    const template = await this.templateRepo.findOne({ where: { id, userId } });
    if (!template) {
      logTemplate('warn', 'TEMPLATE_UPDATE_FAILED', { id, field: 'ActivityTemplate.id', reason: 'not found' });
      throw new AppError(ErrorCodes.TEMPLATE_NOT_FOUND, `ActivityTemplate[id=${id}] update failed: id not found`, HttpStatus.NOT_FOUND);
    }
    if (input.name && input.name !== template.name) {
      const existing = await this.templateRepo.findOne({ where: { userId, name: input.name } });
      if (existing) {
        logTemplate('warn', 'TEMPLATE_UPDATE_FAILED', { id, field: 'ActivityTemplate.name', reason: 'duplicate name' });
        throw new AppError(ErrorCodes.VALIDATION_FAILED, `ActivityTemplate[id=${id}] update failed: name already exists`);
      }
    }
    if (input.category && !Object.values(ActivityCategory).includes(input.category)) {
      logTemplate('warn', 'TEMPLATE_UPDATE_FAILED', { id, field: 'ActivityTemplate.category', reason: 'invalid enum' });
      throw new AppError(ErrorCodes.ACTIVITY_CATEGORY_INVALID, `ActivityTemplate[id=${id}] update failed: category invalid`);
    }
    Object.assign(template, input);
    const saved = await this.templateRepo.save(template);
    logTemplate('info', 'TEMPLATE_UPDATE_SUCCESS', { id: saved.id });
    return { message: Messages.TEMPLATE_UPDATED, template: saved };
  }

  async remove(userId: number, id: number) {
    const template = await this.templateRepo.findOne({ where: { id, userId } });
    if (!template) {
      throw new AppError(ErrorCodes.TEMPLATE_NOT_FOUND, `ActivityTemplate[id=${id}] delete failed: id not found`, HttpStatus.NOT_FOUND);
    }
    await this.templateRepo.remove(template);
    logTemplate('info', 'TEMPLATE_DELETE_SUCCESS', { id });
    return { message: Messages.TEMPLATE_DELETED };
  }
}
