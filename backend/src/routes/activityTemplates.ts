import { ActivityTemplateController } from '../controllers/activityTemplateController';
import { logTemplate } from '../utils/logger';

export const activityTemplateRoutes = [
  'GET /activity-templates requireAuth',
  'POST /activity-templates requireAuth audit',
  'PATCH /activity-templates/:id requireAuth audit',
  'DELETE /activity-templates/:id requireAuth audit'
];

logTemplate('info', 'ACTIVITY_TEMPLATE_ROUTES_REGISTERED');
export const activityTemplateRouteControllers = [ActivityTemplateController];
