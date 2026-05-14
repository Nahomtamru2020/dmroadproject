import { motion } from "motion/react";

export function ProjectTimeline() {
  const milestones = [
    { date: "MAY 2025", title: "Planning Complete", status: "complete" },
    { date: "OCT 2025", title: "Foundation Laid", status: "complete" },
    { date: "MAR 2027", title: "Structure Erected", status: "complete" },
    { date: "DEC 2029", title: "Finishing Touches", status: "in-progress" },
    { date: "MAY 2030", title: "Project Handover", status: "pending" },
  ];
  return (
    <div className="bg-white p-5 border-l-4 border-sky-600 shadow-sm flex-1">
      <h2 className="text-xs font-bold text-slate-500 uppercase mb-4">Project Timeline</h2>
      <div className="space-y-4">
        {milestones.map((m, i) => (
          <motion.div 
            key={i} 
            className="relative pl-6 border-l border-slate-200"
            animate={m.status === 'complete' ? { opacity: [0.8, 1, 0.8] } : {}}
            transition={m.status === 'complete' ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${m.status === 'complete' ? 'bg-sky-600' : 'bg-slate-300'}`}></div>
            <p className={`text-[10px] font-bold ${m.status === 'complete' ? 'text-sky-600' : 'text-slate-400'}`}>{m.date}</p>
            <p className="text-xs font-medium">{m.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
