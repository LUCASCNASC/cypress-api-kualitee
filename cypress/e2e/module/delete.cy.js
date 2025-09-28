describe('API - Module Delete - /module/delete', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validModuleId = 22; // Substitua por um id de módulo válido do seu ambiente
  const PATH_API = '/Module/ModuleDelete'

  function moduleDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Deleta módulo do projeto com token, project_id e module_id[0] válidos', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    moduleDelete({
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    moduleDelete({
      token: 'token_invalido',
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    moduleDelete({
      token: 'token_expirado',
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    moduleDelete({
      token: null,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id/module_id[0] inválidos, ausentes, tipos errados, limites ---
  it('Falha sem project_id', () => {
    moduleDelete({
      token: validToken,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem module_id[0]', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      moduleDelete({
        token: validToken,
        project_id,
        'module_id[0]': validModuleId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(module_id => {
    it(`Falha com module_id[0] inválido (${JSON.stringify(module_id)})`, () => {
      moduleDelete({
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': module_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    moduleDelete({
      token: validToken,
      project_id: 999999,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Falha com module_id[0] inexistente', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': 999999
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId,
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
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          'module_id[0]': validModuleId
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
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': validModuleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    moduleDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      moduleDelete({
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': validModuleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    })
      .then(() => moduleDelete({
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': validModuleId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});