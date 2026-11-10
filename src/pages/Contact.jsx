import { ArrowUpRight, Check, Copy, Download, FileText, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import PageShell from '../components/layout/PageShell.jsx';
import { GitHubIcon, LinkedInIcon } from '../components/ui/BrandIcons.jsx';
import { ButtonLink, Card } from '../components/ui/primitives.jsx';
import { PROFILE } from '../data/profile.js';
import { useCvFiles } from '../hooks/useAvailableFiles.js';
import { useT } from '../i18n/index.jsx';

function Channel({ icon, label, value, action, href, children }) {
  return (
    <Card glow className="flex flex-col p-6">
      <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-raised text-accent-ink">{icon}</span>
      <h2 className="label mb-1">{label}</h2>
      <p className="break-all text-lg font-medium">{value}</p>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" className="link inline-flex items-center gap-1">
          {action}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        {children}
      </div>
    </Card>
  );
}

export default function Contact() {
  const t = useT();
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
    <PageShell title={t('contact.title')} subtitle={t('contact.subtitle')}>
      <div className="grid gap-4 md:grid-cols-3">
        <Channel
          icon={<Mail size={20} aria-hidden="true" />}
          label={t('contact.email')}
          value={PROFILE.email}
          action={t('contact.email_action')}
          href={`mailto:${PROFILE.email}`}
        >
          <button type="button" onClick={copyEmail} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            <span aria-live="polite">{copied ? t('contact.copied') : t('contact.copy')}</span>
          </button>
        </Channel>
        <Channel
          icon={<LinkedInIcon />}
          label={t('contact.linkedin')}
          value="in/leotuvstarr"
          action={t('contact.linkedin_action')}
          href={PROFILE.links.linkedin}
        />
        <Channel
          icon={<GitHubIcon />}
          label={t('contact.github')}
          value={PROFILE.githubUser}
          action={t('contact.github_action')}
          href={PROFILE.links.github}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card className="flex flex-wrap items-center justify-between gap-5 p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-raised text-accent-ink">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{t('contact.cv_title')}</h2>
              <p className="text-sm text-muted">
                {cv.ready && cv.items.length === 0 ? t('contact.cv_missing') : t('contact.cv_text')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {cv.items.map((file) => (
              <ButtonLink key={file.lang} href={file.href} download variant={file.lang === 'en' ? 'primary' : 'secondary'}>
                <Download size={16} aria-hidden="true" />
                {t(`contact.cv_${file.lang}`)}
              </ButtonLink>
            ))}
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-raised text-accent-ink">
            <MapPin size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="label mb-1">{t('contact.location')}</h2>
            <p className="font-medium">{PROFILE.location}</p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
