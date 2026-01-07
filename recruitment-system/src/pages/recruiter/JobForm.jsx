import { useState } from 'react';

const SkillRow = ({ idx, skill, onChange, onRemove }) => (
  <div className="flex gap-2 items-center">
    <input className="border p-2 rounded flex-1" value={skill.name} onChange={(e) => onChange(idx, { ...skill, name: e.target.value })} placeholder="Skill name" />
    <input className="w-20 border p-2 rounded" value={skill.minYears} onChange={(e) => onChange(idx, { ...skill, minYears: parseInt(e.target.value || '0', 10) })} type="number" min={0} />
    <button className="text-sm text-red-600" onClick={() => onRemove(idx)}>Remove</button>
  </div>
);

const JobForm = ({ initial = null, onCancel, onSave }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isOpen, setIsOpen] = useState(initial?.isOpen ?? true);
  const [skills, setSkills] = useState(initial?.requiredSkills?.map(s => ({ name: s.name, minYears: s.minYears })) ?? []);

  const addSkill = () => setSkills((s) => [...s, { name: '', minYears: 0 }]);
  const updateSkill = (i, val) => setSkills((s) => s.map((sk, idx) => idx === i ? val : sk));
  const removeSkill = (i) => setSkills((s) => s.filter((_, idx) => idx !== i));

  const submit = (e) => {
    e.preventDefault();
    onSave({ title, description, isOpen, requiredSkills: skills.map(s => ({ name: s.name, minYears: s.minYears })) });
  };

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded-ds-card shadow-ds-card">
      <div className="mb-3">
        <label className="block text-sm text-ds-text-secondary">Title</label>
        <input className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="block text-sm text-ds-text-secondary">Description</label>
        <textarea className="w-full p-2 border rounded" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="block text-sm text-ds-text-secondary">Required Skills</label>
        <div className="space-y-2">
          {skills.map((sk, idx) => (
            <SkillRow key={idx} idx={idx} skill={sk} onChange={updateSkill} onRemove={removeSkill} />
          ))}
        </div>
        <button type="button" onClick={addSkill} className="mt-2 text-sm text-blue-600">Add skill</button>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm"><input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} /> Open</label>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </form>
  );
};

export default JobForm;