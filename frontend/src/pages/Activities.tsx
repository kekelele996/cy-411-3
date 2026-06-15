import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Pagination, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ActivityCard } from '../components/common/ActivityCard';
import { EmptyState } from '../components/common/EmptyState';
import { ActivityCategory, ACTIVITY_CATEGORY_LABELS } from '../constants/activity';
import { useActivityStore } from '../stores/activityStore';
import { useActivityTemplateStore } from '../stores/activityTemplateStore';
import { useAuth } from '../hooks/useAuth';
import { usePagination } from '../hooks/usePagination';
import { Messages } from '../constants/messages';
import { ActivityTemplate } from '../types/entities';
import { ActivityTemplatePayload } from '../api/activityTemplate';

export function Activities() {
  const [open, setOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [category, setCategory] = useState<ActivityCategory | undefined>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null);
  const [templateForm] = Form.useForm<ActivityTemplatePayload>();
  const [form] = Form.useForm();

  const rows = useActivityStore((state) => state.rows);
  const load = useActivityStore((state) => state.load);
  const add = useActivityStore((state) => state.add);

  const templates = useActivityTemplateStore((state) => state.templates);
  const loadTemplates = useActivityTemplateStore((state) => state.load);
  const addTemplate = useActivityTemplateStore((state) => state.add);
  const updateTemplate = useActivityTemplateStore((state) => state.update);
  const removeTemplate = useActivityTemplateStore((state) => state.remove);

  const { token } = useAuth();
  const filtered = useMemo(() => (category ? rows.filter((row) => row.category === category) : rows), [rows, category]);
  const pagination = usePagination(filtered, 5);

  useEffect(() => {
    if (!token) return;
    void load();
    void loadTemplates();
  }, [load, loadTemplates, token]);

  const handleTemplateSelect = (templateId: number | undefined) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        form.setFieldsValue({
          category: template.category,
          subType: template.subType,
          unit: template.unit,
          note: template.note || undefined
        });
        message.success(Messages.FRONTEND_TEMPLATE_APPLIED);
      }
    }
  };

  const handleSaveAsTemplate = async () => {
    const values = await form.validateFields(['category', 'subType', 'unit', 'note']);
    setEditingTemplate(null);
    templateForm.setFieldsValue({
      name: '',
      category: values.category,
      subType: values.subType,
      unit: values.unit,
      note: values.note
    });
    setTemplateModalOpen(true);
  };

  const handleEditTemplate = (template: ActivityTemplate) => {
    setEditingTemplate(template);
    templateForm.setFieldsValue({
      name: template.name,
      category: template.category,
      subType: template.subType,
      unit: template.unit,
      note: template.note || undefined
    });
    setTemplateModalOpen(true);
  };

  const handleTemplateModalOk = async () => {
    try {
      const values = await templateForm.validateFields();
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, values);
        message.success(Messages.FRONTEND_TEMPLATE_UPDATED);
      } else {
        await addTemplate(values);
        message.success(Messages.FRONTEND_TEMPLATE_SAVED);
      }
      setTemplateModalOpen(false);
      setEditingTemplate(null);
      templateForm.resetFields();
    } catch {
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    await removeTemplate(id);
    message.success(Messages.FRONTEND_TEMPLATE_DELETED);
  };

  const templateOptions = useMemo(() => templates.map((t) => ({
    value: t.id,
    label: `${t.name} (${ACTIVITY_CATEGORY_LABELS[t.category]})`
  })), [templates]);

  const templateTableColumns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (value: ActivityCategory) => ACTIVITY_CATEGORY_LABELS[value]
    },
    {
      title: '子类型',
      dataIndex: 'subType',
      key: 'subType'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      render: (value: string | null) => value || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ActivityTemplate) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditTemplate(record)}>编辑</Button>
          <Popconfirm title="确定删除这个模板吗？" onConfirm={() => handleDeleteTemplate(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <div>
          <Typography.Title level={2}>活动记录</Typography.Title>
          <Typography.Text type="secondary">按分类筛选日常碳排活动。</Typography.Text>
        </div>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setTemplateModalOpen(true)}>管理模板</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setOpen(true); setSelectedTemplateId(undefined); }}>新增活动</Button>
        </Space>
      </Space>
      <Select
        allowClear
        placeholder="按分类筛选"
        value={category}
        onChange={setCategory}
        style={{ width: 220 }}
        options={Object.values(ActivityCategory).map((value) => ({ value, label: ACTIVITY_CATEGORY_LABELS[value] }))}
      />
      <div className="card-grid">
        {pagination.currentRows.length ? pagination.currentRows.map((activity) => <ActivityCard key={activity.id} activity={activity} />) : <EmptyState text="暂无活动记录" />}
      </div>
      <Pagination current={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={(page, size) => { pagination.setPage(page); pagination.setPageSize(size); }} />
      <Modal title="新增活动" open={open} onCancel={() => { setOpen(false); setSelectedTemplateId(undefined); form.resetFields(); }} footer={null} destroyOnClose width={600}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ category: ActivityCategory.TRANSPORT, subType: 'metro', unit: 'km', recordDate: dayjs() }}
          onFinish={async (values) => {
            await add({ ...values, recordDate: values.recordDate.format('YYYY-MM-DD') });
            message.success(Messages.FRONTEND_ACTIVITY_SAVED);
            setOpen(false);
            setSelectedTemplateId(undefined);
          }}
        >
          <Form.Item label="选择模板（可选）">
            <Select
              allowClear
              placeholder="选择一个常用模板快速填充"
              value={selectedTemplateId}
              onChange={handleTemplateSelect}
              options={templateOptions}
            />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select options={Object.values(ActivityCategory).map((value) => ({ value, label: ACTIVITY_CATEGORY_LABELS[value] }))} />
          </Form.Item>
          <Form.Item name="subType" label="子类型" rules={[{ required: true }]}>
            <Input placeholder="metro / electricity / beef-meal / parcel" />
          </Form.Item>
          <Form.Item name="amount" label="数量" rules={[{ required: true }]}>
            <InputNumber min={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="recordDate" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input />
          </Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button icon={<SaveOutlined />} onClick={handleSaveAsTemplate}>保存为模板</Button>
            <Button type="primary" htmlType="submit">保存</Button>
          </Space>
        </Form>
      </Modal>
      <Modal
        title={editingTemplate ? '编辑模板' : '管理模板'}
        open={templateModalOpen}
        onCancel={() => { setTemplateModalOpen(false); setEditingTemplate(null); templateForm.resetFields(); }}
        onOk={handleTemplateModalOk}
        okText={editingTemplate ? '保存修改' : '添加模板'}
        destroyOnClose
        width={800}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Title level={5}>添加/编辑模板</Typography.Title>
          <Form form={templateForm} layout="vertical">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
                <Input placeholder="例如：日常通勤-地铁" maxLength={64} />
              </Form.Item>
              <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                <Select options={Object.values(ActivityCategory).map((value) => ({ value, label: ACTIVITY_CATEGORY_LABELS[value] }))} />
              </Form.Item>
              <Form.Item name="subType" label="子类型" rules={[{ required: true }]}>
                <Input placeholder="metro / electricity / beef-meal / parcel" />
              </Form.Item>
              <Form.Item name="unit" label="单位" rules={[{ required: true }]}>
                <Input placeholder="km / kWh / meal / item" />
              </Form.Item>
              <Form.Item name="note" label="备注">
                <Input placeholder="可选的默认备注" />
              </Form.Item>
            </Space>
          </Form>
          <Typography.Divider />
          <Typography.Title level={5}>已有模板</Typography.Title>
          <Table
            dataSource={templates}
            columns={templateTableColumns}
            rowKey="id"
            locale={{ emptyText: '暂无模板，可以在上方添加新模板' }}
            pagination={false}
            size="small"
          />
        </Space>
      </Modal>
    </Space>
  );
}
