describe('API - Build List - /build/list', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validKeyword = 'feature'; // Ou qualquer palavra-chave válida
  const PATH_API = '/Build/BuiltList'

  function buildList(body, options = {}) {
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
  it('Retorna lista de builds com token e project_id válidos', () => {
    buildList({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Retorna lista de builds filtrando por keyword', () => {
    buildList({ token: validToken, project_id: validProjectId, keyword: validKeyword }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    buildList({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    buildList({ token: 'token_invalido', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    buildList({ token: 'token_expirado', project_id: validProjectId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    buildList({ token: null, project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    buildList({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      buildList({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    buildList({ token: validToken, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- keyword inválida, limites ---
  [null, '', {}, [], true, false, 12345].forEach(keyword => {
    it(`Falha (ou ignora) com keyword inválida (${JSON.stringify(keyword)})`, () => {
      buildList({ token: validToken, project_id: validProjectId, keyword }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    buildList({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
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
        body: { token: validToken, project_id: validProjectId },
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
      body: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    buildList({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    buildList({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      buildList({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    buildList({ token: validToken, project_id: validProjectId })
      .then(() => buildList({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});