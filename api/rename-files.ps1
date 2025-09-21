# Script para renomear arquivos para o padrão kebab-case

# Renomear arquivos em controllers
Rename-Item -Path "src\controllers\budget.controller.js" -NewName "budget-controller.js" -Force
Rename-Item -Path "src\controllers\empresa.controller.js" -NewName "empresa-controller.js" -Force
Rename-Item -Path "src\controllers\saidaTesouraria.controller.js" -NewName "saida-tesouraria-controller.js" -Force
Rename-Item -Path "src\controllers\usuario.controller.js" -NewName "usuario-controller.js" -Force

# Renomear arquivos em models
Rename-Item -Path "src\models\budget.model.js" -NewName "budget-model.js" -Force
Rename-Item -Path "src\models\budgetAsset.model.js" -NewName "budget-asset-model.js" -Force
Rename-Item -Path "src\models\budgetCost.model.js" -NewName "budget-cost-model.js" -Force
Rename-Item -Path "src\models\budgetRevenue.model.js" -NewName "budget-revenue-model.js" -Force
Rename-Item -Path "src\models\company.model.js" -NewName "company-model.js" -Force
Rename-Item -Path "src\models\custo.model.js" -NewName "custo-model.js" -Force
Rename-Item -Path "src\models\user.model.js" -NewName "user-model.js" -Force

# Renomear arquivos em routes
Rename-Item -Path "src\routes\auth.routes.js" -NewName "auth-routes.js" -Force
Rename-Item -Path "src\routes\budget.routes.js" -NewName "budget-routes.js" -Force
Rename-Item -Path "src\routes\tesouraria.routes.js" -NewName "tesouraria-routes.js" -Force

Write-Host "Arquivos renomeados com sucesso para o padrão kebab-case!"
