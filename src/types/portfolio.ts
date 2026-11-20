export interface Profile {
  name: string;
  headline: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  resumeUrl: string;
  objective: string;
}

export interface SnapshotMetric {
  value: string;
  label: string;
  detail: string;
}

export interface EducationItem {
  institution: string;
  program: string;
  period: string;
  status: string;
  score: string;
}

export interface SkillItem {
  category: 'programming' | 'tools' | 'languages' | 'soft';
  group: string;
  name: string;
  level: string;
  note: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  stack: string;
  status: string;
  summary: string;
  highlights: string[];
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface DatasetPreset {
  id: string;
  name: string;
  xLabel: string;
  yLabel: string;
  defaultPredictX: number;
  points: DataPoint[];
}

export interface PortfolioData {
  profile: Profile;
  metrics: SnapshotMetric[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  datasets: DatasetPreset[];
}

export interface EvaluatedPoint {
  x: number;
  y: number;
  predicted: number;
  residual: number;
}

export interface RegressionResponse {
  engine: string;
  count: number;
  slope: number;
  intercept: number;
  meanX: number;
  meanY: number;
  metrics: {
    rSquared: number;
    mse: number;
    rmse: number;
    mae: number;
  };
  line: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  prediction: {
    x: number;
    y: number;
  } | null;
  points: EvaluatedPoint[];
}

export interface InquiryRecord {
  id: number;
  name: string;
  email: string;
  organization: string;
  message: string;
  created_at: string;
}
