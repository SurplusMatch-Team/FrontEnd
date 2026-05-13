import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useI18n, useLocaleMessages } from "../i18n/I18nContext";
import { LanguageSwitch } from "../components/common/LanguageSwitch";

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true);
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`sm-reveal ${on ? "sm-reveal--in" : ""} ${className}`}>
      {children}
    </div>
  );
}

const VALUE_CARD_STYLES = [
  {
    accent: "from-teal-400 to-emerald-600",
    delay: "0ms",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    accent: "from-lime-400 to-green-600",
    delay: "80ms",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    accent: "from-amber-400 to-orange-500",
    delay: "160ms",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const messages = useLocaleMessages();
  const valueCards = messages.landing.valueCards.map((card, i) => ({
    ...card,
    ...VALUE_CARD_STYLES[i],
  }));
  const howSteps = messages.landing.how.steps;

  return (
    <div className="min-h-screen bg-[#f6faf7] text-slate-900 antialiased overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(52,211,153,0.35),transparent_55%)]" />
        <div className="absolute top-[40%] -left-[20%] h-[70vh] w-[70vh] rounded-full bg-teal-300/25 blur-[100px] sm-drift-blob" />
        <div className="absolute bottom-[-10%] right-[-15%] h-[60vh] w-[60vh] rounded-full bg-lime-200/30 blur-[90px] sm-drift-blob-reverse" />
        <div className="absolute top-1/2 left-1/2 h-[40vh] w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/40 blur-[80px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-emerald-900/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
          <Link to="/" className="group flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-black text-white shadow-md shadow-emerald-600/25 transition group-hover:scale-105 group-hover:shadow-lg">
              R
            </span>
            <span className="truncate text-lg font-bold tracking-tight text-slate-900">{t("common.brand")}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitch variant="light" />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 hover:shadow-md sm:px-4 sm:text-sm"
              >
                {t("landing.nav.dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800 sm:inline-flex sm:px-4"
                >
                  {t("landing.nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:px-4 sm:text-sm"
                >
                  {t("landing.nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t("landing.hero.pill")}
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                {t("landing.hero.titleBefore")}{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 bg-clip-text text-transparent sm-shimmer-text">
                  {t("landing.hero.titleHighlight")}
                </span>
                {t("landing.hero.titleAfter")}
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600">{t("landing.hero.body")}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:translate-y-[-2px] hover:shadow-xl hover:shadow-emerald-600/35"
                >
                  {t("landing.hero.ctaPrimary")}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white/90 px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50/80"
                >
                  {t("landing.hero.ctaSecondary")}
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-500">
                <div>
                  <p className="font-bold text-slate-800">{t("landing.pillars.transparentTitle")}</p>
                  <p className="mt-0.5">{t("landing.pillars.transparentDesc")}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{t("landing.pillars.fastTitle")}</p>
                  <p className="mt-0.5">{t("landing.pillars.fastDesc")}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{t("landing.pillars.humaneTitle")}</p>
                  <p className="mt-0.5">{t("landing.pillars.humaneDesc")}</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-200/50 via-transparent to-lime-200/40 blur-2xl" />
              <div className="relative space-y-4">
                <div
                  className="sm-float-card rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-emerald-900/10 backdrop-blur-md"
                  style={{ animationDelay: "0s" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        {t("landing.preview.live")}
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{t("landing.preview.sampleTitle")}</p>
                      <p className="text-sm text-slate-500">{t("landing.preview.sampleMeta")}</p>
                    </div>
                    <span className="rounded-2xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {t("landing.preview.open")}
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 sm-progress-pulse" />
                  </div>
                </div>
                <div
                  className="sm-float-card sm-float-card--delayed ml-0 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-teal-900/10 backdrop-blur-md sm:ml-8"
                  style={{ animationDelay: "0.15s" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">{t("landing.preview.claimLabel")}</p>
                  <p className="mt-1 font-semibold text-slate-900">{t("landing.preview.claimOrg")}</p>
                  <p className="mt-2 text-sm text-slate-600">{t("landing.preview.claimMeta")}</p>
                </div>
                <div
                  className="sm-float-card sm-float-card--slow mr-0 rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50/80 p-5 shadow-lg backdrop-blur-md sm:mr-10"
                  style={{ animationDelay: "0.3s" }}
                >
                  <p className="text-sm font-medium text-amber-950">{t("landing.preview.philosophy")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Reveal>
          <section className="border-y border-emerald-900/5 bg-white/60 py-16 backdrop-blur-sm md:py-20">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t("landing.how.title")}</h2>
                <p className="mt-3 text-slate-600">{t("landing.how.subtitle")}</p>
              </div>
              <ol className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
                {howSteps.map((item, i) => (
                  <li
                    key={item.title}
                    className="group relative rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <span className="text-4xl font-black text-emerald-100 transition group-hover:text-emerald-200">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("landing.audience.title")}</h2>
                <p className="mt-2 max-w-lg text-slate-600">{t("landing.audience.subtitle")}</p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {valueCards.map((card) => (
                <article
                  key={card.title}
                  className="sm-tilt-card group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-md transition duration-500 hover:shadow-2xl"
                  style={{ animationDelay: card.delay }}
                >
                  <div
                    className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${card.accent} opacity-20 blur-2xl transition duration-500 group-hover:opacity-35 group-hover:blur-xl`}
                  />
                  <div className={`inline-flex rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.subtitle}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 opacity-0 transition group-hover:opacity-100">
                    <span className="h-px w-6 bg-emerald-400" />
                    {t("landing.audience.explore")}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <section className="relative mx-4 mb-16 overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 px-6 py-14 text-center text-white shadow-2xl md:mx-auto md:max-w-6xl md:px-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-lime-300 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-teal-300 blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("landing.cta.title")}</h2>
            <p className="mt-4 text-lg text-emerald-50/95">{t("landing.cta.body")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex min-w-[160px] items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-emerald-800 shadow-lg transition hover:scale-[1.02] hover:bg-emerald-50"
              >
                {t("landing.cta.register")}
              </Link>
              <Link
                to="/login"
                className="inline-flex min-w-[160px] items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                {t("landing.cta.login")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 py-8 text-center text-sm text-slate-500 backdrop-blur">
        <p className="font-medium text-slate-700">{t("common.brand")}</p>
        <p className="mt-1">{t("landing.footer.tagline")}</p>
      </footer>
    </div>
  );
}

export default LandingPage;
