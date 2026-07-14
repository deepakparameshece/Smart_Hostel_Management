'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import SmartAllocationModal from "@/components/SmartAllocationModal";
import apiClient from "@/lib/api";

export default function RoomManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [allocateModal, setAllocateModal] = useState<any>(null); 
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [newFloorNumber, setNewFloorNumber] = useState('');
  const [floorLoading, setFloorLoading] = useState(false);
  
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    type: 'DOUBLE',
    capacity: 2,
    monthlyRent: 0,
    floorId: '',
    description: ''
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, floorsRes, studentsRes] = await Promise.all([
        apiClient.get('/rooms'),
        apiClient.get('/structure/floors'),
        apiClient.get('/students')
      ]);
      
      const roomsData = roomsRes.data.data || roomsRes.data;
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      
      const floorsData = floorsRes.data;
      setFloors(Array.isArray(floorsData) ? floorsData : []);

      const studentsData = studentsRes.data.data || studentsRes.data;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      
      if (floorsData.length > 0) {
        setRoomFormData(prev => ({ ...prev, floorId: floorsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      type: 'DOUBLE',
      capacity: 2,
      monthlyRent: 7500,
      floorId: floors[0]?.id || '',
      description: ''
    });
    setShowModal(true);
  };

  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorNumber) return;
    setFloorLoading(true);
    try {
      await apiClient.post('/structure/floors', { floorNumber: parseInt(newFloorNumber) });
      setNewFloorNumber('');
      fetchData();
      alert('Floor added successfully!');
    } catch (error: any) {
      console.error('Error adding floor:', error);
      alert(error.response?.data?.error || 'Failed to add floor');
    } finally {
      setFloorLoading(false);
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    if (!confirm('Are you sure you want to delete this floor? All rooms on this floor will also be deleted.')) return;
    try {
      await apiClient.delete(`/structure/floors/${floorId}`);
      fetchData();
      alert('Floor deleted successfully!');
    } catch (error) {
      console.error('Error deleting floor:', error);
      alert('Failed to delete floor');
    }
  };

  const handleOpenEdit = (room: any) => {
    setEditingRoom(room);
    setRoomFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      capacity: room.capacity || 0,
      monthlyRent: room.monthlyRent || 0,
      floorId: room.floorId,
      description: room.description || ''
    });
    setShowModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.floorId) {
      alert("A floor must be configured and selected. Please configure a floor first using the 'Manage Floors' option.");
      return;
    }
    try {
      if (editingRoom) {
        await apiClient.put(`/rooms/${editingRoom.id}`, roomFormData);
      } else {
        await apiClient.post('/rooms', roomFormData);
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving room:', error);
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to save room';
      alert(msg);
    }
  };

  const handleManualAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !allocateModal) return;
    try {
      await apiClient.post('/allocations', {
        studentId: selectedStudentId,
        roomId: allocateModal.id
      });
      alert('Student allocated successfully!');
      setAllocateModal(null);
      setSelectedStudentId('');
      fetchData();
    } catch (error: any) {
      console.error('Allocation error:', error);
      const msg = error.response?.data?.error || 'Failed to allocate student.';
      alert(msg);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await apiClient.delete(`/rooms/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const [filterTab, setFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Status mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-success-emerald/10 text-success-emerald border border-success-emerald/20';
      case 'OCCUPIED': return 'bg-primary/10 text-primary border border-primary/20';
      case 'MAINTENANCE': return 'bg-error/10 text-error border border-error/20';
      default: return 'bg-surface-variant text-outline border border-surface-border';
    }
  };

  const filteredRooms = rooms.filter(room => {
    // Search filter
    if (searchQuery && !room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Tab filter
    if (filterTab === 'ALL') return true;
    if (filterTab === 'MAINTENANCE') return room.status === 'MAINTENANCE';
    if (filterTab === 'VACANT') return room.currentOccupancy === 0;
    if (filterTab.startsWith('FLOOR_')) {
      const floorNum = parseInt(filterTab.split('_')[1]);
      return room.floor?.floorNumber === floorNum;
    }
    return true;
  });

  const vacantCount = rooms.filter(r => r.currentOccupancy === 0).length;
  const maintenanceCount = rooms.filter(r => r.status === 'MAINTENANCE').length;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header title="Room Management" />
      
      <main className="p-container-padding max-w-[1440px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Controls Panel */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-surface-border">
          
          {/* Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setFilterTab('ALL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterTab === 'ALL' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
              }`}
            >
              All Rooms ({rooms.length})
            </button>
            {floors.map(f => (
              <button 
                key={f.id}
                onClick={() => setFilterTab(`FLOOR_${f.floorNumber}`)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterTab === `FLOOR_${f.floorNumber}` 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Floor {f.floorNumber} ({rooms.filter(r => r.floorId === f.id).length})
              </button>
            ))}
            <button 
              onClick={() => setFilterTab('MAINTENANCE')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterTab === 'MAINTENANCE' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Maintenance ({maintenanceCount})
            </button>
            <button 
              onClick={() => setFilterTab('VACANT')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterTab === 'VACANT' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Vacant ({vacantCount})
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Room..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-xs text-on-surface"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            </div>
            
            <SmartAllocationModal />
            
            {user?.role !== 'WARDEN' && (
              <>
                <button 
                  onClick={() => setShowFloorModal(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-surface-container-lowest border border-surface-border text-on-surface rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                  Manage Floors
                </button>
                <button 
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Room
                </button>
              </>
            )}
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {loading ? (
            <div className="col-span-full text-center text-outline uppercase font-bold text-[10px] tracking-widest py-20">Loading Rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full text-center text-outline py-12">No matching rooms found.</div>
          ) : filteredRooms.map((room) => {
             const occupancyRate = room.capacity > 0 ? (room.currentOccupancy / room.capacity) * 100 : 0;
             const individualRent = room.capacity > 0 ? (room.monthlyRent / room.capacity) : room.monthlyRent;
             return (
              <div key={room.id} className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-0.5 bg-surface-container rounded text-[10px] font-bold text-primary uppercase tracking-wider">{room.type}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </div>
                  
                  <h3 className="font-headline-md text-xl font-bold text-on-surface">Room {room.roomNumber}</h3>
                  <p className="text-[11px] text-outline mt-1 font-medium">Floor {room.floor?.floorNumber || '1'} &bull; Block {room.floor?.block?.name || 'A'}</p>

                  <div className="space-y-2 mt-4 pt-4 border-t border-surface-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-outline">Occupancy</span>
                      <span className="font-bold text-on-surface">{room.currentOccupancy} / {room.capacity} beds</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4 text-xs border-b border-surface-border pb-3">
                    <span className="text-outline">Rent Per Student</span>
                    <span className="font-bold text-success-emerald text-sm">₹{individualRent.toLocaleString()}/mo</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAllocateModal(room)}
                      disabled={room.currentOccupancy >= room.capacity}
                      className="flex-grow py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      Allocate
                    </button>
                    {user?.role !== 'WARDEN' && (
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(room)} 
                          className="p-2 bg-surface-container border border-surface-border text-outline hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)} 
                          className="p-2 bg-surface-container border border-surface-border text-outline hover:text-error rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Room Card Placeholder */}
          {!loading && user?.role !== 'WARDEN' && (
            <div 
              onClick={handleOpenAdd}
              className="border-2 border-dashed border-surface-border hover:border-primary/50 bg-transparent rounded-xl p-5 flex flex-col items-center justify-center min-h-[220px] transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-3">
                <span className="material-symbols-outlined text-[28px]">add</span>
              </div>
              <span className="text-xs font-bold text-outline group-hover:text-primary uppercase tracking-wider transition-colors">Add New Room</span>
            </div>
          )}
        </div>
      </main>

      {/* Manual Allocation Modal */}
      {allocateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6 transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Allocate Room {allocateModal.roomNumber}</h3>
              <button className="p-1 hover:bg-surface-container rounded text-outline cursor-pointer" onClick={() => setAllocateModal(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleManualAllocate} className="space-y-4">
               <div>
                 <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Select Student</label>
                 <select 
                   required 
                   value={selectedStudentId} 
                   onChange={e => setSelectedStudentId(e.target.value)} 
                   className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                 >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                 </select>
               </div>
               <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setAllocateModal(null)} className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer">Confirm Allocation</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6 transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">{editingRoom ? 'Edit Room Settings' : 'Add New Room'}</h3>
              <button className="p-1 hover:bg-surface-container rounded text-outline cursor-pointer" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Room Number</label>
                <input 
                  required 
                  type="text" 
                  value={roomFormData.roomNumber} 
                  onChange={e => setRoomFormData({...roomFormData, roomNumber: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Room Type</label>
                  <select 
                    value={roomFormData.type} 
                    onChange={e => setRoomFormData({...roomFormData, type: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                  >
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="TRIPLE">TRIPLE</option>
                    <option value="DORMITORY">DORMITORY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Bed Capacity</label>
                  <input 
                    required 
                    type="number" 
                    value={roomFormData.capacity.toString()} 
                    onChange={e => setRoomFormData({...roomFormData, capacity: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Monthly Room Rent (₹)</label>
                <input 
                  required 
                  type="number" 
                  value={roomFormData.monthlyRent.toString()} 
                  onChange={e => setRoomFormData({...roomFormData, monthlyRent: parseFloat(e.target.value) || 0})} 
                  className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
                />
              </div>
              {!editingRoom && (
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Select Floor location</label>
                  {floors.length === 0 ? (
                    <p className="text-xs text-error font-bold mt-1">Please add a floor first using the "Manage Floors" tab.</p>
                  ) : (
                    <select 
                      value={roomFormData.floorId} 
                      onChange={e => setRoomFormData({...roomFormData, floorId: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                    >
                      {floors.map(f => <option key={f.id} value={f.id}>{f.block?.name || 'Block A'} - Floor {f.floorNumber}</option>)}
                    </select>
                  )}
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floor Management Modal */}
      {showFloorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6 transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Manage Floors</h3>
              <button onClick={() => setShowFloorModal(false)} className="p-1 hover:bg-surface-container rounded text-outline cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddFloor} className="flex gap-2 mb-6">
              <input 
                required
                type="number" 
                placeholder="New Floor Number..." 
                value={newFloorNumber}
                onChange={e => setNewFloorNumber(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-xs text-on-surface"
              />
              <button 
                type="submit" 
                disabled={floorLoading}
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                Add Floor
              </button>
            </form>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Configured Floors</h4>
              {floors.length === 0 ? (
                <p className="text-xs text-outline py-4 text-center italic">No floors added yet.</p>
              ) : floors.map(f => (
                <div key={f.id} className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-surface-container/50 border border-surface-border">
                  <span className="text-xs font-semibold text-on-surface">Floor {f.floorNumber} ({f.block?.name || 'Block A'})</span>
                  <button 
                    onClick={() => handleDeleteFloor(f.id)} 
                    className="text-outline hover:text-error transition-colors p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
