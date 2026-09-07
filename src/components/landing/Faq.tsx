import * as Accordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import AnimatedContent from '../backgrounds/AnimatedContent';

const ITEMS = [
  {
    q: 'Do I need to connect a wallet?',
    a: 'No. Every page works without one. Connecting a wallet is optional and only used to show your own balances. It grants Murkspire no permission to move anything.',
  },
  {
    q: 'Where does the data come from?',
    a: 'Directly from Solana mainnet via Helius RPC. The app calls getSignaturesForAddress, getTransaction, getVoteAccounts and getEpochInfo, then parses the responses in the browser.',
  },
  {
    q: 'How often does it refresh?',
    a: 'Whale activity and market flow poll every 30 seconds. Staking data refreshes every 60 seconds, since validator figures only change once per epoch.',
  },
  {
    q: 'Which wallets do you track?',
    a: 'Three large Solana wallets are monitored by default. The list lives in the source, so you can fork the project and point it at any address you care about.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. There is no account, no paid tier, and no rate limit beyond what the upstream RPC provider enforces.',
  },
  {
    q: 'Can I self-host it?',
    a: 'Yes. The client is MIT licensed. Clone the repo, add your own Helius API key, and deploy it anywhere that serves static files.',
  },
];

export function Faq() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <AnimatedContent distance={40} duration={0.7} threshold={0.15} className="lg:col-span-4">
            <div>
              <span className="eyebrow">FAQ</span>
              <h2 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl">
                <span className="block text-bone">Questions,</span>
                <span className="block text-spire">answered plainly.</span>
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-zinc-400">
                Still stuck? The source is the documentation.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={40} duration={0.7} delay={0.1} threshold={0.1} className="lg:col-span-8">
            <Accordion.Root type="single" collapsible className="border-t border-white/[0.07]">
              {ITEMS.map((item, i) => (
                <Accordion.Item
                  key={item.q}
                  value={`item-${i}`}
                  className="border-b border-white/[0.07]"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-spire">
                      <span className="text-base font-medium text-bone transition-colors group-hover:text-spire sm:text-lg">
                        {item.q}
                      </span>
                      <Plus className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-spire" />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <p className="max-w-2xl pb-5 pr-10 text-[15px] leading-relaxed text-zinc-400">
                      {item.a}
                    </p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </AnimatedContent>
        </div>
      </div>
    </section>
  );
}
