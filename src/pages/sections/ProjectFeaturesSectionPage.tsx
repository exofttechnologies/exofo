import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Layers, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Upload,
  FileCheck2,
  Download
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectFeature, ProjectDocument } from '../../types';

export const ProjectFeaturesSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleSrsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const extension = file.name.split('.').pop()?.toUpperCase() || 'PDF';

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      category: 'SRS Documents',
      size: sizeFormatted,
      uploadDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      uploadedBy: 'Admin',
      fileType: extension,
    };

    const updatedDocuments = [newDoc, ...(project.documents || [])];
    await projectService.updateProject(project.id, { documents: updatedDocuments });
    setProject({ ...project, documents: updatedDocuments });

    setToastMessage(`SRS document "${file.name}" uploaded successfully!`);
    setTimeout(() => setToastMessage(null), 3500);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteSrsDoc = async (docId: string) => {
    if (!project) return;
    if (window.confirm('Are you sure you want to remove this SRS document?')) {
      const updatedDocuments = project.documents.filter(d => d.id !== docId);
      await projectService.updateProject(project.id, { documents: updatedDocuments });
      setProject({ ...project, documents: updatedDocuments });
    }
  };

  const handleDeleteFeature = async (e: React.MouseEvent, featureId: string) => {
    e.stopPropagation();
    if (!project) return;
    if (window.confirm('Are you sure you want to delete this feature?')) {
      await projectService.deleteFeature(project.id, featureId);
      const updated = await projectService.getProjectById(project.id);
      if (updated) setProject(updated);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading project features...</div>;
  if (!project) return null;

  const srsDocuments = (project.documents || []).filter(d => d.category === 'SRS Documents');

  return (
    <div className="w-full pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Hidden file input for SRS Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.xls,.zip"
        onChange={handleSrsUpload}
        className="hidden"
      />

      {/* Header & Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Project Sections</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs sm:text-sm font-bold shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <Upload className="w-4 h-4 stroke-[2.2] text-blue-600" />
            <span>Upload SRS</span>
          </button>

          <button
            onClick={() => navigate(`/projects/${project.id}/features/create`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Feature</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Features & Requirements
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Manage functional specs, SRS requirement files, and deliverables for {project.name}.
        </p>
      </div>

      {/* SRS Documents Management Card */}
      <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass mb-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Software Requirements Specification (SRS)</h2>
              <p className="text-[11px] text-slate-400 font-medium">Uploaded technical scope and specifications</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New SRS</span>
          </button>
        </div>

        {srsDocuments.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white/50 text-center cursor-pointer transition-all group"
          >
            <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-slate-700">No SRS Document Uploaded Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click here to upload the project SRS document (.PDF, .DOCX, .XLSX)</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {srsDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {doc.fileType || 'PDF'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {doc.size} • {doc.uploadDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    onClick={() => alert(`Downloading ${doc.name}...`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Download SRS"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSrsDoc(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features List Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Feature Modules ({project.features.length})
        </h2>
      </div>

      {/* Features List */}
      <div className="space-y-3.5">
        {project.features.length === 0 ? (
          <div className="glass-surface rounded-[26px] p-10 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Features Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "Add Feature" above to specify project deliverables.</p>
          </div>
        ) : (
          project.features.map((feature: ProjectFeature) => (
            <div
              key={feature.id}
              onClick={() => navigate(`/projects/${project.id}/features/${feature.id}`)}
              role="button"
              tabIndex={0}
              className="group glass-surface stat-card-hover rounded-[24px] p-5 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 hover:border-blue-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    feature.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : feature.status === 'In Development'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {feature.status}
                  </span>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    feature.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {feature.priority} Priority
                  </span>

                  {feature.srsDocName && (
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      {feature.srsDocName}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={(e) => handleDeleteFeature(e, feature.id)}
                  aria-label="Delete feature"
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


