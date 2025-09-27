const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Custo = sequelize.define('Custo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identificador único do custo'
    },
    // Campos comuns a todos os custos
    tipoCusto: {
      type: DataTypes.ENUM('material', 'servico', 'pessoal'),
      allowNull: false,
      comment: 'Tipo específico do custo'
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nome do custo'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição do custo'
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Quantidade do custo'
    },
    custoUnitario: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Custo unitário'
    },
    
    // Campos específicos para custos de pessoal
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Apenas para custos de pessoal'
    },
    tipoContratacao: {
      type: DataTypes.ENUM('Permanente', 'Temporário', 'Freelancer'),
      allowNull: true,
      comment: 'Apenas para custos de pessoal'
    },
    salario: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Apenas para custos de pessoal'
    },
    
    // Campos de frequência e temporalidade
    frequencia: {
      type: DataTypes.ENUM('Único', 'Diário', 'Semanal', 'Mensal', 'Trimestral', 'Anual'),
      allowNull: false,
      defaultValue: 'Mensal',
      comment: 'Frequência do custo'
    },
    
    // Campos de relacionamento
    orcamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do orçamento'
    },
    
    // Campo calculado (opcional - pode ser calculado on-the-fly)
    valor: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.tipoCusto === 'pessoal') {
          return (this.salario || 0) * (this.quantidade || 0);
        } else {
          return (this.custoUnitario || 0) * (this.quantidade || 0);
        }
      },
      comment: 'Valor calculado do custo'
    },
    contaPgc: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Código da conta PGC-AO mapeada'
    },
    nomeContaPgc: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Nome da conta PGC-AO'
    },
    confiancaMapeamento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Confiança do mapeamento PGC (0-100)'
    },
    categoriaPersonalizada: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Categoria personalizada pelo usuário'
    },
    mapeamentoManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o mapeamento foi feito manualmente'
    }
    
  }, {
    tableName: 'Custos',
    timestamps: true,
    
    hooks: {
      beforeValidate: (custo) => {
        // Validações condicionais
        if (custo.tipoCusto === 'pessoal') {
          if (!custo.cargo) {
            throw new Error('Cargo é obrigatório para custos de pessoal');
          }
          if (!custo.salario || custo.salario <= 0) {
            throw new Error('Salário é obrigatório para custos de pessoal');
          }
        } else {
          if (!custo.nome) {
            throw new Error('Nome é obrigatório para custos de materiais e serviços');
          }
          if (!custo.custoUnitario || custo.custoUnitario <= 0) {
            throw new Error('Custo unitário é obrigatório');
          }
        }
      },
      
      beforeSave: (custo) => {
        // Garantir consistência dos dados
        if (custo.tipoCusto !== 'pessoal') {
          custo.cargo = null;
          custo.tipoContratacao = null;
          custo.salario = null;
        }
        
        if (custo.tipoCusto === 'pessoal') {
          custo.custoUnitario = null;
        }
      }
    }
  });

  Custo.associate = (models) => {
    Custo.belongsTo(models.Orcamento, {
      foreignKey: 'orcamentoId',
      as: 'orcamento',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  // Métodos de instância úteis
  Custo.prototype.toJSON = function() {
    const values = { ...this.get() };
    
    // Incluir o valor calculado na serialização
    if (this.tipoCusto === 'pessoal') {
      values.valor = (values.salario || 0) * (values.quantidade || 0);
    } else {
      values.valor = (values.custoUnitario || 0) * (values.quantidade || 0);
    }
    
    return values;
  };

  // Método para facilitar a criação baseado no tipo
  Custo.criarPorTipo = function(tipo, dados) {
    const camposPermitidos = {
      material: ['nome', 'descricao', 'quantidade', 'custoUnitario', 'frequencia', 'mes', 'orcamentoId'],
      servico: ['nome', 'descricao', 'quantidade', 'custoUnitario', 'frequencia', 'mes', 'orcamentoId'],
      pessoal: ['cargo', 'quantidade', 'salario', 'tipoContratacao', 'frequencia', 'mes', 'orcamentoId']
    };
    
    const dadosFiltrados = {};
    camposPermitidos[tipo].forEach(campo => {
      if (dados[campo] !== undefined) {
        dadosFiltrados[campo] = dados[campo];
      }
    });
    
    dadosFiltrados.tipoCusto = tipo;
    
    return this.create(dadosFiltrados);
  };

  return Custo;
};