const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Meta/Update';

describe('API - Metas Update - /metas/update', () => {
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validId = Cypress.env('VALID_ID');
  const validMetaKey = 'browser';
  const validMetaValue = 'chrome';

  function metasUpdate(body, options = {}) {
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
  it('Atualiza meta com token, project_id, id, meta_value válidos', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza meta com meta_key válido', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_key: validMetaKey, meta_value: validMetaValue }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    metasUpdate({ project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      metasUpdate({ token, project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    metasUpdate({ token: validToken, id: validId, meta_value: validMetaValue }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      metasUpdate({ token: validToken, project_id, id: validId, meta_value: validMetaValue }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- id inválido, ausente, tipos errados, limites ---
  it('Falha sem id', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      metasUpdate({ token: validToken, project_id: validProjectId, id, meta_value: validMetaValue }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- meta_value inválido, ausente, tipos errados, limites ---
  it('Falha sem meta_value', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(meta_value => {
    it(`Falha com meta_value inválido (${JSON.stringify(meta_value)})`, () => {
      metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- meta_key inválido (valores não permitidos) ---
  ['INVALID', 123, {}, [], true, false].forEach(meta_key => {
    it(`Falha com meta_key inválido (${JSON.stringify(meta_key)})`, () => {
      metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_key, meta_value: validMetaValue }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue, extra: 'foo' }).then(response => {
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
        body: { token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue },
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
      body: { token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasUpdate({ token: "' OR 1=1 --", project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue })
      .then(() => metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});