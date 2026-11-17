import { ArrowUpRight, Check, Copy, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageShell from '../components/layout/PageShell.jsx';
import Magnetic from '../components/motion/Magnetic.jsx';
import SplitTitle from '../components/motion/SplitTitle.jsx';
import TypedLine from '../components/motion/TypedLine.jsx';
import { GitHubIcon, LinkedInIcon } from '../components/ui/BrandIcons.jsx';
import { ButtonLink } from '../components/ui/primitives.jsx';
import { PROFILE } from '../data/profile.js';
import { useCvFiles } from '../hooks/useAvailableFiles.js';
import { useLanguage } from '../i18n/index.jsx';

// Current time in Medellín, refreshed twice a minute.
function LocalTime({ lang }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const time = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  }).format(now);
  return <span className="tabular-nums">{time} (GMT-5)</span>;
}

function Channel({ icon, label, value, action, href }) {
  return (
    <li data-reveal className="border-t border-line">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="fill-row shell grid items-center gap-x-8 gap-y-2 py-8 sm:grid-cols-12 sm:py-10"
      >
        <span className="fill-row-muted label flex items-center gap-3 transition-colors sm:col-span-3">
          {icon}
          {label}
        </span>
        <span className="display text-[clamp(2rem,6.4vw,6rem)] sm:col-span-6">{value}</span>
        <span className="fill-row-muted flex items-center gap-2 text-muted transition-colors sm:col-span-3 sm:justify-end">
          {action}
          <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className="h-6 w-6" />
        </span>
      </a>
    </li>
  );
}

export default function Contact() {
  const { t, lang } = useLanguage();
  const cv = useCvFiles();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the address is visible and selectable anyway */
    }
  };

  return (
    <PageShell
      title={t('contact.title')}
      page="contact"
      compact
      hero={
        <div className="pb-6 pt-10 sm:pb-16 sm:pt-20">
          <div className="hero-fade max-w-2xl">
            <TypedLine text={t('contact.subtitle')} />
          </div>
          <a
            href={`mailto:${PROFILE.email}`}
            aria-label={`${t('contact.email_action')}: ${PROFILE.email}`}
            className="email-link mt-10 block w-fit max-w-full sm:mt-14"
          >
            <SplitTitle as="span" text={PROFILE.email} className="display block text-[clamp(1.4rem,6.7vw,7.25rem)]" />
          </a>
          <div className="hero-fade mt-10 flex flex-wrap items-center gap-4 sm:mt-14">
            <Magnetic>
              <ButtonLink href={`mailto:${PROFILE.email}`} className="h-14 px-8 text-base">
                {t('contact.email_action')}
                <ArrowUpRight size={18} aria-hidden="true" />
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex h-14 items-center gap-2 rounded-full border border-line bg-surface/70 px-7 font-semibold backdrop-blur transition-colors hover:border-accent-ink"
              >
                {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                <span aria-live="polite">{copied ? t('contact.copied') : t('contact.copy')}</span>
              </button>
            </Magnetic>
          </div>
        </div>
      }
    >
      <ul className="border-b border-line">
        <Channel
          icon={<LinkedInIcon size={18} />}
          label={t('contact.linkedin')}
          value="in/leotuvstarr"
          action={t('contact.linkedin_action')}
          href={PROFILE.links.linkedin}
        />
        <Channel
          icon={<GitHubIcon size={18} />}
          label={t('contact.github')}
          value={PROFILE.githubUser}
          action={t('contact.github_action')}
          href={PROFILE.links.github}
        />
      </ul>

      <section className="shell grid gap-x-12 gap-y-12 py-16 sm:py-24 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-6">
          <h2 className="label mb-4">{t('contact.cv_title')}</h2>
          <p className="serif mb-6 text-3xl text-muted">
            {cv.ready && cv.items.length === 0 ? t('contact.cv_missing') : t('contact.cv_text')}
          </p>
          <div className="flex flex-wrap gap-3">
            {cv.items.map((file) => (
              <ButtonLink
                key={file.lang}
                href={file.href}
                download
                variant={file.lang === 'en' ? 'primary' : 'secondary'}
                className="h-12 px-6"
              >
                <Download size={16} aria-hidden="true" />
                {t(`contact.cv_${file.lang}`)}
              </ButtonLink>
            ))}
          </div>
        </div>
        <div data-reveal className="lg:col-span-3">
          <h2 className="label mb-4">{t('contact.location')}</h2>
          <p className="text-2xl font-medium tracking-tight">{PROFILE.location}</p>
        </div>
        <div data-reveal className="lg:col-span-3">
          <h2 className="label mb-4">{t('contact.local_time')}</h2>
          <p className="text-2xl font-medium tracking-tight">
            <LocalTime lang={lang} />
          </p>
        </div>
      </section>
    </PageShell>
  );
}
