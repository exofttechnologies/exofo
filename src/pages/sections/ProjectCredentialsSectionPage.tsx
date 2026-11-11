import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ExternalLink, 
  X 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectCredential } from '../../types';

export const ProjectCredentialsSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Revealed passwords state: set of credential IDs currently shown
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Credential modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      if (data) setProject(data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !platform.trim() || !username.trim() || !password.trim()) return;

    await projectService.addCredential(project.id, {
      platform: platform.trim(),
      url: url.trim() || 'https://',
      username: username.trim(),
      password: password.trim(),
      notes: notes.trim() || 'Direct project access key.',
      lastUpdated: 'Just now',
    });

    const updated = await projectService.getProjectById(project.id);
    if (updated) setProject(updated);

    setPlatform('');
    setUrl('');
    setUsername('');
    setPassword('');
    setNotes('');
    setIsAddOpen(false);
  };

  const handleDelete = async (credId: string) => {
    if (!project) return;
    if (window.confirm('Delete these stored project credentials?')) {
      await projectService.deleteCredential(project.id, credId);
      const updated = await projectService.getProjectById(project.id);
      if (updated) setProject(updated);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading Password Vault...</div>;
  if (!project) return null;

  return (
    <div className="w-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Project Sections</span>
        </button>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Credentials</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Password Vault & Secrets
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Encrypted credentials, cloud dashboards, and API service keys for {project.name}.
        </p>
      </div>

      {/* Security Notice */}
      <div className="glass-surface rounded-2xl p-4 mb-6 border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
        <Key className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <span>Passwords are masked by default. Click the eye icon to reveal secrets securely.</span>
      </div>

      {/* Credentials Grid */}
      <div className="space-y-4">
        {project.credentials.length === 0 ? (
          <div className="glass-surface rounded-[26px] p-10 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Credentials Stored</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "Add Credentials" to safely store project logins.</p>
          </div>
        ) : (
          project.credentials.map((cred) => {
            const isRevealed = revealedIds.includes(cred.id);

            return (
              <div
                key={cred.id}
                className="glass-surface stat-card-hover rounded-[24px] p-5 border border-white/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                      {cred.platform}
                    </h3>
                    <a
                      href={cred.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span className="truncate">{cred.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleDelete(cred.id)}
                    aria-label="Delete credentials"
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors self-end sm:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Row: Username & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* Username */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username / Key</p>
                      <p className="text-xs font-bold text-slate-800 font-mono mt-0.5 select-all">{cred.username}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(cred.username, `${cred.id}-user`)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-2xs"
                      title="Copy username"
                    >
                      {copiedId === `${cred.id}-user` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Password */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password Secret</p>
                      <p className="text-xs font-bold text-slate-800 font-mono mt-0.5 truncate select-all">
                        {isRevealed ? cred.password : '••••••••••••••••••••'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleReveal(cred.id)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-2xs"
                        title={isRevealed ? 'Hide Password' : 'Reveal Password'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(cred.password, `${cred.id}-pass`)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-2xs"
                        title="Copy password"
                      >
                        {copiedId === `${cred.id}-pass` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {cred.notes && (
                  <p className="text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-600">Note: </span>{cred.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Credential Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
              <h3 className="font-extrabold text-slate-900 text-lg">Store Project Credentials</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCredential} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Platform / Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Production Console or SendGrid API"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://dashboard.stripe.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username / Key</label>
                  <input
                    type="text"
                    placeholder="admin@exofo.internal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password / Token</label>
                  <input
                    type="text"
                    placeholder="SuperSecretPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or MFA backup codes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

