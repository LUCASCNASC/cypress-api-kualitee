// Testes automatizados para API: POST /manage_test_case/tree_drag_tc_in_modules
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)

describe('API - Manage Test Case Tree Drag TC In Modules - /manage_test_case/tree_drag_tc_in_modules', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validModuleId = 22;

  function treeDragTcInModules(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/TestLab/TreeDragTestCaseinModules',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Consulta casos de teste do módulo com todos os campos obrigatórios válidos', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    treeDragTcInModules({
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      treeDragTcInModules({
        token,
        project_id: validProjectId,
        module_id: validModuleId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'module_id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      };
      delete body[field];
      treeDragTcInModules(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      treeDragTcInModules({
        token: validToken,
        project_id,
        module_id: validModuleId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(module_id => {
    it(`Falha com module_id inválido (${JSON.stringify(module_id)})`, () => {
      treeDragTcInModules({
        token: validToken,
        project_id: validProjectId,
        module_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: '/TestLab/TreeDragTestCaseinModules',
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          module_id: validModuleId
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
      url: '/TestLab/TreeDragTestCaseinModules',
      body: {
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeDragTcInModules({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      treeDragTcInModules({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(() =>
      treeDragTcInModules({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});