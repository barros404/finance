/**
 * Página de Diagnóstico - EndiAgro FinancePro
 * 
 * Esta página fornece uma interface completa para diagnosticar
 * problemas de integração entre frontend e backend.
 * 
 * @author Antonio Emiliano Barros
 * @version 1.0.0
 */

import React from 'react';
import DiagnosticPanel from '../components/DiagnosticPanel';
import Layout from '../components/Layout';

const DiagnosticPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <DiagnosticPanel />
      </div>
    </Layout>
  );
};

export default DiagnosticPage;
