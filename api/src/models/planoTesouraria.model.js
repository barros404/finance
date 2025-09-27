const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PlanoTesouraria = sequelize.define('PlanoTesouraria', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            comment: 'Identificador único do plano'
        },
        nome: {
            type: DataTypes.STRING(150),
            allowNull: false,
            comment: 'Nome do plano'
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Descrição do plano'
        },
        ano: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Ano do plano'
        },
        mes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mês do plano (1-12)'
        },
        saldoInicial: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Saldo inicial do mês'
        },
        orcamentoId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID do orçamento referência'
        },
        necessidadeFinanciamento: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Valor necessário de financiamento'
        },
        status: {
            type: DataTypes.ENUM('rascunho', 'em_analise', 'aprovado', 'rejeitado', 'arquivado'),
            allowNull: false,
            defaultValue: 'rascunho',
            comment: 'Status do plano'
        },
        empresaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'ID da empresa'
        },
        criadoPor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'ID do usuário que criou'
        },
        aprovadoPor: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID do usuário que aprovou'
        },
        aprovadoEm: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Data de aprovação'
        },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observações do plano'
        }
    }, {
        tableName: 'PlanoTesourarias',
        timestamps: true
    });

    PlanoTesouraria.associate = (models) => {
        PlanoTesouraria.belongsTo(models.Empresa, {
            foreignKey: 'empresaId',
            as: 'empresas'
        });
        PlanoTesouraria.belongsTo(models.Orcamento, {
            foreignKey: 'orcamentoId',
            as: 'orcamentos'
        });

        PlanoTesouraria.belongsTo(models.Usuario, {
            foreignKey: 'criadoPor',
            as: 'criador'
        });

        PlanoTesouraria.belongsTo(models.Usuario, {
            foreignKey: 'aprovadoPor',
            as: 'aprovador'
        });

        PlanoTesouraria.hasMany(models.FinanciamentoTesouraria, {
            foreignKey: 'planoId',
            as: 'financiamentos'
        });

        PlanoTesouraria.hasMany(models.EntradaTesouraria, {
            foreignKey: 'planoId',
            as: 'entradas'
        });

        PlanoTesouraria.hasMany(models.SaidaTesouraria, {
            foreignKey: 'planoId',
            as: 'saidas'
        });
    };

    return PlanoTesouraria;
};