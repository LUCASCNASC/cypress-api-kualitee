// Testes automatizados para API: POST /task/columns/card/reposition

describe('API - Task Columns Card Reposition - /task/columns/card/reposition', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validId = 888;

  function taskColumnsCardReposition(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/Task/task%2Fcolumns%2Fcard%2Freposition',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Reposiciona card da coluna com token, project_id e id válidos', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    taskColumnsCardReposition({ project_id: validProjectId, id: validId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      taskColumnsCardReposition({ token, project_id: validProjectId, id: validId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    taskColumnsCardReposition({ token: validToken, id: validId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      taskColumnsCardReposition({ token: validToken, project_id, id: validId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- id inválido, ausente, tipos errados, limites ---
  it('Falha sem id', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: '/Task/task%2Fcolumns%2Fcard%2Freposition',
        form: true,
        body: { token: validToken, project_id: validProjectId, id: validId },
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
      url: '/Task/task%2Fcolumns%2Fcard%2Freposition',
      body: { token: validToken, project_id: validProjectId, id: validId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskColumnsCardReposition({ token: "' OR 1=1 --", project_id: validProjectId, id: validId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId })
      .then(() => taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});