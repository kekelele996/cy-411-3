import { create } from 'zustand';
import {
  fetchActivityTemplates,
  createActivityTemplate,
  updateActivityTemplate,
  deleteActivityTemplate,
  ActivityTemplatePayload
} from '../api/activityTemplate';
import { ActivityTemplate } from '../types/entities';

interface ActivityTemplateStore {
  templates: ActivityTemplate[];
  loading: boolean;
  load: () => Promise<void>;
  add: (payload: ActivityTemplatePayload) => Promise<void>;
  update: (id: number, payload: Partial<ActivityTemplatePayload>) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useActivityTemplateStore = create<ActivityTemplateStore>((set, get) => ({
  templates: [],
  loading: false,
  async load() {
    set({ loading: true });
    const templates = await fetchActivityTemplates();
    set({ templates, loading: false });
  },
  async add(payload) {
    await createActivityTemplate(payload);
    await get().load();
  },
  async update(id, payload) {
    await updateActivityTemplate(id, payload);
    await get().load();
  },
  async remove(id) {
    await deleteActivityTemplate(id);
    await get().load();
  }
}));
