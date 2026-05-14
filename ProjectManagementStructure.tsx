export function ProjectManagementStructure() {
  const roles = [
    { title: "Project Manager", resp: "Overall project oversight and client communication." },
    { title: "Office Engineer", resp: "Documentation, scheduling, and administrative approvals.", reportsTo: "Project Manager" },
    { title: "Site Engineer", resp: "Direct site supervision, quality control, and technical compliance.", reportsTo: "Project Manager" },
    { title: "Foreman", resp: "Managing work crews and daily onsite operations.", reportsTo: "Site Engineer" },
  ];
  return (
    <div className="bg-white p-5 border-l-4 border-amber-500 shadow-sm">
      <h2 className="text-xs font-bold text-slate-500 uppercase mb-4">Management Structure</h2>
      <div className="space-y-4">
        {roles.map((r, i) => (
          <div key={i} className="text-xs">
            <p className="font-bold text-slate-800">{r.title}</p>
            <p className="text-slate-600 mb-1">{r.resp}</p>
            {r.reportsTo && (
              <p className="text-[10px] text-slate-400 italic">Reports to: {r.reportsTo}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
