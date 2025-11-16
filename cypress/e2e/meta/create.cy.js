const validToken = Cypress.env('VALID_TOKEN');

describe('API - Metas Create - /metas/create', () => {
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validMetaKey = 'browser';
  const validMetaValue = 'chrome';
  const PATH_API = '/Meta/Create'

  function metasCreate(body, options = {}) {
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
  it('Cria meta com token, project_id, meta_value válidos', () => {
    metasCreate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Cria meta com meta_key válido', () => {
    metasCreate({ token: validToken, project_id: validProjectId, meta_key: validMetaKey, meta_value: validMetaValue }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    metasCreate({ project_id: validProjectId, meta_value: validMetaValue }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      metasCreate({ token, project_id: validProjectId, meta_value: validMetaValue }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    metasCreate({ token: validToken, meta_value: validMetaValue }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      metasCreate({ token: validToken, project_id, meta_value: validMetaValue }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- meta_value inválido, ausente, tipos errados, limites ---
  it('Falha sem meta_value', () => {
    metasCreate({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(meta_value => {
    it(`Falha com meta_value inválido (${JSON.stringify(meta_value)})`, () => {
      metasCreate({ token: validToken, project_id: validProjectId, meta_value }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- meta_key inválido (valores não permitidos) ---
  ['INVALID', 123, {}, [], true, false].forEach(meta_key => {
    it(`Falha com meta_key inválido (${JSON.stringify(meta_key)})`, () => {
      metasCreate({ token: validToken, project_id: validProjectId, meta_key, meta_value: validMetaValue }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    metasCreate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue, extra: 'foo' }).then(response => {
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
        body: { token: validToken, project_id: validProjectId, meta_value: validMetaValue },
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
      body: { token: validToken, project_id: validProjectId, meta_value: validMetaValue },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasCreate({ token: "' OR 1=1 --", project_id: validProjectId, meta_value: validMetaValue }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    metasCreate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      metasCreate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    metasCreate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue })
      .then(() => metasCreate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});