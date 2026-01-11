import { useEffect, useState } from 'react';
import * as api from '../../api/adminApi.js';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');

  useEffect(()=>{ api.getRoles().then(setRoles).catch(console.error); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createRole(newRole);
      setNewRole('');
      setRoles(await api.getRoles());
    } catch (err) { alert('Failed to create role: ' + err.message); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Role Management</h1>
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-medium mb-2">Existing roles</h2>
        <ul className="list-disc list-inside">
          {roles.map(r => <li key={r}>{r}</li>)}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-medium mb-2">Create new role</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input className="p-2 border rounded" value={newRole} onChange={e=>setNewRole(e.target.value)} placeholder="Role name" />
          <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit">Create</button>
        </form>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="font-medium mb-2">RBAC Matrix (placeholder)</h2>
        <div className="text-sm text-ds-text-secondary">A simple RBAC matrix will be shown here mapping roles to protected pages and permissions.</div>
      </div>
    </div>
  );
};

export default RoleManagement;