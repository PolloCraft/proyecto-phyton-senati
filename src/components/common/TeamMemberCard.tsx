interface TeamMemberCardProps {
  name: string;
  role: string;
  desc: string;
  color: string;
  icon: string;
}

function TeamMemberCard({ name, role, desc, color, icon }: TeamMemberCardProps) {
  return (
    <div className="team-card">
      <img src={icon} alt={role} className="team-card-icon" />
      <h4 className="team-card-name">{name}</h4>
      <p className="team-card-role" style={{ color }}>{role}</p>
      <p className="team-card-desc">{desc}</p>
    </div>
  );
}

export default TeamMemberCard;
