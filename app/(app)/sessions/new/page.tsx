import nextDynamic from "next/dynamic";
import { createSession } from "@/lib/actions/sessions";

const LocationPicker = nextDynamic(() => import("@/components/LocationPicker"), {
  ssr: false
});

export default function NewSessionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Create a rolê</h1>
      <form action={createSession} className="space-y-4">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" required minLength={3} maxLength={80}
                 placeholder="Sunday session at Praça Roosevelt" className="input" />
        </div>

        <div>
          <label className="label" htmlFor="description">Description (optional)</label>
          <textarea id="description" name="description" maxLength={500} rows={3}
                    placeholder="Bring your board. Beginners welcome." className="input" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="starts_at">When</label>
            <input id="starts_at" name="starts_at" type="datetime-local" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="type">Type</label>
            <select id="type" name="type" className="input" defaultValue="casual">
              <option value="casual">Casual</option>
              <option value="training">Training</option>
              <option value="class">Class / Social project</option>
            </select>
          </div>
        </div>

        <LocationPicker />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="max_participants">Max attendees (optional)</label>
            <input id="max_participants" name="max_participants" type="number" min={1} className="input" />
          </div>
          <label className="flex items-center gap-2 mt-6 text-sm">
            <input type="checkbox" name="recurring_weekly" />
            Repeat weekly
          </label>
        </div>

        <button type="submit" className="btn-primary w-full">Create rolê</button>
      </form>
    </div>
  );
}
