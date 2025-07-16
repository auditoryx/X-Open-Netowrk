"use client";

interface ServiceFilterProps {
  selectedRole: string;
  onChange: (role: string) => void;
}

export default function ServiceFilter({ selectedRole, onChange }: ServiceFilterProps): JSX.Element {
  const roles = ["all", "artist", "engineer", "producer", "studio", "videographer"];

  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => onChange(role)}
          className={`btn ${selectedRole === role ? "btn-primary" : "btn-secondary"}`}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
      ))}
    </div>
  );
}
