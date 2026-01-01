/**
 * RoleSelectionCard Component
 * Reusable component for role selection using radio-card style
 * Follows Design System selectionCard specifications
 */

const RoleSelectionCard = ({ role, label, icon, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`w-full transition-all duration-200 text-left rounded-ds-role-card p-4 outline-none ${
        isSelected
          ? 'border border-ds-border-focus bg-ds-selected-bg'
          : 'border border-ds-border bg-ds-surface hover:bg-ds-bg'
      } focus:shadow-ds-focus`}
      aria-pressed={isSelected}
      role="radio"
    >
      <div className="flex flex-col items-center text-center gap-2">
        {icon && (
          <div className={`mb-1 ${isSelected ? 'text-ds-border-focus' : 'text-ds-icon'}`}>
            {icon}
          </div>
        )}
        <span
          className={`text-sm ${
            isSelected
              ? 'font-semibold text-ds-border-focus'
              : 'font-medium text-ds-text-label'
          }`}
        >
          {label}
        </span>
      </div>
    </button>
  );
};

export default RoleSelectionCard;
