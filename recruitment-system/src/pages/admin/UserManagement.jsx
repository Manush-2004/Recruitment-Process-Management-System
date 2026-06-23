import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/adminService.js";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const allowedRoles = [
    "Candidate",
    "Recruiter",
    "Reviewer",
    "Interviewer",
    "HR",
    "Admin",
  ];
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Recruiter",
    phone: "",
  });

  const load = async () => {
    try {
      const u = await api.getUsers();
      // exclude users that have roles outside the allowed set
      setUsers(
        u.filter((x) => (x.roles || []).every((r) => allowedRoles.includes(r))),
      );
    } catch (err) {
      console.error(err);
    }
    try {
      const r = await api.getRoles();
      setRoles(r.filter((rr) => allowedRoles.includes(rr)));
    } catch (err) {
      console.error(err);
    }
  };

  const { hasRole } = useAuth();

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!allowedRoles.includes(form.role))
      return alert("Selected role is not allowed");
    try {
      await api.createUser({
        FullName: form.fullName,
        Email: form.email,
        Password: form.password,
        Role: form.role,
        Phone: form.phone,
      });
      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "Recruiter",
        phone: "",
      });
      await load();
    } catch (err) {
      alert("Failed to create user: " + err.message);
    }
  };

  const handleAssign = async (id, role) => {
    if (!allowedRoles.includes(role)) return alert("Role not allowed");
    try {
      await api.assignRole(id, role);
      await load();
    } catch (err) {
      alert("Failed to assign role: " + err.message);
    }
  };

  const handleRemoveRole = async (id, role) => {
    try {
      await api.removeRole(id, role);
      await load();
    } catch (err) {
      alert("Failed to remove role: " + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <form onSubmit={handleCreate} className="p-4 bg-white rounded shadow">
          <h2 className="font-medium mb-2">Create user</h2>
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className="w-full mb-2 p-2 border rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            type="submit"
          >
            Create
          </button>
        </form>

        <div className="md:col-span-2 p-4 bg-white rounded shadow">
          <div className="flex items-center justify-between">
            <h2 className="font-medium mb-2">Users</h2>
            {hasRole("Admin") && (
              <button
                onClick={async () => {
                  if (
                    !confirm(
                      "Are you sure? This will remove all non-admin users.",
                    )
                  )
                    return;
                  try {
                    await api.clearUsers();
                    await load();
                    alert("Users cleared");
                  } catch (err) {
                    alert("Failed to clear users: " + err.message);
                  }
                }}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Clear users
              </button>
            )}
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-ds-text-secondary">
                <tr>
                  <th className="text-left">Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{(u.roles || []).join(", ")}</td>
                    <td>
                      <select
                        onChange={(e) => handleAssign(u.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Assign role...</option>
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {u.roles &&
                        u.roles.map((r) => (
                          <button
                            key={r}
                            onClick={() => handleRemoveRole(u.id, r)}
                            className="ml-2 text-red-600"
                          >
                            Remove {r}
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
