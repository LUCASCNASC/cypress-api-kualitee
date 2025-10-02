// Testes automatizados para API: GET /task/columns/view
const PATH_API = '/Task/task%2Fcolumn%2Fview'

describe('API - Task Columns View - /task/columns/view', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validKeyword = 'important';

  function taskColumnsView(params, options = {}) {
    return cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: params,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: só obrigatórios ---
  it('Retorna colunas das tasks com token e project_id válidos', () => {
    taskColumnsView({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: com keyword ---
  it('Retorna colunas das tasks com keyword', () => {
    taskColumnsView({ token: validToken, project_id: validProjectId, keyword: validKeyword }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    taskColumnsView({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      taskColumnsView({ token, project_id: validProjectId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    taskColumnsView({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      taskColumnsView({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- keyword: casos extremos ---
  ['', '!!!', '123', 'áéíóú', '@#$%', null].forEach(keyword => {
    it(`Aceita keyword extrema (${JSON.stringify(keyword)})`, () => {
      taskColumnsView({ token: validToken, project_id: validProjectId, keyword }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- Parâmetro extra ignorado ---
  it('Ignora parâmetro extra na query', () => {
    taskColumnsView({ token: validToken, project_id: validProjectId, keyword: validKeyword, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: { token: validToken, project_id: validProjectId, keyword: validKeyword },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type: não deve afetar GET (mas testando) ---
  it('GET ignora Content-Type application/json', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskColumnsView({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    taskColumnsView({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskColumnsView({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    taskColumnsView({ token: validToken, project_id: validProjectId })
      .then(() => taskColumnsView({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});