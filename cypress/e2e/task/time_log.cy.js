// Testes automatizados para API: POST /task/time/log
const PATH_API = '/Task/task%2Ftime%2Flog'

describe('API - Task Time Log - /task/time/log', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validTaskId = 888;

  function taskTimeLog(body, options = {}) {
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
  it('Registra tempo de task com todos campos obrigatórios válidos', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    taskTimeLog({
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      taskTimeLog({
        token,
        project_id: validProjectId,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    taskTimeLog({
      token: validToken,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      taskTimeLog({
        token: validToken,
        project_id,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- id inválido, ausente, tipos errados, limites ---
  it('Falha sem id', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      taskTimeLog({
        token: validToken,
        project_id: validProjectId,
        id,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes/errados (demais campos) ---
  ['start_date', 'start_time', 'end_time', 'billable', 'task_complete', 'end_date'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const req = {
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      };
      delete req[field];
      taskTimeLog(req).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16',
      extra: 'foo'
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
          id: validTaskId,
          start_date: '2025-09-16',
          start_time: '09:00',
          end_time: '17:00',
          billable: 1,
          task_complete: 0,
          end_date: '2025-09-16'
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
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskTimeLog({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskTimeLog({
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    })
      .then(() => taskTimeLog({
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});