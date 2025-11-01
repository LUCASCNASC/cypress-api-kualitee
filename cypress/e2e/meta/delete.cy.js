describe('API - Metas Delete - /metas/delete', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validIds = Cypress.env('VALID_IDS');
  const PATH_API = '/Meta/Create'

  function metasDelete(body, options = {}) {
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
  it('Deleta metas com token, project_id e ids[0], ids[1] válidos', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Deleta apenas uma meta se enviado apenas ids[0]', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0] }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    metasDelete({ project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      metasDelete({ token, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    metasDelete({ token: validToken, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      metasDelete({ token: validToken, project_id, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- ids[0] e/ou ids[1] inválido(s), ausente(s), tipos errados, limites ---
  it('Falha sem ids[0]', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });
  it('Falha sem ids[1]', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0] }).then(response => {
      // Se o endpoint permitir apenas um id, pode passar, senão deve falhar
      expect([200, 400, 422, 404]).to.include(response.status);
    });
  });
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(badId => {
    it(`Falha com ids[0] inválido (${JSON.stringify(badId)})`, () => {
      metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': badId, 'ids[1]': validIds[1] }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
    it(`Falha com ids[1] inválido (${JSON.stringify(badId)})`, () => {
      metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': badId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1], extra: 'foo' }).then(response => {
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
        body: { token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] },
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
      body: { token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasDelete({ token: "' OR 1=1 --", project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] })
      .then(() => metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});