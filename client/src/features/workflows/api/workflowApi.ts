import { api as axiosInstance } from '../../../api/axiosClient';
import { WorkflowRequestDto, WorkflowRequestSummaryDto, WorkflowStatus, WorkflowTemplateDto } from '../types/workflow';

interface ApiResponse<T> {
  data: T;
  message?: string;
  isSuccess: boolean;
}

export const workflowApi = {
  getWorkflowTemplates: async (): Promise<ApiResponse<WorkflowTemplateDto[]>> => {
    const response = await axiosInstance.get('/api/workflow-templates');
    return response.data;
  },

  createWorkflowTemplate: async (data: { name: string; description: string; approvalLevels: { levelOrder: number; levelName: string; requiredPermission: string }[] }): Promise<ApiResponse<WorkflowTemplateDto>> => {
    const response = await axiosInstance.post('/api/workflow-templates', data);
    return response.data;
  },

  getWorkflows: async (status?: WorkflowStatus): Promise<ApiResponse<WorkflowRequestSummaryDto[]>> => {
    const params = status !== undefined ? { status } : undefined;
    const response = await axiosInstance.get('/api/workflows', { params });
    return response.data;
  },

  getWorkflowById: async (id: number): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.get(`/api/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (data: { workflowTemplateId: number; title: string; description: string }): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.post('/api/workflows', data);
    return response.data;
  },

  submitWorkflow: async (id: number): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.post(`/api/workflows/${id}/submit`);
    return response.data;
  },

  approveWorkflow: async (id: number, comment?: string): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.post(`/api/workflows/${id}/approve`, { comment });
    return response.data;
  },

  rejectWorkflow: async (id: number, reason: string): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.post(`/api/workflows/${id}/reject`, { rejectionReason: reason });
    return response.data;
  },

  completeWorkflow: async (id: number): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.post(`/api/workflows/${id}/complete`);
    return response.data;
  },

  obsoleteWorkflow: async (id: number, reason: string): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.post(`/api/workflows/${id}/obsolete`, { obsolescenceReason: reason });
    return response.data;
  },

  resetToDraft: async (id: number, reason: string): Promise<ApiResponse<WorkflowRequestDto>> => {
    const response = await axiosInstance.post(`/api/workflows/${id}/reset-to-draft`, { reason });
    return response.data;
  }
};
