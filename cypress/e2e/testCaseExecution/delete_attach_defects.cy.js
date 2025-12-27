const PATH_API = '/Test%20Case%20Execution/delete_attach_defects'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTcId = 101;
const validBugId = 555;
const validExecBugId = 222;

describe('API rest - Test Case Execution Delete Attach Defects - /test_case_execution/delete_attach_defects', () => {

  it('Status Code is 200', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    deleteAttachDefects({
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    deleteAttachDefects({
      token: validToken,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem tc_id', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem bug_id', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem exec_bug_id', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    deleteAttachDefects({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      deleteAttachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    })
      .then(() => deleteAttachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});