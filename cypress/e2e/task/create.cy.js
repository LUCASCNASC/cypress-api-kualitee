const PATH_API = '/Task/Create'
const validToken = Cypress.env('VALID_TOKEN');

const validStartDate = Cypress.env('VALID_START_DATE');
const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validAssignedTo = [1234];
const validTaskname = 'Nova tarefa';
const validEndDate = '2025-09-18';

describe('API rest - Task Create - /task/create', () => {


  it('Status Code is 200', () => {

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