import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * A full-width feature band: copy on one side, a real, dense product
 * surface on the other. The pattern Linear / Dune use — one large honest
 * view of the product beats four small decorative cards.
 */
export function FeatureBand({
  label,
  headline,
  body,
  linkText,
  linkTo,
  reverse = false,
  children,
}: {
  label: string;
  headline: ReactNode;
  body: string[];
  linkText: string;
  linkTo: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32">
      <div className="container">
        <div
          className={`grid items-center gap-12 lg:grid-cols-12 lg:gap-16 ${
            reverse ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Copy — no card, no border, just type */}
          <div className="lg:col-span-4">
            <p className="mono-label">{label}</p>

            <h2 className="mt-5 text-3xl font-bold leading-[1.12] tracking-tight text-bone sm:text-4xl">
              {headline}
            </h2>

            <div className="mt-5 space-y-1">
              {body.map((line) => (
                <p key={line} className="text-[15px] leading-relaxed text-zinc-400">
                  {line}
                </p>
              ))}
            </div>

            <Link
              to={linkTo}
              className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-spire transition-colors hover:text-spire-400"
            >
              {linkText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Product surface */}
          <div className="lg:col-span-8">
            <div className="relative">
              <div className="overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#101114]">
                {children}
              </div>
              {/* faint warm pool under the panel */}
              <div
                className="pointer-events-none absolute inset-x-16 -bottom-6 h-16 blur-2xl"
                style={{ background: 'radial-gradient(ellipse at center, rgba(255,90,54,.16), transparent 70%)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
