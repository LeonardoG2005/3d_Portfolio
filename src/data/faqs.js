// Intents for the scripted assistant. Answers live in src/i18n/* under chat.answers.<id>.
// keywords: lowercase, accent-free fragments. A question matches the intent with the best keyword score.
// route: optional page the answer links to. suggested: shown as a quick question chip.
export const FAQS = [
  {
    id: 'who',
    suggested: true,
    route: '/about',
    keywords: ['who', 'yourself', 'introduce', 'quien', 'sobre', 'presenta', 'eres', 'tell me about', 'about him', 'about leo', 'background', 'bio', 'cuentame', 'hablame', 'perfil', 'conocer'],
  },
  {
    id: 'tech',
    suggested: true,
    route: '/skills',
    keywords: ['tech', 'stack', 'skill', 'language', 'framework', 'tool', 'tecnolog', 'habilidad', 'lenguaje', 'herramienta', 'usa', 'maneja', 'python', 'typescript', 'javascript', 'java', 'react', 'angular', 'node', 'nest', 'django', 'spring', 'backend', 'frontend', 'full stack', 'fullstack', 'code', 'program', 'sabe', 'conoce', 'programa', 'codigo'],
  },
  {
    id: 'projects',
    suggested: true,
    route: '/projects',
    keywords: ['project', 'built', 'developed', 'portfolio', 'fluxlab', 'focushub', 'ergonominador', 'proyecto', 'desarroll', 'constru', 'hecho', 'medical', 'app', 'apps', 'build', 'portafolio', 'trabajos', 'aplicacion', 'sistema', 'repo', 'github'],
  },
  {
    id: 'experience',
    suggested: true,
    route: '/journey',
    keywords: ['experience', 'professional', 'work', 'job', 'years', 'career', 'experiencia', 'profesional', 'trabajo', 'laboral', 'anos', 'how long', 'senior', 'junior', 'level', 'background in', 'cuanto tiempo', 'trayectoria', 'nivel', 'empresa', 'company'],
  },
  {
    id: 'english',
    route: '/journey',
    keywords: ['english', 'ielts', 'c1', 'speak', 'idioma', 'ingles', 'habla', 'languages spoken', 'bilingual', 'bilingue', 'spanish', 'espanol', 'level of english', 'nivel de ingles', 'native', 'nativo'],
  },
  {
    id: 'education',
    route: '/journey',
    keywords: ['education', 'study', 'studies', 'university', 'degree', 'academic', 'course', 'certif', 'estudi', 'universidad', 'carrera', 'academ', 'formacion', 'curso', 'school', 'college', 'semester', 'graduate', 'student', 'learn', 'semestre', 'estudiante', 'gradu', 'aprendi', 'deeplearning', 'datacamp'],
  },
  {
    id: 'availability',
    route: '/contact',
    keywords: ['available', 'availability', 'hire', 'hiring', 'opportunit', 'open to', 'freelance', 'intern', 'disponib', 'contrat', 'oportunidad', 'vacante', 'practica', 'looking for', 'job offer', 'recruit', 'busca empleo', 'busca trabajo', 'reclut', 'oferta'],
  },
  {
    id: 'cv',
    suggested: true,
    route: '/contact',
    keywords: ['cv', 'resume', 'curriculum', 'hoja de vida', 'download', 'descargar', 'pdf', 'hoja', 'resumen'],
  },
  {
    id: 'contact',
    suggested: true,
    route: '/contact',
    keywords: ['contact', 'email', 'mail', 'reach', 'linkedin', 'message', 'contacto', 'contactar', 'correo', 'escribir', 'mensaje', 'phone', 'call', 'talk', 'get in touch', 'telefono', 'llamar', 'hablar', 'comunicar'],
  },
  {
    id: 'cloud',
    route: '/projects/medical-documents-api',
    keywords: ['cloud', 'devops', 'kubernetes', 'docker', 'gcp', 'aws', 'terraform', 'ci/cd', 'cicd', 'pipeline', 'deploy', 'nube', 'despliegue', 'infraestructura', 'infrastructure', 'google cloud', 'azure', 'oracle', 'oci', 'gke', 'cloud run', 'chaos', 'observability', 'grafana', 'kubernet', 'k8s', 'caos', 'observabilidad'],
  },
  {
    id: 'ai',
    route: '/skills',
    keywords: ['ai', 'artificial', 'machine learning', 'ml', 'intelligence', 'agent', 'langchain', 'model', 'data', 'ia', 'inteligencia', 'aprendizaje', 'agente', 'modelo', 'datos', 'llm', 'openai', 'tensorflow', 'pandas', 'deep learning', 'neural', 'airflow', 'etl', 'red neuronal'],
  },
  {
    id: 'location',
    route: '/contact',
    keywords: ['where', 'location', 'based', 'country', 'city', 'colombia', 'medellin', 'donde', 'ubicacion', 'pais', 'ciudad', 'vive', 'from', 'remote', 'timezone', 'time zone', 'remoto', 'horario', 'zona horaria', 'de donde'],
  },
  {
    id: 'site',
    keywords: ['this site', 'this portfolio', 'room', '3d', 'three', 'how was', 'made', 'sitio', 'pagina', 'habitacion', 'cuarto', 'como hiciste', 'website', 'built this', 'made this', 'sitio web', 'web', 'como se hizo', 'quien hizo'],
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
