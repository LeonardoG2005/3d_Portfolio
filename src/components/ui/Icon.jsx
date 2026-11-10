import {
  Bot,
  BrainCircuit,
  Briefcase,
  ChartNoAxesCombined,
  Cloud,
  CodeXml,
  Database,
  DatabaseZap,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Server,
  Workflow,
  Wrench,
} from 'lucide-react';

// Icons that data files refer to by name. Add an entry here when a data file needs a new one.
const ICONS = {
  Bot,
  BrainCircuit,
  Briefcase,
  ChartNoAxesCombined,
  Cloud,
  Code2: CodeXml,
  Database,
  DatabaseZap,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Server,
  Workflow,
  Wrench,
};

export default function Icon({ name, ...props }) {
  const Component = ICONS[name];
  return Component ? <Component aria-hidden="true" {...props} /> : null;
}
