// Language-neutral project facts. Titles and descriptions live in src/i18n/* under projects.items.<slug>.
// Plain JS on purpose: scripts/postbuild-routes.mjs reads the slugs.
//
// Images: put files in public/images/projects/<slug>/ and list them here.
// A missing or broken image falls back to a generated placeholder, so the page never breaks.
export const PROJECTS = [
  {
    slug: 'fluxlab',
    accent: '#009929',
    cover: 'images/projects/fluxlab/cover.jpg',
    gallery: [],
    tech: ['NestJS', 'React', 'TypeScript', 'Vite', 'Supabase', 'PostgreSQL', 'JWT', 'RBAC', 'Excel export'],
    links: {
      demo: 'https://fluxlab-front.vercel.app/',
      repos: [
        { label: 'Frontend', url: 'https://github.com/LeonardoG2005/fluxlab-front' },
        { label: 'Backend', url: 'https://github.com/LeonardoG2005/fluxlab-backend' },
      ],
    },
    demoAccess: { user: 'admin@fluxlab.com', password: 'Admin123!' },
  },
  {
    slug: 'focushub',
    accent: '#2f8fd6',
    cover: 'images/projects/focushub/cover.jpg',
    gallery: [],
    tech: [
      'Angular 19',
      'NestJS 11',
      'TypeScript',
      'TypeORM',
      'PostgreSQL',
      'SQLite',
      'MySQL',
      'JWT',
      'Swagger',
      'Docker Compose',
      'ELK',
    ],
    links: {
      demo: 'https://focushub-eight.vercel.app/',
      repos: [{ label: 'GitHub', url: 'https://github.com/LeonardoG2005/FocusHub' }],
    },
  },
  {
    slug: 'medical-documents-api',
    accent: '#c98a1a',
    cover: null,
    gallery: [],
    tech: [
      'Node.js',
      'Fastify',
      'PostgreSQL',
      'Docker',
      'Kubernetes (GKE)',
      'Cloud Run',
      'Cloud SQL',
      'Pub/Sub',
      'Terraform',
      'OpenTelemetry',
      'Grafana',
      'GitHub Actions',
      'GCP',
      'AWS',
      'OCI',
    ],
    links: {
      repos: [{ label: 'GitHub', url: 'https://github.com/LeonardoG2005/MedicalDevops' }],
    },
  },
  {
    slug: 'ergonominador',
    accent: '#b5543a',
    cover: 'images/projects/ergonominador/cover.png',
    gallery: [],
    tech: ['Django', 'Python', 'MQTT', 'HiveMQ', 'ESP32', 'MicroPython', 'SQLite', 'Chart.js', 'jQuery', 'Bootstrap'],
    links: {
      demo: 'https://ergonominador.vercel.app/',
      docs: 'https://ergonominador.vercel.app/pages/documentation/',
      repos: [{ label: 'GitHub', url: 'https://github.com/LeonardoG2005/Ergonominador' }],
    },
    coAuthors: [{ name: 'Phol Castañeda', url: 'https://github.com/PholCast' }],
  },
];

export const getProject = (slug) => PROJECTS.find((project) => project.slug === slug);
