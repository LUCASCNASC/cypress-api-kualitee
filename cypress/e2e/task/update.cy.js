const PATH_API = '/Task/Update'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validStartDate = Cypress.env('VALID_START_DATE');

const validTaskId = 888;
const validAssignedTo = [1234];
const validTaskname = 'Tarefa atualizada';
const validEndDate = '2025-09-20';

describe('API rest - Task Update - /task/update', () => {

  it('Status Code is 200', () => {
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

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
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