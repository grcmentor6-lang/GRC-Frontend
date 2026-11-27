import { Card } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import type { Desk } from "@/lib/desk/model";
import { EXAMS, RETAKE_DAYS, examOpensAfter } from "@/lib/programme";

/** The two exams, from the programme facts: when each opens, how long, attempts, pass mark. Calendar sidebar. */
export function ExamsCard({ desk }: { desk: Desk }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon name="bullseye" size={15} className="text-indigo-500" />
        <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Exams</h2>
      </div>
      <div className="space-y-3">
        {EXAMS.map((e) => (
          <div key={e.id} className="text-[12px] text-slate-600 leading-relaxed tracking-tight">
            <div className="font-semibold text-slate-800">{e.title} ({e.id})</div>
            <div>Opens in week {e.week}, once you submit {examOpensAfter(desk, e)}. {e.questions} questions, {e.minutes} minutes, pass mark {e.passMark} %, {e.attempts} attempts.</div>
          </div>
        ))}
        <p className="text-[11.5px] text-slate-500 leading-relaxed">An exam failed on every attempt opens one more {RETAKE_DAYS} days after the last. Nothing to book: it opens on the desk by itself.</p>
      </div>
    </Card>
  );
}
