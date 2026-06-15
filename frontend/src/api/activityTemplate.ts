import { ActivityCategory } from '../constants/activity';
import { ActivityTemplate } from '../types/entities';
import { request } from '../utils/request';

export interface ActivityTemplatePayload {
  name: string;
  category: ActivityCategory;
  subType: string;
  unit: string;
  note?: string;
}

export function fetchActivityTemplates(): Promise<ActivityTemplate[]> {
  return request.get('/activity-templates');
}

export function createActivityTemplate(payload: ActivityTemplatePayload): Promise<{ template: ActivityTemplate }> {
  return request.post('/activity-templates', payload);
}

export function updateActivityTemplate(id: number, payload: Partial<ActivityTemplatePayload>): Promise<{ template: ActivityTemplate }> {
  return request.patch(`/activity-templates/${id}`, payload);
}

export function deleteActivityTemplate(id: number): Promise<{ message: string }> {
  return request.delete(`/activity-templates/${id}`);
}
