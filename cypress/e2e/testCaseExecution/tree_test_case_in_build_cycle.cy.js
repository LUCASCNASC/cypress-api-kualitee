
const PATH_API = '/Test%20Case%20Execution/TreeTestCaseinBuildCycle'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');

const validCycleId = 1001;

describe('API rest - Test Case Execution Tree Test Case in Build Cycle - /test_case_execution/tree_test_case_in_build_cycle', () => {


  it('Status Code is 200', () => {

    treeTestCaseInBuildCycle({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {

    treeTestCaseInBuildCycle({
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {

    treeTestCaseInBuildCycle({
      token: validToken,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem build_id', () => {

    treeTestCaseInBuildCycle({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem cycle_id', () => {

    treeTestCaseInBuildCycle({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {

    treeTestCaseInBuildCycle({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId,
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
        build_id: validBuildId,
        cycle_id: validCycleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {

    treeTestCaseInBuildCycle({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {

    treeTestCaseInBuildCycle({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {

    const requests = Array(10).fill(0).map(() =>
      treeTestCaseInBuildCycle({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {

    treeTestCaseInBuildCycle({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    })
      .then(() => treeTestCaseInBuildCycle({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});