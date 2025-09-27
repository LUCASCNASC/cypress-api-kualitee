// Testes automatizados para API: GET /defects/details
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)

describe('API - Defects Details - /defects/details', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validDefectId = 101;
  const PATH_API = '/Defect/stagingdetail'

  function defectsDetails(params, options = {}) {
    return cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: params,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Consulta detalhes do defeito com todos os parâmetros válidos', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    defectsDetails({
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsDetails({
        token,
        project_id: validProjectId,
        defect_id: validDefectId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'defect_id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const params = {
        token: validToken,
        project_id: validProjectId,
        defect_id: validDefectId
      };
      delete params[field];
      defectsDetails(params).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsDetails({
        token: validToken,
        project_id,
        defect_id: validDefectId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(defect_id => {
    it(`Falha com defect_id inválido (${JSON.stringify(defect_id)})`, () => {
      defectsDetails({
        token: validToken,
        project_id: validProjectId,
        defect_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora parâmetro extra na query', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: {
          token: validToken,
          project_id: validProjectId,
          defect_id: validDefectId
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/x-www-form-urlencoded', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: {
        token: validToken,
        project_id: validProjectId,
        defect_id: validDefectId
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsDetails({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas consultas rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsDetails({
        token: validToken,
        project_id: validProjectId,
        defect_id: validDefectId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita consultas idênticas sequenciais ---
  it('Permite consultas duplicadas rapidamente', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(() =>
      defectsDetails({
        token: validToken,
        project_id: validProjectId,
        defect_id: validDefectId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});