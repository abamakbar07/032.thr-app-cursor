'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useParams, useRouter } from 'next/navigation';
import { getGameRoom, getCousinEntries, createCousinEntries } from '@/lib/actions';
import Link from 'next/link';

// Match the types from the server
interface CousinEntry {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  hasEntered: boolean;
  userId?: string;
  createdAt: string;
}

// Match the types returned by createCousinEntries
interface EntryWithQR {
  _id: unknown;
  code: string;
  name: string;
  isActive: boolean;
  hasEntered: boolean;
  userId?: unknown;
  createdAt: string;
  qrCodeUrl: string;
}

export default function ManageEntriesPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [roomName, setRoomName] = useState('');
  const [entries, setEntries] = useState<CousinEntry[]>([]);
  const [generatedEntries, setGeneratedEntries] = useState<EntryWithQR[]>([]);
  
  // Form for generating new entries
  const [entryPrefix, setEntryPrefix] = useState('Cousin');
  const [entryCount, setEntryCount] = useState(5);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (typeof roomId !== 'string') return;
        
        // Get room details
        const roomResult = await getGameRoom(roomId);
        if (!roomResult.success || !roomResult.data) {
          setError(roomResult.error || 'Failed to load room data');
          return;
        }
        
        setRoomName(roomResult.data.name);
        
        // Get entries
        const entriesResult = await getCousinEntries(roomId);
        if (entriesResult.success && entriesResult.data) {
          setEntries(entriesResult.data);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [roomId]);
  
  const handleGenerateEntries = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setSuccess(null);
    setGeneratedEntries([]);
    
    try {
      if (typeof roomId !== 'string') return;
      
      if (entryCount <= 0 || entryCount > 100) {
        setError('Please enter a valid number of entries (1-100)');
        return;
      }
      
      const result = await createCousinEntries(roomId, {
        name: entryPrefix.trim() || 'Cousin',
        count: entryCount
      });
      
      if (result.success && result.data) {
        // Cast the result data to our EntryWithQR interface
        setGeneratedEntries(result.data as unknown as EntryWithQR[]);
        setSuccess(`Successfully generated ${result.data.length} new entry codes`);
        
        // Refresh entries list
        const refreshResult = await getCousinEntries(roomId);
        if (refreshResult.success && refreshResult.data) {
          setEntries(refreshResult.data);
        }
      } else {
        setError(result.error || 'Failed to generate entries');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setGenerating(false);
    }
  };
  
  // Filter entries
  const activeEntries = entries.filter(entry => entry.isActive);
  const inactiveEntries = entries.filter(entry => !entry.isActive);
  const usedEntries = entries.filter(entry => entry.hasEntered);
  const unusedEntries = entries.filter(entry => !entry.hasEntered);
  
  if (loading && error === null) {
    return <div className="p-8 text-center">Loading entries...</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Entry Codes</h1>
          <p className="text-gray-500">Room: {roomName}</p>
        </div>
        <Link href={`/dashboard/rooms/${roomId}`}>
          <Button variant="outline">Back to Room</Button>
        </Link>
      </div>
      
      {error && (
        <Card className="p-4 mb-6 bg-red-50 text-red-800">
          {error}
        </Card>
      )}
      
      {success && (
        <Card className="p-4 mb-6 bg-green-50 text-green-800">
          {success}
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate new entries */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Generate Entry Codes</h2>
          <form onSubmit={handleGenerateEntries}>
            <div className="space-y-4">
              <div>
                <label htmlFor="entryPrefix" className="block mb-2 font-medium">
                  Entry Name Prefix
                </label>
                <Input
                  id="entryPrefix"
                  value={entryPrefix}
                  onChange={(e) => setEntryPrefix(e.target.value)}
                  placeholder="e.g. Cousin or Family Member"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used as the base name for generated entries.
                </p>
              </div>
              
              <div>
                <label htmlFor="entryCount" className="block mb-2 font-medium">
                  Number of Entries
                </label>
                <Input
                  id="entryCount"
                  type="number"
                  value={entryCount}
                  onChange={(e) => setEntryCount(parseInt(e.target.value, 10) || 0)}
                  placeholder="How many entry codes to generate"
                  min="1"
                  max="100"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={generating}
                className="w-full"
              >
                {generating ? 'Generating...' : 'Generate Entries'}
              </Button>
            </div>
          </form>
        </Card>
        
        {/* Entry statistics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Entry Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-3xl font-bold">{entries.length}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Used Entries</p>
              <p className="text-3xl font-bold">{usedEntries.length}</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Entries</p>
              <p className="text-3xl font-bold">{activeEntries.length}</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Inactive Entries</p>
              <p className="text-3xl font-bold">{inactiveEntries.length}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recently generated entries */}
      {generatedEntries.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Recently Generated Entries</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedEntries.map((entry) => (
                  <tr key={String(entry._id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {entry.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.qrCodeUrl && (
                        <img src={entry.qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Tip: Save these codes or print them for distribution. Participants will use these codes to join the game.
            </p>
          </div>
        </Card>
      )}
      
      {/* All entries list */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">All Entry Codes</h2>
        
        {entries.length === 0 ? (
          <div className="text-center p-4 bg-yellow-50 rounded-md">
            No entry codes have been generated yet for this room.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {entry.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${entry.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {entry.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full mt-1 ${entry.hasEntered ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {entry.hasEntered ? 'Used' : 'Unused'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 