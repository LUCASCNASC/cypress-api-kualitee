describe('API - Module Update - /module/update', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validModuleId = 22; // Substitua por um id de módulo válido do seu ambiente
  const validModuleName = 'Autenticação';
  const validBuildId = 10; // Substitua por um id de build válido do seu ambiente
  const validModuleDescription = 'Descrição atualizada do módulo de autenticação.';

  function moduleUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/Module/ModuleUpdate',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Atualiza módulo com todos os campos válidos', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    moduleUpdate({
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    moduleUpdate({
      token: 'token_invalido',
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    moduleUpdate({
      token: 'token_expirado',
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    moduleUpdate({
      token: null,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'module_id', 'module_name', 'build_id', 'module_description'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      };
      delete body[field];
      moduleUpdate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', {}, [], true, false].forEach(invalidValue => {
    ['module_name', 'module_description'].forEach(field => {
      it(`Falha com ${field} inválido (${JSON.stringify(invalidValue)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          module_id: validModuleId,
          module_name: validModuleName,
          build_id: validBuildId,
          module_description: validModuleDescription
        };
        body[field] = invalidValue;
        moduleUpdate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      moduleUpdate({
        token: validToken,
        project_id,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(module_id => {
    it(`Falha com module_id inválido (${JSON.stringify(module_id)})`, () => {
      moduleUpdate({
        token: validToken,
        project_id: validProjectId,
        module_id,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(build_id => {
    it(`Falha com build_id inválido (${JSON.stringify(build_id)})`, () => {
      moduleUpdate({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id,
        module_description: validModuleDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: '/Module/ModuleUpdate',
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          module_id: validModuleId,
          module_name: validModuleName,
          build_id: validBuildId,
          module_description: validModuleDescription
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: '/Module/ModuleUpdate',
      body: {
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    moduleUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      moduleUpdate({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    })
      .then(() => moduleUpdate({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});