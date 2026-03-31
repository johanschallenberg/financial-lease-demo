import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="md:sticky md:top-20 self-start">
            <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10            
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

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-2">
                Voor zzp en mkb
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2">
                Binnen 1 werkdag duidelijkheid mogelijk
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2">
                Vrijblijvende indicatie
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
    </main>
  );
}
