// Testes automatizados para API: POST /task/update

describe('API - Task Update - /task/update', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validTaskId = 888;
  const validAssignedTo = [1234];
  const validTaskname = 'Tarefa atualizada';
  const validStartDate = '2025-09-19';
  const validEndDate = '2025-09-20';

  function taskUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Task/Update`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO (mínimo obrigatório) ---
  it('Atualiza task com campos obrigatórios mínimos', () => {
    taskUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Todos parâmetros ---
  it('Atualiza task com todos campos possíveis', () => {
    taskUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      module: 'Defets',
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#111111',
      foregroundColor: '#EEEEEE',
      priority: 'High'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    taskUpdate({
      project_id: validProjectId,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      taskUpdate({
        token,
        project_id: validProjectId,
        id: validTaskId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: project_id/id/assignedto[0] inválidos/ausentes ---
  it('Falha sem project_id', () => {
    taskUpdate({
      token: validToken,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem id', () => {
    taskUpdate({
      token: validToken,
      project_id: validProjectId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem assignedto[0]', () => {
    taskUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(param => {
    it(`Falha com project_id inválido (${JSON.stringify(param)})`, () => {
      taskUpdate({
        token: validToken,
        project_id: param,
        id: validTaskId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
    it(`Falha com id inválido (${JSON.stringify(param)})`, () => {
      taskUpdate({
        token: validToken,
        project_id: validProjectId,
        id: param,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
    it(`Falha com assignedto[0] inválido (${JSON.stringify(param)})`, () => {
      taskUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        'assignedto[0]': param,
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: taskname/startdate/enddate obrigatórios/errados ---
  ['taskname', 'startdate', 'enddate', 'backgroundColor', 'foregroundColor'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const req = {
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      };
      delete req[field];
      taskUpdate(req).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    taskUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
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
        url: `${BASE_URL}/Task/Update`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          id: validTaskId,
          'assignedto[0]': validAssignedTo[0],
          taskname: validTaskname,
          startdate: validStartDate,
          enddate: validEndDate,
          backgroundColor: '#FFFFFF',
          foregroundColor: '#000000'
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
      url: `${BASE_URL}/Task/Update`,
      body: {
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    taskUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    taskUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      'assignedto[0]': validAssignedTo[0],
      taskname: validTaskname,
      startdate: validStartDate,
      enddate: validEndDate,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000'
    })
      .then(() => taskUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        'assignedto[0]': validAssignedTo[0],
        taskname: validTaskname,
        startdate: validStartDate,
        enddate: validEndDate,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});