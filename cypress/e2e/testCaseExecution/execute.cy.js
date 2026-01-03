const PATH_API = '/Test%20Case%20Execution/Execute'
const validToken = Cypress.env('VALID_TOKEN');

const validBuildId = Cypress.env('VALID_BUILD_ID');
const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validStatus = 'Passed';
const validTcId = 101;
const validTestScenarioId = 1234;
const validCycleId = 1001;
const validNotes = 'Teste executado com sucesso';
const validExecute = 'yes';

describe('Test Case Execution Execute - /test_case_execution/execute', () => {

  it('Status Code is 200', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    executeTest({
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    executeTest({
      token: validToken,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem status', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha sem tc_id', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha sem testscenario_id', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha sem cycle_id', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha sem execute', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute,
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
        status: validStatus,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        notes: validNotes,
        execute: validExecute
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    executeTest({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      executeTest({
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        notes: validNotes,
        execute: validExecute
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    executeTest({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      notes: validNotes,
      execute: validExecute
    })
      .then(() => executeTest({
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        notes: validNotes,
        execute: validExecute
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});