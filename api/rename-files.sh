#!/bin/bash

# Renomear arquivos em controllers
mv src/controllers/budget.controller.js src/controllers/budget-controller.js
mv src/controllers/empresa.controller.js src/controllers/empresa-controller.js
mv src/controllers/saidaTesouraria.controller.js src/controllers/saida-tesouraria-controller.js
mv src/controllers/usuario.controller.js src/controllers/usuario-controller.js

# Renomear arquivos em models
mv src/models/budget.model.js src/models/budget-model.js
mv src/models/budgetAsset.model.js src/models/budget-asset-model.js
mv src/models/budgetCost.model.js src/models/budget-cost-model.js
mv src/models/budgetRevenue.model.js src/models/budget-revenue-model.js
mv src/models/company.model.js src/models/company-model.js
mv src/models/custo.model.js src/models/custo-model.js
mv src/models/user.model.js src/models/user-model.js

# Renomear arquivos em routes
mv src/routes/auth.routes.js src/routes/auth-routes.js
mv src/routes/budget.routes.js src/routes/budget-routes.js
mv src/routes/tesouraria.routes.js src/routes/tesouraria-routes.js

echo "Arquivos renomeados com sucesso para o padrão kebab-case!"
