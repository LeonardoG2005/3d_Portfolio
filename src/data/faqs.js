// Intents for the scripted assistant. Answers live in src/i18n/* under chat.answers.<id>.
// keywords: lowercase, accent-free fragments. A question matches the intent with the best keyword score.
// route: optional page the answer links to. suggested: shown as a quick question chip.
export const FAQS = [
  {
    id: 'who',
    suggested: true,
    route: '/about',
    keywords: ['who', 'yourself', 'introduce', 'quien', 'sobre', 'presenta', 'eres'],
  },
  {
    id: 'tech',
    suggested: true,
    route: '/skills',
    keywords: ['tech', 'stack', 'skill', 'language', 'framework', 'tool', 'tecnolog', 'habilidad', 'lenguaje', 'herramienta', 'usa', 'maneja'],
  },
  {
    id: 'projects',
    suggested: true,
    route: '/projects',
    keywords: ['project', 'built', 'developed', 'portfolio', 'fluxlab', 'focushub', 'ergonominador', 'proyecto', 'desarroll', 'constru', 'hecho'],
  },
  {
    id: 'experience',
    suggested: true,
    route: '/journey',
    keywords: ['experience', 'professional', 'work', 'job', 'years', 'career', 'experiencia', 'profesional', 'trabajo', 'laboral', 'anos'],
  },
  {
    id: 'english',
    route: '/journey',
    keywords: ['english', 'ielts', 'c1', 'speak', 'idioma', 'ingles', 'habla', 'languages spoken', 'bilingual', 'bilingue'],
  },
  {
    id: 'education',
    route: '/journey',
    keywords: ['education', 'study', 'studies', 'university', 'degree', 'academic', 'course', 'certif', 'estudi', 'universidad', 'carrera', 'academ', 'formacion', 'curso'],
  },
  {
    id: 'availability',
    route: '/contact',
    keywords: ['available', 'availability', 'hire', 'hiring', 'opportunit', 'open to', 'freelance', 'intern', 'disponib', 'contrat', 'oportunidad', 'vacante', 'practica'],
  },
  {
    id: 'cv',
    suggested: true,
    route: '/contact',
    keywords: ['cv', 'resume', 'curriculum', 'hoja de vida', 'download', 'descargar'],
  },
  {
    id: 'contact',
    suggested: true,
    route: '/contact',
    keywords: ['contact', 'email', 'mail', 'reach', 'linkedin', 'message', 'contacto', 'contactar', 'correo', 'escribir', 'mensaje'],
  },
  {
    id: 'cloud',
    route: '/projects/medical-documents-api',
    keywords: ['cloud', 'devops', 'kubernetes', 'docker', 'gcp', 'aws', 'terraform', 'ci/cd', 'cicd', 'pipeline', 'deploy', 'nube', 'despliegue', 'infraestructura', 'infrastructure'],
  },
  {
    id: 'ai',
    route: '/skills',
    keywords: ['ai', 'artificial', 'machine learning', 'ml', 'intelligence', 'agent', 'langchain', 'model', 'data', 'ia', 'inteligencia', 'aprendizaje', 'agente', 'modelo', 'datos'],
  },
  {
    id: 'location',
    route: '/contact',
    keywords: ['where', 'location', 'based', 'country', 'city', 'colombia', 'medellin', 'donde', 'ubicacion', 'pais', 'ciudad', 'vive'],
  },
  {
    id: 'site',
    keywords: ['this site', 'this portfolio', 'room', '3d', 'three', 'how was', 'made', 'sitio', 'pagina', 'habitacion', 'cuarto', 'como hiciste'],
  },
  {
    id: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'hola', 'buenas', 'buenos dias', 'good morning'],
  },
  {
    id: 'thanks',
    keywords: ['thank', 'thanks', 'gracias', 'genial', 'great', 'cool'],
  },
];
