import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Image, File, AlertCircle, CheckCircle, X, Eye, Download } from 'lucide-react';
import { uploadApi, processamentoApi } from '../../services/upload/uploadApi.js';

const CapturaDocumentos = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      result: null,
      error: null
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const processFiles = async () => {
    setIsProcessing(true);
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file.status === 'pending') {
        setUploadedFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
        ));
        
        try {
          // Simular upload usando mock
          const uploadResult = await uploadApi.uploadArquivo(file.file, {
            tipo: 'documento',
            categoria: 'financeiro'
          });
          
          // Simular processamento
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setUploadedFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            ));
          }
          
          // Simular resultado do processamento
          const processResult = await processamentoApi.processarArquivo(uploadResult.data.id);
          
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'completed',
              result: {
                extractedText: 'Texto extraído do documento via OCR...',
                pgcMapping: {
                  confidence: Math.floor(Math.random() * 30) + 70,
                  mappedAccounts: ['611 - Matérias-Primas', '622 - Serviços Especializados', '632 - Remunerações']
                },
                arquivoId: uploadResult.data.id
              },
              error: null
            } : f
          ));
        } catch (error) {
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error',
              result: null,
              error: 'Erro no processamento do arquivo'
            } : f
          ));
        }
      }
    }
    
    setIsProcessing(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'processing': return <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              📸
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">CAPTURA & OCR</h1>
              <p className="text-xs text-white/60">Upload, digitalização e extração automática de texto</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md"
            >
              <Upload className="w-4 h-4" />
              Selecionar Arquivos
            </button>
            <button 
              onClick={processFiles}
              disabled={uploadedFiles.length === 0 || isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Processar Documentos
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10 space-y-8">
        
        {/* Upload Area */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/30">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-blue-400 bg-blue-500/10' 
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.tiff"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-[#667eea]/30">
                📤
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Arraste e solte seus documentos aqui</h3>
                <p className="text-white/70 mb-4">
                  Suporte para PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TIFF
                </p>
                <p className="text-sm text-white/50">
                  Tamanho máximo: 10MB por arquivo
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all font-semibold"
              >
                Ou clique para selecionar
              </button>
            </div>
          </div>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <h2 className="text-xl font-bold text-white">Documentos Carregados ({uploadedFiles.length})</h2>
            </div>
            
            <div className="divide-y divide-white/10">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-6 hover:bg-white/5 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#667eea]/30">
                        {getFileIcon(file.type)}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg mb-1">{file.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-white/70">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="capitalize">{file.type.split('/')[1]}</span>
                          {file.status === 'processing' && (
                            <span className="text-blue-400">Processando... {file.progress}%</span>
                          )}
                        </div>
                        
                        {file.status === 'processing' && (
                          <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                        
                        {file.error && (
                          <p className="text-red-400 text-sm mt-1">{file.error}</p>
                        )}
                        
                        {file.result && (
                          <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-green-400 text-sm font-semibold mb-1">
                              ✅ Processado com sucesso
                            </p>
                            <p className="text-white/70 text-xs">
                              Confiança do mapeamento: {file.result.pgcMapping.confidence}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {file.status === 'completed' && (
                        <>
                          <button className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all">
                            <Download className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
              {uploadedFiles.filter(f => f.status === 'completed').length}
            </div>
            <p className="text-white/70">Processados</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
              {uploadedFiles.filter(f => f.status === 'processing').length}
            </div>
            <p className="text-white/70">Processando</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
              {uploadedFiles.filter(f => f.status === 'error').length}
            </div>
            <p className="text-white/70">Com Erro</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
              {uploadedFiles.length}
            </div>
            <p className="text-white/70">Total</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
        <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
        <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
      </footer>
    </div>
  );
};

export default CapturaDocumentos;
