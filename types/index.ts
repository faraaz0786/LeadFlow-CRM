
export type Role = 'admin' | 'rep';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  source: string;
  status: string; // Foreign Key to pipeline_stage.id
  assigned_rep_id: string;
  expected_value: number;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  stage_order: number;
}
