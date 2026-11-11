import { Download } from 'lucide-react';
import { useState } from 'react';
import PageShell from '../components/layout/PageShell.jsx';
import { ButtonLink, Card } from '../components/ui/primitives.jsx';
import { ASSETS } from '../data/profile.js';
import { useCvFiles } from '../hooks/useAvailableFiles.js';
import { useT } from '../i18n/index.jsx';
import { asset } from '../lib/paths.js';

function Portrait({ alt }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="grid aspect-square w-full place-items-center rounded-3xl border border-line bg-raised font-display text-6xl font-semibold text-accent-ink">
        LG
      </div>
    );
  }
  return (
    <img
      src={asset(ASSETS.photo)}
      alt={alt}
      width="480"
      height="480"
      onError={() => setBroken(true)}
      className="aspect-square w-full rounded-3xl border border-line object-cover"
    />
  );
}

export default function About() {
  const t = useT();
  const cv = useCvFiles();

  return (
    <PageShell title={t('about.title')} subtitle={t('about.subtitle')}>
      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-5 text-[1.0625rem] leading-relaxed">
          {t('about.paragraphs').map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            {cv.items.map((file) => (
              <ButtonLink key={file.lang} href={file.href} download variant={file.lang === 'en' ? 'primary' : 'secondary'}>
                <Download size={16} aria-hidden="true" />
                {t(`contact.cv_${file.lang}`)}
              </ButtonLink>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="mx-auto max-w-[18rem]">
            <Portrait alt={t('about.photo_alt')} />
          </div>
          <Card className="p-5">
            <h2 className="label mb-4">{t('about.facts_title')}</h2>
            <dl className="space-y-4">
              {t('about.facts').map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm text-muted">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>

      <section className="mt-16" aria-labelledby="focus-heading">
        <h2 id="focus-heading" className="mb-6 text-2xl font-semibold">
          {t('about.focus_title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {t('about.focus').map((area, index) => (
            <Card key={area.title} glow className="p-6">
              <p className="label mb-3 text-accent-ink">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mb-2 text-lg font-semibold">{area.title}</h3>
              <p className="text-muted">{area.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
