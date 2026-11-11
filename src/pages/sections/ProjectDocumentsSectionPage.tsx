import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Folder, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Filter, 
  Plus, 
  X 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectDocument } from '../../types';

export const ProjectDocumentsSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<ProjectDocument['category']>('SRS Documents');

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

  const categories = [
    'All',
    'SRS Documents',
    'Design Files',
    'Development Files',
    'Client Documents',
    'General Documents',
  ];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !docName.trim()) return;

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: docName.trim(),
      category: docCategory,
      size: '2.4 MB',
      uploadDate: 'Just now',
      uploadedBy: 'Miqdhadh M.',
      fileType: docName.split('.').pop()?.toUpperCase() || 'PDF',
    };

    const updated = [newDoc, ...project.documents];
    await projectService.updateProject(project.id, { documents: updated });
    setProject({ ...project, documents: updated });

    setDocName('');
    setIsUploadOpen(false);
  };

  const handleDeleteDoc = async (docId: string, name: string) => {
    if (!project) return;
    if (window.confirm(`Delete document "${name}"?`)) {
      const updated = project.documents.filter((d) => d.id !== docId);
      await projectService.updateProject(project.id, { documents: updated });
      setProject({ ...project, documents: updated });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading documents...</div>;
  if (!project) return null;

  const filteredDocs = activeCategory === 'All'
    ? project.documents
    : project.documents.filter((d) => d.category === activeCategory);

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
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <Folder className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Documents ({project.documents.length})
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          SRS specifications, design assets, and client signed agreements for {project.name}.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-2 glass-surface rounded-[26px] p-10 text-center">
            <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Documents in this Category</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "Upload Document" to add files.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="glass-surface stat-card-hover rounded-[24px] p-5 flex items-center justify-between gap-3 border border-white/80"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-black text-xs border border-blue-100">
                  <FileText className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block truncate">
                    {doc.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate leading-tight mt-0.5">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {doc.size} • Uploaded {doc.uploadDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => alert(`Downloading ${doc.name}...`)}
                  title="Download File"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDoc(doc.id, doc.name)}
                  title="Delete File"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors shadow-2xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
              <h3 className="font-extrabold text-slate-900 text-lg">Upload Project Document</h3>
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document File Name</label>
                <input
                  type="text"
                  placeholder="e.g. SRS_Payment_Security_v1.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="SRS Documents">SRS Documents</option>
                  <option value="Design Files">Design Files</option>
                  <option value="Development Files">Development Files</option>
                  <option value="Client Documents">Client Documents</option>
                  <option value="General Documents">General Documents</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Drag & drop file or click to select</p>
                <p className="text-[11px] text-slate-400 mt-1">PDF, DOCX, FIG, SQL, PNG up to 50MB</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

