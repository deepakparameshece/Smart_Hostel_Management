'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import apiClient from "@/lib/api";

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  
  const initialForm = { 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    role: 'STUDENT',
    idType: 'AADHAR',
    idNumber: '',
    address: '',
    city: '',
    purpose: 'STUDENT'
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' or 'staff'
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const storedUser = localStorage.getItem('user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      let studentsRes;
      let usersRes: any = { data: [] };

      if (currentUser?.role === 'WARDEN') {
        studentsRes = await apiClient.get('/students');
      } else {
        const [sRes, uRes] = await Promise.all([
          apiClient.get('/students'),
          apiClient.get('/users')
        ]);
        studentsRes = sRes;
        usersRes = uRes;
      }
      const data = studentsRes.data.data || studentsRes.data;
      setStudents(Array.isArray(data) ? data : []);
      
      const userData = usersRes.data.data || usersRes.data;
      setAllUsers(Array.isArray(userData) ? userData : []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      if (error.response?.status === 403) {
        setErrorMsg('PERMISSION_DENIED');
      } else {
        setErrorMsg('Failed to load students list. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingStudent(item);
    setFormData({ 
      firstName: item.firstName || item.student?.firstName || '', 
      lastName: item.lastName || item.student?.lastName || '', 
      email: item.user?.email || item.email || '', 
      password: '', 
      role: item.user?.role || item.role || 'STUDENT',
      idType: item.idType || item.student?.idType || 'AADHAR',
      idNumber: item.idNumber || item.student?.idNumber || '',
      address: item.address || item.student?.address || '',
      city: item.city || item.student?.city || '',
      purpose: item.purpose || item.student?.purpose || 'STUDENT'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        const isStudent = editingStudent.userId !== undefined || editingStudent.role === 'STUDENT';
        if (isStudent) {
          const studentId = editingStudent.id || editingStudent.student?.id;
          await apiClient.put(`/students/${studentId}`, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            idType: formData.idType,
            idNumber: formData.idNumber,
            address: formData.address,
            city: formData.city,
            purpose: formData.purpose
          });
        } else {
          // Editing warden or mess manager profile details
          await apiClient.put(`/users/${editingStudent.id}`, {
            email: formData.email,
            role: formData.role
          });
        }
        
        const targetUserId = editingStudent.userId || editingStudent.id;
        if (targetUserId && formData.password) {
          await apiClient.put(`/users/${targetUserId}`, { password: formData.password });
        }
      } else {
        await apiClient.post('/auth/register', formData);
      }
      setShowModal(false);
      fetchStudents();
    } catch (error: any) {
      console.error('Error saving student:', error);
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to save student';
      alert(msg);
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    try {
      if (userId) {
        await apiClient.delete(`/users/${userId}`);
      } else {
        await apiClient.delete(`/students/${id}`);
      }
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(s => {
    const fullname = `${s.firstName} ${s.lastName}`.toLowerCase();
    const email = (s.user?.email || s.email || '').toLowerCase();
    const city = (s.city || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullname.includes(query) || email.includes(query) || city.includes(query);
  });

  const filteredStaff = allUsers.filter(u => u.role !== 'STUDENT').filter(u => {
    const email = (u.email || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return email.includes(query) || role.includes(query);
  });

  if (!loading && errorMsg === 'PERMISSION_DENIED') {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <Header title="Access Denied" />
        <main className="p-container-padding flex flex-col items-center justify-center min-h-[60vh] text-center max-w-[500px] mx-auto">
           <span className="material-symbols-outlined text-[64px] text-error mb-6">lock</span>
           <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">Permission Denied</h2>
           <p className="text-sm text-outline mb-8 leading-relaxed">
             Only Hostel Administrators or authorized Wardens have permission to view and manage the tenant registry.
           </p>
           <button 
             onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
             className="px-8 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer"
           >
             Sign In as Administrator
           </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header title="User & Tenant Management" />
      
      <main className="p-container-padding max-w-[1440px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Navigation Tabs (Staff vs Tenant) */}
        {user?.role !== 'WARDEN' && (
          <div className="flex gap-2 border-b border-surface-border pb-2">
            <button 
              onClick={() => setActiveTab('tenants')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'tenants' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Tenants Registry ({students.length})
            </button>
            <button 
              onClick={() => setActiveTab('staff')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'staff' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Staff & Wardens ({allUsers.filter(u => u.role !== 'STUDENT').length})
            </button>
          </div>
        )}

        {/* Controls Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder={activeTab === 'tenants' ? "Search tenants..." : "Search staff..."} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-xs text-on-surface"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          </div>

          {user?.role !== 'WARDEN' && (
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-sm w-full sm:w-auto justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add New User
            </button>
          )}
        </div>

        {errorMsg && errorMsg !== 'PERMISSION_DENIED' && (
          <div className="bg-error/10 border border-error/20 p-4 rounded-lg text-error text-xs font-bold flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={fetchStudents} className="underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Main Records Table */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {activeTab === 'tenants' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container border-b border-surface-border">
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Identification Info</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Stay Purpose</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Origin Location</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-outline uppercase font-bold text-[10px] tracking-widest">
                        Fetching Tenant Records...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-outline italic">
                        No tenants matched your query.
                      </td>
                    </tr>
                  ) : filteredStudents.map((tenant) => {
                    const name = `${tenant.firstName} ${tenant.lastName}`;
                    const email = tenant.user?.email || tenant.email || 'N/A';
                    
                    return (
                      <tr key={tenant.id} className="hover:bg-surface-container/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-surface-container border border-surface-border flex items-center justify-center text-primary font-bold text-sm">
                              {tenant.firstName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface text-sm">{name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-outline">
                                <span>{email}</span>
                                <span>&bull;</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(tenant.id);
                                    alert("Copied Tenant ID to clipboard!");
                                  }}
                                  className="text-primary font-bold uppercase tracking-wider hover:underline cursor-pointer"
                                  title="Copy Student ID"
                                >
                                  ID: {tenant.id.substring(0, 8)}...
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-on-surface">{tenant.idType || 'N/A'}</p>
                          <p className="text-[10px] text-outline mt-0.5">{tenant.idNumber || 'No document ID set'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            tenant.purpose === 'WORK' 
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {tenant.purpose || 'STUDENT'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{tenant.city || 'N/A'}</p>
                          <p className="text-[10px] text-outline mt-0.5 max-w-[200px] truncate">{tenant.address || 'No address registered'}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user?.role !== 'WARDEN' && (
                            <div className="flex justify-end gap-1">
                              <button 
                                onClick={() => handleOpenEdit(tenant)} 
                                className="p-1.5 hover:bg-surface-container rounded text-outline hover:text-primary transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(tenant.id, tenant.userId)} 
                                className="p-1.5 hover:bg-surface-container rounded text-outline hover:text-error transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container border-b border-surface-border">
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Staff / Warden</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Role Tag</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider">Account Status</th>
                    <th className="px-6 py-3.5 font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-outline uppercase font-bold text-[10px] tracking-widest">
                        Fetching Staff Records...
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-outline italic">
                        No staff members matched your query.
                      </td>
                    </tr>
                  ) : filteredStaff.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-surface-container/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-surface-container border border-surface-border flex items-center justify-center text-primary font-bold text-sm">
                              {item.email?.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-bold text-on-surface text-sm">{item.email?.split('@')[0]}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-on-surface">
                          {item.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.isActive 
                              ? 'bg-success-emerald/10 text-success-emerald border border-success-emerald/20' 
                              : 'bg-error/10 text-error border border-error/20'
                          }`}>
                            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => handleOpenEdit(item)} 
                              className="p-1.5 hover:bg-surface-container rounded text-outline hover:text-primary transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete('', item.id)} 
                              className="p-1.5 hover:bg-surface-container rounded text-outline hover:text-error transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="px-6 py-3.5 bg-surface-container/30 border-t border-surface-border flex justify-between items-center text-xs font-semibold text-outline">
            <span>
              {activeTab === 'tenants' ? `Total registered: ${filteredStudents.length} tenants` : `Total registered: ${filteredStaff.length} staff members`}
            </span>
          </div>
        </div>
      </main>

      {/* Register / Update User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl p-6 transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface">{editingStudent ? 'Update User Record' : 'Register New User'}</h3>
                <p className="text-xs text-outline mt-0.5">Fill out personal info and access credentials.</p>
              </div>
              <button className="p-1 hover:bg-surface-container rounded text-outline cursor-pointer" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">First Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Last Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    disabled={!!editingStudent} 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface disabled:opacity-55" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                    {editingStudent ? 'Update Password' : 'Login Password'}
                  </label>
                  <input 
                    required={!editingStudent} 
                    type="password" 
                    placeholder={editingStudent ? "Leave blank to keep" : ""} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">System Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                  >
                    <option value="STUDENT">Tenant</option>
                    <option value="MESS_MANAGER">Mess Manager</option>
                    <option value="WARDEN">Warden</option>
                  </select>
                </div>
              </div>
 
              {formData.role === 'STUDENT' && (
                <div className="space-y-4 border-t border-surface-border pt-4 mt-2 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Identity Document Type</label>
                      <select 
                        value={formData.idType} 
                        onChange={e => setFormData({...formData, idType: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                      >
                        <option value="AADHAR">Aadhar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="VOTER_ID">Voter ID</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Document Number</label>
                      <input 
                        type="text" 
                        placeholder="ID number..." 
                        value={formData.idNumber} 
                        onChange={e => setFormData({...formData, idNumber: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Stay Purpose</label>
                      <select 
                        value={formData.purpose} 
                        onChange={e => setFormData({...formData, purpose: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="WORK">Working Professional</option>
                      </select>
                    </div>
                  </div>
 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Origin City</label>
                       <input 
                         type="text" 
                         placeholder="Home city..." 
                         value={formData.city} 
                         onChange={e => setFormData({...formData, city: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Permanent Address</label>
                       <textarea 
                         value={formData.address} 
                         onChange={e => setFormData({...formData, address: e.target.value})} 
                         className="w-full px-4 py-2 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface h-16 resize-none" 
                         placeholder="Full residence address details..." 
                       />
                     </div>
                  </div>
                </div>
              )}
 
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
                  {editingStudent ? 'Update Profile' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
