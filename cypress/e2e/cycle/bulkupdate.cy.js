// Testes automatizados para API: POST /defects/bulkupdate
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)

describe('API - Defects Bulk Update - /defects/bulkupdate', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validIds = [101, 102, 103];
  const validBuildId = 10;
  const validModuleId = 22;
  const PATH_API = '/Defect/Bulkupdate'

  function bulkUpdateDefects(body, options = {}) {
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
  it('Atualiza defeitos em lote com todos os campos obrigatórios válidos', () => {
    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza defeitos em lote com todos os campos preenchidos', () => {
    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds,
      build_id: validBuildId,
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    bulkUpdateDefects({
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      bulkUpdateDefects({
        token,
        project_id: validProjectId,
        id: validIds
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        id: validIds
      };
      delete body[field];
      bulkUpdateDefects(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      bulkUpdateDefects({
        token: validToken,
        project_id,
        id: validIds
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [
    null, '', 'abc', 0, -1, 999999999, {}, true, false,
    [null], [''], ['abc'], [0], [-1], [999999999], [{}], [true], [false], []
  ].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      bulkUpdateDefects({
        token: validToken,
        project_id: validProjectId,
        id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos opcionais inválidos ---
  const invalidArray = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['build_id', 'module_id'].forEach(field => {
    invalidArray.forEach(value => {
      it(`Falha com campo opcional ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          id: validIds,
        };
        body[field] = value;
        bulkUpdateDefects(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds,
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
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          id: validIds
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
        id: validIds
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    bulkUpdateDefects({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      bulkUpdateDefects({
        token: validToken,
        project_id: validProjectId,
        id: validIds
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds
    }).then(() =>
      bulkUpdateDefects({
        token: validToken,
        project_id: validProjectId,
        id: validIds
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});