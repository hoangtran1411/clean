import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../api/workflowApi';
import { WorkflowStatus } from '../types/workflow';

export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (status?: WorkflowStatus) => [...workflowKeys.lists(), { status }] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: number) => [...workflowKeys.details(), id] as const,
  templates: ['workflowTemplates'] as const,
};

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: workflowKeys.templates,
    queryFn: () => workflowApi.getWorkflowTemplates(),
  });
}

export function useWorkflows(status?: WorkflowStatus) {
  return useQuery({
    queryKey: workflowKeys.list(status),
    queryFn: () => workflowApi.getWorkflows(status),
  });
}

export function useWorkflow(id: number) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => workflowApi.getWorkflowById(id),
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workflowTemplateId: number; title: string; description: string }) => workflowApi.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
}

export function useSubmitWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workflowApi.submitWorkflow(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id) });
    },
  });
}

export function useApproveWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) => workflowApi.approveWorkflow(id, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.id) });
    },
  });
}

export function useRejectWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => workflowApi.rejectWorkflow(id, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.id) });
    },
  });
}

export function useCompleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workflowApi.completeWorkflow(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id) });
    },
  });
}
