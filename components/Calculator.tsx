"use client";

import { useMemo, useState } from "react";
import { calculateMonthlyPayment, formatEuroRange } from "@/lib/calculator";

type LeadForm = {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  yearsActive: string;
  revenueBand: string;
};

const DEFAULT_PRICE = 28500;
const DEFAULT_DOWN_PAYMENT = 3000;
const DEFAULT_BALLOON = 4000;
const DEFAULT_MONTHS = 60;
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

export default function Calculator() {
  const [carUrl, setCarUrl] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState("");

  const [carTitle, setCarTitle] = useState("BMW 3 Serie Touring");
  const [carPrice, setCarPrice] = useState<number>(DEFAULT_PRICE);
  const [buildYear, setBuildYear] = useState("2021");
  const [mileage, setMileage] = useState("72.000 km");
  const [imageUrl, setImageUrl] = useState(PLACEHOLDER_IMAGE);

  const [downPayment, setDownPayment] = useState<number>(DEFAULT_DOWN_PAYMENT);
  const [balloonPayment, setBalloonPayment] = useState<number>(DEFAULT_BALLOON);
  const [months, setMonths] = useState<number>(DEFAULT_MONTHS);

  const [showQualification, setShowQualification] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [lead, setLead] = useState<LeadForm>({
    name: "",
    email: "",
    phone: "",
    businessType: "",
    yearsActive: "",
    revenueBand: "",
  });

  const calculation = useMemo(() => {
    const lowRate = 0.07;
    const highRate = 0.1;

    const min = calculateMonthlyPayment({
      price: carPrice,
      downPayment,
      balloonPayment,
      annualRate: lowRate,
      months,
    });

    const max = calculateMonthlyPayment({
      price: carPrice,
      downPayment,
      balloonPayment,
      annualRate: highRate,
      months,
    });

    return {
      financedAmount: Math.max(carPrice - downPayment, 0),
      min,
      max,
      range: formatEuroRange(min, max),
    };
  }, [carPrice, downPayment, balloonPayment, months]);

  async function handleUrlUse() {
    if (!carUrl.trim()) return;

    setParseLoading(true);
    setParseError("");

    try {
      const response = await fetch("/api/parse-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: carUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Advertentie kon niet worden uitgelezen.");
      }

      const listing = data?.listing;
      if (!listing) {
        throw new Error("Geen advertentiegegevens ontvangen.");
      }

      setCarTitle(listing.title || carTitle);
      setCarPrice(Number(listing.price) || carPrice);
      setBuildYear(listing.buildYear || buildYear);
      setMileage(listing.mileage || mileage);
      setImageUrl(listing.imageUrl || PLACEHOLDER_IMAGE);
      setManualMode(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout";
      setParseError(message);
    } finally {
      setParseLoading(false);
    }
  }

  function handleLeadChange(field: keyof LeadForm, value: string) {
    setLead((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
      {!submitted ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-500">Stap 1 van 3</div>
              <h2 className="mt-1 text-2xl font-bold">Bereken je indicatie</h2>
            </div>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/3 rounded-full bg-slate-900" />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Link van de advertentie
              </label>
              <div className="flex gap-2">
                <input
                  value={carUrl}
                  onChange={(e) => setCarUrl(e.target.value)}
                  placeholder="Plak hier de link van de auto"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={handleUrlUse}
                  disabled={parseLoading}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {parseLoading ? "Bezig..." : "Gebruik link"}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setManualMode((prev) => !prev)}
                  className="text-sm font-medium text-slate-600 underline"
                >
                  {manualMode ? "Handmatige invoer verbergen" : "Of voer handmatig de auto in"}
                </button>

                <span className="text-xs text-slate-400">
                  Werkt het uitlezen niet? Gebruik handmatige invoer.
                </span>
              </div>

              {parseError && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {parseError}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="aspect-[16/9] w-full bg-slate-200">
                <img
                  src={imageUrl}
                  alt={carTitle}
                  className="h-full w-full object-cover"
                  onError={() => setImageUrl(PLACEHOLDER_IMAGE)}
                />
              </div>

              <div className="p-4">
                <div className="text-sm font-medium text-slate-500">Geselecteerde auto</div>
                <div className="mt-2 text-lg font-semibold">{carTitle}</div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-slate-600">
                  <div>
                    <div className="text-slate-400">Prijs</div>
                    <div className="font-medium text-slate-900">
                      € {carPrice.toLocaleString("nl-NL")}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Bouwjaar</div>
                    <div className="font-medium text-slate-900">{buildYear}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Km-stand</div>
                    <div className="font-medium text-slate-900">{mileage}</div>
                  </div>
                </div>
              </div>
            </div>

            {manualMode && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Titel auto
                  </label>
                  <input
                    value={carTitle}
                    onChange={(e) => setCarTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Prijs auto
                  </label>
                  <input
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Bouwjaar
                  </label>
                  <input
                    value={buildYear}
                    onChange={(e) => setBuildYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Kilometerstand
                  </label>
                  <input
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Aanbetaling
                </label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Looptijd
                </label>
                <select
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                >
                  <option value={36}>36 maanden</option>
                  <option value={48}>48 maanden</option>
                  <option value={60}>60 maanden</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Slotsom
                </label>
                <input
                  type="number"
                  value={balloonPayment}
                  onChange={(e) => setBalloonPayment(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="text-sm text-slate-300">Realistische indicatie</div>
              <div className="mt-2 text-4xl font-bold">{calculation.range}</div>
              <div className="mt-1 text-sm text-slate-300">per maand ex. btw</div>

              <div className="mt-4 grid gap-2 text-sm text-slate-200">
                <div>✔ Gebaseerd op actuele rente-aannames</div>
                <div>✔ Vrijblijvende eerste indicatie</div>
                <div>✔ Binnen 1 werkdag duidelijkheid mogelijk</div>
              </div>

              <div className="mt-5 text-sm text-slate-300">
                Te financieren bedrag: € {calculation.financedAmount.toLocaleString("nl-NL")}
              </div>
            </div>

            {!showQualification && (
              <button
                type="button"
                onClick={() => setShowQualification(true)}
                className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white"
              >
                Check wat in mijn situatie mogelijk is
              </button>
            )}

            {showQualification && !showLeadForm && (
              <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
                <div>
                  <h3 className="text-lg font-semibold">
                    Nog een paar vragen voor een betere inschatting
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Dit helpt om te bepalen wat voor jou haalbaar is.
                  </p>
                </div>

                <div className="grid gap-4">
                  <select
                    value={lead.businessType}
                    onChange={(e) => handleLeadChange("businessType", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                  >
                    <option value="">Type onderneming</option>
                    <option value="zzp">ZZP / Eenmanszaak</option>
                    <option value="vof">VOF</option>
                    <option value="bv">BV</option>
                  </select>

                  <select
                    value={lead.yearsActive}
                    onChange={(e) => handleLeadChange("yearsActive", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                  >
                    <option value="">Hoe lang bestaat je bedrijf?</option>
                    <option value="0-1">Korter dan 1 jaar</option>
                    <option value="1-3">1 tot 3 jaar</option>
                    <option value="3+">3 jaar of langer</option>
                  </select>

                  <select
                    value={lead.revenueBand}
                    onChange={(e) => handleLeadChange("revenueBand", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                  >
                    <option value="">Geschatte jaaromzet</option>
                    <option value="lt50k">Tot €50.000</option>
                    <option value="50-150k">€50.000 – €150.000</option>
                    <option value="150-500k">€150.000 – €500.000</option>
                    <option value="500k+">Meer dan €500.000</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white"
                >
                  Ga verder
                </button>
              </div>
            )}

            {showLeadForm && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-2xl border border-slate-200 p-5"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    Ontvang je persoonlijke inschatting
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    We nemen kort contact op om je mogelijkheden te bespreken.
                  </p>
                </div>

                <input
                  required
                  placeholder="Naam"
                  value={lead.name}
                  onChange={(e) => handleLeadChange("name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                />

                <input
                  required
                  type="email"
                  placeholder="E-mailadres"
                  value={lead.email}
                  onChange={(e) => handleLeadChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                />

                <input
                  required
                  placeholder="Telefoonnummer"
                  value={lead.phone}
                  onChange={(e) => handleLeadChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-slate-900"
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white"
                >
                  Ontvang mijn inschatting
                </button>

                <p className="text-xs text-slate-500">
                  Geen spam. Alleen relevant contact over je aanvraag.
                </p>
              </form>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <h2 className="text-2xl font-bold">Top, we gaan voor je aan de slag</h2>
          <p className="mt-3 text-slate-600">
            Dit is nu nog een demo-flow. In de volgende stap kun je dit koppelen
            aan e-mail, CRM of webhook-opvolging.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-left">
            <div className="text-sm text-slate-500">Samenvatting lead</div>
            <div className="mt-3 space-y-2 text-sm">
              <div><strong>Naam:</strong> {lead.name}</div>
              <div><strong>Email:</strong> {lead.email}</div>
              <div><strong>Telefoon:</strong> {lead.phone}</div>
              <div><strong>Type onderneming:</strong> {lead.businessType || "-"}</div>
              <div><strong>Bedrijf bestaat:</strong> {lead.yearsActive || "-"}</div>
              <div><strong>Omzet:</strong> {lead.revenueBand || "-"}</div>
              <div><strong>Auto:</strong> {carTitle}</div>
              <div><strong>Indicatie:</strong> {calculation.range} p/m</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
