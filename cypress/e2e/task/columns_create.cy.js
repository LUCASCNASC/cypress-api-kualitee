const PATH_API = '/Task/columnCreate'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validColumnName = 'Nova Coluna';

describe('API - Task Columns Create - /task/columns/create', () => {

  function taskColumnsCreate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Cria coluna de task com token, project_id e column_name válidos', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    taskColumnsCreate({ project_id: validProjectId, column_name: validColumnName }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      taskColumnsCreate({ token, project_id: validProjectId, column_name: validColumnName }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    taskColumnsCreate({ token: validToken, column_name: validColumnName }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      taskColumnsCreate({ token: validToken, project_id, column_name: validColumnName }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- column_name inválido, ausente, tipos errados, limites ---
  it('Falha sem column_name', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(column_name => {
    it(`Falha com column_name inválido (${JSON.stringify(column_name)})`, () => {
      taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName, extra: 'foo' }).then(response => {
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
        body: { token: validToken, project_id: validProjectId, column_name: validColumnName },
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
      body: { token: validToken, project_id: validProjectId, column_name: validColumnName },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskColumnsCreate({ token: "' OR 1=1 --", project_id: validProjectId, column_name: validColumnName }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName })
      .then(() => taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});