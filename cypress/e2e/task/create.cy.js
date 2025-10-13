// Testes automatizados para API: POST /task/create
const PATH_API = '/Task/Create'

describe('API - Task Create - /task/create', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validAssignedTo = [1234];
  const validTaskname = 'Nova tarefa';
  const validStartDate = Cypress.env('VALID_START_DATE');
  const validEndDate = '2025-09-18';

  function taskCreate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO (mínimo obrigatório) ---
  it('Cria task com campos obrigatórios mínimos', () => {
    taskCreate({
      token: validToken,
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Todos parâmetros ---
  it('Cria task com todos campos possíveis', () => {
    taskCreate({
      token: validToken,
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      module: 'Test Case',
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
      priority: 'High'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    taskCreate({
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      taskCreate({
        token,
        project_id: validProjectId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    taskCreate({
      token: validToken,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      taskCreate({
        token: validToken,
        project_id,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: assignedto[0] inválido/ausente ---
  it('Falha sem assignedto[0]', () => {
    taskCreate({
      token: validToken,
      project_id: validProjectId,
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, {}, [], true, false].forEach(assignedto0 => {
    it(`Falha com assignedto[0] inválido (${JSON.stringify(assignedto0)})`, () => {
      taskCreate({
        token: validToken,
        project_id: validProjectId,
        'assignedto[0]': assignedto0,
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: taskname/startdate/enddate obrigatórios/errados ---
  ['taskname', 'startdate', 'enddate'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const req = {
        token: validToken,
        project_id: validProjectId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate
      };
      delete req[field];
      taskCreate(req).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    taskCreate({
      token: validToken,
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
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
          'assignedto[0]': validAssignedTo[0],
          taskname: validTaskname,
          startdate: validStartDate,
          enddate: validEndDate
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
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskCreate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    taskCreate({
      token: validToken,
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskCreate({
        token: validToken,
        project_id: validProjectId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    taskCreate({
      token: validToken,
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate
    })
      .then(() => taskCreate({
        token: validToken,
        project_id: validProjectId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});