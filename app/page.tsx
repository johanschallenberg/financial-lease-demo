import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="self-start md:sticky md:top-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                FL
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Financial Lease Demo
                </div>
                <div className="text-xs text-slate-500">
                  Snelle indicatie voor zzp en mkb
                </div>
              </div>
            </div>

            <div className="mb-4 inline-flex rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
              Financial lease voor zzp en mkb
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
              Auto gevonden? Bereken direct je maandbedrag.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Plak de link van de advertentie of voer handmatig de prijs in en
              krijg binnen 2 minuten een realistische lease-indicatie. Zonder
              verplichtingen.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-2">
                Voor zzp en mkb
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2">
                Binnen 1 werkdag duidelijkheid mogelijk
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2">
                Vrijblijvend
              </span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  1. Plak je autolink
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Gebruik de advertentie van de auto die je al hebt gevonden.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  2. Bereken je maandbedrag
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Zie direct een realistische indicatie per maand.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  3. Check je mogelijkheden
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Laat je gegevens achter voor een persoonlijke inschatting.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Calculator />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Waarom dit werkt</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Je start met de auto die je al hebt gevonden. Geen lang formulier
                vooraf, maar eerst inzicht.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Realistische indicatie</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Geen nep-precies maandbedrag, maar een bandbreedte op basis van
                actuele rente-aannames.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Geschikt voor leadgen</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Deze opzet is ideaal voor SEO, ads en snelle opvolging richting
                financial lease leads.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
