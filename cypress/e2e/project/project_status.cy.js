const PATH_API = '/Project/ProjectStatus';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectStatus = 'ativo';
const validProjectId0 = 77;
const validProjectId1 = 78;

describe('Project Status - /project/project_status', () => {

  it('Status Code is 200', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    projectStatus({
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    projectStatus({
      token: 'token_invalido',
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 401, 403', () => {
    projectStatus({
      token: 'token_expirado',
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    projectStatus({
      token: null,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });


  it('Status Code is 400, 422', () => {
    projectStatus({
      token: validToken,
      project_status: '',
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }, { headers: { 'Content-Type': 'text/plain' } }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    projectStatus({
      token: "' OR 1=1 --",
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      projectStatus({
        token: validToken,
        project_status: validProjectStatus,
        'project_id[0]': validProjectId0,
        'project_id[1]': validProjectId1
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    })
      .then(() => projectStatus({
        token: validToken,
        project_status: validProjectStatus,
        'project_id[0]': validProjectId0,
        'project_id[1]': validProjectId1
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});