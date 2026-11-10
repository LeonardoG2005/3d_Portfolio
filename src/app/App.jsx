import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import TopBar from '../components/layout/TopBar.jsx';
import { MusicProvider } from '../features/music/MusicProvider.jsx';
import { LanguageProvider, useT } from '../i18n/index.jsx';
import Home from '../pages/Home.jsx';
import { ExperienceProvider } from './providers/ExperienceProvider.jsx';
import { ThemeProvider } from './providers/ThemeProvider.jsx';

const About = lazy(() => import('../pages/About.jsx'));
const Skills = lazy(() => import('../pages/Skills.jsx'));
const Projects = lazy(() => import('../pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail.jsx'));
const Journey = lazy(() => import('../pages/Journey.jsx'));
const Activity = lazy(() => import('../pages/Activity.jsx'));
const Contact = lazy(() => import('../pages/Contact.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));
const ChatWidget = lazy(() => import('../features/assistant/ChatWidget.jsx'));

function Pages() {
  const location = useLocation();

  // New page: start at the top and move keyboard focus to the content.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense key={location.pathname} fallback={<div className="min-h-dvh" />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main"
      className="sr-only-focusable fixed left-4 top-3 z-[60] rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent"
    >
      {t('nav.skip')}
    </a>
  );
}

export default function App() {
  // Vite's BASE_URL ends with a slash, the router's basename must not.
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <LanguageProvider>
            <ExperienceProvider>
              <MusicProvider>
                <BrowserRouter basename={basename}>
                  <SkipLink />
                  <TopBar />
                  <Pages />
                  <Suspense fallback={null}>
                    <ChatWidget />
                  </Suspense>
                </BrowserRouter>
              </MusicProvider>
            </ExperienceProvider>
          </LanguageProvider>
        </ThemeProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
