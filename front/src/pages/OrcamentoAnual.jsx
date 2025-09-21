import React from 'react';
import './OrcamentoAnual.css'; // Vamos extrair os estilos para um arquivo CSS separado

const OrcamentoAnual = () => {
  // Dados para preenchimento dinâmico (podem vir de props ou estado)
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  return (
    <div className="document">
      {/* Cabeçalho */}
      <div className="doc-header">
        <div className="doc-number">ORÇ/2025/001</div>
        <h1>ORÇAMENTO ANUAL</h1>
        <div className="company">Empresa Agrícola Modelo, Lda.</div>
        <div className="subtitle">Exercício Económico 2025 | Conformidade PGC-AO</div>
      </div>
      
      {/* Sumário Executivo */}
      <div className="executive-summary">
        <h2 style={{color: '#1a365d', marginBottom: '10px'}}>Sumário Executivo</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Receitas Previstas</div>
            <div className="summary-value">15.000.000 Kz</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Custos Totais</div>
            <div className="summary-value">11.625.000 Kz</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Resultado Líquido</div>
            <div className="summary-value positive">3.375.000 Kz</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Margem Líquida</div>
            <div className="summary-value positive">22,5%</div>
          </div>
        </div>
      </div>
      
      {/* 1. PROVEITOS OPERACIONAIS */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-number">1</span>
          PROVEITOS OPERACIONAIS (CLASSE 7 - PGC-AO)
        </h2>
        <table>
          <thead>
            <tr>
              <th>Conta PGC</th>
              <th>Descrição</th>
              <th>Unidade</th>
              <th className="number">Quantidade</th>
              <th className="number">Preço Unit.</th>
              <th className="number">1º Trim</th>
              <th className="number">2º Trim</th>
              <th className="number">3º Trim</th>
              <th className="number">4º Trim</th>
              <th className="number">Total Anual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="pgc-code">714</span></td>
              <td>Milho</td>
              <td>Tonelada</td>
              <td className="number">400</td>
              <td className="number">20.000</td>
              <td className="number">1.500.000</td>
              <td className="number">2.000.000</td>
              <td className="number">2.500.000</td>
              <td className="number">2.000.000</td>
              <td className="number"><strong>8.000.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">714</span></td>
              <td>Feijão</td>
              <td>Tonelada</td>
              <td className="number">150</td>
              <td className="number">30.000</td>
              <td className="number">800.000</td>
              <td className="number">1.200.000</td>
              <td className="number">1.500.000</td>
              <td className="number">1.000.000</td>
              <td className="number"><strong>4.500.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">715</span></td>
              <td>Gado Bovino</td>
              <td>Cabeça</td>
              <td className="number">100</td>
              <td className="number">25.000</td>
              <td className="number">400.000</td>
              <td className="number">600.000</td>
              <td className="number">800.000</td>
              <td className="number">700.000</td>
              <td className="number"><strong>2.500.000</strong></td>
            </tr>
            <tr className="total-row">
              <td colSpan="5"><strong>TOTAL PROVEITOS OPERACIONAIS</strong></td>
              <td className="number">2.700.000</td>
              <td className="number">3.800.000</td>
              <td className="number">4.800.000</td>
              <td className="number">3.700.000</td>
              <td className="number"><strong>15.000.000</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* 2. CUSTOS OPERACIONAIS */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-number">2</span>
          CUSTOS OPERACIONAIS (CLASSE 6 - PGC-AO)
        </h2>
        
        {/* 2.1 CMVMC */}
        <h3 style={{margin: '20px 0 10px', color: '#2c5282'}}>2.1. Custo das Mercadorias Vendidas e Matérias Consumidas (CMVMC)</h3>
        <table>
          <thead>
            <tr>
              <th>Conta PGC</th>
              <th>Descrição</th>
              <th className="number">1º Trim</th>
              <th className="number">2º Trim</th>
              <th className="number">3º Trim</th>
              <th className="number">4º Trim</th>
              <th className="number">Total Anual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="pgc-code">611</span></td>
              <td>Sementes e Adubos</td>
              <td className="number">800.000</td>
              <td className="number">1.200.000</td>
              <td className="number">600.000</td>
              <td className="number">400.000</td>
              <td className="number"><strong>3.000.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">612</span></td>
              <td>Ração e Medicamentos Veterinários</td>
              <td className="number">400.000</td>
              <td className="number">500.000</td>
              <td className="number">450.000</td>
              <td className="number">350.000</td>
              <td className="number"><strong>1.700.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">613</span></td>
              <td>Combustíveis e Lubrificantes</td>
              <td className="number">200.000</td>
              <td className="number">250.000</td>
              <td className="number">300.000</td>
              <td className="number">250.000</td>
              <td className="number"><strong>1.000.000</strong></td>
            </tr>
            <tr className="subtotal-row">
              <td colSpan="2">Subtotal CMVMC</td>
              <td className="number">1.400.000</td>
              <td className="number">1.950.000</td>
              <td className="number">1.350.000</td>
              <td className="number">1.000.000</td>
              <td className="number">5.700.000</td>
            </tr>
          </tbody>
        </table>
        
        {/* 2.2 FSE */}
        <h3 style={{margin: '20px 0 10px', color: '#2c5282'}}>2.2. Fornecimentos e Serviços Externos (FSE)</h3>
        <table>
          <thead>
            <tr>
              <th>Conta PGC</th>
              <th>Descrição</th>
              <th className="number">1º Trim</th>
              <th className="number">2º Trim</th>
              <th className="number">3º Trim</th>
              <th className="number">4º Trim</th>
              <th className="number">Total Anual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="pgc-code">622</span></td>
              <td>Consultoria Agronómica</td>
              <td className="number">150.000</td>
              <td className="number">150.000</td>
              <td className="number">150.000</td>
              <td className="number">150.000</td>
              <td className="number"><strong>600.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">624</span></td>
              <td>Energia e Água</td>
              <td className="number">100.000</td>
              <td className="number">120.000</td>
              <td className="number">140.000</td>
              <td className="number">115.000</td>
              <td className="number"><strong>475.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">625</span></td>
              <td>Transportes e Deslocações</td>
              <td className="number">125.000</td>
              <td className="number">150.000</td>
              <td className="number">175.000</td>
              <td className="number">150.000</td>
              <td className="number"><strong>600.000</strong></td>
            </tr>
            <tr className="subtotal-row">
              <td colSpan="2">Subtotal FSE</td>
              <td className="number">375.000</td>
              <td className="number">420.000</td>
              <td className="number">465.000</td>
              <td className="number">415.000</td>
              <td className="number">1.675.000</td>
            </tr>
          </tbody>
        </table>
        
        {/* 2.3 Custos com Pessoal */}
        <h3 style={{margin: '20px 0 10px', color: '#2c5282'}}>2.3. Custos com o Pessoal</h3>
        <table>
          <thead>
            <tr>
              <th>Conta PGC</th>
              <th>Descrição</th>
              <th>Qtd</th>
              <th className="number">Salário Mensal</th>
              <th className="number">1º Trim</th>
              <th className="number">2º Trim</th>
              <th className="number">3º Trim</th>
              <th className="number">4º Trim</th>
              <th className="number">Total Anual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="pgc-code">632</span></td>
              <td>Trabalhadores Permanentes</td>
              <td>10</td>
              <td className="number">50.000</td>
              <td className="number">500.000</td>
              <td className="number">500.000</td>
              <td className="number">500.000</td>
              <td className="number">650.000</td>
              <td className="number"><strong>2.150.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">632</span></td>
              <td>Trabalhadores Sazonais</td>
              <td>5</td>
              <td className="number">30.000</td>
              <td className="number">100.000</td>
              <td className="number">100.000</td>
              <td className="number">100.000</td>
              <td className="number">150.000</td>
              <td className="number"><strong>450.000</strong></td>
            </tr>
            <tr>
              <td><span className="pgc-code">635</span></td>
              <td>Encargos Sociais (INSS)</td>
              <td>-</td>
              <td className="number">-</td>
              <td className="number">150.000</td>
              <td className="number">150.000</td>
              <td className="number">150.000</td>
              <td className="number">200.000</td>
              <td className="number"><strong>650.000</strong></td>
            </tr>
            <tr className="subtotal-row">
              <td colSpan="4">Subtotal Pessoal</td>
              <td className="number">750.000</td>
              <td className="number">750.000</td>
              <td className="number">750.000</td>
              <td className="number">1.000.000</td>
              <td className="number">3.250.000</td>
            </tr>
          </tbody>
        </table>
        
        {/* 2.4 Amortizações */}
        <h3 style={{margin: '20px 0 10px', color: '#2c5282'}}>2.4. Amortizações e Provisões</h3>
        <table>
          <thead>
            <tr>
              <th>Conta PGC</th>
              <th>Descrição</th>
              <th className="number">1º Trim</th>
              <th className="number">2º Trim</th>
              <th className="number">3º Trim</th>
              <th className="number">4º Trim</th>
              <th className="number">Total Anual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="pgc-code">641</span></td>
              <td>Amortização de Equipamentos</td>
              <td className="number">250.000</td>
              <td className="number">250.000</td>
              <td className="number">250.000</td>
              <td className="number">250.000</td>
              <td className="number"><strong>1.000.000</strong></td>
            </tr>
            <tr className="total-row">
              <td colSpan="2"><strong>TOTAL CUSTOS OPERACIONAIS</strong></td>
              <td className="number">2.775.000</td>
              <td className="number">3.370.000</td>
              <td className="number">2.815.000</td>
              <td className="number">2.665.000</td>
              <td className="number"><strong>11.625.000</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* 3. DEMONSTRAÇÃO DE RESULTADOS */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-number">3</span>
          DEMONSTRAÇÃO DE RESULTADOS PREVISIONAL
        </h2>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th className="number">1º Trim</th>
              <th className="number">2º Trim</th>
              <th className="number">3º Trim</th>
              <th className="number">4º Trim</th>
              <th className="number">Total Anual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>(+) Proveitos Operacionais</strong></td>
              <td className="number">2.700.000</td>
              <td className="number">3.800.000</td>
              <td className="number">4.800.000</td>
              <td className="number">3.700.000</td>
              <td className="number"><strong>15.000.000</strong></td>
            </tr>
            <tr>
              <td><strong>(-) Custos Operacionais</strong></td>
              <td className="number">(2.775.000)</td>
              <td className="number">(3.370.000)</td>
              <td className="number">(2.815.000)</td>
              <td className="number">(2.665.000)</td>
              <td className="number"><strong>(11.625.000)</strong></td>
            </tr>
            <tr className="subtotal-row">
              <td><strong>= Resultado Operacional (EBITDA)</strong></td>
              <td className="number">(75.000)</td>
              <td className="number">430.000</td>
              <td className="number">1.985.000</td>
              <td className="number">1.035.000</td>
              <td className="number"><strong>3.375.000</strong></td>
            </tr>
            <tr>
              <td>(-) Imposto Industrial (25%)</td>
              <td className="number">0</td>
              <td className="number">(107.500)</td>
              <td className="number">(496.250)</td>
              <td className="number">(258.750)</td>
              <td className="number">(862.500)</td>
            </tr>
            <tr className="total-row">
              <td><strong>= RESULTADO LÍQUIDO DO EXERCÍCIO</strong></td>
              <td className="number negative">(75.000)</td>
              <td className="number positive">322.500</td>
              <td className="number positive">1.488.750</td>
              <td className="number positive">776.250</td>
              <td className="number positive"><strong>2.512.500</strong></td>
            </tr>
          </tbody>
        </table>
        
        {/* Gráfico de Evolução Mensal */}
        <div className="monthly-chart">
          <h3 className="chart-title">Evolução do Resultado Líquido Mensal</h3>
          <div className="chart-bars">
            <div className="bar-group">
              <div className="bar negative" style={{height: '10px'}}>
                <span className="bar-value">-25k</span>
              </div>
              <span className="bar-label">Jan</span>
            </div>
            <div className="bar-group">
              <div className="bar negative" style={{height: '10px'}}>
                <span className="bar-value">-25k</span>
              </div>
              <span className="bar-label">Fev</span>
            </div>
            <div className="bar-group">
              <div className="bar negative" style={{height: '10px'}}>
                <span className="bar-value">-25k</span>
              </div>
              <span className="bar-label">Mar</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '40px'}}>
                <span className="bar-value">107k</span>
              </div>
              <span className="bar-label">Abr</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '40px'}}>
                <span className="bar-value">107k</span>
              </div>
              <span className="bar-label">Mai</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '40px'}}>
                <span className="bar-value">107k</span>
              </div>
              <span className="bar-label">Jun</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '150px'}}>
                <span className="bar-value">496k</span>
              </div>
              <span className="bar-label">Jul</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '150px'}}>
                <span className="bar-value">496k</span>
              </div>
              <span className="bar-label">Ago</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '150px'}}>
                <span className="bar-value">496k</span>
              </div>
              <span className="bar-label">Set</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '80px'}}>
                <span className="bar-value">259k</span>
              </div>
              <span className="bar-label">Out</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '80px'}}>
                <span className="bar-value">259k</span>
              </div>
              <span className="bar-label">Nov</span>
            </div>
            <div className="bar-group">
              <div className="bar positive" style={{height: '80px'}}>
                <span className="bar-value">259k</span>
              </div>
              <span className="bar-label">Dez</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 4. INDICADORES E RÁCIOS */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-number">4</span>
          INDICADORES FINANCEIROS
        </h2>
        <div className="indicators-grid">
          <div className="indicator-card">
            <div className="indicator-label">Margem Bruta</div>
            <div className="indicator-value">62%</div>
          </div>
          <div className="indicator-card">
            <div className="indicator-label">Margem Operacional</div>
            <div className="indicator-value">22,5%</div>
          </div>
          <div className="indicator-card">
            <div className="indicator-label">Margem Líquida</div>
            <div className="indicator-value">16,8%</div>
          </div>
          <div className="indicator-card">
            <div className="indicator-label">Ponto de Equilíbrio</div>
            <div className="indicator-value">9.375.000 Kz</div>
          </div>
          <div className="indicator-card">
            <div className="indicator-label">Prazo Médio Retorno</div>
            <div className="indicator-value">3,2 anos</div>
          </div>
          <div className="indicator-card">
            <div className="indicator-label">ROI Previsto</div>
            <div className="indicator-value">31,2%</div>
          </div>
        </div>
      </div>
      
      {/* 5. NOTAS E PREMISSAS */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-number">5</span>
          NOTAS E PREMISSAS DO ORÇAMENTO
        </h2>
        <div className="notes-section">
          <div className="notes-title">Premissas Utilizadas:</div>
          <ul className="notes-list">
            <li>Taxa de câmbio considerada: 1 USD = 850 AOA</li>
            <li>Taxa de inflação projetada: 15% ao ano</li>
            <li>Preços baseados em contratos de fornecimento já negociados</li>
            <li>Sazonalidade agrícola considerada: maior produção no 3º trimestre</li>
            <li>Taxa de Imposto Industrial: 25% sobre lucros tributáveis</li>
            <li>Depreciação linear de equipamentos em 10 anos</li>
            <li>Conformidade total com o Plano Geral de Contabilidade de Angola (PGC-AO)</li>
            <li>Subsídio de férias và 13º salário incluídos nos custos com pessoal</li>
          </ul>
        </div>
      </div>
      
      {/* Assinaturas */}
      <div className="section">
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-title">Elaborado por</div>
            <div className="signature-name">Departamento Financeiro</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-title">Revisto por</div>
            <div className="signature-name">Diretor Financeiro</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-title">Aprovado por</div>
            <div className="signature-name">Administração</div>
          </div>
        </div>
      </div>
      
      {/* Rodapé */}
      <div className="doc-footer">
        <p>Sistema Híbrido de Orçamento - Conformidade PGC-AO</p>
        <p style={{fontSize: '0.9rem', marginTop: '10px', opacity: '0.8'}}>
          Documento gerado automaticamente após validação de dados e mapeamento PGC-AO
        </p>
        <p style={{fontSize: '0.85rem', marginTop: '5px', opacity: '0.6'}}>
          Data de Emissão: {currentDate} | Válido para o exercício de 2025
        </p>
      </div>
    </div>
  );
};

export default OrcamentoAnual;